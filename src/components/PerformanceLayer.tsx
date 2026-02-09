// Live performance interface with chord triggers

import { useEffect, useState, useRef } from 'react';
import { useApp } from '../store/AppContext';
import { getChordFromDegree, getRomanNumeral } from '../music/scales';
import { getChordSymbol } from '../music/chords';
import { playChord, stopChord, DEFAULT_ENVELOPE } from '../audio/synthesizer';
import { voiceChord, VoicedChord } from '../audio/voiceLeading';

export function PerformanceLayer() {
  const {
    scale,
    triggerChord,
    isRecording,
    recordedChords,
    recordedBpm,
    isPlayingRecordedLoop,
    startRecording,
    stopRecording,
    startRecordedLoop,
    stopRecordedLoop,
  } = useApp();

  const degrees = [1, 2, 3, 4, 5, 6, 7];

  // Track which keys are currently held down (for visual feedback)
  const [activeKeys, setActiveKeys] = useState<Set<number>>(new Set());
  // Use refs to track pressed keys and voicings to avoid stale closures
  const pressedKeysRef = useRef<Set<number>>(new Set());
  const activeVoicingsRef = useRef<Map<number, VoicedChord>>(new Map());
  // Store scale and isRecording in refs for use in event handlers
  const scaleRef = useRef(scale);
  const isRecordingRef = useRef(isRecording);

  // Keep refs in sync with state
  useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);

  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  // Keyboard event handlers - set up once on mount
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Map keys 1-7 to degrees 1-7
      const keyNum = parseInt(e.key, 10);
      if (keyNum >= 1 && keyNum <= 7) {
        // Prevent key repeat from triggering multiple times
        if (!pressedKeysRef.current.has(keyNum)) {
          pressedKeysRef.current.add(keyNum);
          setActiveKeys(new Set(pressedKeysRef.current));

          // Play the chord
          const chord = getChordFromDegree(scaleRef.current, keyNum);
          const voicing = voiceChord(chord, null, 0);
          activeVoicingsRef.current.set(keyNum, voicing);
          playChord(voicing.frequencies, DEFAULT_ENVELOPE);

          // Record the chord if recording (uses triggerChord for recording only, not playback)
          if (isRecordingRef.current) {
            triggerChord(chord);
          }
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const keyNum = parseInt(e.key, 10);
      if (keyNum >= 1 && keyNum <= 7) {
        pressedKeysRef.current.delete(keyNum);
        setActiveKeys(new Set(pressedKeysRef.current));

        // Stop the chord
        const voicing = activeVoicingsRef.current.get(keyNum);
        if (voicing) {
          stopChord(voicing.frequencies, DEFAULT_ENVELOPE);
          activeVoicingsRef.current.delete(keyNum);
        }
      }
    };

    const handleBlur = () => {
      // Stop all playing chords when window loses focus
      activeVoicingsRef.current.forEach((voicing) => {
        stopChord(voicing.frequencies, DEFAULT_ENVELOPE);
      });
      activeVoicingsRef.current.clear();
      pressedKeysRef.current.clear();
      setActiveKeys(new Set());
    };

    // Add listeners
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);

      // Stop any playing chords when component unmounts
      activeVoicingsRef.current.forEach((voicing) => {
        stopChord(voicing.frequencies, DEFAULT_ENVELOPE);
      });
      activeVoicingsRef.current.clear();
      pressedKeysRef.current.clear();
    };
  }, [triggerChord]);

  return (
    <div style={{ padding: '1rem' }}>
      <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 'bold' }}>
        Performance Layer
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '0.75rem',
        marginBottom: '1rem',
      }}>
        {degrees.map(degree => {
          const chord = getChordFromDegree(scale, degree);
          const romanNumeral = getRomanNumeral(scale, degree);
          const symbol = getChordSymbol(chord);
          const isActive = activeKeys.has(degree);

          return (
            <button
              key={degree}
              onMouseDown={() => triggerChord(chord)}
              style={{
                padding: '1.5rem 1rem',
                backgroundColor: isActive ? '#22c55e' : 'var(--accent)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 'bold',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.25rem',
                transition: 'transform 0.1s, background-color 0.1s',
                transform: isActive ? 'scale(1.05)' : 'scale(1)',
                boxShadow: isActive ? '0 0 12px rgba(34, 197, 94, 0.5)' : 'none',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.transform = 'scale(1.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.transform = 'scale(1)';
                }
              }}
            >
              <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>
                {degree}
              </div>
              <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>
                {romanNumeral}
              </div>
              <div style={{ fontSize: '1.25rem' }}>
                {symbol}
              </div>
            </button>
          );
        })}
      </div>

      <div style={{
        padding: '1rem',
        backgroundColor: 'var(--bg-muted)',
        borderRadius: '8px',
        fontSize: '0.875rem',
        color: 'var(--text-secondary)',
      }}>
        Click pads or hold keys 1-7 to trigger chords in {scale.root} {scale.type}
      </div>

      {/* Recording Controls */}
      <div style={{
        marginTop: '1rem',
        padding: '1rem',
        backgroundColor: 'var(--bg-muted)',
        borderRadius: '8px',
      }}>
        <div style={{ marginBottom: '0.75rem', fontWeight: 'bold' }}>
          Recording
        </div>

        {/* Record / Stop button */}
        <button
          onClick={isRecording ? stopRecording : startRecording}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: isRecording ? '#dc2626' : 'var(--accent)',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <span style={{
            display: 'inline-block',
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: isRecording ? 'white' : '#dc2626',
            animation: isRecording ? 'pulse 1s infinite' : 'none',
          }} />
          {isRecording ? 'Stop' : 'Record'}
        </button>

        {/* Recording feedback */}
        {isRecording && (
          <div style={{
            marginTop: '0.75rem',
            padding: '0.5rem 0.75rem',
            backgroundColor: 'rgba(220, 38, 38, 0.1)',
            borderRadius: '4px',
            fontSize: '0.875rem',
            color: '#dc2626',
            fontWeight: 'bold',
          }}>
            Recording: {recordedChords.length} chord{recordedChords.length !== 1 ? 's' : ''}
          </div>
        )}

        {/* Recorded loop controls (shown when we have a recording) */}
        {!isRecording && recordedChords.length > 0 && recordedBpm !== null && (
          <div style={{ marginTop: '0.75rem' }}>
            <div style={{
              marginBottom: '0.5rem',
              fontSize: '0.875rem',
              color: 'var(--text-secondary)',
            }}>
              {isPlayingRecordedLoop
                ? `Loop playing at ${recordedBpm} BPM`
                : `${recordedChords.length} chord${recordedChords.length !== 1 ? 's' : ''} recorded at ${recordedBpm} BPM`}
            </div>

            {/* Play/Stop loop button */}
            <button
              onClick={isPlayingRecordedLoop ? stopRecordedLoop : startRecordedLoop}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: isPlayingRecordedLoop ? '#dc2626' : '#22c55e',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '0.875rem',
              }}
            >
              {isPlayingRecordedLoop ? 'Stop Loop' : 'Play Loop'}
            </button>
          </div>
        )}
      </div>

      {/* CSS animation for pulsing indicator */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

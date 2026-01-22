// Chord progression editor

import { useApp } from '../store/AppContext';
import { getChordSymbol, Chord, ChordQuality, Inversion } from '../music/chords';
import { NoteName, NOTE_NAMES } from '../music/utils';
import { ScaleType } from '../music/scales';

export function CompositionLayer() {
  const {
    progression,
    scale,
    selectedChordIndex,
    setSelectedChordIndex,
    updateChord,
    updateChordDuration,
    addChord,
    removeChord,
    setScale,
    currentChordIndex,
    isPlaying,
  } = useApp();

  const chordQualities: ChordQuality[] = ['major', 'minor', 'diminished', 'augmented', 'sus2', 'sus4', 'dominant7', 'major7', 'minor7'];
  const inversions: Inversion[] = [0, 1, 2];
  const scaleTypes: ScaleType[] = ['major', 'minor'];

  return (
    <div style={{ padding: '1rem' }}>
      <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: 'bold' }}>
        Composition Layer
      </h2>

      {/* Scale selector */}
      <div style={{
        marginBottom: '1rem',
        padding: '1rem',
        backgroundColor: '#f9fafb',
        borderRadius: '8px',
      }}>
        <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
          Scale/Key
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <select
            value={scale.root}
            onChange={(e) => setScale({ ...scale, root: e.target.value as NoteName })}
            style={{
              padding: '0.5rem',
              borderRadius: '4px',
              border: '1px solid #d1d5db',
              backgroundColor: 'white',
            }}
          >
            {NOTE_NAMES.map(note => (
              <option key={note} value={note}>{note}</option>
            ))}
          </select>
          <select
            value={scale.type}
            onChange={(e) => setScale({ ...scale, type: e.target.value as ScaleType })}
            style={{
              padding: '0.5rem',
              borderRadius: '4px',
              border: '1px solid #d1d5db',
              backgroundColor: 'white',
            }}
          >
            {scaleTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Chord progression timeline */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '1rem',
        overflowX: 'auto',
        padding: '0.5rem',
      }}>
        {progression.map((chordWithDuration, index) => (
          <div
            key={index}
            onClick={() => setSelectedChordIndex(index)}
            style={{
              minWidth: '120px',
              padding: '1rem',
              borderRadius: '6px',
              backgroundColor: selectedChordIndex === index ? '#dbeafe' :
                currentChordIndex === index && isPlaying ? '#fef3c7' : '#f3f4f6',
              border: selectedChordIndex === index ? '2px solid #2563eb' : '2px solid transparent',
              cursor: 'pointer',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
              {getChordSymbol(chordWithDuration.chord)}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#666' }}>
              {chordWithDuration.duration} {chordWithDuration.duration === 1 ? 'beat' : 'beats'}
            </div>
          </div>
        ))}
      </div>

      {/* Chord editor */}
      {selectedChordIndex !== null && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#f9fafb',
          borderRadius: '8px',
          marginBottom: '1rem',
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            Edit Chord {selectedChordIndex + 1}
          </h3>

          <div style={{ display: 'grid', gap: '1rem' }}>
            {/* Root note */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>
                Root Note
              </label>
              <select
                value={progression[selectedChordIndex].chord.root}
                onChange={(e) => {
                  const newChord: Chord = {
                    ...progression[selectedChordIndex].chord,
                    root: e.target.value as NoteName,
                  };
                  updateChord(selectedChordIndex, newChord);
                }}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '4px',
                  border: '1px solid #d1d5db',
                  backgroundColor: 'white',
                }}
              >
                {NOTE_NAMES.map(note => (
                  <option key={note} value={note}>{note}</option>
                ))}
              </select>
            </div>

            {/* Quality */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>
                Quality
              </label>
              <select
                value={progression[selectedChordIndex].chord.quality}
                onChange={(e) => {
                  const newChord: Chord = {
                    ...progression[selectedChordIndex].chord,
                    quality: e.target.value as ChordQuality,
                  };
                  updateChord(selectedChordIndex, newChord);
                }}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '4px',
                  border: '1px solid #d1d5db',
                  backgroundColor: 'white',
                }}
              >
                {chordQualities.map(quality => (
                  <option key={quality} value={quality}>{quality}</option>
                ))}
              </select>
            </div>

            {/* Inversion */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>
                Inversion
              </label>
              <select
                value={progression[selectedChordIndex].chord.inversion}
                onChange={(e) => {
                  const newChord: Chord = {
                    ...progression[selectedChordIndex].chord,
                    inversion: parseInt(e.target.value) as Inversion,
                  };
                  updateChord(selectedChordIndex, newChord);
                }}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '4px',
                  border: '1px solid #d1d5db',
                  backgroundColor: 'white',
                }}
              >
                {inversions.map(inv => (
                  <option key={inv} value={inv}>
                    {inv === 0 ? 'Root' : `${inv}st`} Position
                  </option>
                ))}
              </select>
            </div>

            {/* Duration */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>
                Duration: {progression[selectedChordIndex].duration} {progression[selectedChordIndex].duration === 1 ? 'beat' : 'beats'}
              </label>
              <input
                type="range"
                min="0.25"
                max="8"
                step="0.25"
                value={progression[selectedChordIndex].duration}
                onChange={(e) => updateChordDuration(selectedChordIndex, parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            {/* Add/Remove buttons */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => addChord(selectedChordIndex)}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                + Add After
              </button>
              <button
                onClick={() => {
                  removeChord(selectedChordIndex);
                  setSelectedChordIndex(null);
                }}
                disabled={progression.length <= 1}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  backgroundColor: progression.length <= 1 ? '#d1d5db' : '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: progression.length <= 1 ? 'not-allowed' : 'pointer',
                }}
              >
                🗑 Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

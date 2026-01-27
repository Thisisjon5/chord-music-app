// Main App component

import { useEffect, useState } from 'react';
import { AppProvider, useApp } from './store/AppContext';
import { initAudioContext, resumeAudioContext, isAudioContextRunning } from './audio/audioContext';
import { ChordDisplay } from './components/ChordDisplay';
import { TransportControls } from './components/TransportControls';
import { CompositionLayer } from './components/CompositionLayer';
import { PerformanceLayer } from './components/PerformanceLayer';

function AppContent() {
  const { play, performanceMode, setPerformanceMode, darkMode, toggleDarkMode } = useApp();
  const [needsUserInteraction, setNeedsUserInteraction] = useState(false);

  useEffect(() => {
    // Initialize audio context
    initAudioContext();

    // Try to start playback immediately
    const startPlayback = async () => {
      try {
        await resumeAudioContext();
        if (isAudioContextRunning()) {
          // Auto-play starts here
          play();
        } else {
          // AudioContext is suspended, need user interaction
          setNeedsUserInteraction(true);
        }
      } catch (error) {
        // Browser blocked autoplay, need user interaction
        setNeedsUserInteraction(true);
      }
    };

    startPlayback();

    // Keyboard shortcuts
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        // togglePlayback(); // Uncomment if you want spacebar toggle
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [play]);

  // Handle user interaction to start audio
  const handleStartAudio = async () => {
    await resumeAudioContext();
    play();
    setNeedsUserInteraction(false);
  };

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '2rem',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      {/* Header */}
      <header style={{ marginBottom: '2rem', textAlign: 'center', position: 'relative' }}>
        <button
          onClick={toggleDarkMode}
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            padding: '0.5rem',
            fontSize: '1.25rem',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            borderRadius: '6px',
          }}
          title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          🎹 Chord Music App
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          HiChord-inspired chord progression tool
        </p>
      </header>

      {/* Click to start overlay */}
      {needsUserInteraction && (
        <div
          onClick={handleStartAudio}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            cursor: 'pointer',
          }}
        >
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            padding: '2rem 3rem',
            borderRadius: '12px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎵</div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Click to Start</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Audio requires user interaction</p>
          </div>
        </div>
      )}

      {/* Main content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Chord display */}
        <ChordDisplay />

        {/* Transport controls */}
        <TransportControls />

        {/* Mode toggle */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          justifyContent: 'center',
          marginBottom: '0.5rem',
        }}>
          <button
            onClick={() => setPerformanceMode(false)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: !performanceMode ? 'var(--accent-blue)' : 'var(--btn-inactive)',
              color: !performanceMode ? 'white' : 'var(--btn-inactive-text)',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            Composition
          </button>
          <button
            onClick={() => setPerformanceMode(true)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: performanceMode ? 'var(--accent-blue)' : 'var(--btn-inactive)',
              color: performanceMode ? 'white' : 'var(--btn-inactive-text)',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            Performance
          </button>
        </div>

        {/* Layer content */}
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          borderRadius: '8px',
          boxShadow: '0 1px 3px var(--shadow-color)',
        }}>
          {performanceMode ? <PerformanceLayer /> : <CompositionLayer />}
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;

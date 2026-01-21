// Play/pause and transport controls

import { useApp } from '../store/AppContext';

export function TransportControls() {
  const { isPlaying, togglePlayback, transpose, transposeUp, transposeDown, bpm, setBpm } = useApp();

  const handleBpmInput = (value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 40 && numValue <= 240) {
      setBpm(numValue);
    }
  };

  return (
    <div style={{
      display: 'flex',
      gap: '1rem',
      alignItems: 'center',
      padding: '1rem',
      backgroundColor: '#f9fafb',
      borderRadius: '8px',
      marginBottom: '1rem',
      flexWrap: 'wrap',
    }}>
      <button
        onClick={togglePlayback}
        style={{
          padding: '0.75rem 1.5rem',
          fontSize: '1rem',
          fontWeight: 'bold',
          backgroundColor: isPlaying ? '#ef4444' : '#10b981',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
        }}
      >
        {isPlaying ? '⏸ Pause' : '▶ Play'}
      </button>

      {/* BPM Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}>
        <span style={{ fontSize: '0.875rem', color: '#666' }}>BPM:</span>
        <input
          type="number"
          min="40"
          max="240"
          value={bpm}
          onChange={(e) => handleBpmInput(e.target.value)}
          style={{
            width: '4rem',
            padding: '0.5rem',
            fontSize: '1rem',
            fontWeight: 'bold',
            textAlign: 'center',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            fontFamily: 'monospace',
          }}
        />
        <input
          type="range"
          min="40"
          max="240"
          value={bpm}
          onChange={(e) => setBpm(parseInt(e.target.value))}
          style={{
            width: '120px',
          }}
        />
      </div>

      {/* Transpose Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginLeft: 'auto',
      }}>
        <span style={{ fontSize: '0.875rem', color: '#666' }}>Transpose:</span>
        <button
          onClick={transposeDown}
          style={{
            padding: '0.5rem 0.75rem',
            fontSize: '1rem',
            backgroundColor: '#e5e7eb',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          -
        </button>
        <span style={{
          minWidth: '3rem',
          textAlign: 'center',
          fontWeight: 'bold',
          fontFamily: 'monospace',
        }}>
          {transpose > 0 ? `+${transpose}` : transpose}
        </span>
        <button
          onClick={transposeUp}
          style={{
            padding: '0.5rem 0.75rem',
            fontSize: '1rem',
            backgroundColor: '#e5e7eb',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          +
        </button>
      </div>
    </div>
  );
}

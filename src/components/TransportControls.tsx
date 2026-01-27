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
      backgroundColor: 'var(--bg-muted)',
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
          backgroundColor: isPlaying ? 'var(--danger)' : 'var(--success)',
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
        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>BPM:</span>
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
            border: '1px solid var(--border)',
            borderRadius: '4px',
            fontFamily: 'monospace',
            backgroundColor: 'var(--bg-card)',
            color: 'var(--text-primary)',
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
        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Transpose:</span>
        <button
          onClick={transposeDown}
          style={{
            padding: '0.5rem 0.75rem',
            fontSize: '1rem',
            backgroundColor: 'var(--bg-hover)',
            color: 'var(--text-primary)',
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
            backgroundColor: 'var(--bg-hover)',
            color: 'var(--text-primary)',
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

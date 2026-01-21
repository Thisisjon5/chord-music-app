// Play/pause and transport controls

import { useApp } from '../store/AppContext';

export function TransportControls() {
  const { isPlaying, togglePlayback, transpose, transposeUp, transposeDown } = useApp();

  return (
    <div style={{
      display: 'flex',
      gap: '1rem',
      alignItems: 'center',
      padding: '1rem',
      backgroundColor: '#f9fafb',
      borderRadius: '8px',
      marginBottom: '1rem',
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

// Live performance interface with chord triggers

import { useApp } from '../store/AppContext';
import { getChordFromDegree, getRomanNumeral } from '../music/scales';
import { getChordSymbol } from '../music/chords';

export function PerformanceLayer() {
  const { scale, triggerChord } = useApp();

  const degrees = [1, 2, 3, 4, 5, 6, 7];

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

          return (
            <button
              key={degree}
              onMouseDown={() => triggerChord(chord)}
              style={{
                padding: '1.5rem 1rem',
                backgroundColor: '#2563eb',
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
                transition: 'transform 0.1s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
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
        backgroundColor: '#f9fafb',
        borderRadius: '8px',
        fontSize: '0.875rem',
        color: '#666',
      }}>
        Click pads to trigger chords in the current scale ({scale.root} {scale.type})
      </div>
    </div>
  );
}

// Display current chord being played

import { getChordSymbol } from '../music/chords';
import { getNashvilleNumber } from '../music/scales';
import { useApp } from '../store/AppContext';

export function ChordDisplay() {
  const { progression, currentChordIndex, isPlaying, scale } = useApp();

  if (progression.length === 0) {
    return null;
  }

  const currentChord = progression[currentChordIndex]?.chord;

  return (
    <div style={{
      padding: '2rem',
      textAlign: 'center',
      backgroundColor: 'var(--bg-muted)',
      borderRadius: '8px',
      marginBottom: '1rem',
    }}>
      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
        Now Playing in {scale.root} {scale.type}
      </div>
      <div style={{
        fontSize: '3rem',
        fontWeight: 'bold',
        color: isPlaying ? 'var(--accent)' : 'var(--text-muted)',
        fontFamily: 'monospace',
      }}>
        {currentChord ? getNashvilleNumber(currentChord, scale) : '-'}
      </div>
      <div style={{
        fontSize: '1rem',
        color: 'var(--text-muted)',
        fontFamily: 'monospace',
        marginTop: '0.25rem',
      }}>
        {currentChord ? getChordSymbol(currentChord) : ''}
      </div>
    </div>
  );
}

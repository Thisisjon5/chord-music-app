// Display current chord being played

import { getChordSymbol } from '../music/chords';
import { useApp } from '../store/AppContext';

export function ChordDisplay() {
  const { progression, currentChordIndex, isPlaying } = useApp();

  if (progression.length === 0) {
    return null;
  }

  const currentChord = progression[currentChordIndex]?.chord;

  return (
    <div style={{
      padding: '2rem',
      textAlign: 'center',
      backgroundColor: '#f0f0f0',
      borderRadius: '8px',
      marginBottom: '1rem',
    }}>
      <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
        Now Playing
      </div>
      <div style={{
        fontSize: '3rem',
        fontWeight: 'bold',
        color: isPlaying ? '#2563eb' : '#999',
        fontFamily: 'monospace',
      }}>
        {currentChord ? getChordSymbol(currentChord) : '-'}
      </div>
    </div>
  );
}

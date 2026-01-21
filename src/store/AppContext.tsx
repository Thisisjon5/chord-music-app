// React Context for global app state

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { AppContextType } from './types';
import { Scale } from '../music/scales';
import { Chord } from '../music/chords';
import { ChordWithDuration, getLoopController } from '../audio/loopController';
import { getChordFromDegree } from '../music/scales';

// Create context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Default progression: I-V-vi-IV in C major
const createDefaultProgression = (): ChordWithDuration[] => {
  const scale: Scale = { root: 'C', type: 'major' };
  return [
    { chord: getChordFromDegree(scale, 1), duration: 1 }, // I (C major)
    { chord: getChordFromDegree(scale, 5), duration: 1 }, // V (G major)
    { chord: getChordFromDegree(scale, 6), duration: 1 }, // vi (A minor)
    { chord: getChordFromDegree(scale, 4), duration: 1 }, // IV (F major)
  ];
};

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  // State
  const [progression, setProgression] = useState<ChordWithDuration[]>(createDefaultProgression());
  const [scale, setScaleState] = useState<Scale>({ root: 'C', type: 'major' });
  const [selectedChordIndex, setSelectedChordIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentChordIndex, setCurrentChordIndex] = useState(0);
  const [bpm, setBpmState] = useState(120);
  const [transpose, setTransposeState] = useState(0);
  const [performanceMode, setPerformanceMode] = useState(false);

  const loopController = getLoopController();

  // Update loop controller when progression changes
  useEffect(() => {
    loopController.setProgression(progression);
  }, [progression]);

  // Update loop controller when transpose changes
  useEffect(() => {
    loopController.setTranspose(transpose);
  }, [transpose]);

  // Update loop controller when BPM changes
  useEffect(() => {
    loopController.setBpm(bpm);
  }, [bpm]);

  // Set up playback callback
  useEffect(() => {
    loopController.setPlaybackCallback((index) => {
      setCurrentChordIndex(index);
    });
  }, []);

  // Actions
  const updateChord = useCallback((index: number, chord: Chord) => {
    setProgression(prev => {
      const newProgression = [...prev];
      newProgression[index] = { ...newProgression[index], chord };
      return newProgression;
    });
  }, []);

  const updateChordDuration = useCallback((index: number, duration: number) => {
    setProgression(prev => {
      const newProgression = [...prev];
      newProgression[index] = { ...newProgression[index], duration };
      return newProgression;
    });
  }, []);

  const addChord = useCallback((afterIndex: number) => {
    setProgression(prev => {
      const newChord: ChordWithDuration = {
        chord: getChordFromDegree(scale, 1), // Default to I chord
        duration: 1,
      };
      const newProgression = [...prev];
      newProgression.splice(afterIndex + 1, 0, newChord);
      return newProgression;
    });
  }, [scale]);

  const removeChord = useCallback((index: number) => {
    setProgression(prev => {
      if (prev.length <= 1) return prev; // Keep at least one chord
      const newProgression = [...prev];
      newProgression.splice(index, 1);
      return newProgression;
    });
  }, []);

  const setScale = useCallback((newScale: Scale) => {
    setScaleState(newScale);
  }, []);

  const play = useCallback(() => {
    loopController.start();
    setIsPlaying(true);
  }, []);

  const pause = useCallback(() => {
    loopController.stop();
    setIsPlaying(false);
  }, []);

  const togglePlayback = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  const setBpm = useCallback((newBpm: number) => {
    setBpmState(newBpm);
  }, []);

  const setTranspose = useCallback((semitones: number) => {
    setTransposeState(semitones);
  }, []);

  const transposeUp = useCallback(() => {
    setTransposeState(prev => prev + 1);
  }, []);

  const transposeDown = useCallback(() => {
    setTransposeState(prev => prev - 1);
  }, []);

  const triggerChord = useCallback((chord: Chord) => {
    loopController.triggerChord(chord, 0.5);
  }, []);

  const value: AppContextType = {
    // State
    progression,
    scale,
    selectedChordIndex,
    isPlaying,
    currentChordIndex,
    bpm,
    transpose,
    performanceMode,

    // Actions
    setProgression,
    updateChord,
    updateChordDuration,
    addChord,
    removeChord,
    setScale,
    setSelectedChordIndex,
    play,
    pause,
    togglePlayback,
    setBpm,
    setTranspose,
    transposeUp,
    transposeDown,
    triggerChord,
    setPerformanceMode,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Hook to use app context
export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}

// React Context for global app state

import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react';
import { AppContextType, RecordedChordEvent, detectBpm } from './types';
import { Scale } from '../music/scales';
import { Chord, ChordQuality } from '../music/chords';
import { ChordWithDuration, getLoopController } from '../audio/loopController';
import { RecordedLoopController } from '../audio/recordedLoopController';
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

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChords, setRecordedChords] = useState<RecordedChordEvent[]>([]);
  const [recordedBpm, setRecordedBpm] = useState<number | null>(null);
  const recordingStartTimeRef = useRef<number | null>(null);

  // Recorded loop playback state
  const [isPlayingRecordedLoop, setIsPlayingRecordedLoop] = useState(false);
  const recordedLoopControllerRef = useRef<RecordedLoopController | null>(null);

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

    // Capture chord with timestamp if recording
    if (recordingStartTimeRef.current !== null) {
      const timestamp = performance.now() - recordingStartTimeRef.current;
      setRecordedChords(prev => [...prev, { chord, timestamp }]);
    }
  }, []);

  const previewChordQuality = useCallback((quality: ChordQuality) => {
    loopController.previewCurrentChordWithQuality(quality);
  }, []);

  const clearPreviewQuality = useCallback(() => {
    loopController.clearPreviewQuality();
  }, []);

  // Recording actions
  const startRecording = useCallback(() => {
    setRecordedChords([]);
    setRecordedBpm(null);
    recordingStartTimeRef.current = performance.now();
    setIsRecording(true);
  }, []);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
    recordingStartTimeRef.current = null;
    // Detect BPM from recorded chords
    setRecordedChords(currentChords => {
      const detectedBpm = detectBpm(currentChords);
      setRecordedBpm(detectedBpm);
      return currentChords;
    });
  }, []);

  const clearRecording = useCallback(() => {
    setRecordedChords([]);
    setRecordedBpm(null);
    recordingStartTimeRef.current = null;
    setIsRecording(false);
  }, []);

  // Recorded loop playback actions
  const startRecordedLoop = useCallback(() => {
    if (recordedChords.length === 0 || recordedBpm === null) return;

    // Create or reuse the recorded loop controller
    if (!recordedLoopControllerRef.current) {
      recordedLoopControllerRef.current = new RecordedLoopController();
    }

    // Set the recording data (uses detected BPM, ignores app BPM)
    recordedLoopControllerRef.current.setRecording(recordedChords, recordedBpm);
    recordedLoopControllerRef.current.start();
    setIsPlayingRecordedLoop(true);
  }, [recordedChords, recordedBpm]);

  const stopRecordedLoop = useCallback(() => {
    if (recordedLoopControllerRef.current) {
      recordedLoopControllerRef.current.stop();
    }
    setIsPlayingRecordedLoop(false);
  }, []);

  const value: AppContextType = {
    // State
    progression,
    scale,
    selectedChordIndex,
    isPlaying,
    currentChordIndex,
    currentPlayingChordIndex: currentChordIndex, // Alias for VoicingWheel
    bpm,
    transpose,
    performanceMode,
    isRecording,
    recordedChords,
    recordedBpm,
    isPlayingRecordedLoop,

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
    previewChordQuality,
    clearPreviewQuality,
    startRecording,
    stopRecording,
    clearRecording,
    startRecordedLoop,
    stopRecordedLoop,
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

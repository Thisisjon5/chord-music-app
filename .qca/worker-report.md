# Task 1 of 3: Recording Data Structure and Detection Logic

## What Changed
Added recording feature foundation to the AppContext. Created `RecordedChordEvent` type to store chord and timestamp data, implemented `detectBpm()` function that analyzes inter-chord intervals using median for robustness against variable timing, and integrated recording state/actions into the React context. The `triggerChord()` function now captures chords with precise timestamps when recording is active.

## Files Modified
- `src/store/types.ts`: Added `RecordedChordEvent` type, `detectBpm()` function, and recording state/action types
- `src/store/AppContext.tsx`: Added recording state (`isRecording`, `recordedChords`, `recordedBpm`), recording actions (`startRecording`, `stopRecording`, `clearRecording`), and timestamp capture in `triggerChord()`

## Subagents Used
None required for this task.

## Scope Concerns
None. Changes were limited to the specified files and did not touch LoopController logic, audio synthesis, or persistence.

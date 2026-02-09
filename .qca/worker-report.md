# Task 2 of 3: Implement Recorded Chord Playback Loop

## What Changed
Created a new `RecordedLoopController` class that manages playback of recorded chords independently from the main `LoopController`. This controller uses the detected BPM from the recording session and explicitly ignores both the app's BPM setting and performance transpose, ensuring the recorded loop plays back exactly as performed. Added `isPlayingRecordedLoop` state and `startRecordedLoop`/`stopRecordedLoop` actions to AppContext.

## Files Modified
- `src/audio/recordedLoopController.ts`: New file - `RecordedLoopController` class with `setRecording()`, `start()`, `stop()` methods
- `src/store/types.ts`: Added `isPlayingRecordedLoop` state and `startRecordedLoop`/`stopRecordedLoop` action types
- `src/store/AppContext.tsx`: Added recorded loop controller ref, playback state, and action implementations

## Subagents Used
None required for this task.

## Scope Concerns
None. The existing `LoopController` class was not modified per the scope guard requirements. The new controller is fully separate and does not share state with the main loop.

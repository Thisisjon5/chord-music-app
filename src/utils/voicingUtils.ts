// Voicing wheel utility functions

import { ChordQuality } from '../music/chords';

// 8 chord qualities arranged in wheel order (45 degrees each)
export const WHEEL_QUALITIES: ChordQuality[] = [
  'sus2',       // 0°
  'sus4',       // 45°
  'major',      // 90°
  'major7',     // 135°
  'minor',      // 180°
  'minor7',     // 225°
  'diminished', // 270°
  'augmented',  // 315°
];

/**
 * Maps an angle (0-360 degrees) to the nearest chord quality.
 * Each quality occupies a 45-degree wedge.
 *
 * Wedge layout (clockwise from top):
 * - 0° (337.5° - 22.5°): sus2
 * - 45° (22.5° - 67.5°): sus4
 * - 90° (67.5° - 112.5°): major
 * - 135° (112.5° - 157.5°): major7
 * - 180° (157.5° - 202.5°): minor
 * - 225° (202.5° - 247.5°): minor7
 * - 270° (247.5° - 292.5°): diminished
 * - 315° (292.5° - 337.5°): augmented
 *
 * @param angle - Angle in degrees (0-360, or any value that will be normalized)
 * @returns The nearest ChordQuality
 */
export function angleToChordQuality(angle: number): ChordQuality {
  // Normalize angle to 0-360
  const normalizedAngle = ((angle % 360) + 360) % 360;

  // Each quality occupies 45 degrees
  // Round to nearest 45-degree increment to find the index
  const index = Math.round(normalizedAngle / 45) % 8;

  return WHEEL_QUALITIES[index];
}

/**
 * Converts a chord quality to its corresponding angle on the wheel.
 *
 * @param quality - The chord quality to convert
 * @returns The angle in degrees (0-360)
 */
export function chordQualityToAngle(quality: ChordQuality): number {
  const index = WHEEL_QUALITIES.indexOf(quality);
  // Return 0 for qualities not in the wheel (like dominant7)
  return index >= 0 ? index * 45 : 0;
}

/**
 * Gets the index of a chord quality in the wheel.
 * Returns -1 if the quality is not in the wheel.
 *
 * @param quality - The chord quality to find
 * @returns The index (0-7) or -1 if not found
 */
export function getWheelQualityIndex(quality: ChordQuality): number {
  return WHEEL_QUALITIES.indexOf(quality);
}

/**
 * Checks if a chord quality is included in the voicing wheel.
 *
 * @param quality - The chord quality to check
 * @returns True if the quality is in the wheel
 */
export function isWheelQuality(quality: ChordQuality): boolean {
  return WHEEL_QUALITIES.includes(quality);
}

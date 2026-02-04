// Rotary voicing wheel for live chord quality morphing

import { useRef, useState, useCallback, useEffect } from 'react';
import { ChordQuality } from '../music/chords';
import {
  WHEEL_QUALITIES,
  angleToChordQuality,
  chordQualityToAngle,
} from '../utils/voicingUtils';

// Display names for chord qualities
const QUALITY_LABELS: Record<ChordQuality, string> = {
  major: 'Major',
  minor: 'Minor',
  diminished: 'Dim',
  augmented: 'Aug',
  sus2: 'sus2',
  sus4: 'sus4',
  major7: 'Maj7',
  minor7: 'Min7',
  dominant7: '7',
};

interface VoicingWheelProps {
  currentQuality?: ChordQuality;
  currentChordName?: string;
  isPlaying?: boolean;
  onRotate?: (angle: number, quality: ChordQuality) => void;
  onRelease?: (quality: ChordQuality) => void;
}

export function VoicingWheel({
  currentQuality = 'major',
  currentChordName = '',
  isPlaying = false,
  onRotate,
  onRelease,
}: VoicingWheelProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [angle, setAngle] = useState(() => chordQualityToAngle(currentQuality));
  const [hoveredQuality, setHoveredQuality] = useState<ChordQuality>(currentQuality);
  const dragStartAngleRef = useRef(0);
  const startAngleRef = useRef(0);

  // Update angle when currentQuality changes externally (new chord starts)
  useEffect(() => {
    if (!isDragging) {
      const newAngle = chordQualityToAngle(currentQuality);
      setAngle(newAngle);
      setHoveredQuality(currentQuality);
    }
  }, [currentQuality, isDragging]);

  // Calculate angle from mouse/touch position relative to center
  const getAngleFromEvent = useCallback((clientX: number, clientY: number): number => {
    if (!svgRef.current) return 0;
    const rect = svgRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = clientX - centerX;
    const dy = clientY - centerY;
    // Convert to degrees, with 0° at top
    let deg = Math.atan2(dx, -dy) * (180 / Math.PI);
    return (deg + 360) % 360;
  }, []);

  const handleDragStart = useCallback((clientX: number, clientY: number) => {
    setIsDragging(true);
    const currentAngleFromMouse = getAngleFromEvent(clientX, clientY);
    dragStartAngleRef.current = currentAngleFromMouse;
    startAngleRef.current = angle;
  }, [getAngleFromEvent, angle]);

  const handleDragMove = useCallback((clientX: number, clientY: number) => {
    if (!isDragging) return;

    const currentAngleFromMouse = getAngleFromEvent(clientX, clientY);
    let deltaAngle = currentAngleFromMouse - dragStartAngleRef.current;

    // Handle wrap-around
    if (deltaAngle > 180) deltaAngle -= 360;
    if (deltaAngle < -180) deltaAngle += 360;

    let newAngle = (startAngleRef.current + deltaAngle + 360) % 360;
    setAngle(newAngle);

    const quality = angleToChordQuality(newAngle);
    setHoveredQuality(quality);

    if (onRotate) {
      onRotate(newAngle, quality);
    }
  }, [isDragging, getAngleFromEvent, onRotate]);

  const handleDragEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);

    const quality = angleToChordQuality(angle);
    // Snap to nearest quality
    const snappedAngle = chordQualityToAngle(quality);
    setAngle(snappedAngle);

    if (onRelease) {
      onRelease(quality);
    }
  }, [isDragging, angle, onRelease]);

  // Mouse event handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientX, e.clientY);
  }, [handleDragStart]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      handleDragMove(e.clientX, e.clientY);
    };

    const handleMouseUp = () => {
      handleDragEnd();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

  // Touch event handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleDragStart(touch.clientX, touch.clientY);
  }, [handleDragStart]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleDragMove(touch.clientX, touch.clientY);
  }, [handleDragMove]);

  const handleTouchEnd = useCallback(() => {
    handleDragEnd();
  }, [handleDragEnd]);

  // SVG dimensions
  const size = 200;
  const center = size / 2;
  const outerRadius = 90;
  const innerRadius = 40;
  const labelRadius = 70;

  // Calculate wedge path
  const getWedgePath = (index: number): string => {
    const startAngle = (index * 45 - 22.5 - 90) * (Math.PI / 180);
    const endAngle = (index * 45 + 22.5 - 90) * (Math.PI / 180);

    const x1 = center + outerRadius * Math.cos(startAngle);
    const y1 = center + outerRadius * Math.sin(startAngle);
    const x2 = center + outerRadius * Math.cos(endAngle);
    const y2 = center + outerRadius * Math.sin(endAngle);
    const x3 = center + innerRadius * Math.cos(endAngle);
    const y3 = center + innerRadius * Math.sin(endAngle);
    const x4 = center + innerRadius * Math.cos(startAngle);
    const y4 = center + innerRadius * Math.sin(startAngle);

    return `M ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 0 0 ${x4} ${y4} Z`;
  };

  // Get label position
  const getLabelPosition = (index: number): { x: number; y: number } => {
    const angleRad = (index * 45 - 90) * (Math.PI / 180);
    return {
      x: center + labelRadius * Math.cos(angleRad),
      y: center + labelRadius * Math.sin(angleRad),
    };
  };

  // Needle rotation
  const needleAngle = angle - 90; // Adjust for SVG coordinate system

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        opacity: isPlaying ? 1 : 0.5,
        transition: 'opacity 0.3s ease',
        userSelect: 'none',
      }}
    >
      {/* Chord name display */}
      <div
        style={{
          fontSize: '0.875rem',
          fontWeight: 'bold',
          marginBottom: '0.5rem',
          color: 'var(--text-primary)',
          minHeight: '1.25rem',
        }}
      >
        {currentChordName || (isPlaying ? '' : 'Not playing')}
      </div>

      {/* SVG Wheel */}
      <svg
        ref={svgRef}
        width={size}
        height={size}
        style={{
          cursor: isDragging ? 'grabbing' : 'grab',
          touchAction: 'none',
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={outerRadius}
          fill="var(--bg-muted)"
          stroke="var(--border)"
          strokeWidth="2"
        />

        {/* Wedges */}
        {WHEEL_QUALITIES.map((quality, index) => {
          const isHighlighted = hoveredQuality === quality;
          const isCurrentQuality = currentQuality === quality;

          return (
            <path
              key={quality}
              d={getWedgePath(index)}
              fill={isHighlighted ? 'var(--accent)' : isCurrentQuality ? 'var(--bg-selected)' : 'var(--bg-card)'}
              stroke="var(--border)"
              strokeWidth="1"
              style={{
                transition: isDragging ? 'none' : 'fill 0.15s ease',
              }}
            />
          );
        })}

        {/* Labels */}
        {WHEEL_QUALITIES.map((quality, index) => {
          const pos = getLabelPosition(index);
          const isHighlighted = hoveredQuality === quality;

          return (
            <text
              key={`label-${quality}`}
              x={pos.x}
              y={pos.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={isHighlighted ? 'white' : 'var(--text-primary)'}
              fontSize="10"
              fontWeight={isHighlighted ? 'bold' : 'normal'}
              style={{
                pointerEvents: 'none',
                transition: isDragging ? 'none' : 'fill 0.15s ease',
              }}
            >
              {QUALITY_LABELS[quality]}
            </text>
          );
        })}

        {/* Center circle */}
        <circle
          cx={center}
          cy={center}
          r={innerRadius - 5}
          fill="var(--bg-card)"
          stroke="var(--border)"
          strokeWidth="2"
        />

        {/* Needle */}
        <g
          transform={`rotate(${needleAngle}, ${center}, ${center})`}
          style={{
            transition: isDragging ? 'none' : 'transform 0.15s ease-out',
          }}
        >
          <line
            x1={center}
            y1={center}
            x2={center}
            y2={center - outerRadius + 10}
            stroke="var(--accent)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle
            cx={center}
            cy={center - outerRadius + 10}
            r="5"
            fill="var(--accent)"
          />
        </g>

        {/* Center dot */}
        <circle
          cx={center}
          cy={center}
          r="6"
          fill="var(--accent)"
        />
      </svg>

      {/* Hovered quality display */}
      <div
        style={{
          fontSize: '1rem',
          fontWeight: 'bold',
          marginTop: '0.5rem',
          color: isDragging ? 'var(--accent)' : 'var(--text-secondary)',
          minHeight: '1.5rem',
          transition: 'color 0.15s ease',
        }}
      >
        {isDragging ? QUALITY_LABELS[hoveredQuality] : QUALITY_LABELS[currentQuality]}
      </div>
    </div>
  );
}

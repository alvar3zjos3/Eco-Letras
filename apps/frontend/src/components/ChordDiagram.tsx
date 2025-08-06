'use client';

import React from 'react';

interface ChordPosition {
  fret: number;
  finger: number;
}

interface ChordDiagramProps {
  chordName: string;
  positions: (ChordPosition | null)[];
  barres?: { fret: number; fromString: number; toString: number }[];
  className?: string;
}

const ChordDiagram: React.FC<ChordDiagramProps> = ({
  chordName,
  positions,
  barres = [],
  className = ''
}) => {
  const strings = 6;
  const frets = 5;
  const stringSpacing = 25;
  const fretSpacing = 30;
  const width = (strings - 1) * stringSpacing + 40;
  const height = frets * fretSpacing + 60;

  // Determinar si necesitamos mostrar el número de traste inicial
  const minFret = Math.min(...positions.filter(p => p !== null).map(p => p!.fret));
  const showFretNumber = minFret > 1;
  const baseFret = showFretNumber ? minFret : 1;

  return (
    <div className={`inline-block ${className}`}>
      <div className="text-center mb-2">
        <h3 className="text-lg font-bold text-foreground">{chordName}</h3>
      </div>
      
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="bg-card/50 rounded-lg border border-border shadow-lg"
      >
        {/* Fondo */}
        <rect
          x="0"
          y="0"
          width={width}
          height={height}
          fill="transparent"
        />
        
        {/* Número de traste si es necesario */}
        {showFretNumber && (
          <text
            x="10"
            y="45"
            fill="currentColor"
            className="text-sm font-medium fill-muted-foreground"
            textAnchor="middle"
          >
            {baseFret}
          </text>
        )}
        
        {/* Cuerdas (líneas verticales) */}
        {Array.from({ length: strings }, (_, i) => (
          <line
            key={`string-${i}`}
            x1={20 + i * stringSpacing}
            y1="30"
            x2={20 + i * stringSpacing}
            y2={30 + frets * fretSpacing}
            stroke="currentColor"
            strokeWidth="2"
            className="stroke-muted-foreground"
          />
        ))}
        
        {/* Trastes (líneas horizontales) */}
        {Array.from({ length: frets + 1 }, (_, i) => (
          <line
            key={`fret-${i}`}
            x1="20"
            y1={30 + i * fretSpacing}
            x2={20 + (strings - 1) * stringSpacing}
            y2={30 + i * fretSpacing}
            stroke="currentColor"
            strokeWidth={i === 0 ? "4" : "2"}
            className={i === 0 ? "stroke-foreground" : "stroke-muted-foreground"}
          />
        ))}
        
        {/* Barres */}
        {barres.map((barre, index) => {
          const fretPosition = 30 + (barre.fret - baseFret + 0.5) * fretSpacing;
          const startX = 20 + (strings - barre.toString - 1) * stringSpacing;
          const endX = 20 + (strings - barre.fromString - 1) * stringSpacing;
          
          return (
            <line
              key={`barre-${index}`}
              x1={startX}
              y1={fretPosition}
              x2={endX}
              y2={fretPosition}
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              className="stroke-primary"
            />
          );
        })}
        
        {/* Posiciones de los dedos */}
        {positions.map((position, stringIndex) => {
          if (!position) {
            // Cuerda no tocada (X)
            const x = 20 + (strings - stringIndex - 1) * stringSpacing;
            return (
              <g key={`position-${stringIndex}`}>
                <line
                  x1={x - 4}
                  y1="20"
                  x2={x + 4}
                  y2="28"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="stroke-destructive"
                />
                <line
                  x1={x + 4}
                  y1="20"
                  x2={x - 4}
                  y2="28"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="stroke-destructive"
                />
              </g>
            );
          }
          
          if (position.fret === 0) {
            // Cuerda al aire (O)
            const x = 20 + (strings - stringIndex - 1) * stringSpacing;
            return (
              <circle
                key={`position-${stringIndex}`}
                cx={x}
                cy="24"
                r="6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="stroke-primary"
              />
            );
          }
          
          // Dedo en traste
          const x = 20 + (strings - stringIndex - 1) * stringSpacing;
          const y = 30 + (position.fret - baseFret + 0.5) * fretSpacing;
          
          return (
            <g key={`position-${stringIndex}`}>
              <circle
                cx={x}
                cy={y}
                r="8"
                fill="currentColor"
                className="fill-primary"
              />
              <text
                x={x}
                y={y + 1}
                fill="currentColor"
                className="text-xs font-bold fill-primary-foreground"
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {position.finger}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default ChordDiagram;


'use client';

import React, { useState } from 'react';
import ChordDiagram from './ChordDiagram';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Music } from 'lucide-react';

// Biblioteca de acordes comunes para música cristiana
const chordLibrary = {
  // Acordes mayores
  'C': {
    positions: [
      null, // 6ta cuerda no se toca
      { fret: 3, finger: 3 }, // 5ta cuerda, 3er traste
      { fret: 2, finger: 2 }, // 4ta cuerda, 2do traste
      { fret: 0, finger: 0 }, // 3ra cuerda al aire
      { fret: 1, finger: 1 }, // 2da cuerda, 1er traste
      { fret: 0, finger: 0 }  // 1ra cuerda al aire
    ]
  },
  'D': {
    positions: [
      null, // 6ta cuerda no se toca
      null, // 5ta cuerda no se toca
      { fret: 0, finger: 0 }, // 4ta cuerda al aire
      { fret: 2, finger: 1 }, // 3ra cuerda, 2do traste
      { fret: 3, finger: 3 }, // 2da cuerda, 3er traste
      { fret: 2, finger: 2 }  // 1ra cuerda, 2do traste
    ]
  },
  'E': {
    positions: [
      { fret: 0, finger: 0 }, // 6ta cuerda al aire
      { fret: 2, finger: 2 }, // 5ta cuerda, 2do traste
      { fret: 2, finger: 3 }, // 4ta cuerda, 2do traste
      { fret: 1, finger: 1 }, // 3ra cuerda, 1er traste
      { fret: 0, finger: 0 }, // 2da cuerda al aire
      { fret: 0, finger: 0 }  // 1ra cuerda al aire
    ]
  },
  'F': {
    positions: [
      { fret: 1, finger: 1 }, // 6ta cuerda, 1er traste
      { fret: 1, finger: 1 }, // 5ta cuerda, 1er traste
      { fret: 3, finger: 3 }, // 4ta cuerda, 3er traste
      { fret: 3, finger: 4 }, // 3ra cuerda, 3er traste
      { fret: 2, finger: 2 }, // 2da cuerda, 2do traste
      { fret: 1, finger: 1 }  // 1ra cuerda, 1er traste
    ],
    barres: [{ fret: 1, fromString: 1, toString: 6 }]
  },
  'G': {
    positions: [
      { fret: 3, finger: 2 }, // 6ta cuerda, 3er traste
      { fret: 2, finger: 1 }, // 5ta cuerda, 2do traste
      { fret: 0, finger: 0 }, // 4ta cuerda al aire
      { fret: 0, finger: 0 }, // 3ra cuerda al aire
      { fret: 3, finger: 4 }, // 2da cuerda, 3er traste
      { fret: 3, finger: 3 }  // 1ra cuerda, 3er traste
    ]
  },
  'A': {
    positions: [
      null, // 6ta cuerda no se toca
      { fret: 0, finger: 0 }, // 5ta cuerda al aire
      { fret: 2, finger: 1 }, // 4ta cuerda, 2do traste
      { fret: 2, finger: 2 }, // 3ra cuerda, 2do traste
      { fret: 2, finger: 3 }, // 2da cuerda, 2do traste
      { fret: 0, finger: 0 }  // 1ra cuerda al aire
    ]
  },
  'B': {
    positions: [
      null, // 6ta cuerda no se toca
      { fret: 2, finger: 1 }, // 5ta cuerda, 2do traste
      { fret: 4, finger: 3 }, // 4ta cuerda, 4to traste
      { fret: 4, finger: 4 }, // 3ra cuerda, 4to traste
      { fret: 4, finger: 2 }, // 2da cuerda, 4to traste
      { fret: 2, finger: 1 }  // 1ra cuerda, 2do traste
    ]
  },
  
  // Acordes menores
  'Am': {
    positions: [
      null, // 6ta cuerda no se toca
      { fret: 0, finger: 0 }, // 5ta cuerda al aire
      { fret: 2, finger: 3 }, // 4ta cuerda, 2do traste
      { fret: 2, finger: 2 }, // 3ra cuerda, 2do traste
      { fret: 1, finger: 1 }, // 2da cuerda, 1er traste
      { fret: 0, finger: 0 }  // 1ra cuerda al aire
    ]
  },
  'Dm': {
    positions: [
      null, // 6ta cuerda no se toca
      null, // 5ta cuerda no se toca
      { fret: 0, finger: 0 }, // 4ta cuerda al aire
      { fret: 2, finger: 2 }, // 3ra cuerda, 2do traste
      { fret: 3, finger: 3 }, // 2da cuerda, 3er traste
      { fret: 1, finger: 1 }  // 1ra cuerda, 1er traste
    ]
  },
  'Em': {
    positions: [
      { fret: 0, finger: 0 }, // 6ta cuerda al aire
      { fret: 2, finger: 2 }, // 5ta cuerda, 2do traste
      { fret: 2, finger: 3 }, // 4ta cuerda, 2do traste
      { fret: 0, finger: 0 }, // 3ra cuerda al aire
      { fret: 0, finger: 0 }, // 2da cuerda al aire
      { fret: 0, finger: 0 }  // 1ra cuerda al aire
    ]
  },
  'Fm': {
    positions: [
      { fret: 1, finger: 1 }, // 6ta cuerda, 1er traste
      { fret: 1, finger: 1 }, // 5ta cuerda, 1er traste
      { fret: 3, finger: 3 }, // 4ta cuerda, 3er traste
      { fret: 3, finger: 4 }, // 3ra cuerda, 3er traste
      { fret: 1, finger: 1 }, // 2da cuerda, 1er traste
      { fret: 1, finger: 1 }  // 1ra cuerda, 1er traste
    ],
    barres: [{ fret: 1, fromString: 1, toString: 6 }]
  },
  'Gm': {
    positions: [
      { fret: 3, finger: 1 }, // 6ta cuerda, 3er traste
      { fret: 5, finger: 3 }, // 5ta cuerda, 5to traste
      { fret: 5, finger: 4 }, // 4ta cuerda, 5to traste
      { fret: 3, finger: 1 }, // 3ra cuerda, 3er traste
      { fret: 3, finger: 1 }, // 2da cuerda, 3er traste
      { fret: 3, finger: 1 }  // 1ra cuerda, 3er traste
    ],
    barres: [{ fret: 3, fromString: 1, toString: 6 }]
  }
};

interface ChordLibraryProps {
  className?: string;
  onChordSelect?: (chordName: string) => void;
}

const ChordLibrary: React.FC<ChordLibraryProps> = ({
  className = '',
  onChordSelect
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = {
    all: 'Todos',
    major: 'Mayores',
    minor: 'Menores'
  };

  const filteredChords = Object.entries(chordLibrary).filter(([chordName]) => {
    const matchesSearch = chordName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = 
      selectedCategory === 'all' ||
      (selectedCategory === 'major' && !chordName.includes('m')) ||
      (selectedCategory === 'minor' && chordName.includes('m'));
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className={`glass-card p-6 ${className}`}>
      <div className="flex items-center gap-2 mb-6">
        <Music className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold text-gradient">
          Biblioteca de Acordes
        </h2>
      </div>

      {/* Controles de búsqueda y filtros */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar acorde (ej: C, Am, G7...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/50"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {Object.entries(categories).map(([key, label]) => (
            <Button
              key={key}
              variant={selectedCategory === key ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(key)}
              className={selectedCategory === key ? "btn-gradient" : ""}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      {/* Grid de acordes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredChords.map(([chordName, chordData]) => (
          <div
            key={chordName}
            className="interactive-hover cursor-pointer"
            onClick={() => onChordSelect?.(chordName)}
          >
            <ChordDiagram
              chordName={chordName}
              positions={chordData.positions}
              barres={chordData.barres}
              className="w-full"
            />
          </div>
        ))}
      </div>

      {filteredChords.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Music className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No se encontraron acordes que coincidan con tu búsqueda.</p>
        </div>
      )}

      {/* Información adicional */}
      <div className="mt-8 p-4 bg-card/30 rounded-lg border border-border">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Cómo leer los diagramas
        </h3>
        <div className="text-sm text-muted-foreground space-y-1">
          <p>• Los números en los círculos indican qué dedo usar (1=índice, 2=medio, 3=anular, 4=meñique)</p>
          <p>• Las líneas horizontales gruesas indican cejillas (barres)</p>
          <p>• Los círculos vacíos (O) indican cuerdas al aire</p>
          <p>• Las X indican cuerdas que no se tocan</p>
        </div>
      </div>
    </div>
  );
};

export default ChordLibrary;


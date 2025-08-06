'use client';

import React from 'react';

interface TabViewerProps {
  tablature: string;
  title?: string;
  className?: string;
}

const TabViewer: React.FC<TabViewerProps> = ({
  tablature,
  title,
  className = ''
}) => {
  // Procesar la tablatura para mostrarla correctamente
  const processTab = (tab: string) => {
    const lines = tab.split('\n').filter(line => line.trim() !== '');
    const processedLines = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Detectar líneas de tablatura (contienen números y guiones)
      if (/^[e|B|G|D|A|E][\|\-\d\s\(\)\/\\~\^vbrhpx]*$/.test(line.trim())) {
        processedLines.push({
          type: 'tab',
          content: line,
          string: line.charAt(0)
        });
      }
      // Detectar acordes (líneas cortas con letras mayúsculas)
      else if (/^[A-G][#b]?[m]?[0-9]?[sus]?[add]?[maj]?[min]?[dim]?[aug]?[\s]*$/.test(line.trim()) && line.length < 20) {
        processedLines.push({
          type: 'chord',
          content: line.trim()
        });
      }
      // Texto normal o letras
      else {
        processedLines.push({
          type: 'text',
          content: line
        });
      }
    }
    
    return processedLines;
  };

  const processedLines = processTab(tablature);

  return (
    <div className={`glass-card p-6 ${className}`}>
      {title && (
        <h3 className="text-xl font-bold text-foreground mb-4 text-center">
          {title}
        </h3>
      )}
      
      <div className="bg-card/30 rounded-lg p-4 border border-border">
        <pre className="font-mono text-sm leading-relaxed overflow-x-auto">
          {processedLines.map((line, index) => (
            <div key={index} className="min-h-[1.5rem]">
              {line.type === 'tab' && (
                <div className="flex">
                  <span className="text-primary font-bold mr-2 w-4">
                    {line.string}
                  </span>
                  <span className="text-foreground font-mono">
                    {line.content.substring(1)}
                  </span>
                </div>
              )}
              
              {line.type === 'chord' && (
                <div className="text-primary font-bold text-base my-2">
                  {line.content}
                </div>
              )}
              
              {line.type === 'text' && (
                <div className="text-muted-foreground my-1">
                  {line.content}
                </div>
              )}
            </div>
          ))}
        </pre>
      </div>
      
      {/* Leyenda de símbolos de tablatura */}
      <div className="mt-4 text-xs text-muted-foreground">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div><span className="font-mono">h</span> = hammer-on</div>
          <div><span className="font-mono">p</span> = pull-off</div>
          <div><span className="font-mono">b</span> = bend</div>
          <div><span className="font-mono">r</span> = release</div>
          <div><span className="font-mono">/</span> = slide up</div>
          <div><span className="font-mono">\</span> = slide down</div>
          <div><span className="font-mono">~</span> = vibrato</div>
          <div><span className="font-mono">x</span> = mute</div>
        </div>
      </div>
    </div>
  );
};

export default TabViewer;


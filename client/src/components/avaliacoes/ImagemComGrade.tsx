import { useState } from 'react';

interface ImagemComGradeProps {
  src: string;
  alt: string;
  showGrid?: boolean;
}

export function ImagemComGrade({ src, alt, showGrid = true }: ImagemComGradeProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  if (!src) {
    return (
      <div className="relative w-full h-full flex items-center justify-center bg-gray-800">
        <p className="text-gray-500 text-sm">Sem imagem</p>
      </div>
    );
  }

  if (imageError) {
    return (
      <div className="relative w-full h-full flex items-center justify-center bg-gray-800">
        <p className="text-red-500 text-sm">Erro ao carregar</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-gray-900">
      {!imageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-contain"
        onLoad={() => {
          setImageLoaded(true);
          setImageError(false);
        }}
        onError={() => {
          console.error('Erro ao carregar imagem:', src);
          setImageError(true);
        }}
        crossOrigin="anonymous"
      />
      {showGrid && imageLoaded && (
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ mixBlendMode: 'difference' }}
        >
          {/* Grade de alinhamento */}
          <defs>
            <pattern
              id="grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="rgba(255, 255, 255, 0.3)"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Linhas principais de referência */}
          {/* Linha vertical central */}
          <line
            x1="50%"
            y1="0"
            x2="50%"
            y2="100%"
            stroke="rgba(255, 0, 0, 0.6)"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
          
          {/* Linha horizontal superior (cabeça) */}
          <line
            x1="0"
            y1="10%"
            x2="100%"
            y2="10%"
            stroke="rgba(0, 255, 0, 0.5)"
            strokeWidth="1.5"
            strokeDasharray="5,5"
          />
          
          {/* Linha horizontal ombros */}
          <line
            x1="0"
            y1="20%"
            x2="100%"
            y2="20%"
            stroke="rgba(0, 255, 0, 0.5)"
            strokeWidth="1.5"
            strokeDasharray="5,5"
          />
          
          {/* Linha horizontal quadril */}
          <line
            x1="0"
            y1="50%"
            x2="100%"
            y2="50%"
            stroke="rgba(0, 255, 0, 0.5)"
            strokeWidth="1.5"
            strokeDasharray="5,5"
          />
          
          {/* Linha horizontal joelhos */}
          <line
            x1="0"
            y1="70%"
            x2="100%"
            y2="70%"
            stroke="rgba(0, 255, 0, 0.5)"
            strokeWidth="1.5"
            strokeDasharray="5,5"
          />
          
          {/* Linha horizontal pés */}
          <line
            x1="0"
            y1="90%"
            x2="100%"
            y2="90%"
            stroke="rgba(0, 255, 0, 0.5)"
            strokeWidth="1.5"
            strokeDasharray="5,5"
          />

          {/* Letras e números da grade */}
          {/* Letras no topo */}
          {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O'].map((letter, i) => (
            <text
              key={`letter-${i}`}
              x={`${(i + 1) * 6.67}%`}
              y="15"
              fill="white"
              fontSize="12"
              fontWeight="bold"
              textAnchor="middle"
              style={{ textShadow: '0 0 3px black' }}
            >
              {letter}
            </text>
          ))}

          {/* Números na lateral */}
          {Array.from({ length: 24 }, (_, i) => i + 1).map((num) => (
            <text
              key={`num-${num}`}
              x="15"
              y={`${num * 4.17}%`}
              fill="white"
              fontSize="12"
              fontWeight="bold"
              textAnchor="middle"
              style={{ textShadow: '0 0 3px black' }}
            >
              {num}
            </text>
          ))}
        </svg>
      )}
    </div>
  );
}

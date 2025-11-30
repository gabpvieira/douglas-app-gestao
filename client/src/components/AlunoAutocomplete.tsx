import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { User, Check } from 'lucide-react';
import { useAlunos } from '@/hooks/useAlunos';

interface Aluno {
  id: string;
  nome: string;
  email: string;
}

interface AlunoAutocompleteProps {
  value: string;
  onSelect: (aluno: Aluno) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

export function AlunoAutocomplete({
  value,
  onSelect,
  label = "Aluno",
  placeholder = "Digite o nome do aluno...",
  className = ""
}: AlunoAutocompleteProps) {
  const [searchTerm, setSearchTerm] = useState(value);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedAluno, setSelectedAluno] = useState<Aluno | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  
  const { data: alunosSupabase = [], isLoading } = useAlunos();
  
  // Converter dados do Supabase para formato esperado
  const alunos: Aluno[] = alunosSupabase.map(aluno => ({
    id: aluno.id,
    nome: aluno.nome,
    email: aluno.email
  }));

  // Filtrar alunos baseado no termo de busca
  const filteredAlunos = alunos.filter(aluno =>
    aluno.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    aluno.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fechar sugestões ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowSuggestions(true);
    setSelectedAluno(null);
  };

  const handleSelectAluno = (aluno: Aluno) => {
    setSearchTerm(aluno.nome);
    setSelectedAluno(aluno);
    setShowSuggestions(false);
    onSelect(aluno);
  };

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <Label className="text-gray-300 text-xs sm:text-sm mb-2 block">{label}</Label>
      <div className="relative">
        <Input
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setShowSuggestions(true)}
          placeholder={placeholder}
          className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 text-xs sm:text-sm pr-10"
        />
        {selectedAluno && (
          <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-500" />
        )}
      </div>

      {/* Sugestões */}
      {showSuggestions && searchTerm && (
        <Card className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto border-gray-700 bg-gray-800 shadow-xl">
          {isLoading ? (
            <div className="p-3 text-center text-gray-400 text-sm">
              Carregando alunos...
            </div>
          ) : filteredAlunos.length === 0 ? (
            <div className="p-3 text-center text-gray-400 text-sm">
              Nenhum aluno encontrado
            </div>
          ) : (
            <div className="py-1">
              {filteredAlunos.map((aluno) => (
                <button
                  key={aluno.id}
                  onClick={() => handleSelectAluno(aluno)}
                  className="w-full px-3 py-2 text-left hover:bg-gray-700 transition-colors flex items-center gap-3 group"
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate group-hover:text-blue-300">
                      {aluno.nome}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {aluno.email}
                    </p>
                  </div>
                  {selectedAluno?.id === aluno.id && (
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

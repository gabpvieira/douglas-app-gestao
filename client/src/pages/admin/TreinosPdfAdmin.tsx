import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  Search, 
  Download, 
  Trash2, 
  FileText,
  Calendar
} from 'lucide-react';
import { useAlunos } from '@/hooks/useAlunos';
import { useTreinosPdf, useDeleteTreinoPdf, useDownloadTreinoPdf } from '@/hooks/useTreinosPdf';
import { UploadTreinoPdf } from '@/components/UploadTreinoPdf';

export default function TreinosPdfAdmin() {
  const [selectedAlunoId, setSelectedAlunoId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  const { data: alunos = [], isLoading: loadingAlunos } = useAlunos();
  const { data: treinos = [], isLoading: loadingTreinos } = useTreinosPdf(selectedAlunoId);
  const deleteTreino = useDeleteTreinoPdf();
  const downloadTreino = useDownloadTreinoPdf();

  const alunosAtivos = alunos.filter(a => a.status === 'ativo');
  
  const filteredTreinos = treinos.filter(t =>
    t.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja deletar este treino?')) {
      deleteTreino.mutate(id);
    }
  };

  const handleDownload = (id: string) => {
    downloadTreino.mutate(id);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Treinos PDF</h1>
          <p className="text-muted-foreground">
            Gerencie os treinos em PDF dos alunos
          </p>
        </div>
        <Button
          onClick={() => setUploadDialogOpen(true)}
          disabled={!selectedAlunoId}
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload Treino
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Selecionar Aluno</label>
              <Select
                value={selectedAlunoId}
                onValueChange={setSelectedAlunoId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um aluno" />
                </SelectTrigger>
                <SelectContent>
                  {loadingAlunos ? (
                    <SelectItem value="loading" disabled>
                      Carregando...
                    </SelectItem>
                  ) : alunosAtivos.length === 0 ? (
                    <SelectItem value="empty" disabled>
                      Nenhum aluno ativo
                    </SelectItem>
                  ) : (
                    alunosAtivos.map((aluno) => (
                      <SelectItem key={aluno.id} value={aluno.id}>
                        {aluno.nome}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar Treino</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Nome do treino..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  disabled={!selectedAlunoId}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Treinos */}
      {!selectedAlunoId ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">
              Selecione um aluno
            </h3>
            <p className="text-muted-foreground">
              Escolha um aluno para visualizar seus treinos em PDF
            </p>
          </CardContent>
        </Card>
      ) : loadingTreinos ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Carregando treinos...</p>
          </CardContent>
        </Card>
      ) : filteredTreinos.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm ? 'Nenhum treino encontrado' : 'Nenhum treino cadastrado'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm 
                ? 'Tente buscar com outros termos'
                : 'Faça upload do primeiro treino PDF para este aluno'
              }
            </p>
            {!searchTerm && (
              <Button onClick={() => setUploadDialogOpen(true)}>
                <Upload className="w-4 h-4 mr-2" />
                Upload Treino
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTreinos.map((treino) => (
            <Card key={treino.id} className="hover-elevate">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    <CardTitle className="text-base">{treino.nome}</CardTitle>
                  </div>
                  <Badge variant="outline">PDF</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {treino.descricao && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {treino.descricao}
                  </p>
                )}
                
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  {new Date(treino.dataUpload).toLocaleDateString('pt-BR')}
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleDownload(treino.id)}
                    disabled={downloadTreino.isPending}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(treino.id)}
                    disabled={deleteTreino.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Dialog */}
      {selectedAlunoId && (
        <UploadTreinoPdf
          alunoId={selectedAlunoId}
          open={uploadDialogOpen}
          onOpenChange={setUploadDialogOpen}
        />
      )}
    </div>
  );
}

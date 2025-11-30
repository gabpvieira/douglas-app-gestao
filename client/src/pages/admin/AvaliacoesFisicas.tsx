/**
 * Página de Avaliações Físicas - Admin
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PageHeader from '@/components/PageHeader';
import NovaAvaliacaoModal from '@/components/avaliacoes/NovaAvaliacaoModal';
import { ModulosAdicionaisModal } from '@/components/avaliacoes/ModulosAdicionaisModal';
import { useAvaliacoes } from '@/hooks/useAvaliacoesFisicas';
import { Plus, Calendar, User, Activity, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function AvaliacoesFisicas() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modulosModalOpen, setModulosModalOpen] = useState(false);
  const [selectedAvaliacao, setSelectedAvaliacao] = useState<{ id: string; alunoId: string } | null>(null);
  const { data: avaliacoes, isLoading } = useAvaliacoes();

  const handleOpenModulos = (avaliacaoId: string, alunoId: string) => {
    setSelectedAvaliacao({ id: avaliacaoId, alunoId });
    setModulosModalOpen(true);
  };

  const getProtocoloBadge = (protocolo: string) => {
    if (protocolo === 'pollock_7_dobras') return '7 Dobras';
    if (protocolo === 'pollock_3_dobras') return '3 Dobras';
    return 'Manual';
  };

  const getClassificacaoColor = (classificacao?: string) => {
    if (!classificacao) return 'default';
    const lower = classificacao.toLowerCase();
    if (lower.includes('atleta') || lower.includes('excelente')) return 'default';
    if (lower.includes('bom')) return 'secondary';
    if (lower.includes('regular')) return 'outline';
    return 'destructive';
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Avaliações Físicas"
        description="Gerencie avaliações de composição corporal dos alunos"
        actions={
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Avaliação
          </Button>
        }
      />

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Carregando avaliações...</p>
        </div>
      ) : avaliacoes && avaliacoes.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {avaliacoes.map((avaliacao) => (
            <Card key={avaliacao.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {avaliacao.aluno?.nome}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {avaliacao.dataAvaliacao && format(new Date(avaliacao.dataAvaliacao), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                    </CardDescription>
                  </div>
                  <Badge variant="outline">
                    {getProtocoloBadge(avaliacao.protocolo || 'manual')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Peso</p>
                    <p className="text-lg font-semibold">{avaliacao.peso} kg</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">IMC</p>
                    <p className="text-lg font-semibold">{avaliacao.imc}</p>
                  </div>
                </div>

                {avaliacao.percentualGordura && (
                  <div className="space-y-2 pt-2 border-t">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">% Gordura</span>
                      </div>
                      <span className="text-lg font-bold">{avaliacao.percentualGordura}%</span>
                    </div>
                    {avaliacao.classificacaoGordura && (
                      <Badge variant={getClassificacaoColor(avaliacao.classificacaoGordura)} className="w-full justify-center">
                        {avaliacao.classificacaoGordura}
                      </Badge>
                    )}
                  </div>
                )}

                {avaliacao.massaMagra && avaliacao.massaGorda && (
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Massa Magra</p>
                      <p className="text-sm font-semibold text-green-600">{avaliacao.massaMagra} kg</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Massa Gorda</p>
                      <p className="text-sm font-semibold text-red-600">{avaliacao.massaGorda} kg</p>
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => handleOpenModulos(avaliacao.id, avaliacao.alunoId)}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Módulos Adicionais
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma avaliação cadastrada</h3>
            <p className="text-muted-foreground mb-4">
              Comece criando a primeira avaliação física de um aluno.
            </p>
            <Button onClick={() => setModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Avaliação
            </Button>
          </CardContent>
        </Card>
      )}

      <NovaAvaliacaoModal
        open={modalOpen}
        onOpenChange={setModalOpen}
      />

      {selectedAvaliacao && (
        <ModulosAdicionaisModal
          open={modulosModalOpen}
          onOpenChange={setModulosModalOpen}
          avaliacaoId={selectedAvaliacao.id}
          alunoId={selectedAvaliacao.alunoId}
        />
      )}
    </div>
  );
}

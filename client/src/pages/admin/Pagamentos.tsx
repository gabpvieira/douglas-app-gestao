import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Table, TableHead, TableHeader, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { useNotification } from "@/hooks/useNotification";
import PageHeader from "@/components/PageHeader";
import { AlunoAutocomplete } from "@/components/AlunoAutocomplete";
import { DollarSign, Users, AlertCircle, Plus, Loader2 } from "lucide-react";
import {
  useAssinaturasComPagamentos,
  useCancelAssinatura,
  useDeleteAssinatura,
  useAprovarPagamento,
  useCreateAssinaturaComPagamento,
  type AssinaturaComPagamentos,
} from "@/hooks/usePagamentos";

type PlanoId = "online_mensal" | "online_trimestral" | "online_familia" | "presencial_3x" | "presencial_4x" | "presencial_5x" | "personalizado";

const PLANOS: Record<PlanoId, { nome: string; preco: number; periodo: string; popular?: boolean; precoOriginal?: number; categoria: 'online' | 'presencial' | 'custom' }> = {
  // Planos Online (valores em centavos)
  online_mensal: { nome: "Online Mensal", preco: 10000, periodo: "/mês", categoria: 'online' },
  online_trimestral: { nome: "Online Trimestral", preco: 25000, periodo: "/3 meses", popular: true, precoOriginal: 30000, categoria: 'online' },
  online_familia: { nome: "Online Família", preco: 9000, periodo: "/pessoa/mês", categoria: 'online' },
  
  // Planos Presenciais (valores em centavos)
  presencial_3x: { nome: "Presencial 3x/semana", preco: 45000, periodo: "/mês", categoria: 'presencial' },
  presencial_4x: { nome: "Presencial 4x/semana", preco: 55000, periodo: "/mês", categoria: 'presencial' },
  presencial_5x: { nome: "Presencial 5x/semana", preco: 70000, periodo: "/mês", categoria: 'presencial' },
  
  // Personalizado
  personalizado: { nome: "Personalizado", preco: 0, periodo: "", categoria: 'custom' },
};

const METODO_PAGAMENTO_LABELS: Record<string, string> = {
  credit_card: 'Cartão de Crédito',
  debit_card: 'Cartão de Débito',
  pix: 'PIX',
  boleto: 'Boleto',
};

function formatCurrency(v: number) {
  // Valor vem em centavos do banco
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v / 100);
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('pt-BR');
}

export default function PagamentosAdmin() {
  const { notify } = useNotification();
  const { data: assinaturas, isLoading } = useAssinaturasComPagamentos();
  const cancelAssinatura = useCancelAssinatura();
  const deleteAssinatura = useDeleteAssinatura();
  const aprovarPagamento = useAprovarPagamento();
  const createAssinaturaComPagamento = useCreateAssinaturaComPagamento();

  const [alunoSelecionado, setAlunoSelecionado] = useState<{ id: string; nome: string; email: string } | null>(null);
  const [novoPlano, setNovoPlano] = useState<PlanoId>("online_mensal");
  const [valorPersonalizado, setValorPersonalizado] = useState<number>(0);
  const [quantidade, setQuantidade] = useState(1);
  const [metodoPagamento, setMetodoPagamento] = useState<'credit_card' | 'debit_card' | 'pix' | 'boleto'>('pix');
  const [inicio, setInicio] = useState<string>(new Date().toISOString().slice(0, 10));

  const receitaMensalEstimativa = useMemo(() => {
    if (!assinaturas) return 0;
    return assinaturas
      .filter((a) => a.status === 'ativa')
      .reduce((acc, a) => {
        // Valor já vem em centavos do banco
        if (a.plano_tipo === "online_trimestral") return acc + a.preco / 3;
        return acc + a.preco;
      }, 0);
  }, [assinaturas]);

  const porPlano = useMemo(() => {
    const r: Record<string, number> = {
      online: 0,
      presencial: 0,
      personalizado: 0
    };
    if (!assinaturas) return r;
    assinaturas.forEach((a) => {
      if (a.status === 'ativa') {
        if (a.plano_tipo.startsWith('online_')) r.online += 1;
        else if (a.plano_tipo.startsWith('presencial_')) r.presencial += 1;
        else r.personalizado += 1;
      }
    });
    return r;
  }, [assinaturas]);

  const pendencias = useMemo(() => {
    if (!assinaturas) return 0;
    return assinaturas.filter((a) => 
      a.pagamentos.some(p => p.status === 'pendente')
    ).length;
  }, [assinaturas]);

  const valorPlanoAtual = useMemo(() => {
    if (novoPlano === "personalizado") return valorPersonalizado;
    
    const p = PLANOS[novoPlano];
    if (novoPlano === "online_familia") return p.preco * quantidade;
    return p.preco;
  }, [novoPlano, quantidade, valorPersonalizado]);

  const criarCobranca = async () => {
    if (!alunoSelecionado) {
      notify.warning("Aluno obrigatório", "Selecione um aluno para criar a cobrança");
      return;
    }

    if (novoPlano === "personalizado" && valorPersonalizado <= 0) {
      notify.warning("Valor obrigatório", "Informe o valor personalizado");
      return;
    }

    try {
      // Calcular data de fim baseado no plano
      const dataInicio = new Date(inicio);
      const dataFim = new Date(dataInicio);
      
      if (novoPlano === 'online_trimestral') {
        dataFim.setMonth(dataFim.getMonth() + 3);
      } else {
        dataFim.setMonth(dataFim.getMonth() + 1); // Todos os outros são mensais
      }

      await createAssinaturaComPagamento.mutateAsync({
        aluno_id: alunoSelecionado.id,
        plano_tipo: novoPlano as any,
        preco: valorPlanoAtual,
        data_inicio: inicio,
        data_fim: dataFim.toISOString().slice(0, 10),
        metodo_pagamento: metodoPagamento,
      });

      notify.success("Cobrança criada!", `Assinatura criada para ${alunoSelecionado.nome} com sucesso`);
      
      // Limpar formulário
      setAlunoSelecionado(null);
      setNovoPlano('online_mensal');
      setValorPersonalizado(0);
      setQuantidade(1);
      setMetodoPagamento('pix');
      setInicio(new Date().toISOString().slice(0, 10));
    } catch (error: any) {
      console.error('Erro ao criar cobrança:', error);
      notify.error("Erro ao criar cobrança", error.message || "Tente novamente");
    }
  };

  const handleMarcarPago = async (pagamentoId: string) => {
    try {
      await aprovarPagamento.mutateAsync(pagamentoId);
      notify.success("Pagamento confirmado!", "O status foi atualizado com sucesso");
    } catch (error: any) {
      notify.error("Erro ao confirmar pagamento", error.message);
    }
  };

  const handleCancelarAssinatura = async (assinaturaId: string, alunoNome: string) => {
    try {
      await cancelAssinatura.mutateAsync(assinaturaId);
      notify.warning("Assinatura cancelada", `A assinatura de ${alunoNome} foi cancelada`);
    } catch (error: any) {
      notify.error("Erro ao cancelar assinatura", error.message);
    }
  };

  const handleDeletarAssinatura = async (assinaturaId: string, alunoNome: string) => {
    if (!window.confirm(`Tem certeza que deseja DELETAR permanentemente a assinatura de ${alunoNome}?\n\nEsta ação não pode ser desfeita e todos os pagamentos relacionados serão removidos.`)) {
      return;
    }

    try {
      await deleteAssinatura.mutateAsync(assinaturaId);
      notify.success("Assinatura deletada", `A assinatura de ${alunoNome} foi removida permanentemente`);
    } catch (error: any) {
      notify.error("Erro ao deletar assinatura", error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-3 sm:p-6">
      <div className="w-full space-y-4 sm:space-y-6">
        <PageHeader
          title="Pagamentos"
          description="Gestão de assinaturas e cobranças"
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <Card className="p-3 sm:p-6 border-gray-800 bg-gray-900/50 backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-400">Receita Mensal</p>
                <p className="text-lg sm:text-2xl font-bold text-white mt-1">{formatCurrency(receitaMensalEstimativa)}</p>
                <p className="text-[10px] sm:text-xs text-gray-500 mt-1">Estimativa</p>
              </div>
              <div className="h-8 w-8 sm:h-12 sm:w-12 rounded-lg sm:rounded-xl flex items-center justify-center bg-gradient-to-br from-green-500 to-green-600">
                <DollarSign className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
          </Card>

          <Card className="p-3 sm:p-6 border-gray-800 bg-gray-900/50 backdrop-blur">
            <CardHeader className="p-0 mb-3">
              <CardTitle className="text-sm sm:text-base text-white flex items-center gap-2">
                <Users className="w-4 h-4" />
                Assinantes por Tipo
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-2">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-gray-400">Online</span>
                <Badge variant="secondary" className="bg-blue-900/30 text-blue-300 border-blue-700/50 text-[10px] sm:text-xs">{porPlano.online}</Badge>
              </div>
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-gray-400">Presencial</span>
                <Badge variant="secondary" className="bg-purple-900/30 text-purple-300 border-purple-700/50 text-[10px] sm:text-xs">{porPlano.presencial}</Badge>
              </div>
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-gray-400">Personalizado</span>
                <Badge variant="secondary" className="bg-gray-700 text-white text-[10px] sm:text-xs">{porPlano.personalizado}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="p-3 sm:p-6 border-gray-800 bg-gray-900/50 backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-400">Pendências</p>
                <p className="text-lg sm:text-2xl font-bold text-white mt-1">{pendencias}</p>
                <p className="text-[10px] sm:text-xs text-gray-500 mt-1">Aguardando</p>
              </div>
              <div className="h-8 w-8 sm:h-12 sm:w-12 rounded-lg sm:rounded-xl flex items-center justify-center bg-gradient-to-br from-yellow-500 to-yellow-600">
                <AlertCircle className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
          </Card>
        </div>

        {/* Criar Cobrança */}
        <Card className="border-gray-800 bg-gray-900/50 backdrop-blur">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl text-white flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Criar Cobrança
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              <AlunoAutocomplete
                value={alunoSelecionado?.nome || ''}
                onSelect={(aluno) => setAlunoSelecionado(aluno)}
                label="Aluno"
                placeholder="Digite o nome do aluno..."
              />
              {alunoSelecionado && (
                <div className="flex items-center gap-2 p-2 bg-gray-800/50 rounded-lg border border-gray-700">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{alunoSelecionado.nome}</p>
                    <p className="text-xs text-gray-400 truncate">{alunoSelecionado.email}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300 text-xs sm:text-sm">Plano</Label>
                <Select value={novoPlano} onValueChange={(v) => setNovoPlano(v as PlanoId)}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white text-xs sm:text-sm">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700 max-h-80">
                    <div className="px-2 py-1.5 text-xs font-semibold text-gray-400 uppercase">Online</div>
                    <SelectItem value="online_mensal" className="text-white hover:bg-gray-700">
                      Mensal — {formatCurrency(PLANOS.online_mensal.preco)}
                    </SelectItem>
                    <SelectItem value="online_trimestral" className="text-white hover:bg-gray-700">
                      Trimestral — {formatCurrency(PLANOS.online_trimestral.preco)} 
                      <span className="text-green-400 text-xs ml-1">(Economize R$50)</span>
                    </SelectItem>
                    <SelectItem value="online_familia" className="text-white hover:bg-gray-700">
                      Família — {formatCurrency(PLANOS.online_familia.preco)}/pessoa
                    </SelectItem>
                    
                    <div className="px-2 py-1.5 text-xs font-semibold text-gray-400 uppercase mt-2">Presencial</div>
                    <SelectItem value="presencial_3x" className="text-white hover:bg-gray-700">
                      3x/semana — {formatCurrency(PLANOS.presencial_3x.preco)}
                    </SelectItem>
                    <SelectItem value="presencial_4x" className="text-white hover:bg-gray-700">
                      4x/semana — {formatCurrency(PLANOS.presencial_4x.preco)}
                    </SelectItem>
                    <SelectItem value="presencial_5x" className="text-white hover:bg-gray-700">
                      5x/semana — {formatCurrency(PLANOS.presencial_5x.preco)}
                    </SelectItem>
                    
                    <div className="px-2 py-1.5 text-xs font-semibold text-gray-400 uppercase mt-2">Outros</div>
                    <SelectItem value="personalizado" className="text-white hover:bg-gray-700">
                      Personalizado
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {novoPlano === "personalizado" && (
                <div className="space-y-2">
                  <Label className="text-gray-300 text-xs sm:text-sm">Valor (R$)</Label>
                  <Input 
                    type="number" 
                    min={0} 
                    step={0.01}
                    value={valorPersonalizado / 100} 
                    onChange={(e) => setValorPersonalizado(Math.round(parseFloat(e.target.value || "0") * 100))}
                    placeholder="0,00"
                    className="bg-gray-800 border-gray-700 text-white text-xs sm:text-sm"
                  />
                </div>
              )}
              
              {novoPlano === "online_familia" && (
                <div className="space-y-2">
                  <Label className="text-gray-300 text-xs sm:text-sm">Quantidade</Label>
                  <Input 
                    type="number" 
                    min={2} 
                    max={10} 
                    value={quantidade} 
                    onChange={(e) => setQuantidade(parseInt(e.target.value || "2"))}
                    className="bg-gray-800 border-gray-700 text-white text-xs sm:text-sm"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label className="text-gray-300 text-xs sm:text-sm">Método</Label>
                <Select value={metodoPagamento} onValueChange={(v) => setMetodoPagamento(v as any)}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white text-xs sm:text-sm">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="pix" className="text-white hover:bg-gray-700">PIX</SelectItem>
                    <SelectItem value="credit_card" className="text-white hover:bg-gray-700">Cartão de Crédito</SelectItem>
                    <SelectItem value="debit_card" className="text-white hover:bg-gray-700">Cartão de Débito</SelectItem>
                    <SelectItem value="boleto" className="text-white hover:bg-gray-700">Boleto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300 text-xs sm:text-sm">Início</Label>
                <Input 
                  type="date" 
                  value={inicio} 
                  onChange={(e) => setInicio(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white text-xs sm:text-sm"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
              <div className="text-xs sm:text-sm text-gray-400">
                Valor: <span className="font-semibold text-white text-sm sm:text-base">{formatCurrency(valorPlanoAtual)}</span>
              </div>
              <Button 
                onClick={criarCobranca}
                disabled={!alunoSelecionado || createAssinaturaComPagamento.isPending}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createAssinaturaComPagamento.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Cobrança
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <Card className="border-gray-800 bg-gray-900/50 backdrop-blur">
            <CardContent className="p-12 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
              <p className="text-gray-400">Carregando pagamentos...</p>
            </CardContent>
          </Card>
        )}

        {/* Assinaturas - Desktop Table */}
        {!isLoading && assinaturas && assinaturas.length > 0 && (
          <Card className="border-gray-800 bg-gray-900/50 backdrop-blur hidden md:block">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl text-white">Assinaturas ({assinaturas.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-800 hover:bg-transparent">
                      <TableHead className="text-gray-400">Aluno</TableHead>
                      <TableHead className="text-gray-400">Plano</TableHead>
                      <TableHead className="text-gray-400">Valor</TableHead>
                      <TableHead className="text-gray-400">Início</TableHead>
                      <TableHead className="text-gray-400">Término</TableHead>
                      <TableHead className="text-gray-400">Último Pag.</TableHead>
                      <TableHead className="text-gray-400">Status</TableHead>
                      <TableHead className="text-right text-gray-400">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assinaturas.map((a) => {
                      const p = PLANOS[a.plano_tipo as PlanoId] || { nome: a.plano_tipo, preco: a.preco, periodo: '/mês', categoria: 'custom' as const };
                      const ultimoPagamento = a.ultimo_pagamento;
                      const temPagamentoPendente = a.pagamentos.some(p => p.status === 'pendente');
                      
                      return (
                        <TableRow key={a.id} className="border-gray-800 hover:bg-gray-800/30">
                          <TableCell>
                            <div className="font-medium text-white">{a.aluno?.user_profile?.nome || 'N/A'}</div>
                            <div className="text-xs text-gray-400">{a.aluno?.user_profile?.email || 'N/A'}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-white">{p.nome}</div>
                            <div className="text-xs text-gray-400">{p.periodo}</div>
                          </TableCell>
                          <TableCell className="text-white">{formatCurrency(a.preco)}</TableCell>
                          <TableCell className="text-gray-400">{formatDate(a.data_inicio)}</TableCell>
                          <TableCell className="text-gray-400">{formatDate(a.data_fim)}</TableCell>
                          <TableCell>
                            {ultimoPagamento ? (
                              <div>
                                <div className="text-sm text-white">{formatCurrency(ultimoPagamento.valor)}</div>
                                <div className="text-xs text-gray-400">
                                  {METODO_PAGAMENTO_LABELS[ultimoPagamento.metodo]}
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-500 text-sm">Sem pagamentos</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {a.status === "ativa" && !temPagamentoPendente && <Badge className="bg-green-600 text-white">Ativa</Badge>}
                            {a.status === "ativa" && temPagamentoPendente && <Badge className="bg-amber-500 text-white">Pendente</Badge>}
                            {a.status === "cancelada" && <Badge className="bg-red-600 text-white">Cancelada</Badge>}
                            {a.status === "vencida" && <Badge className="bg-gray-600 text-white">Vencida</Badge>}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                              {ultimoPagamento && ultimoPagamento.status === 'pendente' && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleMarcarPago(ultimoPagamento.id)}
                                  disabled={aprovarPagamento.isPending}
                                  className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white text-xs"
                                >
                                  {aprovarPagamento.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Marcar Pago'}
                                </Button>
                              )}
                              <Button 
                                variant="outline" 
                                size="sm"
                                disabled={a.status === "cancelada" || cancelAssinatura.isPending} 
                                onClick={() => handleCancelarAssinatura(a.id, a.aluno?.user_profile?.nome || 'Aluno')}
                                className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white text-xs"
                              >
                                {cancelAssinatura.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Cancelar'}
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                disabled={deleteAssinatura.isPending} 
                                onClick={() => handleDeletarAssinatura(a.id, a.aluno?.user_profile?.nome || 'Aluno')}
                                className="border-red-900/50 bg-red-950/30 text-red-400 hover:bg-red-950/50 hover:text-red-300 text-xs"
                              >
                                {deleteAssinatura.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Deletar'}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Assinaturas - Mobile Cards */}
        {!isLoading && assinaturas && assinaturas.length > 0 && (
          <div className="md:hidden space-y-3">
            <h2 className="text-lg font-semibold text-white px-1">Assinaturas ({assinaturas.length})</h2>
            {assinaturas.map((a) => {
              const p = PLANOS[a.plano_tipo as PlanoId] || { nome: a.plano_tipo, preco: a.preco, periodo: '/mês', categoria: 'custom' as const };
              const ultimoPagamento = a.ultimo_pagamento;
              const temPagamentoPendente = a.pagamentos.some(p => p.status === 'pendente');
              
              return (
                <Card key={a.id} className="border-gray-700 bg-gray-800/30">
                  <CardContent className="p-3 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white text-sm truncate">{a.aluno?.user_profile?.nome || 'N/A'}</h3>
                        <p className="text-xs text-gray-400 truncate">{a.aluno?.user_profile?.email || 'N/A'}</p>
                      </div>
                      {a.status === "ativa" && !temPagamentoPendente && <Badge className="bg-green-600 text-white text-[10px]">Ativa</Badge>}
                      {a.status === "ativa" && temPagamentoPendente && <Badge className="bg-amber-500 text-white text-[10px]">Pendente</Badge>}
                      {a.status === "cancelada" && <Badge className="bg-red-600 text-white text-[10px]">Cancelada</Badge>}
                      {a.status === "vencida" && <Badge className="bg-gray-600 text-white text-[10px]">Vencida</Badge>}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-gray-500">Plano</p>
                        <p className="text-white font-medium">{p.nome}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Valor</p>
                        <p className="text-white font-medium">{formatCurrency(a.preco)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Início</p>
                        <p className="text-white">{formatDate(a.data_inicio)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Término</p>
                        <p className="text-white">{formatDate(a.data_fim)}</p>
                      </div>
                    </div>

                    {ultimoPagamento && (
                      <div className="pt-2 border-t border-gray-700">
                        <p className="text-xs text-gray-500 mb-1">Último Pagamento</p>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-white">{formatCurrency(ultimoPagamento.valor)}</span>
                          <span className="text-gray-400">{METODO_PAGAMENTO_LABELS[ultimoPagamento.metodo]}</span>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2 border-t border-gray-700">
                      {ultimoPagamento && ultimoPagamento.status === 'pendente' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleMarcarPago(ultimoPagamento.id)}
                          disabled={aprovarPagamento.isPending}
                          className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white text-xs h-8"
                        >
                          {aprovarPagamento.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Marcar Pago'}
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm"
                        disabled={a.status === "cancelada" || cancelAssinatura.isPending} 
                        onClick={() => handleCancelarAssinatura(a.id, a.aluno?.user_profile?.nome || 'Aluno')}
                        className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white text-xs h-8"
                      >
                        {cancelAssinatura.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Cancelar'}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        disabled={deleteAssinatura.isPending} 
                        onClick={() => handleDeletarAssinatura(a.id, a.aluno?.user_profile?.nome || 'Aluno')}
                        className="flex-1 border-red-900/50 bg-red-950/30 text-red-400 hover:bg-red-950/50 hover:text-red-300 text-xs h-8"
                      >
                        {deleteAssinatura.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Deletar'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && (!assinaturas || assinaturas.length === 0) && (
          <Card className="border-gray-800 bg-gray-900/50 backdrop-blur">
            <CardContent className="p-12 flex flex-col items-center justify-center text-center">
              <DollarSign className="w-12 h-12 text-gray-600 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Nenhuma assinatura encontrada</h3>
              <p className="text-gray-400 text-sm">Crie a primeira cobrança para começar</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

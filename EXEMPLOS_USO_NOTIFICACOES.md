# Exemplos de Uso - Sistema de Notificações Premium

## 🚀 Guia Rápido de Implementação

### 1. Importar o Hook

```typescript
import { useNotification } from '@/hooks/useNotification';

function MeuComponente() {
  const { notify } = useNotification();
  
  // Usar notify.success(), notify.error(), etc.
}
```

## 📝 Exemplos Práticos por Funcionalidade

### Fichas de Treino

```typescript
// client/src/pages/admin/FichasTreino.tsx
import { useNotification } from '@/hooks/useNotification';

function FichasTreino() {
  const { notify } = useNotification();
  const { createFicha, updateFicha, deleteFicha } = useFichasTreino();

  // Criar nova ficha
  const handleCreate = async (data: FichaTreinoFormData) => {
    try {
      await createFicha.mutateAsync(data);
      notify.create(
        'Ficha criada!',
        'A ficha de treino foi criada com sucesso'
      );
      onClose();
    } catch (error) {
      notify.error(
        'Erro ao criar ficha',
        error.message || 'Tente novamente mais tarde'
      );
    }
  };

  // Atualizar ficha existente
  const handleUpdate = async (id: string, data: FichaTreinoFormData) => {
    try {
      await updateFicha.mutateAsync({ id, data });
      notify.success(
        'Ficha atualizada!',
        'As alterações foram salvas com sucesso'
      );
      onClose();
    } catch (error) {
      notify.error(
        'Erro ao atualizar ficha',
        'Não foi possível salvar as alterações'
      );
    }
  };

  // Deletar ficha
  const handleDelete = async (id: string, nome: string) => {
    try {
      await deleteFicha.mutateAsync(id);
      notify.success(
        'Ficha excluída',
        `"${nome}" foi removida com sucesso`
      );
    } catch (error) {
      notify.error(
        'Erro ao excluir ficha',
        'Não foi possível remover a ficha'
      );
    }
  };

  // Atribuir ficha a aluno
  const handleAssign = async (fichaId: string, alunoId: string) => {
    try {
      await assignFicha.mutateAsync({ fichaId, alunoId });
      notify.success(
        'Ficha atribuída!',
        'O aluno já pode visualizar a ficha'
      );
    } catch (error) {
      notify.error(
        'Erro ao atribuir ficha',
        'Tente novamente mais tarde'
      );
    }
  };
}
```

### Planos Alimentares

```typescript
// client/src/components/PlanosAlimentaresList.tsx
import { useNotification } from '@/hooks/useNotification';

function PlanosAlimentaresList() {
  const { notify } = useNotification();
  const { createPlano, updatePlano, deletePlano } = usePlanosAlimentares();

  // Criar plano
  const handleCreatePlano = async (data: PlanoAlimentarData) => {
    try {
      await createPlano.mutateAsync(data);
      notify.create(
        'Plano criado!',
        'O plano alimentar foi criado com sucesso'
      );
    } catch (error) {
      notify.error(
        'Erro ao criar plano',
        'Verifique os dados e tente novamente'
      );
    }
  };

  // Adicionar refeição
  const handleAddRefeicao = async (planoId: string, refeicao: Refeicao) => {
    try {
      await addRefeicao.mutateAsync({ planoId, refeicao });
      notify.success(
        'Refeição adicionada',
        'A refeição foi incluída no plano'
      );
    } catch (error) {
      notify.error(
        'Erro ao adicionar refeição',
        error.message
      );
    }
  };

  // Duplicar plano
  const handleDuplicate = async (planoId: string) => {
    const loadingId = notify.info(
      'Duplicando plano...',
      'Aguarde enquanto criamos uma cópia',
      { duration: Infinity }
    );

    try {
      const newPlano = await duplicatePlano.mutateAsync(planoId);
      notify.dismiss(loadingId);
      notify.create(
        'Plano duplicado!',
        'Uma cópia foi criada com sucesso',
        {
          action: {
            label: 'Ver plano',
            onClick: () => navigate(`/admin/planos/${newPlano.id}`)
          }
        }
      );
    } catch (error) {
      notify.dismiss(loadingId);
      notify.error('Erro ao duplicar plano', error.message);
    }
  };
}
```

### Upload de Vídeos

```typescript
// client/src/pages/TreinosVideo.tsx
import { useNotification } from '@/hooks/useNotification';

function TreinosVideo() {
  const { notify } = useNotification();

  const handleUploadVideo = async (file: File, metadata: VideoMetadata) => {
    // Validar arquivo
    if (file.size > 500 * 1024 * 1024) {
      notify.warning(
        'Arquivo muito grande',
        'O vídeo deve ter no máximo 500MB'
      );
      return;
    }

    if (!file.type.startsWith('video/')) {
      notify.error(
        'Formato inválido',
        'Por favor, selecione um arquivo de vídeo'
      );
      return;
    }

    // Iniciar upload
    const uploadId = notify.info(
      'Enviando vídeo...',
      'Isso pode levar alguns minutos',
      { duration: Infinity, sound: false }
    );

    try {
      const result = await uploadVideo(file, metadata, (progress) => {
        // Atualizar progresso (opcional)
        console.log(`Upload: ${progress}%`);
      });

      notify.dismiss(uploadId);
      notify.success(
        'Vídeo enviado!',
        'O vídeo está disponível na biblioteca',
        {
          action: {
            label: 'Ver vídeo',
            onClick: () => openVideoModal(result.id)
          }
        }
      );
    } catch (error) {
      notify.dismiss(uploadId);
      notify.error(
        'Falha no upload',
        error.message || 'Tente novamente mais tarde'
      );
    }
  };

  // Deletar vídeo
  const handleDeleteVideo = async (videoId: string, titulo: string) => {
    try {
      await deleteVideo.mutateAsync(videoId);
      notify.success(
        'Vídeo excluído',
        `"${titulo}" foi removido da biblioteca`
      );
    } catch (error) {
      notify.error(
        'Erro ao excluir vídeo',
        'Não foi possível remover o vídeo'
      );
    }
  };
}
```

### Agenda Profissional

```typescript
// client/src/pages/AgendaProfissional.tsx
import { useNotification } from '@/hooks/useNotification';

function AgendaProfissional() {
  const { notify } = useNotification();

  // Criar agendamento
  const handleCreateAgendamento = async (data: AgendamentoData) => {
    try {
      await createAgendamento.mutateAsync(data);
      notify.create(
        'Agendamento criado!',
        `${data.alunoNome} - ${formatDate(data.data)} às ${data.hora}`
      );
    } catch (error) {
      notify.error(
        'Erro ao criar agendamento',
        'Verifique se o horário está disponível'
      );
    }
  };

  // Cancelar agendamento
  const handleCancelAgendamento = async (id: string, alunoNome: string) => {
    try {
      await cancelAgendamento.mutateAsync(id);
      notify.warning(
        'Agendamento cancelado',
        `O horário de ${alunoNome} foi liberado`
      );
    } catch (error) {
      notify.error(
        'Erro ao cancelar',
        'Não foi possível cancelar o agendamento'
      );
    }
  };

  // Confirmar presença
  const handleConfirmPresenca = async (id: string) => {
    try {
      await confirmPresenca.mutateAsync(id);
      notify.success(
        'Presença confirmada',
        'O aluno foi marcado como presente'
      );
    } catch (error) {
      notify.error(
        'Erro ao confirmar presença',
        error.message
      );
    }
  };

  // Bloquear horário
  const handleBlockHorario = async (data: BlockData) => {
    try {
      await blockHorario.mutateAsync(data);
      notify.info(
        'Horário bloqueado',
        'Este período não estará disponível para agendamentos'
      );
    } catch (error) {
      notify.error(
        'Erro ao bloquear horário',
        error.message
      );
    }
  };
}
```

### Gestão de Alunos

```typescript
// client/src/pages/admin/StudentsList.tsx
import { useNotification } from '@/hooks/useNotification';

function StudentsList() {
  const { notify } = useNotification();

  // Criar aluno
  const handleCreateStudent = async (data: StudentData) => {
    try {
      const student = await createStudent.mutateAsync(data);
      notify.create(
        'Aluno cadastrado!',
        `${data.nome} foi adicionado com sucesso`,
        {
          action: {
            label: 'Ver perfil',
            onClick: () => navigate(`/admin/alunos/${student.id}`)
          }
        }
      );
    } catch (error) {
      notify.error(
        'Erro ao cadastrar aluno',
        error.message
      );
    }
  };

  // Atualizar status de pagamento
  const handleUpdatePayment = async (alunoId: string, status: string) => {
    try {
      await updatePaymentStatus.mutateAsync({ alunoId, status });
      
      if (status === 'pago') {
        notify.success(
          'Pagamento confirmado',
          'O status do aluno foi atualizado'
        );
      } else if (status === 'pendente') {
        notify.warning(
          'Pagamento pendente',
          'O aluno foi notificado sobre o vencimento'
        );
      }
    } catch (error) {
      notify.error(
        'Erro ao atualizar pagamento',
        error.message
      );
    }
  };

  // Suspender aluno
  const handleSuspendStudent = async (alunoId: string, nome: string) => {
    try {
      await suspendStudent.mutateAsync(alunoId);
      notify.warning(
        'Aluno suspenso',
        `${nome} não terá mais acesso ao sistema`,
        {
          action: {
            label: 'Desfazer',
            onClick: () => reactivateStudent(alunoId)
          },
          duration: 8000
        }
      );
    } catch (error) {
      notify.error(
        'Erro ao suspender aluno',
        error.message
      );
    }
  };
}
```

### Autenticação

```typescript
// client/src/components/LoginForm.tsx
import { useNotification } from '@/hooks/useNotification';

function LoginForm() {
  const { notify } = useNotification();

  const handleLogin = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      notify.success(
        'Login realizado!',
        `Bem-vindo de volta, ${data.user.email}`
      );
      
      onLoginSuccess(data.user);
    } catch (error) {
      notify.error(
        'Erro ao fazer login',
        'Verifique suas credenciais e tente novamente'
      );
    }
  };

  const handleForgotPassword = async (email: string) => {
    try {
      await supabase.auth.resetPasswordForEmail(email);
      notify.info(
        'Email enviado',
        'Verifique sua caixa de entrada para redefinir a senha'
      );
    } catch (error) {
      notify.error(
        'Erro ao enviar email',
        'Tente novamente mais tarde'
      );
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      notify.info(
        'Logout realizado',
        'Até logo!'
      );
    } catch (error) {
      notify.error(
        'Erro ao fazer logout',
        error.message
      );
    }
  };
}
```

### Operações em Lote

```typescript
// Exemplo de operação em múltiplos itens
function BulkOperations() {
  const { notify } = useNotification();

  const handleBulkDelete = async (ids: string[]) => {
    const deleteId = notify.warning(
      'Excluindo itens...',
      `${ids.length} itens serão removidos`,
      { duration: Infinity }
    );

    try {
      const results = await Promise.allSettled(
        ids.map(id => deleteItem(id))
      );

      const succeeded = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      notify.dismiss(deleteId);

      if (failed === 0) {
        notify.success(
          'Itens excluídos',
          `${succeeded} itens foram removidos com sucesso`
        );
      } else if (succeeded === 0) {
        notify.error(
          'Falha na exclusão',
          'Nenhum item pôde ser excluído'
        );
      } else {
        notify.warning(
          'Exclusão parcial',
          `${succeeded} itens excluídos, ${failed} falharam`
        );
      }
    } catch (error) {
      notify.dismiss(deleteId);
      notify.error(
        'Erro na operação',
        'Não foi possível completar a exclusão'
      );
    }
  };

  const handleBulkAssign = async (fichaId: string, alunoIds: string[]) => {
    const assignId = notify.info(
      'Atribuindo ficha...',
      `Processando ${alunoIds.length} alunos`,
      { duration: Infinity, sound: false }
    );

    try {
      await Promise.all(
        alunoIds.map(alunoId => assignFicha({ fichaId, alunoId }))
      );

      notify.dismiss(assignId);
      notify.success(
        'Ficha atribuída!',
        `${alunoIds.length} alunos receberam a ficha`
      );
    } catch (error) {
      notify.dismiss(assignId);
      notify.error(
        'Erro na atribuição',
        'Alguns alunos podem não ter recebido a ficha'
      );
    }
  };
}
```

### Notificações de Sistema

```typescript
// Notificações globais e de sistema
function SystemNotifications() {
  const { notify } = useNotification();

  // Atualização disponível
  useEffect(() => {
    const checkForUpdates = async () => {
      const hasUpdate = await checkAppUpdate();
      
      if (hasUpdate) {
        notify.system(
          'Atualização disponível',
          'Uma nova versão do sistema está disponível',
          {
            duration: Infinity,
            action: {
              label: 'Atualizar agora',
              onClick: () => window.location.reload()
            }
          }
        );
      }
    };

    checkForUpdates();
  }, []);

  // Manutenção programada
  const notifyMaintenance = (date: Date) => {
    notify.system(
      'Manutenção programada',
      `O sistema ficará indisponível em ${formatDate(date)}`,
      {
        duration: Infinity,
        action: {
          label: 'Saiba mais',
          onClick: () => navigate('/manutencao')
        }
      }
    );
  };

  // Conexão perdida
  useEffect(() => {
    const handleOffline = () => {
      notify.warning(
        'Sem conexão',
        'Você está offline. Algumas funcionalidades podem não funcionar',
        { duration: Infinity }
      );
    };

    const handleOnline = () => {
      notify.dismissAll();
      notify.success(
        'Conexão restaurada',
        'Você está online novamente'
      );
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);
}
```

## 🎨 Customização Avançada

### Notificação Persistente com Ação

```typescript
const handleCriticalAction = async () => {
  const confirmId = notify.warning(
    'Ação irreversível',
    'Esta operação não pode ser desfeita',
    {
      duration: Infinity,
      action: {
        label: 'Confirmar',
        onClick: async () => {
          notify.dismiss(confirmId);
          await performCriticalAction();
          notify.success('Operação concluída');
        }
      }
    }
  );
};
```

### Notificação sem Som

```typescript
// Para operações frequentes ou silenciosas
const handleAutoSave = async () => {
  await saveData();
  notify.info('Rascunho salvo', undefined, { sound: false });
};
```

### Notificação com Callback

```typescript
const handleExport = async () => {
  const exportId = notify.info(
    'Exportando dados...',
    'Preparando arquivo para download',
    {
      duration: Infinity,
      onClose: () => {
        console.log('Exportação cancelada pelo usuário');
      }
    }
  );

  try {
    const file = await exportData();
    notify.dismiss(exportId);
    notify.success(
      'Exportação concluída!',
      'Seu arquivo está pronto',
      {
        action: {
          label: 'Download',
          onClick: () => downloadFile(file)
        }
      }
    );
  } catch (error) {
    notify.dismiss(exportId);
    notify.error('Erro na exportação', error.message);
  }
};
```

## 🎯 Boas Práticas

### ✅ Fazer

```typescript
// Mensagens claras e específicas
notify.success('Ficha criada!', 'A ficha "Treino A" foi criada');

// Fechar notificações de loading
const loadingId = notify.info('Carregando...', { duration: Infinity });
// ... operação
notify.dismiss(loadingId);

// Adicionar ações quando relevante
notify.success('Backup concluído', 'Seus dados foram salvos', {
  action: { label: 'Ver backup', onClick: () => navigate('/backups') }
});
```

### ❌ Evitar

```typescript
// Mensagens genéricas
notify.success('Sucesso'); // ❌ Muito vago

// Esquecer de fechar loading
notify.info('Carregando...', { duration: Infinity });
// ... operação completa mas notificação fica aberta ❌

// Sons em operações frequentes
setInterval(() => {
  notify.info('Auto-save'); // ❌ Som a cada 30s é irritante
}, 30000);
```

---

**Dica**: Sempre teste suas notificações em diferentes cenários (sucesso, erro, loading) para garantir uma experiência consistente!

# Guia de Teste: Treino em Background

## 🎯 Objetivo

Validar que o treino continua funcionando corretamente em segundo plano sem necessidade de minimizar manualmente.

## ✅ Pré-requisitos

- [ ] App rodando localmente ou em produção
- [ ] Usuário aluno autenticado
- [ ] Ficha de treino atribuída ao aluno
- [ ] Navegador com suporte a notificações (Chrome, Firefox, Edge)
- [ ] Permissão de notificações concedida (opcional, mas recomendado)

## 🧪 Cenários de Teste

### 1. Timer Principal em Background

**Objetivo:** Verificar se o tempo de treino continua contando quando usuário sai da tela.

**Passos:**
1. Fazer login como aluno
2. Acessar "Meus Treinos"
3. Clicar em "Iniciar Treino" em uma ficha
4. Observar o timer iniciando (ex: 00:00)
5. Aguardar 10 segundos (timer deve mostrar 00:10)
6. Clicar no botão "Voltar" ou navegar para outra página
7. Aguardar 30 segundos
8. Voltar para a página de treinos
9. Clicar em "Retomar Treino"

**Resultado Esperado:**
- ✅ Timer deve mostrar aproximadamente 00:40 (10s inicial + 30s em background)
- ✅ Exercícios devem estar no mesmo estado
- ✅ Nenhum dado perdido

**Resultado Real:**
- [ ] Passou
- [ ] Falhou (descrever problema)

---

### 2. Trocar de Aba

**Objetivo:** Verificar sincronização ao trocar de aba do navegador.

**Passos:**
1. Iniciar treino
2. Observar timer (ex: 00:15)
3. Abrir nova aba no navegador
4. Aguardar 1 minuto
5. Voltar para a aba do treino

**Resultado Esperado:**
- ✅ Timer atualiza imediatamente ao voltar
- ✅ Tempo correto (00:15 + 1min = 01:15)
- ✅ Interface responsiva

**Resultado Real:**
- [ ] Passou
- [ ] Falhou (descrever problema)

---

### 3. Minimizar Navegador

**Objetivo:** Verificar funcionamento com navegador minimizado.

**Passos:**
1. Iniciar treino
2. Completar primeira série de um exercício
3. Observar timer de descanso iniciando (ex: 60s)
4. Minimizar janela do navegador
5. Aguardar 30 segundos
6. Restaurar janela

**Resultado Esperado:**
- ✅ Timer de descanso mostra ~30s restantes
- ✅ Notificação aparece quando descanso completa (se permissão concedida)
- ✅ Tempo total do treino continua correto

**Resultado Real:**
- [ ] Passou
- [ ] Falhou (descrever problema)

---

### 4. Timer de Descanso Completo em Background

**Objetivo:** Verificar notificação quando timer de descanso completa em background.

**Passos:**
1. Iniciar treino
2. Completar uma série
3. Timer de descanso inicia (ex: 60s)
4. Imediatamente trocar de aba ou minimizar
5. Aguardar timer completar (60s)

**Resultado Esperado:**
- ✅ Notificação do navegador aparece: "Descanso Completo! 💪"
- ✅ Som de notificação toca (se não silenciado)
- ✅ Vibração no mobile (se suportado)
- ✅ Ao voltar, timer mostra "Completo"

**Resultado Real:**
- [ ] Passou
- [ ] Falhou (descrever problema)

---

### 5. Bloquear Tela (Mobile)

**Objetivo:** Verificar funcionamento com tela bloqueada no mobile.

**Passos:**
1. Abrir app no mobile (navegador ou PWA)
2. Iniciar treino
3. Observar timer (ex: 00:20)
4. Bloquear tela do dispositivo
5. Aguardar 2 minutos
6. Desbloquear tela

**Resultado Esperado:**
- ✅ Timer mostra ~02:20
- ✅ Estado do treino preservado
- ✅ Notificações chegaram (se timer de descanso completou)

**Resultado Real:**
- [ ] Passou
- [ ] Falhou (descrever problema)

**Observações:**
- Safari iOS pode ter limitações sem PWA instalado
- Android funciona melhor com PWA instalado

---

### 6. Auto-Save Periódico

**Objetivo:** Verificar salvamento automático do progresso.

**Passos:**
1. Iniciar treino
2. Completar 2-3 séries de exercícios
3. Preencher peso e repetições
4. Aguardar 15 segundos (auto-save a cada 10s)
5. Fechar aba do navegador (sem finalizar treino)
6. Reabrir app e fazer login
7. Acessar "Meus Treinos"

**Resultado Esperado:**
- ✅ Mensagem "Treino retomado" aparece
- ✅ Séries completadas estão marcadas
- ✅ Pesos e repetições preenchidos
- ✅ Tempo aproximadamente correto

**Resultado Real:**
- [ ] Passou
- [ ] Falhou (descrever problema)

---

### 7. Pausar e Retomar

**Objetivo:** Verificar funcionalidade de pausar treino.

**Passos:**
1. Iniciar treino
2. Aguardar 30 segundos (timer: 00:30)
3. Clicar em "Pausar"
4. Aguardar 1 minuto
5. Timer deve permanecer em 00:30
6. Clicar em "Retomar"
7. Aguardar 20 segundos

**Resultado Esperado:**
- ✅ Timer pausa em 00:30
- ✅ Não avança durante pausa
- ✅ Retoma de 00:30 ao clicar "Retomar"
- ✅ Após 20s, mostra 00:50

**Resultado Real:**
- [ ] Passou
- [ ] Falhou (descrever problema)

---

### 8. Múltiplos Exercícios

**Objetivo:** Verificar fluxo completo com vários exercícios.

**Passos:**
1. Iniciar treino com 3+ exercícios
2. Completar todas as séries do primeiro exercício
3. Navegar para outra página
4. Aguardar 1 minuto
5. Voltar e retomar treino
6. Completar segundo exercício
7. Verificar progresso

**Resultado Esperado:**
- ✅ Primeiro exercício marcado como completo
- ✅ Progresso salvo (ex: "1/3 exercícios completos")
- ✅ Tempo total correto
- ✅ Pode continuar normalmente

**Resultado Real:**
- [ ] Passou
- [ ] Falhou (descrever problema)

---

### 9. Finalizar Treino

**Objetivo:** Verificar finalização e limpeza de estado.

**Passos:**
1. Iniciar treino
2. Completar todos os exercícios
3. Clicar em "Finalizar Treino"
4. Confirmar finalização
5. Preencher feedback (opcional)
6. Verificar que voltou para lista de treinos
7. Tentar iniciar novo treino

**Resultado Esperado:**
- ✅ Modal de finalização mostra resumo correto
- ✅ Treino salvo no histórico
- ✅ Estado limpo (não há mais treino em andamento)
- ✅ Pode iniciar novo treino sem conflito

**Resultado Real:**
- [ ] Passou
- [ ] Falhou (descrever problema)

---

### 10. Conflito de Treinos

**Objetivo:** Verificar comportamento ao tentar iniciar segundo treino.

**Passos:**
1. Iniciar treino A
2. Sem finalizar, tentar iniciar treino B
3. Observar mensagem de aviso

**Resultado Esperado:**
- ✅ Aviso: "Você já tem um treino em andamento"
- ✅ Opções: "Retomar treino" ou "Descartar"
- ✅ Não permite iniciar segundo treino
- ✅ Ao retomar, volta para treino A

**Resultado Real:**
- [ ] Passou
- [ ] Falhou (descrever problema)

---

## 🔧 Testes de Permissões

### Notificações

**Cenário 1: Permissão Concedida**
1. Acessar `/aluno/notificacoes`
2. Clicar em "Ativar Notificações"
3. Conceder permissão no navegador
4. Completar série e aguardar descanso em background

**Resultado Esperado:**
- ✅ Notificação aparece quando descanso completa

**Cenário 2: Permissão Negada**
1. Negar permissão de notificações
2. Completar série e aguardar descanso em background

**Resultado Esperado:**
- ✅ Timer funciona normalmente
- ✅ Som e vibração ainda funcionam (se suportado)
- ✅ Sem notificação visual

**Cenário 3: Permissão Bloqueada**
1. Bloquear notificações nas configurações do navegador
2. Tentar ativar na página de notificações

**Resultado Esperado:**
- ✅ Mensagem explicando como desbloquear
- ✅ Link para instruções

---

## 🌐 Testes Cross-Browser

### Desktop

| Navegador | Versão | Timer Background | Notificações | Page Visibility | Status |
|-----------|--------|------------------|--------------|-----------------|--------|
| Chrome    | 120+   | ✅               | ✅           | ✅              | ✅     |
| Firefox   | 120+   | ✅               | ✅           | ✅              | ✅     |
| Edge      | 120+   | ✅               | ✅           | ✅              | ✅     |
| Safari    | 17+    | ✅               | ⚠️           | ✅              | ⚠️     |

### Mobile

| Dispositivo | OS      | Navegador | PWA | Timer | Notificações | Status |
|-------------|---------|-----------|-----|-------|--------------|--------|
| Android     | 12+     | Chrome    | Sim | ✅    | ✅           | ✅     |
| Android     | 12+     | Chrome    | Não | ✅    | ⚠️           | ⚠️     |
| iPhone      | iOS 16+ | Safari    | Sim | ✅    | ⚠️           | ⚠️     |
| iPhone      | iOS 16+ | Safari    | Não | ⚠️    | ❌           | ⚠️     |

**Legenda:**
- ✅ Funciona perfeitamente
- ⚠️ Funciona com limitações
- ❌ Não funciona

---

## 🐛 Problemas Conhecidos e Soluções

### Problema 1: Timer não atualiza ao voltar

**Sintoma:** Timer mostra tempo antigo ao voltar à aba.

**Causa:** Page Visibility API não disparou.

**Solução:**
- Recarregar página
- Verificar console para erros
- Testar em navegador diferente

### Problema 2: Notificações não aparecem

**Sintoma:** Timer completa mas notificação não aparece.

**Causa:** Permissão não concedida ou bloqueada.

**Solução:**
1. Verificar permissões em `/aluno/notificacoes`
2. Verificar configurações do navegador
3. Testar com `Notification.permission` no console

### Problema 3: Progresso não salva

**Sintoma:** Ao retomar, treino volta ao início.

**Causa:** Auto-save não funcionou ou localStorage limpo.

**Solução:**
- Verificar conexão com internet
- Verificar console para erros de Supabase
- Verificar localStorage: `localStorage.getItem('treino_em_andamento')`

### Problema 4: Safari iOS não funciona em background

**Sintoma:** Timer para quando app vai para background.

**Causa:** Limitação do Safari iOS sem PWA.

**Solução:**
- Instalar como PWA (Add to Home Screen)
- Ou manter app visível durante treino

---

## 📊 Checklist de Validação

### Funcionalidades Core
- [ ] Timer baseado em timestamp funciona
- [ ] Page Visibility API sincroniza corretamente
- [ ] Auto-save a cada 10 segundos
- [ ] Persistência no localStorage
- [ ] Persistência no Supabase
- [ ] Timer de descanso em background
- [ ] Notificações funcionam

### Fluxos de Usuário
- [ ] Iniciar treino
- [ ] Pausar e retomar
- [ ] Sair e voltar
- [ ] Completar séries
- [ ] Finalizar treino
- [ ] Retomar treino salvo

### Edge Cases
- [ ] Trocar de aba
- [ ] Minimizar navegador
- [ ] Bloquear tela
- [ ] Fechar e reabrir
- [ ] Conflito de treinos
- [ ] Permissões negadas

### Performance
- [ ] Timer preciso (< 2s de diferença)
- [ ] UI responsiva
- [ ] Sem travamentos
- [ ] Salvamento rápido

---

## 📝 Relatório de Bugs

**Template:**

```markdown
### Bug: [Título descritivo]

**Severidade:** [Crítico / Alto / Médio / Baixo]

**Cenário:** [Qual teste estava executando]

**Passos para Reproduzir:**
1. 
2. 
3. 

**Resultado Esperado:**


**Resultado Obtido:**


**Ambiente:**
- Navegador: 
- Versão: 
- OS: 
- Dispositivo: 

**Screenshots/Logs:**


**Possível Causa:**


**Sugestão de Fix:**

```

---

## ✅ Aprovação Final

**Testado por:** _______________

**Data:** _______________

**Versão:** _______________

**Status Geral:**
- [ ] ✅ Aprovado - Pronto para produção
- [ ] ⚠️ Aprovado com ressalvas - Documentar limitações
- [ ] ❌ Reprovado - Necessita correções

**Observações:**


---

## 📚 Documentação Relacionada

- `REMOCAO_MINIMIZAR_TREINO.md` - Contexto da mudança
- `CONFIGURACAO_TREINO_BACKGROUND.md` - Arquitetura técnica
- `BOAS_PRATICAS_TIMER_BACKGROUND.md` - Boas práticas
- `SISTEMA_NOTIFICACOES_PWA.md` - Sistema de notificações

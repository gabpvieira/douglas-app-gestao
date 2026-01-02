# Documentação do Projeto

Índice completo da documentação organizada por categoria.

## 📋 Índice Geral

- [Setup e Configuração](#setup-e-configuração)
- [Sistema de Treinos](#sistema-de-treinos)
- [Avaliações Físicas](#avaliações-físicas)
- [Notificações e PWA](#notificações-e-pwa)
- [Autenticação](#autenticação)
- [Planejamento de Features](#planejamento-de-features)
- [Testes](#testes)
- [Dados de Usuários](#dados-de-usuários)
- [Design e Modelos](#design-e-modelos)

---

## 🔧 Setup e Configuração

Guias de configuração inicial e deploy do projeto.

### Arquivos:
- **[SUPABASE_SETUP.md](setup/SUPABASE_SETUP.md)** - Configuração do Supabase (banco de dados, auth, storage)
- **[VERCEL_SETUP.md](setup/VERCEL_SETUP.md)** - Deploy e configuração na Vercel
- **[DEPLOY_SUPABASE_FUNCTION.md](setup/DEPLOY_SUPABASE_FUNCTION.md)** - Deploy de Supabase Functions

### Início Rápido:
1. Configure o Supabase seguindo [SUPABASE_SETUP.md](setup/SUPABASE_SETUP.md)
2. Configure variáveis de ambiente (`.env`)
3. Execute `npm install && npm run dev`
4. Para produção, siga [VERCEL_SETUP.md](setup/VERCEL_SETUP.md)

---

## 💪 Sistema de Treinos

Documentação completa do sistema de execução de treinos, timer em background e funcionalidades relacionadas.

### Arquivos Principais:

#### Implementação Atual
- **[REMOCAO_MINIMIZAR_TREINO.md](treinos/REMOCAO_MINIMIZAR_TREINO.md)** ⭐ - Documentação da remoção da funcionalidade de minimizar
- **[CONFIGURACAO_TREINO_BACKGROUND.md](treinos/CONFIGURACAO_TREINO_BACKGROUND.md)** ⭐ - Arquitetura técnica do treino em background
- **[GUIA_TESTE_TREINO_BACKGROUND.md](treinos/GUIA_TESTE_TREINO_BACKGROUND.md)** ⭐ - Guia completo de testes

#### Boas Práticas e Soluções
- **[BOAS_PRATICAS_TIMER_BACKGROUND.md](treinos/BOAS_PRATICAS_TIMER_BACKGROUND.md)** - Boas práticas para timers em background
- **[SOLUCAO_TIMER_BACKGROUND.md](treinos/SOLUCAO_TIMER_BACKGROUND.md)** - Solução técnica implementada
- **[EXEMPLOS_TIMER_BACKGROUND.md](treinos/EXEMPLOS_TIMER_BACKGROUND.md)** - Exemplos de código

#### Documentação Legada (Referência)
- **[FUNCIONALIDADE_MINIMIZAR_TREINO.md](treinos/FUNCIONALIDADE_MINIMIZAR_TREINO.md)** - [REMOVIDO] Funcionalidade antiga
- **[GUIA_TESTE_MINIMIZAR_TREINO.md](treinos/GUIA_TESTE_MINIMIZAR_TREINO.md)** - [REMOVIDO] Testes da funcionalidade antiga
- **[RESUMO_MINIMIZAR_TREINO.md](treinos/RESUMO_MINIMIZAR_TREINO.md)** - [REMOVIDO] Resumo da funcionalidade antiga

#### Planejamento e Correções
- **[PLANEJAMENTO_BACKGROUND_TIMER.md](treinos/PLANEJAMENTO_BACKGROUND_TIMER.md)** - Planejamento inicial
- **[CORRECAO_TIMER_MINIMIZADO.md](treinos/CORRECAO_TIMER_MINIMIZADO.md)** - Correções aplicadas
- **[CORRECAO_BUG_DELECAO_EXERCICIOS.md](treinos/CORRECAO_BUG_DELECAO_EXERCICIOS.md)** - Correção de bugs

#### Índices e Resumos
- **[INDICE_DOCUMENTACAO_TIMER.md](treinos/INDICE_DOCUMENTACAO_TIMER.md)** - Índice da documentação de timer
- **[RESUMO_IMPLEMENTACAO_TIMER.md](treinos/RESUMO_IMPLEMENTACAO_TIMER.md)** - Resumo da implementação
- **[TESTE_TIMER_BACKGROUND.md](treinos/TESTE_TIMER_BACKGROUND.md)** - Testes realizados

### Conceitos Chave:
- Timer baseado em timestamp (funciona em background)
- Page Visibility API para sincronização
- Persistência em 3 camadas (React state, localStorage, Supabase)
- Auto-save periódico a cada 10 segundos

---

## 📊 Avaliações Físicas

Sistema completo de avaliações físicas com protocolos de dobras cutâneas e avaliação postural.

### Arquivos Principais:

#### Guias e Setup
- **[README_AVALIACOES_FISICAS.md](avaliacoes-fisicas/README_AVALIACOES_FISICAS.md)** - Visão geral do sistema
- **[GUIA_RAPIDO_AVALIACOES_FISICAS.md](avaliacoes-fisicas/GUIA_RAPIDO_AVALIACOES_FISICAS.md)** - Guia rápido de uso
- **[CHECKLIST_SETUP_AVALIACOES_FISICAS.md](avaliacoes-fisicas/CHECKLIST_SETUP_AVALIACOES_FISICAS.md)** - Checklist de configuração

#### Planejamento e Implementação
- **[PLANEJAMENTO_AVALIACOES_FISICAS.md](avaliacoes-fisicas/PLANEJAMENTO_AVALIACOES_FISICAS.md)** - Planejamento completo
- **[PLANEJAMENTO_AVALIACAO_FISICA.md](avaliacoes-fisicas/PLANEJAMENTO_AVALIACAO_FISICA.md)** - Planejamento detalhado

#### Fases de Implementação
- **[FASE1_AVALIACOES_FISICAS_COMPLETA.md](avaliacoes-fisicas/FASE1_AVALIACOES_FISICAS_COMPLETA.md)** - Fase 1: Estrutura base
- **[FASE2_AVALIACOES_CALCULOS_COMPLETA.md](avaliacoes-fisicas/FASE2_AVALIACOES_CALCULOS_COMPLETA.md)** - Fase 2: Cálculos
- **[FASE3_SCHEMAS_HOOKS_COMPLETA.md](avaliacoes-fisicas/FASE3_SCHEMAS_HOOKS_COMPLETA.md)** - Fase 3: Schemas e Hooks
- **[FASE4_INTERFACE_COMPLETA.md](avaliacoes-fisicas/FASE4_INTERFACE_COMPLETA.md)** - Fase 4: Interface
- **[FASE5_IMPLEMENTACAO_COMPLETA.md](avaliacoes-fisicas/FASE5_IMPLEMENTACAO_COMPLETA.md)** - Fase 5: Implementação final
- **[FASE5_MODULOS_ADICIONAIS_COMPLETA.md](avaliacoes-fisicas/FASE5_MODULOS_ADICIONAIS_COMPLETA.md)** - Fase 5: Módulos adicionais

#### Avaliação Postural
- **[AVALIACAO_POSTURAL_SETUP.md](avaliacoes-fisicas/AVALIACAO_POSTURAL_SETUP.md)** - Setup de avaliação postural
- **[GUIA_AVALIACAO_POSTURAL.md](avaliacoes-fisicas/GUIA_AVALIACAO_POSTURAL.md)** - Guia de uso
- **[AVALIACAO_POSTURAL_IMPLEMENTADA.md](avaliacoes-fisicas/AVALIACAO_POSTURAL_IMPLEMENTADA.md)** - Implementação

#### Correções e Sucesso
- **[CORRECAO_AVALIACOES_FISICAS_COMPLETA.md](avaliacoes-fisicas/CORRECAO_AVALIACOES_FISICAS_COMPLETA.md)** - Correções aplicadas
- **[CORRECAO_AVALIACOES_POSTURAIS.md](avaliacoes-fisicas/CORRECAO_AVALIACOES_POSTURAIS.md)** - Correções posturais
- **[AVALIACAO_FISICA_IMPLEMENTADA.md](avaliacoes-fisicas/AVALIACAO_FISICA_IMPLEMENTADA.md)** - Status de implementação
- **[AVALIACAO_FISICA_SUCESSO_FINAL.md](avaliacoes-fisicas/AVALIACAO_FISICA_SUCESSO_FINAL.md)** - Conclusão do projeto

#### Página de Implementação
- **[IMPLEMENTAÇÃO - PÁGINA AVALIAÇÃO FÍSICA.md](avaliacoes-fisicas/IMPLEMENTAÇÃO%20-%20PÁGINA%20AVALIAÇÃO%20FÍSICA.md)** - Detalhes da página

### Protocolos Suportados:
- Pollock 3 Dobras (homens e mulheres)
- Pollock 7 Dobras
- Avaliação Postural
- Circunferências corporais
- Cálculo de percentual de gordura e massa magra

---

## 🔔 Notificações e PWA

Sistema de notificações push e configuração de Progressive Web App.

### Arquivos:
- **[SISTEMA_NOTIFICACOES_PWA.md](notificacoes/SISTEMA_NOTIFICACOES_PWA.md)** - Visão geral do sistema
- **[IMPLEMENTACAO_NOTIFICACOES_PWA.md](notificacoes/IMPLEMENTACAO_NOTIFICACOES_PWA.md)** - Implementação técnica
- **[PWA_SETUP.md](notificacoes/PWA_SETUP.md)** - Configuração do PWA
- **[SETUP_NOTIFICACOES_PWA.md](notificacoes/SETUP_NOTIFICACOES_PWA.md)** - Setup de notificações
- **[EXEMPLOS_USO_NOTIFICACOES.md](notificacoes/EXEMPLOS_USO_NOTIFICACOES.md)** - Exemplos de uso
- **[RESUMO_IMPLEMENTACAO_NOTIFICACOES.md](notificacoes/RESUMO_IMPLEMENTACAO_NOTIFICACOES.md)** - Resumo

### Funcionalidades:
- Notificações de descanso completo
- Notificações de início de treino
- Service Worker para background
- Suporte offline
- Instalação como app nativo

---

## 🔐 Autenticação

Arquitetura de autenticação e gestão de usuários.

### Arquivos:
- **[NOVA_ARQUITETURA_AUTH.md](autenticacao/NOVA_ARQUITETURA_AUTH.md)** - Arquitetura de autenticação
- **[SOLUCAO_AUTENTICACAO_ALUNOS.md](autenticacao/SOLUCAO_AUTENTICACAO_ALUNOS.md)** - Solução para alunos
- **[DOCUMENTO_SENHAS_ALUNOS.md](autenticacao/DOCUMENTO_SENHAS_ALUNOS.md)** - Gestão de senhas

### Conceitos:
- Supabase Auth
- RLS (Row Level Security)
- Autenticação de admin vs aluno
- Gestão de sessões

---

## 📝 Planejamento de Features

Documentos de planejamento e especificação de funcionalidades.

### Arquivos:
- **[PLANEJAMENTO_PAINEL_ALUNO_COMPLETO.md](planejamento/PLANEJAMENTO_PAINEL_ALUNO_COMPLETO.md)** - Painel do aluno
- **[PLANEJAMENTO_PROGRESSO_TREINOS_ADMIN.md](planejamento/PLANEJAMENTO_PROGRESSO_TREINOS_ADMIN.md)** - Progresso de treinos (admin)
- **[CONFIGURACAO_AGENDA_COMPLETA.md](planejamento/CONFIGURACAO_AGENDA_COMPLETA.md)** - Sistema de agenda
- **[EXEMPLOS_IMPLEMENTACAO_PAINEL_ALUNO.md](planejamento/EXEMPLOS_IMPLEMENTACAO_PAINEL_ALUNO.md)** - Exemplos de implementação
- **[GUIA_ESTILO_PAINEL_ALUNO.md](planejamento/GUIA_ESTILO_PAINEL_ALUNO.md)** - Guia de estilo
- **[FEEDBACK_TREINOS_IMPLEMENTACAO.md](planejamento/FEEDBACK_TREINOS_IMPLEMENTACAO.md)** - Sistema de feedback
- **[GUIA_FEEDBACK_TREINOS.md](planejamento/GUIA_FEEDBACK_TREINOS.md)** - Guia de feedback
- **[RESUMO_FEEDBACK_TREINOS.md](planejamento/RESUMO_FEEDBACK_TREINOS.md)** - Resumo
- **[IMPLEMENTACAO_BUSCA_VIDEOS.md](planejamento/IMPLEMENTACAO_BUSCA_VIDEOS.md)** - Busca de vídeos
- **[RESUMO_BUSCA_VIDEOS.md](planejamento/RESUMO_BUSCA_VIDEOS.md)** - Resumo da busca

---

## 🧪 Testes

Guias de teste e casos de teste documentados.

### Arquivos:
- **[TESTE_PAINEL_ALUNO.md](testes/TESTE_PAINEL_ALUNO.md)** - Testes do painel do aluno
- **[TESTE_FEEDBACK_TREINOS.md](testes/TESTE_FEEDBACK_TREINOS.md)** - Testes de feedback
- **[test-aluno-login.md](testes/test-aluno-login.md)** - Testes de login de aluno
- **[test-video-upload.md](testes/test-video-upload.md)** - Testes de upload de vídeo

### Tipos de Teste:
- Testes funcionais
- Testes de integração
- Testes de UI/UX
- Testes de performance

---

## 👥 Dados de Usuários

Dados de teste e exemplos de usuários para desenvolvimento.

### Arquivos:
- **[DADOS_USUARIO_GABRIEL.md](dados-usuarios/DADOS_USUARIO_GABRIEL.md)** - Dados do usuário Gabriel
- **[DADOS_USUARIO_WALDIMAR.md](dados-usuarios/DADOS_USUARIO_WALDIMAR.md)** - Dados do usuário Waldimar

**Nota:** Estes são dados de teste para ambiente de desenvolvimento.

---

## 🎨 Design e Modelos

Guias de design e modelos de referência.

### Arquivos:
- **[design_guidelines.md](design_guidelines.md)** - Diretrizes de design
- **[HEVY MODELO.md](HEVY%20MODELO.md)** - Modelo de referência (app Hevy)
- **[RESUMO_EXECUTIVO_REMOCAO_MINIMIZAR.md](RESUMO_EXECUTIVO_REMOCAO_MINIMIZAR.md)** - Resumo executivo de mudanças

---

## 🔍 Como Usar Esta Documentação

### Para Desenvolvedores Novos:
1. Comece com [Setup e Configuração](#setup-e-configuração)
2. Leia o [README principal](../README.md) do projeto
3. Explore as features específicas conforme necessário

### Para Features Específicas:
- **Trabalhando com treinos?** → [Sistema de Treinos](#sistema-de-treinos)
- **Implementando avaliações?** → [Avaliações Físicas](#avaliações-físicas)
- **Configurando notificações?** → [Notificações e PWA](#notificações-e-pwa)
- **Problemas de autenticação?** → [Autenticação](#autenticação)

### Para Testes:
- Consulte [Testes](#testes) para guias específicos
- Use [Dados de Usuários](#dados-de-usuários) para testes

---

## 📌 Documentos Importantes

### Leitura Obrigatória:
1. **[REMOCAO_MINIMIZAR_TREINO.md](treinos/REMOCAO_MINIMIZAR_TREINO.md)** - Mudança arquitetural importante
2. **[CONFIGURACAO_TREINO_BACKGROUND.md](treinos/CONFIGURACAO_TREINO_BACKGROUND.md)** - Arquitetura atual de treinos
3. **[SUPABASE_SETUP.md](setup/SUPABASE_SETUP.md)** - Setup essencial

### Referência Rápida:
- **[GUIA_TESTE_TREINO_BACKGROUND.md](treinos/GUIA_TESTE_TREINO_BACKGROUND.md)** - Testes de treino
- **[GUIA_RAPIDO_AVALIACOES_FISICAS.md](avaliacoes-fisicas/GUIA_RAPIDO_AVALIACOES_FISICAS.md)** - Avaliações físicas
- **[EXEMPLOS_USO_NOTIFICACOES.md](notificacoes/EXEMPLOS_USO_NOTIFICACOES.md)** - Notificações

---

## 🔄 Atualizações Recentes

### Janeiro 2026
- ✅ Remoção da funcionalidade "Minimizar Treino"
- ✅ Implementação de treino em background automático
- ✅ Reorganização completa da documentação
- ✅ Criação de índice estruturado

---

## 📞 Suporte

Para dúvidas sobre a documentação:
1. Verifique o índice acima
2. Use a busca do editor (Ctrl+F / Cmd+F)
3. Consulte os guias de teste para exemplos práticos

---

**Última atualização:** Janeiro 2026

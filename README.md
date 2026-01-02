# Fitness Coaching Platform

Plataforma completa de gestão para personal trainers gerenciarem clientes, treinos, planos alimentares e agendamentos.

## 🎯 Visão Geral

Sistema full-stack desenvolvido em TypeScript com React e Supabase, permitindo que personal trainers gerenciem seus alunos de forma profissional e eficiente.

## ✨ Funcionalidades Principais

### Para o Personal Trainer (Admin)
- **Gestão de Alunos**: Dashboard completo com perfis, acompanhamento de progresso e status
- **Gestão de Treinos**: 
  - Biblioteca de vídeos com demonstrações de exercícios
  - Fichas de treino estruturadas com séries, repetições e descanso
  - Acompanhamento de progresso dos alunos
- **Avaliações Físicas**: Sistema completo de avaliações com protocolos de dobras cutâneas e avaliação postural
- **Planos Alimentares**: Sistema de planejamento nutricional customizável
- **Agenda Profissional**: Sistema de agendamento com blocos de horário e disponibilidade
- **Controle de Pagamentos**: Gestão de assinaturas e pagamentos dos clientes

### Para o Aluno (Student)
- **Meus Treinos**: Acesso aos treinos atribuídos com execução em tempo real
- **Timer Inteligente**: Sistema de timer que funciona em background
- **Planos Alimentares**: Visualização dos planos nutricionais
- **Agendamento**: Marcação de horários com o personal
- **Progresso**: Acompanhamento de evolução com fotos e métricas
- **Notificações PWA**: Alertas de descanso e lembretes

## 🚀 Tecnologias

### Frontend
- React 18 + TypeScript
- Wouter (routing)
- TanStack Query (state management)
- Tailwind CSS + Radix UI
- Framer Motion

### Backend
- Node.js + Express
- Supabase (PostgreSQL + Auth + Storage)
- Drizzle ORM
- Vercel (deployment)

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas credenciais do Supabase

# Iniciar desenvolvimento
npm run dev

# Build para produção
npm run build
```

## 🔧 Comandos Úteis

```bash
npm run dev              # Servidor de desenvolvimento
npm run build            # Build de produção
npm run start            # Executar build de produção
npm run check            # Verificação de tipos TypeScript
npm run db:push          # Aplicar mudanças no schema do banco
npm run create-admin     # Criar usuário admin
```

## 📚 Documentação

A documentação completa está organizada na pasta `/docs`:

- **[Setup](docs/setup/)** - Guias de configuração (Supabase, Vercel, Deploy)
- **[Treinos](docs/treinos/)** - Sistema de treinos e timer em background
- **[Avaliações Físicas](docs/avaliacoes-fisicas/)** - Sistema de avaliações e protocolos
- **[Notificações](docs/notificacoes/)** - PWA e sistema de notificações
- **[Autenticação](docs/autenticacao/)** - Arquitetura de autenticação
- **[Planejamento](docs/planejamento/)** - Documentos de planejamento de features
- **[Testes](docs/testes/)** - Guias e casos de teste

Ver [Índice Completo da Documentação](docs/README.md)

## 🏗️ Estrutura do Projeto

```
├── client/              # Frontend React
│   ├── src/
│   │   ├── components/  # Componentes React
│   │   ├── pages/       # Páginas (admin/ e aluno/)
│   │   ├── hooks/       # Custom hooks
│   │   └── lib/         # Utilitários
│   └── public/          # Assets estáticos
├── server/              # Backend Express
│   └── routes/          # Rotas da API
├── shared/              # Código compartilhado
│   └── schema.ts        # Schemas Drizzle + Zod
├── scripts/             # Scripts de setup e utilitários
├── supabase/            # Funções Supabase
├── docs/                # Documentação completa
└── api/                 # Serverless functions (Vercel)
```

## 🔐 Variáveis de Ambiente

Necessárias no arquivo `.env`:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
PORT=3174
```

## 🌐 Deploy

O projeto está configurado para deploy automático na Vercel:

1. Conectar repositório na Vercel
2. Configurar variáveis de ambiente
3. Deploy automático a cada push na branch main

Ver [Guia de Deploy](docs/setup/VERCEL_SETUP.md) para detalhes.

## 📱 PWA

O app funciona como Progressive Web App (PWA):

- Instalável em dispositivos móveis e desktop
- Funciona offline (cache de assets)
- Notificações push
- Timer de treino em background

Ver [Setup de PWA](docs/notificacoes/PWA_SETUP.md) para configuração.

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é proprietário e confidencial.

## 📞 Suporte

Para dúvidas ou suporte, consulte a [documentação completa](docs/README.md) ou entre em contato com a equipe de desenvolvimento.

---

**Desenvolvido com ❤️ para personal trainers e seus alunos**

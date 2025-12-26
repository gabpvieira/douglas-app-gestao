# Guia de Teste: Timer em Segundo Plano

## O Que Foi Implementado

### ✅ Timer Baseado em Timestamp
- **Timer de descanso** usa timestamps em vez de contadores
- **Tempo total do treino** também baseado em timestamps
- Ambos funcionam corretamente mesmo quando o app está minimizado
- Precisão mantida independente do estado da aba

### ✅ Notificações Web
- Notificação do sistema quando o descanso termina
- Som de alerta (beep)
- Vibração em dispositivos móveis
- Título da página atualiza com o tempo

### ✅ Modo Minimizado
- Botão "Minimizar Treino" na página de execução
- Barra flutuante compacta no canto inferior direito
- Mostra tempo total e timer de descanso ativo
- Permite pausar/retomar sem expandir
- Pode expandir de volta com um clique

### ✅ Page Visibility API
- Detecta quando usuário volta à aba
- Atualiza tempo imediatamente ao retornar
- Sem delay ou tempo incorreto

## Como Testar

### Teste 1: Timer de Descanso em Background (Problema Original)

1. **Iniciar um treino**
   - Entrar em "Meus Treinos"
   - Clicar em "Iniciar Treino"
   - Completar uma série de qualquer exercício

2. **Minimizar o app**
   - Quando o timer de descanso iniciar (ex: 60 segundos)
   - Minimizar a janela do navegador OU trocar de aba
   - Abrir outra aplicação (WhatsApp, Instagram, etc.)

3. **Aguardar o tempo passar**
   - Deixar o tempo do descanso acabar
   - Você deve receber:
     - ✅ Notificação do sistema
     - ✅ Som de alerta
     - ✅ Vibração (em celular)

4. **Voltar ao app**
   - O timer deve mostrar "Descanso Completo!"
   - O tempo deve estar correto (não pausado)

**Resultado Esperado**: Timer continua contando mesmo em background e notifica quando acabar.

### Teste 1.5: Tempo Total em Background (Novo)

1. **Iniciar um treino**
   - Entrar em "Meus Treinos"
   - Clicar em "Iniciar Treino"
   - Observar o tempo total no cabeçalho (ex: 0:00)

2. **Minimizar por tempo prolongado**
   - Minimizar o navegador ou trocar de aba
   - Aguardar 5-10 minutos
   - Fazer outras atividades

3. **Voltar ao app**
   - O tempo total deve estar correto (ex: 5:23, 10:45)
   - Não deve estar parado no tempo que minimizou

4. **Completar o treino**
   - Fazer algumas séries
   - Minimizar entre séries
   - Finalizar o treino
   - No modal de finalização, verificar o tempo total
   - Deve refletir o tempo real desde o início

**Resultado Esperado**: Tempo total sempre preciso, independente de minimizações.

### Teste 2: Modo Minimizado

1. **Iniciar um treino**
   - Entrar em qualquer treino
   - Clicar no botão "Minimizar Treino" (novo botão abaixo do header)

2. **Verificar barra flutuante**
   - Deve aparecer uma barra compacta no canto inferior direito
   - Mostra:
     - Nome da ficha
     - Tempo total do treino
     - Timer de descanso (se ativo)
     - Botões de controle

3. **Navegar em outras páginas**
   - Ir para "Dashboard"
   - Ir para "Meus Treinos"
   - Ir para "Progresso"
   - A barra flutuante deve continuar visível

4. **Completar uma série**
   - Expandir o treino clicando em "Ver Treino"
   - Completar uma série
   - Minimizar novamente
   - O timer de descanso deve aparecer na barra flutuante

5. **Controles na barra**
   - Testar botão "Pausar" (deve pausar sem expandir)
   - Testar botão "Retomar" (deve retomar sem expandir)
   - Testar botão "Ver Treino" (deve expandir)

**Resultado Esperado**: Barra flutuante funciona como um "mini player" do treino.

### Teste 3: Notificações

1. **Primeira vez**
   - Ao iniciar um treino pela primeira vez
   - O navegador deve pedir permissão para notificações
   - Clicar em "Permitir"

2. **Testar notificação**
   - Completar uma série com descanso curto (30s)
   - Minimizar o navegador
   - Aguardar 30 segundos
   - Deve receber notificação: "Descanso Completo! 💪"
   - Corpo da notificação: "Pronto para a próxima série de [Nome do Exercício]"

3. **Clicar na notificação**
   - Ao clicar, deve focar na aba do app
   - Notificação deve fechar

**Resultado Esperado**: Notificações funcionam e trazem o usuário de volta ao app.

### Teste 4: Título da Página

1. **Com treino ativo**
   - Título deve mostrar: "💪 [tempo] - Treino"
   - Exemplo: "💪 5:23 - Treino"

2. **Com descanso ativo**
   - Título deve mostrar: "⏱️ [tempo] - Descanso"
   - Exemplo: "⏱️ 0:45 - Descanso"

3. **Com treino pausado**
   - Título deve mostrar: "⏸️ Treino Pausado"

**Resultado Esperado**: Fácil identificar o estado do treino pela aba do navegador.

## Cenários de Uso Real

### Cenário 1: Aluno nas Redes Sociais
```
1. Aluno inicia treino
2. Completa primeira série de supino
3. Timer de 90s inicia
4. Aluno minimiza e abre Instagram
5. Após 90s, recebe notificação
6. Volta ao app e faz próxima série
```

### Cenário 2: Aluno Consultando Vídeo
```
1. Aluno está no meio do treino
2. Quer ver vídeo de técnica de outro exercício
3. Clica em "Minimizar Treino"
4. Navega para "Vídeos" ou outra página
5. Barra flutuante continua mostrando tempo
6. Quando descanso acabar, recebe notificação
7. Clica em "Ver Treino" na barra para voltar
```

### Cenário 3: Treino Longo
```
1. Aluno faz treino de 60+ minutos
2. Minimiza entre séries para responder mensagens
3. Timer continua contando corretamente
4. Tempo total sempre preciso
5. Notificações mantêm o ritmo do treino
```

## Problemas Conhecidos e Limitações

### iOS Safari
- Notificações web têm suporte limitado
- Timer funciona, mas notificações podem não aparecer
- Som e vibração funcionam normalmente

### Permissões Negadas
- Se usuário negar notificações, apenas som tocará
- Timer continua funcionando normalmente
- Pode reabilitar nas configurações do navegador

### Múltiplas Abas
- Se abrir treino em 2 abas, pode haver conflito
- Recomendado usar apenas uma aba por vez
- Estado sincroniza via localStorage e Supabase

## Melhorias Futuras (Não Implementadas Ainda)

### Wake Lock API
- Manter tela ligada durante descanso
- Prevenir que celular durma
- Útil para treinos longos

### Service Worker Avançado
- Timer funcionar com app completamente fechado
- Notificações push mesmo sem aba aberta
- Requer configuração adicional

### Configurações Personalizadas
- Escolher tipo de som de alerta
- Ajustar volume da notificação
- Desabilitar vibração
- Customizar mensagens

## Feedback Solicitado

Por favor, teste e reporte:

1. **Timer de descanso em background funciona?**
   - Tempo continua correto após minimizar?
   - Notificação aparece quando acaba?

2. **Tempo total em background funciona?**
   - Tempo total continua contando quando minimizado?
   - Tempo exibido no modal de finalização está correto?
   - Tempo preciso mesmo após horas de treino?

3. **Modo minimizado é útil?**
   - Barra flutuante atrapalha ou ajuda?
   - Tamanho e posição adequados?
   - Controles suficientes?

4. **Notificações**
   - Aparecem corretamente?
   - Som é adequado?
   - Mensagem é clara?

5. **Experiência geral**
   - Fluxo de treino melhorou?
   - Algo confuso ou inesperado?
   - Sugestões de melhoria?

## Comandos para Testar

```bash
# Rodar o app em desenvolvimento
npm run dev

# Acessar como aluno
# Login: [email do aluno]
# Senha: [senha do aluno]

# Ir para: Meus Treinos > Iniciar Treino
```

## Checklist de Teste

### Timer de Descanso
- [ ] Timer continua em background (minimizado)
- [ ] Timer continua em background (outra aba)
- [ ] Notificação aparece quando tempo acaba
- [ ] Som toca quando tempo acaba
- [ ] Vibração funciona (em celular)
- [ ] Tempo sempre preciso ao voltar

### Tempo Total do Treino
- [ ] Tempo total continua em background
- [ ] Tempo total preciso após minimizar por 5+ minutos
- [ ] Tempo total correto ao pausar treino
- [ ] Tempo total correto ao retomar treino
- [ ] Tempo total exibido corretamente no modal de finalização
- [ ] Tempo atualiza imediatamente ao voltar à aba

### Modo Minimizado
- [ ] Botão "Minimizar Treino" funciona
- [ ] Barra flutuante aparece corretamente
- [ ] Barra flutuante mostra tempo total
- [ ] Barra flutuante mostra timer de descanso
- [ ] Botão "Pausar" na barra funciona
- [ ] Botão "Ver Treino" expande de volta
- [ ] Pode navegar em outras páginas com barra visível

### Geral
- [ ] Título da página atualiza com tempo
- [ ] Clicar na notificação foca no app
- [ ] Estado persiste ao recarregar página
- [ ] Funciona em diferentes navegadores

## Suporte

Se encontrar problemas:
1. Verificar console do navegador (F12)
2. Verificar se notificações estão permitidas
3. Testar em navegador diferente
4. Reportar com detalhes do erro

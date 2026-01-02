# Guia Rápido de Teste: Minimizar Treino

## 🎯 Objetivo

Validar que a funcionalidade de minimizar treino está funcionando corretamente em todos os cenários.

## ⚡ Testes Rápidos (5 minutos)

### Teste 1: Minimizar e Expandir
**Tempo**: 30 segundos

1. Inicie um treino qualquer
2. Clique em "Minimizar Treino"
3. ✅ Verificar: Barra flutuante aparece no canto inferior direito
4. ✅ Verificar: Mostra nome da ficha e tempo total
5. Clique em "Ver Treino"
6. ✅ Verificar: Interface completa é restaurada
7. ✅ Verificar: Nenhuma informação foi perdida

**Resultado Esperado**: Transição suave entre modos, sem perda de dados.

---

### Teste 2: Timer de Descanso em Background
**Tempo**: 2 minutos

1. Inicie um treino
2. Complete uma série (marque como concluída)
3. ✅ Verificar: Timer de descanso inicia (ex: 60s)
4. Clique em "Minimizar Treino"
5. ✅ Verificar: Barra flutuante mostra timer de descanso
6. Minimize o navegador ou troque de aba
7. Aguarde o tempo do descanso acabar
8. ✅ Verificar: Recebe notificação "Descanso Completo! 💪"
9. ✅ Verificar: Som de alerta toca
10. Volte ao app
11. ✅ Verificar: Timer mostra "Descanso Completo!"

**Resultado Esperado**: Timer continua contando em background, notificação aparece.

---

### Teste 3: Tempo Total em Background
**Tempo**: 2 minutos

1. Inicie um treino
2. Observe o tempo total (ex: 0:00)
3. Clique em "Minimizar Treino"
4. Minimize o navegador ou troque de aba
5. Aguarde 1-2 minutos
6. Volte ao app
7. ✅ Verificar: Tempo total está correto (ex: 1:23, 2:15)
8. ✅ Verificar: Tempo não parou quando minimizou

**Resultado Esperado**: Tempo total sempre preciso, independente de minimizações.

---

### Teste 4: Controles na Barra Flutuante
**Tempo**: 30 segundos

1. Inicie um treino e minimize
2. Na barra flutuante, clique em "Pausar"
3. ✅ Verificar: Tempo total para de contar
4. ✅ Verificar: Status muda para "Pausado"
5. Clique em "Retomar"
6. ✅ Verificar: Tempo total volta a contar
7. ✅ Verificar: Status muda para "Em andamento"

**Resultado Esperado**: Controles funcionam sem precisar expandir.

---

### Teste 5: Navegação com Treino Minimizado
**Tempo**: 1 minuto

1. Inicie um treino e minimize
2. Navegue para "Dashboard"
3. ✅ Verificar: Barra flutuante continua visível
4. Navegue para "Meus Treinos"
5. ✅ Verificar: Barra flutuante continua visível
6. Navegue para "Progresso"
7. ✅ Verificar: Barra flutuante continua visível
8. ✅ Verificar: Tempo continua contando

**Resultado Esperado**: Barra flutuante sempre visível, tempo sempre contando.

---

## 🔍 Testes Detalhados (15 minutos)

### Teste 6: Persistência ao Recarregar
**Tempo**: 2 minutos

1. Inicie um treino
2. Complete algumas séries
3. Minimize o treino
4. Recarregue a página (F5)
5. ✅ Verificar: Treino é retomado automaticamente
6. ✅ Verificar: Séries completadas estão marcadas
7. ✅ Verificar: Tempo total está correto
8. ✅ Verificar: Barra flutuante aparece (se estava minimizado)

**Resultado Esperado**: Estado completo é recuperado.

---

### Teste 7: Título da Página
**Tempo**: 2 minutos

1. Inicie um treino
2. ✅ Verificar: Título da aba mostra "💪 [tempo] - Treino"
3. Complete uma série para iniciar descanso
4. ✅ Verificar: Título muda para "⏱️ [tempo] - Descanso"
5. Pause o treino
6. ✅ Verificar: Título muda para "⏸️ Treino Pausado"
7. Retome o treino
8. ✅ Verificar: Título volta para "💪 [tempo] - Treino"

**Resultado Esperado**: Título sempre reflete o estado atual.

---

### Teste 8: Múltiplas Séries com Descanso
**Tempo**: 5 minutos

1. Inicie um treino
2. Complete primeira série → Timer de 60s inicia
3. Minimize o treino
4. Aguarde notificação
5. Expanda e complete segunda série → Timer de 60s inicia
6. Minimize novamente
7. Aguarde notificação
8. ✅ Verificar: Ambas as notificações funcionaram
9. ✅ Verificar: Tempo total está correto
10. ✅ Verificar: Todas as séries estão marcadas

**Resultado Esperado**: Fluxo completo funciona perfeitamente.

---

### Teste 9: Finalizar Treino Minimizado
**Tempo**: 2 minutos

1. Inicie um treino e minimize
2. Aguarde alguns minutos
3. Expanda o treino
4. Complete todas as séries
5. Clique em "Finalizar Treino"
6. ✅ Verificar: Modal de finalização mostra tempo total correto
7. ✅ Verificar: Tempo reflete todo o período (incluindo minimizado)
8. Confirme finalização
9. ✅ Verificar: Treino é salvo com tempo correto

**Resultado Esperado**: Tempo total sempre preciso ao finalizar.

---

### Teste 10: Permissões de Notificação
**Tempo**: 1 minuto

**Primeira vez (permissão não concedida)**:
1. Inicie um treino pela primeira vez
2. ✅ Verificar: Navegador pede permissão para notificações
3. Clique em "Permitir"
4. Complete uma série
5. Minimize e aguarde
6. ✅ Verificar: Notificação aparece

**Se permissão negada**:
1. Complete uma série
2. Minimize e aguarde
3. ✅ Verificar: Som de alerta toca (mesmo sem notificação)
4. ✅ Verificar: Timer continua funcionando normalmente

**Resultado Esperado**: Funciona com ou sem permissão de notificação.

---

## 📱 Testes Mobile (Opcional)

### Teste 11: Mobile - Timer em Background
**Tempo**: 2 minutos

1. Abra o app no celular
2. Inicie um treino
3. Complete uma série (timer de 60s inicia)
4. Minimize o navegador
5. Abra outro app (Instagram, WhatsApp)
6. Aguarde 60 segundos
7. ✅ Verificar: Notificação aparece
8. ✅ Verificar: Celular vibra (Android)
9. Toque na notificação
10. ✅ Verificar: Volta ao app automaticamente

**Resultado Esperado**: Funciona perfeitamente em mobile.

---

### Teste 12: Mobile - Tela Bloqueada
**Tempo**: 2 minutos

1. Inicie um treino no celular
2. Complete uma série (timer de 60s inicia)
3. Minimize o app
4. Bloqueie a tela do celular
5. Aguarde 60 segundos
6. ✅ Verificar: Notificação aparece na tela bloqueada
7. ✅ Verificar: Som toca
8. ✅ Verificar: Celular vibra (Android)
9. Desbloqueie e abra o app
10. ✅ Verificar: Timer mostra "Descanso Completo!"

**Resultado Esperado**: Funciona mesmo com tela bloqueada.

---

## 🐛 Testes de Edge Cases

### Teste 13: Pausar Durante Descanso
**Tempo**: 1 minuto

1. Complete uma série (timer de 60s inicia)
2. Minimize o treino
3. Na barra flutuante, clique em "Pausar"
4. ✅ Verificar: Timer de descanso para
5. ✅ Verificar: Tempo total para
6. Aguarde alguns segundos
7. Clique em "Retomar"
8. ✅ Verificar: Timer de descanso continua de onde parou
9. ✅ Verificar: Tempo total volta a contar

**Resultado Esperado**: Pausar funciona corretamente durante descanso.

---

### Teste 14: Sair e Voltar Durante Descanso
**Tempo**: 2 minutos

1. Complete uma série (timer de 60s inicia)
2. Minimize o treino
3. Clique em "Sair e Salvar"
4. Volte para "Meus Treinos"
5. Clique em "Continuar Treino"
6. ✅ Verificar: Treino é retomado
7. ✅ Verificar: Timer de descanso continua (se ainda não acabou)
8. ✅ Verificar: Tempo total está correto

**Resultado Esperado**: Estado é preservado ao sair e voltar.

---

### Teste 15: Múltiplas Abas (Aviso)
**Tempo**: 1 minuto

1. Inicie um treino
2. Abra a mesma URL em outra aba
3. ✅ Verificar: Sistema detecta treino em andamento
4. ✅ Verificar: Mostra aviso: "Você já tem um treino em andamento"
5. ✅ Verificar: Oferece opções: "Retomar treino" ou "Descartar"

**Resultado Esperado**: Sistema previne conflitos de múltiplas abas.

---

## ✅ Checklist Final

### Funcionalidade Básica
- [ ] Botão "Minimizar Treino" funciona
- [ ] Barra flutuante aparece corretamente
- [ ] Botão "Ver Treino" expande de volta
- [ ] Transição suave entre modos

### Temporizadores
- [ ] Tempo total continua em background
- [ ] Timer de descanso continua em background
- [ ] Precisão mantida (±500ms para total, ±100ms para descanso)
- [ ] Atualização visual correta

### Notificações
- [ ] Permissão solicitada corretamente
- [ ] Notificação aparece quando descanso completa
- [ ] Som toca quando descanso completa
- [ ] Vibração funciona (Android)
- [ ] Clicar na notificação foca no app

### Controles
- [ ] Pausar funciona na barra flutuante
- [ ] Retomar funciona na barra flutuante
- [ ] Pausar congela ambos os timers
- [ ] Retomar continua de onde parou

### Navegação
- [ ] Barra flutuante visível em todas as páginas
- [ ] Pode navegar livremente com treino minimizado
- [ ] Estado preservado ao navegar

### Persistência
- [ ] Estado salvo em localStorage
- [ ] Estado salvo em Supabase
- [ ] Treino recuperado ao recarregar
- [ ] Nenhuma informação perdida

### Título da Página
- [ ] Mostra tempo durante treino ativo
- [ ] Mostra tempo durante descanso
- [ ] Mostra "Pausado" quando pausado
- [ ] Volta ao normal ao sair do treino

### Mobile
- [ ] Funciona em Chrome Android
- [ ] Funciona em Safari iOS (timer e som)
- [ ] Notificações aparecem
- [ ] Vibração funciona (Android)

### Edge Cases
- [ ] Pausar durante descanso funciona
- [ ] Sair e voltar preserva estado
- [ ] Múltiplas abas são detectadas
- [ ] Permissões negadas não quebram funcionalidade

---

## 🎯 Resultado Esperado Geral

**Todos os testes devem passar com sucesso**, demonstrando que:

1. ✅ Temporizadores funcionam perfeitamente em background
2. ✅ Notificações alertam o usuário quando necessário
3. ✅ Estado é sempre preservado e recuperado
4. ✅ Experiência é fluida e intuitiva
5. ✅ Funciona em todos os navegadores e dispositivos

---

## 📊 Relatório de Teste

Após executar os testes, preencha:

**Data**: ___/___/______  
**Testador**: _________________  
**Navegador**: _________________  
**Dispositivo**: _________________  

**Testes Passados**: ___/15  
**Testes Falhados**: ___/15  

**Problemas Encontrados**:
- [ ] Nenhum
- [ ] Listar abaixo:

1. _________________________________
2. _________________________________
3. _________________________________

**Observações**:
_________________________________
_________________________________
_________________________________

**Status Final**:
- [ ] ✅ Aprovado - Pronto para uso
- [ ] ⚠️ Aprovado com ressalvas
- [ ] ❌ Reprovado - Necessita correções

---

## 🆘 Solução de Problemas

### Notificações não aparecem?
- Verificar permissões do navegador
- Som continuará funcionando

### Tempo parece errado?
- Recarregar a página
- Estado é recuperado automaticamente

### Barra flutuante sumiu?
- Voltar para a página do treino
- Estado está salvo e seguro

### Timer não conta em background?
- Verificar se navegador está atualizado
- Testar em navegador diferente

---

**Dica**: Execute os testes rápidos (1-5) primeiro para validação básica. Execute os testes detalhados (6-15) para validação completa.

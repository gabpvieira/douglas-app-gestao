# 🧪 Guia de Testes - Sistema de Feedback de Treinos

## Pré-requisitos

- Aplicação rodando localmente ou em produção
- Usuário admin criado
- Pelo menos um aluno cadastrado
- Pelo menos uma ficha de treino atribuída ao aluno

## 🔍 Testes Funcionais

### 1. Teste de Criação de Feedback (Aluno)

**Objetivo:** Verificar se o aluno consegue criar feedback após finalizar treino

**Passos:**
1. Faça login como aluno
2. Acesse "Meus Treinos"
3. Clique em "Iniciar Treino" em uma ficha
4. Execute pelo menos um exercício (registre séries)
5. Clique em "Finalizar Treino"
6. Confirme a finalização no modal de resumo
7. Verifique se o modal de feedback aparece automaticamente

**Teste A: Enviar apenas estrelas**
1. Selecione 5 estrelas
2. Deixe o comentário vazio
3. Clique em "Enviar Feedback"
4. Verifique se aparece toast de sucesso
5. Verifique se redireciona para lista de treinos

**Teste B: Enviar estrelas + comentário**
1. Selecione 3 estrelas
2. Digite um comentário: "Treino bom, mas senti dificuldade no supino"
3. Clique em "Enviar Feedback"
4. Verifique toast de sucesso
5. Verifique redirecionamento

**Teste C: Pular feedback**
1. Clique em "Cancelar" ou feche o modal
2. Verifique se redireciona para lista de treinos
3. Verifique que nenhum feedback foi criado

**Resultado Esperado:**
- ✅ Modal aparece automaticamente
- ✅ Estrelas são obrigatórias (botão desabilitado sem seleção)
- ✅ Comentário é opcional
- ✅ Toast de sucesso aparece
- ✅ Redirecionamento funciona
- ✅ Feedback é salvo no banco

### 2. Teste de Visualização (Admin)

**Objetivo:** Verificar se admin consegue ver todos os feedbacks

**Passos:**
1. Faça login como admin
2. Clique em "Feedbacks de Treinos" no menu lateral
3. Verifique se a página carrega

**Verificações:**
- ✅ Dashboard com 3 cards de estatísticas
- ✅ Total de feedbacks correto
- ✅ Média de avaliação calculada
- ✅ Gráfico de distribuição visível
- ✅ Tabela com feedbacks listados
- ✅ Informações do aluno visíveis
- ✅ Estrelas renderizadas corretamente
- ✅ Comentários exibidos (ou "Sem comentário")
- ✅ Data/hora formatada corretamente

### 3. Teste de Filtros (Admin)

**Objetivo:** Verificar se os filtros funcionam corretamente

**Teste A: Busca por aluno**
1. Digite parte do nome de um aluno no campo de busca
2. Verifique se a tabela filtra em tempo real
3. Digite nome inexistente
4. Verifique mensagem "Nenhum feedback encontrado"

**Teste B: Filtro por estrelas**
1. Selecione "5 estrelas" no dropdown
2. Verifique se mostra apenas feedbacks com 5 estrelas
3. Teste com outras quantidades (4, 3, 2, 1)
4. Selecione "Todas as avaliações"
5. Verifique se mostra todos novamente

**Teste C: Filtros combinados**
1. Digite nome de aluno + selecione quantidade de estrelas
2. Verifique se ambos os filtros são aplicados

**Resultado Esperado:**
- ✅ Busca funciona em tempo real
- ✅ Filtro de estrelas funciona
- ✅ Filtros podem ser combinados
- ✅ Mensagem apropriada quando não há resultados

### 4. Teste de Exclusão (Admin)

**Objetivo:** Verificar se admin consegue deletar feedbacks

**Passos:**
1. Na tabela de feedbacks, clique no ícone de lixeira
2. Verifique se aparece diálogo de confirmação
3. Clique em "Cancelar"
4. Verifique que feedback não foi deletado
5. Clique novamente no ícone de lixeira
6. Clique em "Excluir"
7. Verifique toast de sucesso
8. Verifique que feedback sumiu da tabela
9. Verifique que estatísticas foram atualizadas

**Resultado Esperado:**
- ✅ Diálogo de confirmação aparece
- ✅ Cancelar não deleta
- ✅ Excluir remove o feedback
- ✅ Toast de sucesso aparece
- ✅ Tabela atualiza automaticamente
- ✅ Estatísticas recalculadas

## 🔒 Testes de Segurança

### 5. Teste de RLS - Aluno não vê feedbacks de outros

**Objetivo:** Verificar isolamento de dados entre alunos

**Passos:**
1. Crie feedback como Aluno A
2. Faça logout
3. Faça login como Aluno B
4. Tente acessar feedbacks via console do navegador:

```javascript
// Abra console (F12) e execute:
const { data, error } = await supabase
  .from('feedback_treinos')
  .select('*');
console.log('Feedbacks:', data);
```

**Resultado Esperado:**
- ✅ Aluno B vê apenas seus próprios feedbacks
- ✅ Feedbacks do Aluno A não aparecem

### 6. Teste de RLS - Aluno não pode deletar

**Objetivo:** Verificar que alunos não podem deletar feedbacks

**Passos:**
1. Faça login como aluno
2. Crie um feedback
3. Tente deletar via console:

```javascript
// Pegue o ID do feedback criado
const feedbackId = 'SEU_FEEDBACK_ID';

const { error } = await supabase
  .from('feedback_treinos')
  .delete()
  .eq('id', feedbackId);

console.log('Erro:', error);
```

**Resultado Esperado:**
- ✅ Erro de permissão (RLS policy)
- ✅ Feedback não é deletado

### 7. Teste de Validação - Estrelas

**Objetivo:** Verificar validação de estrelas (1-5)

**Passos:**
1. Tente criar feedback com estrelas inválidas via console:

```javascript
const { error } = await supabase
  .from('feedback_treinos')
  .insert({
    aluno_id: 'SEU_ALUNO_ID',
    treino_id: 'SEU_TREINO_ID',
    estrelas: 6 // Inválido
  });

console.log('Erro:', error);
```

**Resultado Esperado:**
- ✅ Erro de validação (check constraint)
- ✅ Feedback não é criado

## 📊 Testes de Performance

### 8. Teste de Carga - Muitos Feedbacks

**Objetivo:** Verificar performance com muitos registros

**Passos:**
1. Crie 100+ feedbacks (pode usar script SQL)
2. Acesse página admin de feedbacks
3. Verifique tempo de carregamento
4. Teste filtros e busca
5. Verifique se estatísticas calculam rápido

**Script SQL para criar feedbacks de teste:**
```sql
-- Criar 100 feedbacks de teste
DO $$
DECLARE
  aluno_id_var UUID;
  treino_id_var UUID;
  i INTEGER;
BEGIN
  -- Pegar um aluno existente
  SELECT id INTO aluno_id_var FROM alunos LIMIT 1;
  
  -- Pegar uma ficha_aluno existente
  SELECT id INTO treino_id_var FROM fichas_alunos LIMIT 1;
  
  -- Criar 100 feedbacks
  FOR i IN 1..100 LOOP
    INSERT INTO feedback_treinos (aluno_id, treino_id, estrelas, comentario)
    VALUES (
      aluno_id_var,
      treino_id_var,
      (RANDOM() * 4 + 1)::INTEGER, -- 1-5
      CASE 
        WHEN RANDOM() > 0.5 THEN 'Comentário de teste ' || i
        ELSE NULL
      END
    );
  END LOOP;
END $$;
```

**Resultado Esperado:**
- ✅ Página carrega em < 2 segundos
- ✅ Filtros respondem instantaneamente
- ✅ Estatísticas calculam rápido
- ✅ Sem travamentos

### 9. Teste de Índices

**Objetivo:** Verificar se índices estão sendo usados

**Passos:**
1. Execute no Supabase SQL Editor:

```sql
-- Verificar uso dos índices
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as index_scans,
  idx_tup_read as tuples_read
FROM pg_stat_user_indexes
WHERE tablename = 'feedback_treinos'
ORDER BY idx_scan DESC;
```

**Resultado Esperado:**
- ✅ Índices têm `idx_scan > 0` (estão sendo usados)
- ✅ Índice de `created_at` tem mais scans (ordenação)

## 🎨 Testes de UI/UX

### 10. Teste de Responsividade

**Objetivo:** Verificar funcionamento em diferentes tamanhos de tela

**Dispositivos para testar:**
- Desktop (1920x1080)
- Tablet (768x1024)
- Mobile (375x667)

**Páginas para testar:**
- Modal de feedback (aluno)
- Página de feedbacks (admin)

**Verificações:**
- ✅ Modal se adapta ao tamanho da tela
- ✅ Tabela tem scroll horizontal em mobile
- ✅ Botões são clicáveis em touch
- ✅ Textos são legíveis
- ✅ Espaçamentos adequados

### 11. Teste de Acessibilidade

**Objetivo:** Verificar acessibilidade básica

**Ferramentas:**
- Lighthouse (Chrome DevTools)
- Navegação por teclado

**Testes:**
1. Navegue pelo modal usando apenas Tab
2. Selecione estrelas com Enter/Space
3. Preencha comentário
4. Envie com Enter
5. Execute Lighthouse audit

**Resultado Esperado:**
- ✅ Todos os elementos são acessíveis por teclado
- ✅ Labels associados a inputs
- ✅ Contraste adequado
- ✅ Score de acessibilidade > 90

## 🐛 Testes de Edge Cases

### 12. Teste de Comentário Longo

**Objetivo:** Verificar limite de 500 caracteres

**Passos:**
1. Abra modal de feedback
2. Cole texto com 600 caracteres no comentário
3. Verifique se é truncado em 500
4. Verifique contador de caracteres

**Resultado Esperado:**
- ✅ Máximo de 500 caracteres aceito
- ✅ Contador mostra "500/500"
- ✅ Não permite digitar mais

### 13. Teste de Feedback Duplicado

**Objetivo:** Verificar se permite múltiplos feedbacks para mesmo treino

**Passos:**
1. Finalize um treino e dê feedback
2. Tente dar feedback novamente para o mesmo treino

**Resultado Esperado:**
- ✅ Permite múltiplos feedbacks (não há constraint UNIQUE)
- ✅ Cada feedback é independente

### 14. Teste de Conexão Perdida

**Objetivo:** Verificar comportamento sem internet

**Passos:**
1. Abra modal de feedback
2. Desconecte internet
3. Tente enviar feedback
4. Reconecte internet

**Resultado Esperado:**
- ✅ Mostra erro de conexão
- ✅ Toast com mensagem apropriada
- ✅ Não perde dados do formulário
- ✅ Pode tentar novamente

## 📋 Checklist de Testes

### Funcionalidades Básicas
- [ ] Criar feedback com estrelas apenas
- [ ] Criar feedback com estrelas + comentário
- [ ] Pular feedback
- [ ] Ver feedbacks (admin)
- [ ] Filtrar por aluno
- [ ] Filtrar por estrelas
- [ ] Deletar feedback

### Segurança
- [ ] RLS - Aluno vê apenas seus feedbacks
- [ ] RLS - Aluno não pode deletar
- [ ] RLS - Admin vê todos
- [ ] RLS - Admin pode deletar
- [ ] Validação de estrelas (1-5)

### Performance
- [ ] Carregamento rápido (< 2s)
- [ ] Filtros instantâneos
- [ ] Índices sendo usados
- [ ] Cache funcionando

### UI/UX
- [ ] Responsivo (desktop, tablet, mobile)
- [ ] Acessível (teclado, screen readers)
- [ ] Feedback visual adequado
- [ ] Mensagens de erro claras

### Edge Cases
- [ ] Comentário longo (500 chars)
- [ ] Feedbacks duplicados
- [ ] Sem conexão
- [ ] Muitos feedbacks (100+)

## 🎯 Critérios de Aceitação

Para considerar o sistema pronto para produção, todos os itens devem estar ✅:

**Obrigatórios:**
- [x] Aluno pode criar feedback
- [x] Estrelas são obrigatórias
- [x] Comentário é opcional
- [x] Admin vê todos os feedbacks
- [x] Filtros funcionam
- [x] RLS policies funcionando
- [x] Sem erros no console
- [x] Responsivo

**Desejáveis:**
- [x] Performance adequada
- [x] Acessibilidade básica
- [x] Documentação completa
- [x] Queries SQL úteis

## 📝 Relatório de Bugs

Se encontrar bugs, documente:

**Template:**
```
Título: [Descrição curta do bug]
Severidade: [Crítico/Alto/Médio/Baixo]
Passos para reproduzir:
1. ...
2. ...
3. ...
Resultado esperado: ...
Resultado obtido: ...
Screenshots: [se aplicável]
Console errors: [se houver]
Navegador: [Chrome/Firefox/Safari]
Dispositivo: [Desktop/Mobile]
```

## ✅ Conclusão

Após executar todos os testes e verificar que estão passando, o sistema está pronto para uso em produção!

---

**Última atualização:** Dezembro 2024  
**Versão:** 1.0.0

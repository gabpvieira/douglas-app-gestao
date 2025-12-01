import { sql } from "drizzle-orm";
import { pgTable, text, varchar, date, integer, timestamp, jsonb, uuid, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const usersProfile = pgTable("users_profile", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  authUid: text("auth_uid").notNull(),
  nome: text("nome").notNull(),
  email: text("email").notNull().unique(),
  tipo: text("tipo").notNull(),
  fotoUrl: text("foto_url"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export const alunos = pgTable("alunos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userProfileId: varchar("user_profile_id").notNull().references(() => usersProfile.id),
  dataNascimento: date("data_nascimento"),
  altura: integer("altura"),
  genero: text("genero"),
  status: text("status").notNull().default("ativo"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertUserProfileSchema = createInsertSchema(usersProfile).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAlunoSchema = createInsertSchema(alunos).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Tabela para blocos de horários disponíveis (DEPRECATED - mantida para compatibilidade)
export const blocosHorarios = pgTable("blocos_horarios", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  diaSemana: integer("dia_semana").notNull(),
  horaInicio: text("hora_inicio").notNull(),
  horaFim: text("hora_fim").notNull(),
  duracao: integer("duracao").notNull(),
  ativo: text("ativo").notNull().default("true"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// Tabela para disponibilidade semanal do profissional
export const disponibilidadeSemanal = pgTable("disponibilidade_semanal", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  diaSemana: integer("dia_semana").notNull(), // 0-6 (domingo a sábado)
  horaInicio: text("hora_inicio").notNull(), // formato HH:MM
  horaFim: text("hora_fim").notNull(), // formato HH:MM
  duracaoAtendimento: integer("duracao_atendimento").notNull(), // duração em minutos
  ativo: text("ativo").notNull().default("true"),
  tipo: text("tipo").notNull().default("presencial"), // presencial, online
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// Tabela para agendamentos presenciais (NOVA ESTRUTURA)
export const agendamentosPresenciais = pgTable("agendamentos_presenciais", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  alunoId: varchar("aluno_id").notNull().references(() => alunos.id),
  dataAgendamento: date("data_agendamento").notNull(),
  horaInicio: text("hora_inicio").notNull(),
  horaFim: text("hora_fim").notNull(),
  status: text("status").notNull().default("agendado"), // agendado, confirmado, cancelado, concluido
  tipo: text("tipo").notNull().default("presencial"), // presencial, online
  observacoes: text("observacoes"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// Tabela para exceções de disponibilidade (feriados, férias, etc.)
export const excecoesDispo = pgTable("excecoes_disponibilidade", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  dataInicio: date("data_inicio").notNull(),
  dataFim: date("data_fim").notNull(),
  motivo: text("motivo").notNull(),
  ativo: text("ativo").notNull().default("true"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// Tabela para Avaliações Físicas (Simplificada - Foco em Musculação)
export const avaliacoesFisicas = pgTable("avaliacoes_fisicas", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  alunoId: varchar("aluno_id").notNull().references(() => alunos.id, { onDelete: 'cascade' }),
  dataAvaliacao: date("data_avaliacao").notNull(),
  
  // Medidas Básicas
  peso: text("peso"),
  altura: integer("altura"),
  imc: text("imc"),
  
  // Protocolo e Dados Adicionais (Fase 4)
  protocolo: text("protocolo").default("manual"),
  genero: text("genero"),
  idade: integer("idade"),
  densidadeCorporal: text("densidade_corporal"),
  pesoIdeal: text("peso_ideal"),
  classificacaoGordura: text("classificacao_gordura"),
  
  // Circunferências Principais (cm) - Shape e Músculos
  circunferenciaTorax: text("circunferencia_torax"),
  circunferenciaCintura: text("circunferencia_cintura"),
  circunferenciaAbdomen: text("circunferencia_abdomen"),
  circunferenciaQuadril: text("circunferencia_quadril"),
  circunferenciaBracoDireito: text("circunferencia_braco_direito"),
  circunferenciaBracoEsquerdo: text("circunferencia_braco_esquerdo"),
  circunferenciaCoxaDireita: text("circunferencia_coxa_direita"),
  circunferenciaCoxaEsquerda: text("circunferencia_coxa_esquerda"),
  circunferenciaPanturrilhaDireita: text("circunferencia_panturrilha_direita"),
  circunferenciaPanturrilhaEsquerda: text("circunferencia_panturrilha_esquerda"),
  
  // Composição Corporal
  percentualGordura: text("percentual_gordura"),
  massaMagra: text("massa_magra"),
  massaGorda: text("massa_gorda"),
  
  // Dobras Cutâneas
  dobraTriceps: text("dobra_triceps"),
  dobraSubescapular: text("dobra_subescapular"),
  dobraPeitoral: text("dobra_peitoral"),
  dobraAxilarMedia: text("dobra_axilar_media"),
  dobraSuprailiaca: text("dobra_suprailiaca"),
  dobraAbdominal: text("dobra_abdominal"),
  dobraCoxa: text("dobra_coxa"),
  somaDobras: text("soma_dobras"),
  
  // Fotos de Progresso
  fotoFrenteUrl: text("foto_frente_url"),
  fotoCostasUrl: text("foto_costas_url"),
  fotoLateralUrl: text("foto_lateral_url"),
  
  // Observações
  observacoes: text("observacoes"),
  objetivos: text("objetivos"),
  
  // Fixar avaliação
  fixada: boolean("fixada").default(false),
  
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export const insertAvaliacaoFisicaSchema = createInsertSchema(avaliacoesFisicas).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBlocoHorarioSchema = createInsertSchema(blocosHorarios).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDisponibilidadeSemanalSchema = createInsertSchema(disponibilidadeSemanal).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAgendamentoPresencialSchema = createInsertSchema(agendamentosPresenciais).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertExcecaoDispoSchema = createInsertSchema(excecoesDispo).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type UserProfile = typeof usersProfile.$inferSelect;
export type InsertAluno = z.infer<typeof insertAlunoSchema>;
export type Aluno = typeof alunos.$inferSelect;
export type InsertBlocoHorario = z.infer<typeof insertBlocoHorarioSchema>;
export type BlocoHorario = typeof blocosHorarios.$inferSelect;
export type InsertDisponibilidadeSemanal = z.infer<typeof insertDisponibilidadeSemanalSchema>;
export type DisponibilidadeSemanal = typeof disponibilidadeSemanal.$inferSelect;
export type InsertAgendamentoPresencial = z.infer<typeof insertAgendamentoPresencialSchema>;
export type AgendamentoPresencial = typeof agendamentosPresenciais.$inferSelect;
export type InsertExcecaoDispo = z.infer<typeof insertExcecaoDispoSchema>;
export type ExcecaoDispo = typeof excecoesDispo.$inferSelect;

// Tabela para fichas de treino
export const fichasTreino = pgTable("fichas_treino", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nome: text("nome").notNull(),
  descricao: text("descricao"),
  objetivo: text("objetivo"), // hipertrofia, emagrecimento, força, etc
  nivel: text("nivel").notNull(), // iniciante, intermediario, avancado
  duracaoSemanas: integer("duracao_semanas").notNull().default(4),
  ativo: text("ativo").notNull().default("true"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// Tabela para exercícios da ficha
export const exerciciosFicha = pgTable("exercicios_ficha", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fichaId: varchar("ficha_id").notNull().references(() => fichasTreino.id, { onDelete: 'cascade' }),
  videoId: varchar("video_id"), // referência ao vídeo de treino (opcional)
  nome: text("nome").notNull(),
  grupoMuscular: text("grupo_muscular").notNull(),
  ordem: integer("ordem").notNull(), // ordem de execução
  series: integer("series").notNull(),
  repeticoes: text("repeticoes").notNull(), // pode ser "12" ou "10-12" ou "até falha"
  descanso: integer("descanso").notNull(), // em segundos
  observacoes: text("observacoes"),
  tecnica: text("tecnica"), // drop set, bi-set, super set, etc
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// Tabela para atribuição de fichas aos alunos
export const fichasAlunos = pgTable("fichas_alunos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fichaId: varchar("ficha_id").notNull().references(() => fichasTreino.id, { onDelete: 'cascade' }),
  alunoId: varchar("aluno_id").notNull().references(() => alunos.id, { onDelete: 'cascade' }),
  dataInicio: date("data_inicio").notNull(),
  dataFim: date("data_fim"),
  status: text("status").notNull().default("ativo"), // ativo, concluido, pausado
  observacoes: text("observacoes"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// Tabela para registro de treinos realizados
export const treinosRealizados = pgTable("treinos_realizados", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fichaAlunoId: varchar("ficha_aluno_id").notNull().references(() => fichasAlunos.id, { onDelete: 'cascade' }),
  exercicioId: varchar("exercicio_id").notNull().references(() => exerciciosFicha.id),
  dataRealizacao: timestamp("data_realizacao").notNull(),
  seriesRealizadas: integer("series_realizadas").notNull(),
  observacoes: text("observacoes"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Tabela para séries individuais realizadas
export const seriesRealizadas = pgTable("series_realizadas", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  treinoRealizadoId: varchar("treino_realizado_id").notNull().references(() => treinosRealizados.id, { onDelete: 'cascade' }),
  numeroSerie: integer("numero_serie").notNull(),
  carga: text("carga").notNull(), // peso em kg
  repeticoes: integer("repeticoes").notNull(),
  concluida: text("concluida").notNull().default("true"),
  observacoes: text("observacoes"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const insertFichaTreinoSchema = createInsertSchema(fichasTreino).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertExercicioFichaSchema = createInsertSchema(exerciciosFicha).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFichaAlunoSchema = createInsertSchema(fichasAlunos).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTreinoRealizadoSchema = createInsertSchema(treinosRealizados).omit({
  id: true,
  createdAt: true,
});

export const insertSerieRealizadaSchema = createInsertSchema(seriesRealizadas).omit({
  id: true,
  createdAt: true,
});

export type InsertFichaTreino = z.infer<typeof insertFichaTreinoSchema>;
export type FichaTreino = typeof fichasTreino.$inferSelect;
export type InsertExercicioFicha = z.infer<typeof insertExercicioFichaSchema>;
export type ExercicioFicha = typeof exerciciosFicha.$inferSelect;
export type InsertFichaAluno = z.infer<typeof insertFichaAlunoSchema>;
export type FichaAluno = typeof fichasAlunos.$inferSelect;
export type InsertTreinoRealizado = z.infer<typeof insertTreinoRealizadoSchema>;
export type TreinoRealizado = typeof treinosRealizados.$inferSelect;
export type InsertSerieRealizada = z.infer<typeof insertSerieRealizadaSchema>;
export type SerieRealizada = typeof seriesRealizadas.$inferSelect;

// Tabela para planos alimentares
export const planosAlimentares = pgTable("planos_alimentares", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  alunoId: varchar("aluno_id").notNull().references(() => alunos.id, { onDelete: 'cascade' }),
  titulo: text("titulo").notNull(),
  conteudoHtml: text("conteudo_html").notNull(),
  observacoes: text("observacoes"),
  dadosJson: jsonb("dados_json"), // dados estruturados: objetivo, calorias, macros, etc
  dataCriacao: timestamp("data_criacao").default(sql`CURRENT_TIMESTAMP`),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// Tabela para refeições do plano
export const refeicoesPlano = pgTable("refeicoes_plano", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  planoId: varchar("plano_id").notNull().references(() => planosAlimentares.id, { onDelete: 'cascade' }),
  nome: text("nome").notNull(), // Café da manhã, Almoço, etc
  horario: text("horario").notNull(),
  ordem: integer("ordem").notNull(),
  caloriasCalculadas: integer("calorias_calculadas").default(0), // Soma automática dos alimentos
  observacoes: text("observacoes"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// Tabela para alimentos de cada refeição
export const alimentosRefeicao = pgTable("alimentos_refeicao", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  refeicaoId: varchar("refeicao_id").notNull().references(() => refeicoesPlano.id, { onDelete: 'cascade' }),
  nome: text("nome").notNull(),
  quantidade: integer("quantidade").notNull(),
  unidade: text("unidade").notNull(),
  calorias: integer("calorias").notNull(),
  proteinas: integer("proteinas").notNull(),
  carboidratos: integer("carboidratos").notNull(),
  gorduras: integer("gorduras").notNull(),
  categoria: text("categoria"),
  ordem: integer("ordem").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const insertPlanoAlimentarSchema = createInsertSchema(planosAlimentares).omit({
  id: true,
  dataCriacao: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRefeicaoPlanoSchema = createInsertSchema(refeicoesPlano).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAlimentoRefeicaoSchema = createInsertSchema(alimentosRefeicao).omit({
  id: true,
  createdAt: true,
});

export type InsertPlanoAlimentar = z.infer<typeof insertPlanoAlimentarSchema>;
export type PlanoAlimentar = typeof planosAlimentares.$inferSelect;
export type InsertRefeicaoPlano = z.infer<typeof insertRefeicaoPlanoSchema>;
export type RefeicaoPlano = typeof refeicoesPlano.$inferSelect;
export type InsertAlimentoRefeicao = z.infer<typeof insertAlimentoRefeicaoSchema>;
export type AlimentoRefeicao = typeof alimentosRefeicao.$inferSelect;

// ============================================
// TABELAS DE AVALIAÇÕES FÍSICAS COMPLETAS
// ============================================

// Tabela de Perimetria Detalhada
export const perimetriaDetalhada = pgTable("perimetria_detalhada", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  avaliacaoId: varchar("avaliacao_id").notNull().references(() => avaliacoesFisicas.id, { onDelete: 'cascade' }),
  
  // Tronco
  ombro: text("ombro"),
  toraxInspirado: text("torax_inspirado"),
  toraxExpirado: text("torax_expirado"),
  
  // Membros Superiores
  punhoDireito: text("punho_direito"),
  punhoEsquerdo: text("punho_esquerdo"),
  
  // Membros Inferiores
  coxaProximalDireita: text("coxa_proximal_direita"),
  coxaProximalEsquerda: text("coxa_proximal_esquerda"),
  coxaMedialDireita: text("coxa_medial_direita"),
  coxaMedialEsquerda: text("coxa_medial_esquerda"),
  tornozeloDireito: text("tornozelo_direito"),
  tornozeloEsquerdo: text("tornozelo_esquerdo"),
  
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// Tabela de Avaliações Neuromotoras
export const avaliacoesNeuromotoras = pgTable("avaliacoes_neuromotoras", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  avaliacaoId: varchar("avaliacao_id").notNull().references(() => avaliacoesFisicas.id, { onDelete: 'cascade' }),
  
  // Força
  forcaPreensaoManualDir: text("forca_preensao_manual_dir"),
  forcaPreensaoManualEsq: text("forca_preensao_manual_esq"),
  
  // Resistência Muscular
  flexaoBraco: integer("flexao_braco"),
  abdominal1min: integer("abdominal_1min"),
  agachamento: integer("agachamento"),
  pranchaIsometrica: integer("prancha_isometrica"),
  
  // Flexibilidade
  sentarAlcancar: text("sentar_alcancar"),
  flexaoQuadrilDir: text("flexao_quadril_dir"),
  flexaoQuadrilEsq: text("flexao_quadril_esq"),
  
  // Agilidade
  shuttleRun: text("shuttle_run"),
  teste3Cones: text("teste_3_cones"),
  
  // Equilíbrio
  apoioUnicoPernaDir: integer("apoio_unico_perna_dir"),
  apoioUnicoPernaEsq: integer("apoio_unico_perna_esq"),
  
  // Velocidade
  corrida20m: text("corrida_20m"),
  corrida40m: text("corrida_40m"),
  
  // Potência
  saltoVertical: text("salto_vertical"),
  saltoHorizontal: text("salto_horizontal"),
  
  // Coordenação
  arremessoBola: text("arremesso_bola"),
  
  observacoes: text("observacoes"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// Tabela de Avaliações Posturais
export const avaliacoesPosturais = pgTable("avaliacoes_posturais", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  avaliacaoId: varchar("avaliacao_id").notNull().references(() => avaliacoesFisicas.id, { onDelete: 'cascade' }),
  
  // Vista Anterior
  cabeca: text("cabeca"),
  ombros: text("ombros"),
  clavicula: text("clavicula"),
  quadril: text("quadril"),
  
  // Vista Lateral
  curvaturaLombar: text("curvatura_lombar"),
  curvaturaDorsal: text("curvatura_dorsal"),
  curvaturaCervical: text("curvatura_cervical"),
  
  // Membros Inferiores
  joelhos: text("joelhos"),
  pes: text("pes"),
  
  // Observações
  observacoes: text("observacoes"),
  
  // Fotos Posturais
  fotoFrenteUrl: text("foto_frente_url"),
  fotoCostasUrl: text("foto_costas_url"),
  fotoLateralDirUrl: text("foto_lateral_dir_url"),
  fotoLateralEsqUrl: text("foto_lateral_esq_url"),
  
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// Tabela de Anamneses
export const anamneses = pgTable("anamneses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  alunoId: varchar("aluno_id").notNull().references(() => alunos.id, { onDelete: 'cascade' }).unique(),
  
  // Dados Pessoais
  profissao: text("profissao"),
  nivelAtividade: text("nivel_atividade"),
  
  // Histórico de Saúde
  doencasPreexistentes: text("doencas_preexistentes").array(),
  cirurgias: text("cirurgias"),
  lesoes: text("lesoes"),
  medicamentos: text("medicamentos").array(),
  
  // Hábitos
  fumante: text("fumante").default("false"),
  consumoAlcool: text("consumo_alcool"),
  horasSono: text("horas_sono"),
  qualidadeSono: text("qualidade_sono"),
  
  // Histórico de Atividade Física
  praticaAtividade: text("pratica_atividade").default("false"),
  tipoAtividade: text("tipo_atividade").array(),
  frequenciaSemanal: integer("frequencia_semanal"),
  tempoSessao: integer("tempo_sessao"),
  
  // Objetivos
  objetivoPrincipal: text("objetivo_principal"),
  objetivosSecundarios: text("objetivos_secundarios").array(),
  
  // Limitações
  restricoesMedicas: text("restricoes_medicas"),
  limitacoesMovimento: text("limitacoes_movimento"),
  
  // Observações
  observacoes: text("observacoes"),
  
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// Tabela de Metas de Avaliações
export const metasAvaliacoes = pgTable("metas_avaliacoes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  alunoId: varchar("aluno_id").notNull().references(() => alunos.id, { onDelete: 'cascade' }),
  
  // Metas
  pesoAlvo: text("peso_alvo"),
  percentualGorduraAlvo: text("percentual_gordura_alvo"),
  massaMagraAlvo: text("massa_magra_alvo"),
  
  // Prazos
  dataInicio: date("data_inicio").notNull(),
  dataAlvo: date("data_alvo").notNull(),
  prazoSemanas: integer("prazo_semanas"),
  
  // Status
  status: text("status").notNull().default("ativa"),
  dataAtingida: date("data_atingida"),
  
  observacoes: text("observacoes"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// Schemas de Inserção
export const insertPerimetriaDetalhadaSchema = createInsertSchema(perimetriaDetalhada).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAvaliacaoNeuromotoraSchema = createInsertSchema(avaliacoesNeuromotoras).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAvaliacaoPosturalSchema = createInsertSchema(avaliacoesPosturais).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAnamneseSchema = createInsertSchema(anamneses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMetaAvaliacaoSchema = createInsertSchema(metasAvaliacoes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Tipos TypeScript
export type InsertPerimetriaDetalhada = z.infer<typeof insertPerimetriaDetalhadaSchema>;
export type PerimetriaDetalhada = typeof perimetriaDetalhada.$inferSelect;

export type InsertAvaliacaoNeuromotora = z.infer<typeof insertAvaliacaoNeuromotoraSchema>;
export type AvaliacaoNeuromotora = typeof avaliacoesNeuromotoras.$inferSelect;

export type InsertAvaliacaoPostural = z.infer<typeof insertAvaliacaoPosturalSchema>;
export type AvaliacaoPostural = typeof avaliacoesPosturais.$inferSelect;

export type InsertAnamnese = z.infer<typeof insertAnamneseSchema>;
export type Anamnese = typeof anamneses.$inferSelect;

export type InsertMetaAvaliacao = z.infer<typeof insertMetaAvaliacaoSchema>;
export type MetaAvaliacao = typeof metasAvaliacoes.$inferSelect;

export type InsertAvaliacaoFisica = z.infer<typeof insertAvaliacaoFisicaSchema>;
export type AvaliacaoFisica = typeof avaliacoesFisicas.$inferSelect;

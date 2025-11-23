import { sql } from "drizzle-orm";
import { pgTable, text, varchar, date, integer, timestamp, jsonb, uuid } from "drizzle-orm/pg-core";
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

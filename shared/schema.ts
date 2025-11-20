import { sql } from "drizzle-orm";
import { pgTable, text, varchar, date, integer, timestamp } from "drizzle-orm/pg-core";
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

// Tabela para blocos de horários disponíveis
export const blocosHorarios = pgTable("blocos_horarios", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  diaSemana: integer("dia_semana").notNull(), // 0-6 (domingo a sábado)
  horaInicio: text("hora_inicio").notNull(), // formato HH:MM
  horaFim: text("hora_fim").notNull(), // formato HH:MM
  duracao: integer("duracao").notNull(), // duração em minutos
  ativo: text("ativo").notNull().default("true"), // true/false
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// Tabela para agendamentos
export const agendamentos = pgTable("agendamentos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  alunoId: varchar("aluno_id").notNull().references(() => alunos.id),
  blocoHorarioId: varchar("bloco_horario_id").notNull().references(() => blocosHorarios.id),
  dataAgendamento: date("data_agendamento").notNull(),
  status: text("status").notNull().default("agendado"), // agendado, cancelado, concluido
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

export const insertAgendamentoSchema = createInsertSchema(agendamentos).omit({
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
export type InsertAgendamento = z.infer<typeof insertAgendamentoSchema>;
export type Agendamento = typeof agendamentos.$inferSelect;
export type InsertExcecaoDispo = z.infer<typeof insertExcecaoDispoSchema>;
export type ExcecaoDispo = typeof excecoesDispo.$inferSelect;

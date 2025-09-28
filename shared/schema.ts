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

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type UserProfile = typeof usersProfile.$inferSelect;
export type InsertAluno = z.infer<typeof insertAlunoSchema>;
export type Aluno = typeof alunos.$inferSelect;

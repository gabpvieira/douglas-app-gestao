import { 
  type User, 
  type InsertUser, 
  type UserProfile, 
  type InsertUserProfile, 
  type Aluno, 
  type InsertAluno,
  type BlocoHorario,
  type InsertBlocoHorario,
  type AgendamentoPresencial,
  type InsertAgendamentoPresencial,
  type ExcecaoDispo,
  type InsertExcecaoDispo
} from "@shared/schema";
import { randomUUID } from "crypto";

// Alias para compatibilidade
type Agendamento = AgendamentoPresencial;
type InsertAgendamento = InsertAgendamentoPresencial;

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // User Profile methods
  getUserProfile(id: string): Promise<UserProfile | undefined>;
  getUserProfileByEmail(email: string): Promise<UserProfile | undefined>;
  createUserProfile(userProfile: InsertUserProfile): Promise<UserProfile>;
  
  // Aluno methods
  getAluno(id: string): Promise<Aluno | undefined>;
  getAlunoByUserProfileId(userProfileId: string): Promise<Aluno | undefined>;
  getAllAlunos(): Promise<Aluno[]>;
  createAluno(aluno: InsertAluno): Promise<Aluno>;
  updateAluno(id: string, aluno: Partial<InsertAluno>): Promise<Aluno | undefined>;
  deleteAluno(id: string): Promise<boolean>;

  // Bloco Horario methods
  getBlocoHorario(id: string): Promise<BlocoHorario | undefined>;
  getAllBlocosHorarios(): Promise<BlocoHorario[]>;
  createBlocoHorario(bloco: InsertBlocoHorario): Promise<BlocoHorario>;
  updateBlocoHorario(id: string, bloco: Partial<InsertBlocoHorario>): Promise<BlocoHorario | undefined>;
  deleteBlocoHorario(id: string): Promise<boolean>;

  // Agendamento methods
  getAgendamento(id: string): Promise<Agendamento | undefined>;
  getAllAgendamentos(): Promise<Agendamento[]>;
  getAgendamentosByData(data: Date): Promise<Agendamento[]>;
  getAgendamentosByAluno(alunoId: string): Promise<Agendamento[]>;
  createAgendamento(agendamento: InsertAgendamento): Promise<Agendamento>;
  updateAgendamento(id: string, agendamento: Partial<InsertAgendamento>): Promise<Agendamento | undefined>;
  deleteAgendamento(id: string): Promise<boolean>;

  // Excecao Disponibilidade methods
  getExcecaoDispo(id: string): Promise<ExcecaoDispo | undefined>;
  getAllExcecoesDisponibilidade(): Promise<ExcecaoDispo[]>;
  getExcecoesDisponibilidadeByData(data: Date): Promise<ExcecaoDispo[]>;
  createExcecaoDispo(excecao: InsertExcecaoDispo): Promise<ExcecaoDispo>;
  updateExcecaoDispo(id: string, excecao: Partial<InsertExcecaoDispo>): Promise<ExcecaoDispo | undefined>;
  deleteExcecaoDispo(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private userProfiles: Map<string, UserProfile>;
  private alunos: Map<string, Aluno>;
  private blocosHorarios: Map<string, BlocoHorario>;
  private agendamentos: Map<string, Agendamento>;
  private excecoesDisponibilidade: Map<string, ExcecaoDispo>;

  constructor() {
    this.users = new Map();
    this.userProfiles = new Map();
    this.alunos = new Map();
    this.blocosHorarios = new Map();
    this.agendamentos = new Map();
    this.excecoesDisponibilidade = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // User Profile methods
  async getUserProfile(id: string): Promise<UserProfile | undefined> {
    return this.userProfiles.get(id);
  }

  async getUserProfileByEmail(email: string): Promise<UserProfile | undefined> {
    return Array.from(this.userProfiles.values()).find(
      (profile) => profile.email === email,
    );
  }

  async createUserProfile(insertUserProfile: InsertUserProfile): Promise<UserProfile> {
    const id = randomUUID();
    const now = new Date();
    const userProfile: UserProfile = { 
      ...insertUserProfile, 
      id,
      fotoUrl: insertUserProfile.fotoUrl || null,
      createdAt: now,
      updatedAt: now
    };
    this.userProfiles.set(id, userProfile);
    return userProfile;
  }

  // Aluno methods
  async getAluno(id: string): Promise<Aluno | undefined> {
    return this.alunos.get(id);
  }

  async getAlunoByUserProfileId(userProfileId: string): Promise<Aluno | undefined> {
    return Array.from(this.alunos.values()).find(
      (aluno) => aluno.userProfileId === userProfileId,
    );
  }

  async getAllAlunos(): Promise<Aluno[]> {
    return Array.from(this.alunos.values());
  }

  async createAluno(insertAluno: InsertAluno): Promise<Aluno> {
    const id = randomUUID();
    const now = new Date();
    const aluno: Aluno = { 
      ...insertAluno, 
      id,
      dataNascimento: insertAluno.dataNascimento || null,
      altura: insertAluno.altura || null,
      genero: insertAluno.genero || null,
      status: insertAluno.status || "ativo",
      createdAt: now,
      updatedAt: now
    };
    this.alunos.set(id, aluno);
    return aluno;
  }

  async updateAluno(id: string, updateData: Partial<InsertAluno>): Promise<Aluno | undefined> {
    const aluno = this.alunos.get(id);
    if (!aluno) return undefined;

    const updatedAluno: Aluno = { 
      ...aluno, 
      ...updateData,
      updatedAt: new Date()
    };
    this.alunos.set(id, updatedAluno);
    return updatedAluno;
  }

  async deleteAluno(id: string): Promise<boolean> {
    return this.alunos.delete(id);
  }

  // Bloco Horario methods
  async getBlocoHorario(id: string): Promise<BlocoHorario | undefined> {
    return this.blocosHorarios.get(id);
  }

  async getAllBlocosHorarios(): Promise<BlocoHorario[]> {
    return Array.from(this.blocosHorarios.values());
  }

  async createBlocoHorario(insertBlocoHorario: InsertBlocoHorario): Promise<BlocoHorario> {
    const id = randomUUID();
    const now = new Date();
    const blocoHorario: BlocoHorario = { 
      ...insertBlocoHorario, 
      id,
      createdAt: now,
      updatedAt: now
    };
    this.blocosHorarios.set(id, blocoHorario);
    return blocoHorario;
  }

  async updateBlocoHorario(id: string, updateData: Partial<InsertBlocoHorario>): Promise<BlocoHorario | undefined> {
    const blocoHorario = this.blocosHorarios.get(id);
    if (!blocoHorario) return undefined;

    const updatedBlocoHorario: BlocoHorario = { 
      ...blocoHorario, 
      ...updateData,
      updatedAt: new Date()
    };
    this.blocosHorarios.set(id, updatedBlocoHorario);
    return updatedBlocoHorario;
  }

  async deleteBlocoHorario(id: string): Promise<boolean> {
    return this.blocosHorarios.delete(id);
  }

  // Agendamento methods
  async getAgendamento(id: string): Promise<Agendamento | undefined> {
    return this.agendamentos.get(id);
  }

  async getAllAgendamentos(): Promise<Agendamento[]> {
    return Array.from(this.agendamentos.values());
  }

  async getAgendamentosByData(data: Date): Promise<Agendamento[]> {
    const dataStr = data.toISOString().split('T')[0];
    return Array.from(this.agendamentos.values()).filter(
      (agendamento) => agendamento.dataAgendamento === dataStr
    );
  }

  async getAgendamentosByAluno(alunoId: string): Promise<Agendamento[]> {
    return Array.from(this.agendamentos.values()).filter(
      (agendamento) => agendamento.alunoId === alunoId
    );
  }

  async createAgendamento(insertAgendamento: InsertAgendamento): Promise<Agendamento> {
    const id = randomUUID();
    const now = new Date();
    const agendamento: Agendamento = { 
      ...insertAgendamento, 
      id,
      observacoes: insertAgendamento.observacoes || null,
      createdAt: now,
      updatedAt: now
    };
    this.agendamentos.set(id, agendamento);
    return agendamento;
  }

  async updateAgendamento(id: string, updateData: Partial<InsertAgendamento>): Promise<Agendamento | undefined> {
    const agendamento = this.agendamentos.get(id);
    if (!agendamento) return undefined;

    const updatedAgendamento: Agendamento = { 
      ...agendamento, 
      ...updateData,
      updatedAt: new Date()
    };
    this.agendamentos.set(id, updatedAgendamento);
    return updatedAgendamento;
  }

  async deleteAgendamento(id: string): Promise<boolean> {
    return this.agendamentos.delete(id);
  }

  // Excecao Disponibilidade methods
  async getExcecaoDispo(id: string): Promise<ExcecaoDispo | undefined> {
    return this.excecoesDisponibilidade.get(id);
  }

  async getAllExcecoesDisponibilidade(): Promise<ExcecaoDispo[]> {
    return Array.from(this.excecoesDisponibilidade.values());
  }

  async getExcecoesDisponibilidadeByData(data: Date): Promise<ExcecaoDispo[]> {
    const dataStr = data.toISOString().split('T')[0];
    return Array.from(this.excecoesDisponibilidade.values()).filter(
      (excecao) => {
        const excecaoDataStr = excecao.data.toISOString().split('T')[0];
        return excecaoDataStr === dataStr;
      }
    );
  }

  async createExcecaoDispo(insertExcecaoDispo: InsertExcecaoDispo): Promise<ExcecaoDispo> {
    const id = randomUUID();
    const now = new Date();
    const excecaoDispo: ExcecaoDispo = { 
      ...insertExcecaoDispo, 
      id,
      motivo: insertExcecaoDispo.motivo || null,
      createdAt: now,
      updatedAt: now
    };
    this.excecoesDisponibilidade.set(id, excecaoDispo);
    return excecaoDispo;
  }

  async updateExcecaoDispo(id: string, updateData: Partial<InsertExcecaoDispo>): Promise<ExcecaoDispo | undefined> {
    const excecaoDispo = this.excecoesDisponibilidade.get(id);
    if (!excecaoDispo) return undefined;

    const updatedExcecaoDispo: ExcecaoDispo = { 
      ...excecaoDispo, 
      ...updateData,
      updatedAt: new Date()
    };
    this.excecoesDisponibilidade.set(id, updatedExcecaoDispo);
    return updatedExcecaoDispo;
  }

  async deleteExcecaoDispo(id: string): Promise<boolean> {
    return this.excecoesDisponibilidade.delete(id);
  }
}

// Use Supabase storage in production, MemStorage for fallback
import { supabaseStorage } from './supabaseStorage';

export const storage = process.env.NODE_ENV === 'test' 
  ? new MemStorage() 
  : supabaseStorage;

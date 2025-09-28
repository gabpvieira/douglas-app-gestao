import { 
  type User, 
  type InsertUser, 
  type UserProfile, 
  type InsertUserProfile, 
  type Aluno, 
  type InsertAluno 
} from "@shared/schema";
import { randomUUID } from "crypto";

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
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private userProfiles: Map<string, UserProfile>;
  private alunos: Map<string, Aluno>;

  constructor() {
    this.users = new Map();
    this.userProfiles = new Map();
    this.alunos = new Map();
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
}

export const storage = new MemStorage();

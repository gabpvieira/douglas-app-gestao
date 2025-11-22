import { supabase } from './supabase';
import type {
  User,
  InsertUser,
  UserProfile,
  InsertUserProfile,
  Aluno,
  InsertAluno,
  BlocoHorario,
  InsertBlocoHorario,
  Agendamento,
  InsertAgendamento,
  ExcecaoDispo,
  InsertExcecaoDispo
} from '@shared/schema';
import type { IStorage } from './storage';

export class SupabaseStorage implements IStorage {
  // ============================================
  // USER METHODS
  // ============================================
  
  async getUser(id: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error getting user:', error);
      return undefined;
    }
    return data as User;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();
    
    if (error) {
      console.error('Error getting user by username:', error);
      return undefined;
    }
    return data as User;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert(insertUser)
      .select()
      .single();
    
    if (error) throw error;
    return data as User;
  }

  // ============================================
  // USER PROFILE METHODS
  // ============================================

  async getUserProfile(id: string): Promise<UserProfile | undefined> {
    const { data, error } = await supabase
      .from('users_profile')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error getting user profile:', error);
      return undefined;
    }
    return data as UserProfile;
  }

  async getUserProfileByEmail(email: string): Promise<UserProfile | undefined> {
    const { data, error } = await supabase
      .from('users_profile')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return undefined; // Not found
      console.error('Error getting user profile by email:', error);
      return undefined;
    }
    return data as UserProfile;
  }

  async createUserProfile(insertUserProfile: InsertUserProfile): Promise<UserProfile> {
    // Convert camelCase to snake_case for Supabase
    const dbData = {
      auth_uid: insertUserProfile.authUid,
      nome: insertUserProfile.nome,
      email: insertUserProfile.email,
      tipo: insertUserProfile.tipo,
      foto_url: insertUserProfile.fotoUrl || null
    };
    
    const { data, error } = await supabase
      .from('users_profile')
      .insert(dbData)
      .select()
      .single();
    
    if (error) throw error;
    
    // Convert snake_case back to camelCase
    return {
      id: data.id,
      authUid: data.auth_uid,
      nome: data.nome,
      email: data.email,
      tipo: data.tipo,
      fotoUrl: data.foto_url,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    } as UserProfile;
  }

  // ============================================
  // ALUNO METHODS
  // ============================================

  async getAluno(id: string): Promise<Aluno | undefined> {
    const { data, error } = await supabase
      .from('alunos')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error getting aluno:', error);
      return undefined;
    }
    return data as Aluno;
  }

  async getAlunoByUserProfileId(userProfileId: string): Promise<Aluno | undefined> {
    const { data, error } = await supabase
      .from('alunos')
      .select('*')
      .eq('user_profile_id', userProfileId)
      .single();
    
    if (error) {
      console.error('Error getting aluno by user profile:', error);
      return undefined;
    }
    return data as Aluno;
  }

  async getAllAlunos(): Promise<Aluno[]> {
    const { data, error } = await supabase
      .from('alunos')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error getting all alunos:', error);
      return [];
    }
    return data as Aluno[];
  }

  async createAluno(insertAluno: InsertAluno): Promise<Aluno> {
    // Convert camelCase to snake_case for Supabase
    const dbData = {
      user_profile_id: insertAluno.userProfileId,
      data_nascimento: insertAluno.dataNascimento || null,
      altura: insertAluno.altura || null,
      genero: insertAluno.genero || null,
      status: insertAluno.status || 'ativo'
    };
    
    const { data, error } = await supabase
      .from('alunos')
      .insert(dbData)
      .select()
      .single();
    
    if (error) throw error;
    
    // Convert snake_case back to camelCase
    return {
      id: data.id,
      userProfileId: data.user_profile_id,
      dataNascimento: data.data_nascimento,
      altura: data.altura,
      genero: data.genero,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    } as Aluno;
  }

  async updateAluno(id: string, updateData: Partial<InsertAluno>): Promise<Aluno | undefined> {
    const { data, error } = await supabase
      .from('alunos')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating aluno:', error);
      return undefined;
    }
    return data as Aluno;
  }

  async deleteAluno(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('alunos')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting aluno:', error);
      return false;
    }
    return true;
  }

  // ============================================
  // BLOCO HORARIO METHODS
  // ============================================

  async getBlocoHorario(id: string): Promise<BlocoHorario | undefined> {
    const { data, error } = await supabase
      .from('blocos_horarios')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error getting bloco horario:', error);
      return undefined;
    }
    return data as BlocoHorario;
  }

  async getAllBlocosHorarios(): Promise<BlocoHorario[]> {
    const { data, error } = await supabase
      .from('blocos_horarios')
      .select('*')
      .eq('ativo', true)
      .order('dia_semana', { ascending: true })
      .order('hora_inicio', { ascending: true });
    
    if (error) {
      console.error('Error getting blocos horarios:', error);
      return [];
    }
    return data as BlocoHorario[];
  }

  async createBlocoHorario(insertBlocoHorario: InsertBlocoHorario): Promise<BlocoHorario> {
    const { data, error } = await supabase
      .from('blocos_horarios')
      .insert(insertBlocoHorario)
      .select()
      .single();
    
    if (error) throw error;
    return data as BlocoHorario;
  }

  async updateBlocoHorario(id: string, updateData: Partial<InsertBlocoHorario>): Promise<BlocoHorario | undefined> {
    const { data, error } = await supabase
      .from('blocos_horarios')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating bloco horario:', error);
      return undefined;
    }
    return data as BlocoHorario;
  }

  async deleteBlocoHorario(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('blocos_horarios')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting bloco horario:', error);
      return false;
    }
    return true;
  }

  // ============================================
  // AGENDAMENTO METHODS (usando agendamentos_presenciais)
  // ============================================

  async getAgendamento(id: string): Promise<Agendamento | undefined> {
    const { data, error } = await supabase
      .from('agendamentos_presenciais')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error getting agendamento:', error);
      return undefined;
    }
    return data as Agendamento;
  }

  async getAllAgendamentos(): Promise<Agendamento[]> {
    const { data, error } = await supabase
      .from('agendamentos_presenciais')
      .select('*')
      .order('data_agendamento', { ascending: false });
    
    if (error) {
      console.error('Error getting agendamentos:', error);
      return [];
    }
    return data as Agendamento[];
  }

  async getAgendamentosByData(data: Date): Promise<Agendamento[]> {
    const dataStr = data.toISOString().split('T')[0];
    const { data: agendamentos, error } = await supabase
      .from('agendamentos_presenciais')
      .select('*')
      .eq('data_agendamento', dataStr);
    
    if (error) {
      console.error('Error getting agendamentos by data:', error);
      return [];
    }
    return agendamentos as Agendamento[];
  }

  async getAgendamentosByAluno(alunoId: string): Promise<Agendamento[]> {
    const { data, error } = await supabase
      .from('agendamentos_presenciais')
      .select('*')
      .eq('aluno_id', alunoId)
      .order('data_agendamento', { ascending: false });
    
    if (error) {
      console.error('Error getting agendamentos by aluno:', error);
      return [];
    }
    return data as Agendamento[];
  }

  async createAgendamento(insertAgendamento: InsertAgendamento): Promise<Agendamento> {
    const { data, error } = await supabase
      .from('agendamentos_presenciais')
      .insert(insertAgendamento)
      .select()
      .single();
    
    if (error) throw error;
    return data as Agendamento;
  }

  async updateAgendamento(id: string, updateData: Partial<InsertAgendamento>): Promise<Agendamento | undefined> {
    const { data, error } = await supabase
      .from('agendamentos_presenciais')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating agendamento:', error);
      return undefined;
    }
    return data as Agendamento;
  }

  async deleteAgendamento(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('agendamentos_presenciais')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting agendamento:', error);
      return false;
    }
    return true;
  }

  // ============================================
  // EXCECAO DISPONIBILIDADE METHODS
  // ============================================

  async getExcecaoDispo(id: string): Promise<ExcecaoDispo | undefined> {
    const { data, error } = await supabase
      .from('excecoes_disponibilidade')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error getting excecao dispo:', error);
      return undefined;
    }
    return data as ExcecaoDispo;
  }

  async getAllExcecoesDisponibilidade(): Promise<ExcecaoDispo[]> {
    const { data, error } = await supabase
      .from('excecoes_disponibilidade')
      .select('*')
      .eq('ativo', true)
      .order('data_inicio', { ascending: true });
    
    if (error) {
      console.error('Error getting excecoes disponibilidade:', error);
      return [];
    }
    return data as ExcecaoDispo[];
  }

  async getExcecoesDisponibilidadeByData(data: Date): Promise<ExcecaoDispo[]> {
    const dataStr = data.toISOString().split('T')[0];
    const { data: excecoes, error } = await supabase
      .from('excecoes_disponibilidade')
      .select('*')
      .lte('data_inicio', dataStr)
      .gte('data_fim', dataStr)
      .eq('ativo', true);
    
    if (error) {
      console.error('Error getting excecoes by data:', error);
      return [];
    }
    return excecoes as ExcecaoDispo[];
  }

  async createExcecaoDispo(insertExcecaoDispo: InsertExcecaoDispo): Promise<ExcecaoDispo> {
    const { data, error } = await supabase
      .from('excecoes_disponibilidade')
      .insert(insertExcecaoDispo)
      .select()
      .single();
    
    if (error) throw error;
    return data as ExcecaoDispo;
  }

  async updateExcecaoDispo(id: string, updateData: Partial<InsertExcecaoDispo>): Promise<ExcecaoDispo | undefined> {
    const { data, error } = await supabase
      .from('excecoes_disponibilidade')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating excecao dispo:', error);
      return undefined;
    }
    return data as ExcecaoDispo;
  }

  async deleteExcecaoDispo(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('excecoes_disponibilidade')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting excecao dispo:', error);
      return false;
    }
    return true;
  }
}

// Export singleton instance
export const supabaseStorage = new SupabaseStorage();

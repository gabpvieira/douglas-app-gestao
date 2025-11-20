import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { supabase } from "./supabase";
import { registerTreinosPdfRoutes } from "./routes/treinosPdf";
import { registerTreinosVideoRoutes } from "./routes/treinosVideo";
import { registerFotosProgressoRoutes } from "./routes/fotosProgresso";
import { registerPlanosAlimentaresRoutes } from "./routes/planosAlimentares";
import { registerEvolucoesRoutes } from "./routes/evolucoes";
import { registerAssinaturasRoutes } from "./routes/assinaturas";
import { registerPagamentosRoutes } from "./routes/pagamentos";
import { registerAgendaRoutes } from "./routes/agenda";
import { 
  insertUserProfileSchema, 
  insertAlunoSchema,
  insertBlocoHorarioSchema,
  insertAgendamentoSchema,
  insertExcecaoDispoSchema
} from "@shared/schema";
import { z } from "zod";

const addStudentSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  dataNascimento: z.string().min(1, "Data de nascimento é obrigatória"),
  altura: z.number().int().min(50).max(250),
  genero: z.enum(["masculino", "feminino", "outro"]),
  status: z.enum(["ativo", "inativo", "pendente"]),
  fotoUrl: z.string().optional(),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Register all feature routes
  registerTreinosPdfRoutes(app);
  registerTreinosVideoRoutes(app);
  registerFotosProgressoRoutes(app);
  registerPlanosAlimentaresRoutes(app);
  registerEvolucoesRoutes(app);
  registerAssinaturasRoutes(app);
  registerPagamentosRoutes(app);
  registerAgendaRoutes(app);
  
  // Admin routes for student management
  app.get("/api/admin/students", async (req, res) => {
    try {
      console.log('📋 Buscando alunos do Supabase...');
      
      // Buscar alunos com JOIN para pegar dados do user_profile
      const { data: alunos, error } = await supabase
        .from('alunos')
        .select(`
          id,
          data_nascimento,
          altura,
          genero,
          status,
          created_at,
          updated_at,
          users_profile (
            nome,
            email,
            foto_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("❌ Error fetching students from Supabase:", error);
        throw error;
      }

      console.log(`✅ ${alunos?.length || 0} alunos encontrados`);

      // Formatar dados para o formato esperado pelo frontend
      const alunosFormatted = alunos.map((aluno: any) => ({
        id: aluno.id,
        nome: aluno.users_profile?.nome || 'N/A',
        email: aluno.users_profile?.email || 'N/A',
        dataNascimento: aluno.data_nascimento,
        altura: aluno.altura,
        genero: aluno.genero,
        status: aluno.status,
        fotoUrl: aluno.users_profile?.foto_url || null,
        createdAt: aluno.created_at,
        updatedAt: aluno.updated_at,
      }));
      
      console.log('📤 Enviando resposta formatada');
      res.json(alunosFormatted);
    } catch (error: any) {
      console.error("❌ Error fetching students:", error);
      console.error("Stack:", error.stack);
      res.status(500).json({ error: "Failed to fetch students", details: error.message });
    }
  });

  app.post("/api/admin/students", async (req, res) => {
    try {
      const validatedData = addStudentSchema.parse(req.body);

      // Check if email already exists
      const existingProfile = await storage.getUserProfileByEmail(validatedData.email);
      if (existingProfile) {
        return res.status(400).json({ error: "Email já está em uso" });
      }

      // Create user profile
      const userProfile = await storage.createUserProfile({
        authUid: `mock_${Date.now()}`, // Mock auth UID for now
        nome: validatedData.nome,
        email: validatedData.email,
        tipo: "aluno",
        fotoUrl: validatedData.fotoUrl,
      });

      // Create aluno record
      const aluno = await storage.createAluno({
        userProfileId: userProfile.id,
        dataNascimento: validatedData.dataNascimento,
        altura: validatedData.altura,
        genero: validatedData.genero,
        status: validatedData.status,
      });

      // Return combined data
      const responseData = {
        id: aluno.id,
        nome: userProfile.nome,
        email: userProfile.email,
        dataNascimento: aluno.dataNascimento,
        altura: aluno.altura,
        genero: aluno.genero,
        status: aluno.status,
        fotoUrl: userProfile.fotoUrl,
        createdAt: aluno.createdAt,
        updatedAt: aluno.updatedAt,
      };

      res.status(201).json(responseData);
    } catch (error) {
      console.error("Error creating student:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Dados inválidos", 
          details: error.errors 
        });
      }
      
      res.status(500).json({ error: "Failed to create student" });
    }
  });

  app.get("/api/admin/students/:id", async (req, res) => {
    try {
      const aluno = await storage.getAluno(req.params.id);
      if (!aluno) {
        return res.status(404).json({ error: "Student not found" });
      }

      const userProfile = await storage.getUserProfile(aluno.userProfileId);
      
      const responseData = {
        id: aluno.id,
        nome: userProfile?.nome || '',
        email: userProfile?.email || '',
        dataNascimento: aluno.dataNascimento,
        altura: aluno.altura,
        genero: aluno.genero,
        status: aluno.status,
        fotoUrl: userProfile?.fotoUrl,
        createdAt: aluno.createdAt,
        updatedAt: aluno.updatedAt,
      };

      res.json(responseData);
    } catch (error) {
      console.error("Error fetching student:", error);
      res.status(500).json({ error: "Failed to fetch student" });
    }
  });

  app.put("/api/admin/students/:id", async (req, res) => {
    try {
      const validatedData = addStudentSchema.partial().parse(req.body);
      
      const aluno = await storage.getAluno(req.params.id);
      if (!aluno) {
        return res.status(404).json({ error: "Student not found" });
      }

      // Update aluno data
      const updatedAluno = await storage.updateAluno(req.params.id, {
        dataNascimento: validatedData.dataNascimento,
        altura: validatedData.altura,
        genero: validatedData.genero,
        status: validatedData.status,
      });

      if (!updatedAluno) {
        return res.status(404).json({ error: "Student not found" });
      }

      // Update user profile if needed
      if (validatedData.nome || validatedData.email || validatedData.fotoUrl) {
        const userProfile = await storage.getUserProfile(updatedAluno.userProfileId);
        if (userProfile) {
          // Note: In a real implementation, you'd have an updateUserProfile method
          // For now, we'll just return the current data
        }
      }

      const userProfile = await storage.getUserProfile(updatedAluno.userProfileId);
      
      const responseData = {
        id: updatedAluno.id,
        nome: userProfile?.nome || '',
        email: userProfile?.email || '',
        dataNascimento: updatedAluno.dataNascimento,
        altura: updatedAluno.altura,
        genero: updatedAluno.genero,
        status: updatedAluno.status,
        fotoUrl: userProfile?.fotoUrl,
        createdAt: updatedAluno.createdAt,
        updatedAt: updatedAluno.updatedAt,
      };

      res.json(responseData);
    } catch (error) {
      console.error("Error updating student:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Dados inválidos", 
          details: error.errors 
        });
      }
      
      res.status(500).json({ error: "Failed to update student" });
    }
  });

  app.delete("/api/admin/students/:id", async (req, res) => {
    try {
      const aluno = await storage.getAluno(req.params.id);
      if (!aluno) {
        return res.status(404).json({ error: "Student not found" });
      }

      const deleted = await storage.deleteAluno(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Student not found" });
      }

      res.json({ message: "Student deleted successfully" });
    } catch (error) {
      console.error("Error deleting student:", error);
      res.status(500).json({ error: "Failed to delete student" });
    }
  });

  // Blocos de Horário routes
  app.get("/api/admin/blocos-horarios", async (req, res) => {
    try {
      const blocos = await storage.getAllBlocosHorarios();
      res.json(blocos);
    } catch (error) {
      console.error("Error fetching time blocks:", error);
      res.status(500).json({ error: "Failed to fetch time blocks" });
    }
  });

  app.post("/api/admin/blocos-horarios", async (req, res) => {
    try {
      const validatedData = insertBlocoHorarioSchema.parse(req.body);
      const bloco = await storage.createBlocoHorario(validatedData);
      res.status(201).json(bloco);
    } catch (error) {
      console.error("Error creating time block:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Dados inválidos", 
          details: error.errors 
        });
      }
      res.status(500).json({ error: "Failed to create time block" });
    }
  });

  app.put("/api/admin/blocos-horarios/:id", async (req, res) => {
    try {
      const validatedData = insertBlocoHorarioSchema.partial().parse(req.body);
      const bloco = await storage.updateBlocoHorario(req.params.id, validatedData);
      
      if (!bloco) {
        return res.status(404).json({ error: "Time block not found" });
      }
      
      res.json(bloco);
    } catch (error) {
      console.error("Error updating time block:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Dados inválidos", 
          details: error.errors 
        });
      }
      res.status(500).json({ error: "Failed to update time block" });
    }
  });

  app.delete("/api/admin/blocos-horarios/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteBlocoHorario(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Time block not found" });
      }
      res.json({ message: "Time block deleted successfully" });
    } catch (error) {
      console.error("Error deleting time block:", error);
      res.status(500).json({ error: "Failed to delete time block" });
    }
  });

  // Agendamentos routes
  app.get("/api/admin/agendamentos", async (req, res) => {
    try {
      const { data, alunoId } = req.query;
      let agendamentos;

      if (data) {
        const targetDate = new Date(data as string);
        agendamentos = await storage.getAgendamentosByData(targetDate);
      } else if (alunoId) {
        agendamentos = await storage.getAgendamentosByAluno(alunoId as string);
      } else {
        agendamentos = await storage.getAllAgendamentos();
      }

      // Enrich with aluno and bloco data
      const enrichedAgendamentos = await Promise.all(
        agendamentos.map(async (agendamento) => {
          const aluno = await storage.getAluno(agendamento.alunoId);
          const bloco = await storage.getBlocoHorario(agendamento.blocoHorarioId);
          const userProfile = aluno ? await storage.getUserProfile(aluno.userProfileId) : null;
          
          return {
            ...agendamento,
            aluno: aluno ? {
              id: aluno.id,
              nome: userProfile?.nome || '',
              email: userProfile?.email || ''
            } : null,
            blocoHorario: bloco
          };
        })
      );

      res.json(enrichedAgendamentos);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      res.status(500).json({ error: "Failed to fetch appointments" });
    }
  });

  app.post("/api/admin/agendamentos", async (req, res) => {
    try {
      const validatedData = insertAgendamentoSchema.parse(req.body);
      
      // Check if aluno exists
      const aluno = await storage.getAluno(validatedData.alunoId);
      if (!aluno) {
        return res.status(400).json({ error: "Aluno não encontrado" });
      }

      // Check if bloco horario exists
      const bloco = await storage.getBlocoHorario(validatedData.blocoHorarioId);
      if (!bloco) {
        return res.status(400).json({ error: "Bloco de horário não encontrado" });
      }

      const agendamento = await storage.createAgendamento(validatedData);
      res.status(201).json(agendamento);
    } catch (error) {
      console.error("Error creating appointment:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Dados inválidos", 
          details: error.errors 
        });
      }
      res.status(500).json({ error: "Failed to create appointment" });
    }
  });

  app.put("/api/admin/agendamentos/:id", async (req, res) => {
    try {
      const validatedData = insertAgendamentoSchema.partial().parse(req.body);
      const agendamento = await storage.updateAgendamento(req.params.id, validatedData);
      
      if (!agendamento) {
        return res.status(404).json({ error: "Appointment not found" });
      }
      
      res.json(agendamento);
    } catch (error) {
      console.error("Error updating appointment:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Dados inválidos", 
          details: error.errors 
        });
      }
      res.status(500).json({ error: "Failed to update appointment" });
    }
  });

  app.delete("/api/admin/agendamentos/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteAgendamento(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Appointment not found" });
      }
      res.json({ message: "Appointment deleted successfully" });
    } catch (error) {
      console.error("Error deleting appointment:", error);
      res.status(500).json({ error: "Failed to delete appointment" });
    }
  });

  // Exceções de Disponibilidade routes
  app.get("/api/admin/excecoes-disponibilidade", async (req, res) => {
    try {
      const { data } = req.query;
      let excecoes;

      if (data) {
        const targetDate = new Date(data as string);
        excecoes = await storage.getExcecoesDisponibilidadeByData(targetDate);
      } else {
        excecoes = await storage.getAllExcecoesDisponibilidade();
      }

      res.json(excecoes);
    } catch (error) {
      console.error("Error fetching availability exceptions:", error);
      res.status(500).json({ error: "Failed to fetch availability exceptions" });
    }
  });

  app.post("/api/admin/excecoes-disponibilidade", async (req, res) => {
    try {
      const validatedData = insertExcecaoDispoSchema.parse(req.body);
      const excecao = await storage.createExcecaoDispo(validatedData);
      res.status(201).json(excecao);
    } catch (error) {
      console.error("Error creating availability exception:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Dados inválidos", 
          details: error.errors 
        });
      }
      res.status(500).json({ error: "Failed to create availability exception" });
    }
  });

  app.delete("/api/admin/excecoes-disponibilidade/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteExcecaoDispo(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Availability exception not found" });
      }
      res.json({ message: "Availability exception deleted successfully" });
    } catch (error) {
      console.error("Error deleting availability exception:", error);
      res.status(500).json({ error: "Failed to delete availability exception" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

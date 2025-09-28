import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserProfileSchema, insertAlunoSchema } from "@shared/schema";
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
  // Admin routes for student management
  app.get("/api/admin/students", async (req, res) => {
    try {
      const alunos = await storage.getAllAlunos();
      
      // Get user profiles for each aluno to include name and email
      const alunosWithProfiles = await Promise.all(
        alunos.map(async (aluno) => {
          const userProfile = await storage.getUserProfile(aluno.userProfileId);
          return {
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
        })
      );
      
      res.json(alunosWithProfiles);
    } catch (error) {
      console.error("Error fetching students:", error);
      res.status(500).json({ error: "Failed to fetch students" });
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

  const httpServer = createServer(app);

  return httpServer;
}

import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { generateSchemaFromPrompt, generateDataForField } from "./openai-service";
import { parseUploadedFile } from "./file-parser";
import { exportData } from "./export-service";
import {
  insertSchemaTemplateSchema,
  generateDataRequestSchema,
  aiPromptRequestSchema,
  type Field,
} from "@shared/schema";

const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/upload", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const fields = await parseUploadedFile(req.file.buffer, req.file.originalname);
      res.json({ fields });
    } catch (error: any) {
      console.error("File upload error:", error);
      res.status(400).json({ error: error.message || "Failed to parse file" });
    }
  });

  app.post("/api/generate-schema", async (req, res) => {
    try {
      const { prompt } = aiPromptRequestSchema.parse(req.body);
      const fields = await generateSchemaFromPrompt(prompt);
      res.json({ fields });
    } catch (error: any) {
      console.error("Schema generation error:", error);
      res.status(400).json({ error: error.message || "Failed to generate schema" });
    }
  });

  app.post("/api/generate-preview", async (req, res) => {
    try {
      const { fields, rowCount } = req.body;
      
      if (!fields || !Array.isArray(fields) || fields.length === 0) {
        return res.status(400).json({ error: "No fields provided" });
      }

      const data = [];
      const count = Math.min(rowCount || 10, 10);

      for (let i = 0; i < count; i++) {
        const row: any = {};
        for (const field of fields as Field[]) {
          row[field.name] = await generateDataForField(field.name, field.type);
        }
        data.push(row);
      }

      res.json({ data });
    } catch (error: any) {
      console.error("Data generation error:", error);
      res.status(400).json({ error: error.message || "Failed to generate data" });
    }
  });

  app.post("/api/export", async (req, res) => {
    try {
      const { fields, rowCount, format } = generateDataRequestSchema.parse(req.body);

      const data = [];
      for (let i = 0; i < rowCount; i++) {
        const row: any = {};
        for (const field of fields) {
          row[field.name] = await generateDataForField(field.name, field.type);
        }
        data.push(row);
      }

      const exported = exportData(data, format);

      res.setHeader("Content-Type", exported.contentType);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="data-export-${Date.now()}.${exported.extension}"`
      );
      
      res.send(exported.content);
    } catch (error: any) {
      console.error("Export error:", error);
      res.status(400).json({ error: error.message || "Failed to export data" });
    }
  });

  app.get("/api/templates", async (req, res) => {
    try {
      const templates = await storage.getAllTemplates();
      res.json(templates);
    } catch (error: any) {
      console.error("Get templates error:", error);
      res.status(500).json({ error: "Failed to fetch templates" });
    }
  });

  app.post("/api/templates", async (req, res) => {
    try {
      const templateData = insertSchemaTemplateSchema.parse(req.body);
      const template = await storage.createTemplate(templateData);
      res.json(template);
    } catch (error: any) {
      console.error("Create template error:", error);
      res.status(400).json({ error: error.message || "Failed to create template" });
    }
  });

  app.delete("/api/templates/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteTemplate(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "Template not found" });
      }
      
      res.json({ success: true });
    } catch (error: any) {
      console.error("Delete template error:", error);
      res.status(500).json({ error: "Failed to delete template" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

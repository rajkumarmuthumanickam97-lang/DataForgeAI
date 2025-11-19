import type { SchemaTemplate, InsertSchemaTemplate } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getTemplate(id: string): Promise<SchemaTemplate | undefined>;
  getAllTemplates(): Promise<SchemaTemplate[]>;
  createTemplate(template: InsertSchemaTemplate): Promise<SchemaTemplate>;
  deleteTemplate(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private templates: Map<string, SchemaTemplate>;

  constructor() {
    this.templates = new Map();
  }

  async getTemplate(id: string): Promise<SchemaTemplate | undefined> {
    return this.templates.get(id);
  }

  async getAllTemplates(): Promise<SchemaTemplate[]> {
    return Array.from(this.templates.values());
  }

  async createTemplate(insertTemplate: InsertSchemaTemplate): Promise<SchemaTemplate> {
    const id = randomUUID();
    const template: SchemaTemplate = { ...insertTemplate, id };
    this.templates.set(id, template);
    return template;
  }

  async deleteTemplate(id: string): Promise<boolean> {
    return this.templates.delete(id);
  }
}

export const storage = new MemStorage();

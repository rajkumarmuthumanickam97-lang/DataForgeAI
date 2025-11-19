import { z } from "zod";

export const dataTypeSchema = z.enum([
  "string",
  "number",
  "date",
  "boolean",
  "email",
  "phone",
  "address",
  "url",
  "uuid",
  "currency"
]);

export type DataType = z.infer<typeof dataTypeSchema>;

export const fieldSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Field name is required"),
  type: dataTypeSchema,
  order: z.number(),
});

export type Field = z.infer<typeof fieldSchema>;

export const insertFieldSchema = fieldSchema.omit({ id: true });
export type InsertField = z.infer<typeof insertFieldSchema>;

export const schemaTemplateSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Template name is required"),
  description: z.string().optional(),
  fields: z.array(fieldSchema),
});

export type SchemaTemplate = z.infer<typeof schemaTemplateSchema>;

export const insertSchemaTemplateSchema = schemaTemplateSchema.omit({ id: true });
export type InsertSchemaTemplate = z.infer<typeof insertSchemaTemplateSchema>;

export const exportFormatSchema = z.enum(["json", "csv", "xml"]);
export type ExportFormat = z.infer<typeof exportFormatSchema>;

export const generateDataRequestSchema = z.object({
  fields: z.array(fieldSchema),
  rowCount: z.number().min(1).max(100000),
  format: exportFormatSchema,
});

export type GenerateDataRequest = z.infer<typeof generateDataRequestSchema>;

export const aiPromptRequestSchema = z.object({
  prompt: z.string().min(10, "Prompt must be at least 10 characters"),
});

export type AIPromptRequest = z.infer<typeof aiPromptRequestSchema>;

export const aiSchemaResponseSchema = z.object({
  fields: z.array(insertFieldSchema),
});

export type AISchemaResponse = z.infer<typeof aiSchemaResponseSchema>;

import * as XLSX from "xlsx";
import * as Papa from "papaparse";
import type { Field, DataType } from "@shared/schema";

export async function parseUploadedFile(
  buffer: Buffer,
  filename: string
): Promise<Field[]> {
  if (!buffer || buffer.length === 0) {
    throw new Error("File is empty or corrupted");
  }

  const extension = filename.split(".").pop()?.toLowerCase();

  if (!extension) {
    throw new Error("File has no extension");
  }

  if (extension === "csv") {
    return parseCSV(buffer);
  } else if (extension === "xlsx" || extension === "xls") {
    return parseExcel(buffer);
  }

  throw new Error("Unsupported file format. Please upload CSV or Excel files.");
}

function parseCSV(buffer: Buffer): Field[] {
  try {
    const csvText = buffer.toString("utf-8");
    const result = Papa.parse(csvText, { header: true, preview: 10 });

    if (result.errors.length > 0) {
      const errorMsg = result.errors[0].message || "Failed to parse CSV file";
      throw new Error(`CSV parsing error: ${errorMsg}`);
    }

    const headers = result.meta.fields || [];
    
    if (headers.length === 0) {
      throw new Error("CSV file has no columns");
    }

    const sampleData = result.data as any[];

    return headers.map((header, index) => ({
      id: crypto.randomUUID(),
      name: header || `column_${index + 1}`,
      type: inferDataType(header, sampleData, header),
      order: index,
    }));
  } catch (error: any) {
    throw new Error(`CSV parsing failed: ${error.message}`);
  }
}

function parseExcel(buffer: Buffer): Field[] {
  try {
    const workbook = XLSX.read(buffer, { type: "buffer" });
    
    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      throw new Error("Excel file has no sheets");
    }

    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    if (!worksheet) {
      throw new Error("Excel sheet is empty");
    }

    const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

    if (jsonData.length === 0) {
      throw new Error("Excel file has no data rows");
    }

    const headers = Object.keys(jsonData[0]);

    if (headers.length === 0) {
      throw new Error("Excel file has no columns");
    }

    return headers.map((header, index) => ({
      id: crypto.randomUUID(),
      name: header || `column_${index + 1}`,
      type: inferDataType(header, jsonData, header),
      order: index,
    }));
  } catch (error: any) {
    throw new Error(`Excel parsing failed: ${error.message}`);
  }
}

function inferDataType(fieldName: string, sampleData: any[], columnKey: string): DataType {
  const nameLower = fieldName.toLowerCase();

  if (nameLower.includes("email") || nameLower.includes("e-mail")) {
    return "email";
  }
  
  if (nameLower.includes("phone") || nameLower.includes("mobile") || nameLower.includes("tel")) {
    return "phone";
  }
  
  if (nameLower.includes("address") || nameLower.includes("location") || nameLower.includes("street")) {
    return "address";
  }
  
  if (nameLower.includes("url") || nameLower.includes("website") || nameLower.includes("link")) {
    return "url";
  }
  
  if (nameLower.includes("date") || nameLower.includes("time") || nameLower.includes("dob") || nameLower.includes("birth")) {
    return "date";
  }
  
  if (nameLower.includes("price") || nameLower.includes("amount") || nameLower.includes("cost") || nameLower.includes("salary")) {
    return "currency";
  }
  
  if (nameLower.includes("id") && (nameLower.includes("uuid") || nameLower.includes("guid"))) {
    return "uuid";
  }
  
  if (nameLower === "active" || nameLower === "enabled" || nameLower === "verified" || nameLower.includes("is_")) {
    return "boolean";
  }

  if (sampleData.length > 0) {
    const values = sampleData.slice(0, 5).map(row => row[columnKey]).filter(v => v != null && v !== "");
    
    if (values.length > 0) {
      const firstValue = values[0];
      
      if (typeof firstValue === "boolean") {
        return "boolean";
      }
      
      if (typeof firstValue === "number") {
        return "number";
      }
      
      const allNumbers = values.every(v => !isNaN(Number(v)));
      if (allNumbers) {
        return "number";
      }
      
      const allBooleans = values.every(v => 
        String(v).toLowerCase() === "true" || 
        String(v).toLowerCase() === "false" ||
        v === "0" || v === "1"
      );
      if (allBooleans) {
        return "boolean";
      }
    }
  }

  return "string";
}

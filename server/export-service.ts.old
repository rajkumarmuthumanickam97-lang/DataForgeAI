import * as Papa from "papaparse";
import * as xml from "xml-js";
import type { ExportFormat } from "@shared/schema";

export function exportData(data: any[], format: ExportFormat): { content: string | Buffer; contentType: string; extension: string } {
  switch (format) {
    case "json":
      return {
        content: JSON.stringify(data, null, 2),
        contentType: "application/json",
        extension: "json",
      };

    case "csv":
      const csv = Papa.unparse(data);
      return {
        content: csv,
        contentType: "text/csv",
        extension: "csv",
      };

    case "xml":
      const xmlContent = xml.js2xml(
        { data: { row: data } },
        { compact: true, spaces: 2 }
      );
      return {
        content: xmlContent,
        contentType: "application/xml",
        extension: "xml",
      };

    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Loader2, FileJson, FileText, FileCode, Database } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { Field, ExportFormat } from "@shared/schema";

interface ExportControlsProps {
  fields: Field[];
  data: any[];
  rowCount: number;
  selectedFormat: ExportFormat;
  onFormatChange: (format: ExportFormat) => void;
  onDataGenerated: (data: any[]) => void;
}

const FORMAT_OPTIONS: {
  value: ExportFormat;
  label: string;
  icon: typeof FileJson;
}[] = [
  { value: "json", label: "JSON", icon: FileJson },
  { value: "csv", label: "CSV", icon: FileText },
  { value: "xml", label: "XML", icon: FileCode },
];

export function ExportControls({
  fields,
  data,
  rowCount,
  selectedFormat,
  onFormatChange,
  onDataGenerated,
}: ExportControlsProps) {
  const { toast } = useToast();

  const exportMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fields,
          rowCount,
          format: selectedFormat,
        }),
      });

      if (!response.ok) {
        throw new Error("Export failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `data-export-${Date.now()}.${selectedFormat}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Export successful",
        description: `Downloaded ${rowCount.toLocaleString()} rows as ${selectedFormat.toUpperCase()}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Export failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleExport = () => {
    if (fields.length === 0) {
      toast({
        title: "No schema defined",
        description: "Please define at least one field",
        variant: "destructive",
      });
      return;
    }
    exportMutation.mutate();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="w-5 h-5" />
          Export Data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Select Format</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {FORMAT_OPTIONS.map(({ value, label, icon: Icon }) => (
              <Button
                key={value}
                variant={selectedFormat === value ? "default" : "outline"}
                onClick={() => onFormatChange(value)}
                className="flex items-center gap-2 justify-center"
                data-testid={`button-format-${value}`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Button>
            ))}
          </div>
        </div>

        <Button
          onClick={handleExport}
          disabled={fields.length === 0 || exportMutation.isPending}
          className="w-full"
          size="lg"
          data-testid="button-export"
        >
          {exportMutation.isPending ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Generating & Exporting...
            </>
          ) : (
            <>
              <Download className="w-5 h-5 mr-2" />
              Export {rowCount.toLocaleString()} Rows as {selectedFormat.toUpperCase()}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

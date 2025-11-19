import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FileUploadTab } from "@/components/file-upload-tab";
import { AIPromptTab } from "@/components/ai-prompt-tab";
import { SchemaBuilder } from "@/components/schema-builder";
import { DataPreview } from "@/components/data-preview";
import { ExportControls } from "@/components/export-controls";
import { TemplateDialog } from "@/components/template-dialog";
import { Database, Save, Sparkles } from "lucide-react";
import type { Field, ExportFormat } from "@shared/schema";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"upload" | "ai">("upload");
  const [fields, setFields] = useState<Field[]>([]);
  const [generatedData, setGeneratedData] = useState<any[]>([]);
  const [rowCount, setRowCount] = useState(100);
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("json");
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [templateAction, setTemplateAction] = useState<"save" | "load">("save");

  const handleFieldsUpdate = (newFields: Field[]) => {
    setFields(newFields);
    setGeneratedData([]);
  };

  const handleDataGenerated = (data: any[]) => {
    setGeneratedData(data);
  };

  const handleSaveTemplate = () => {
    setTemplateAction("save");
    setTemplateDialogOpen(true);
  };

  const handleLoadTemplate = () => {
    setTemplateAction("load");
    setTemplateDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-md flex items-center justify-center">
                <Database className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">DataForge AI</h1>
                <p className="text-sm text-muted-foreground">Universal ETL Data Creation Tool</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleLoadTemplate}
                data-testid="button-load-template"
              >
                Load Template
              </Button>
              <Button
                variant="outline"
                onClick={handleSaveTemplate}
                disabled={fields.length === 0}
                data-testid="button-save-template"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Template
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "upload" | "ai")}>
              <TabsList className="grid w-full grid-cols-2" data-testid="tabs-input-mode">
                <TabsTrigger value="upload" data-testid="tab-upload">
                  <Database className="w-4 h-4 mr-2" />
                  Upload Template
                </TabsTrigger>
                <TabsTrigger value="ai" data-testid="tab-ai">
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI Generation
                </TabsTrigger>
              </TabsList>
              <TabsContent value="upload" className="mt-6">
                <FileUploadTab onFieldsExtracted={handleFieldsUpdate} />
              </TabsContent>
              <TabsContent value="ai" className="mt-6">
                <AIPromptTab onSchemaGenerated={handleFieldsUpdate} />
              </TabsContent>
            </Tabs>

            <SchemaBuilder
              fields={fields}
              onFieldsChange={handleFieldsUpdate}
            />
          </div>

          <div className="lg:col-span-3 space-y-6">
            <DataPreview
              fields={fields}
              data={generatedData}
              rowCount={rowCount}
              onRowCountChange={setRowCount}
              onDataGenerated={handleDataGenerated}
            />

            <ExportControls
              fields={fields}
              data={generatedData}
              rowCount={rowCount}
              selectedFormat={selectedFormat}
              onFormatChange={setSelectedFormat}
              onDataGenerated={handleDataGenerated}
            />
          </div>
        </div>
      </main>

      <TemplateDialog
        open={templateDialogOpen}
        onOpenChange={setTemplateDialogOpen}
        action={templateAction}
        currentFields={fields}
        onTemplateLoad={handleFieldsUpdate}
      />
    </div>
  );
}

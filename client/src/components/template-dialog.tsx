import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Loader2, Trash2 } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Field, SchemaTemplate } from "@shared/schema";

interface TemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: "save" | "load";
  currentFields: Field[];
  onTemplateLoad: (fields: Field[]) => void;
}

export function TemplateDialog({
  open,
  onOpenChange,
  action,
  currentFields,
  onTemplateLoad,
}: TemplateDialogProps) {
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const { toast } = useToast();

  const { data: templates = [], isLoading } = useQuery<SchemaTemplate[]>({
    queryKey: ["/api/templates"],
    enabled: open && action === "load",
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/templates", {
        name: templateName,
        description: templateDescription,
        fields: currentFields,
      });
    },
    onSuccess: () => {
      toast({
        title: "Template saved",
        description: `Template "${templateName}" saved successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
      onOpenChange(false);
      setTemplateName("");
      setTemplateDescription("");
    },
    onError: (error: Error) => {
      toast({
        title: "Save failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/templates/${id}`, {});
    },
    onSuccess: () => {
      toast({
        title: "Template deleted",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (!templateName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a template name",
        variant: "destructive",
      });
      return;
    }
    saveMutation.mutate();
  };

  const handleLoad = (template: SchemaTemplate) => {
    onTemplateLoad(template.fields);
    toast({
      title: "Template loaded",
      description: `Loaded "${template.name}" with ${template.fields.length} fields`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {action === "save" ? "Save Template" : "Load Template"}
          </DialogTitle>
          <DialogDescription>
            {action === "save"
              ? "Save your current schema as a reusable template"
              : "Select a saved template to load"}
          </DialogDescription>
        </DialogHeader>

        {action === "save" ? (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="template-name">Template Name</Label>
              <Input
                id="template-name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="e.g., Customer Data Schema"
                data-testid="input-template-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="template-description">Description (Optional)</Label>
              <Textarea
                id="template-description"
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                placeholder="Describe what this template is for..."
                className="resize-none"
                rows={3}
                data-testid="textarea-template-description"
              />
            </div>
            <div className="rounded-lg border p-4 bg-muted/50">
              <p className="text-sm font-medium mb-2">Fields to save: {currentFields.length}</p>
              <p className="text-xs text-muted-foreground">
                {currentFields.map((f) => f.name).join(", ")}
              </p>
            </div>
          </div>
        ) : (
          <ScrollArea className="h-96 py-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : templates.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No saved templates yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {templates.map((template) => (
                  <Card
                    key={template.id}
                    className="hover-elevate cursor-pointer"
                    data-testid={`card-template-${template.id}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div
                          className="flex-1"
                          onClick={() => handleLoad(template)}
                        >
                          <h4 className="font-semibold text-foreground mb-1">
                            {template.name}
                          </h4>
                          {template.description && (
                            <p className="text-sm text-muted-foreground mb-2">
                              {template.description}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {template.fields.length} fields:{" "}
                            {template.fields.map((f) => f.name).join(", ")}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteMutation.mutate(template.id);
                          }}
                          data-testid={`button-delete-template-${template.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        )}

        {action === "save" && (
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saveMutation.isPending}
              data-testid="button-save-template-confirm"
            >
              {saveMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Template"
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

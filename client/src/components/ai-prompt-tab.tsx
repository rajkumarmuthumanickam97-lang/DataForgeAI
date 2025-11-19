import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Field } from "@shared/schema";

interface AIPromptTabProps {
  onSchemaGenerated: (fields: Field[]) => void;
}

export function AIPromptTab({ onSchemaGenerated }: AIPromptTabProps) {
  const [prompt, setPrompt] = useState("");
  const { toast } = useToast();

  const generateMutation = useMutation({
    mutationFn: async (prompt: string) => {
      return await apiRequest("POST", "/api/generate-schema", { prompt }) as Promise<{ fields: Field[] }>;
    },
    onSuccess: (data: { fields: Field[] }) => {
      onSchemaGenerated(data.fields);
      toast({
        title: "Schema generated successfully",
        description: `Created ${data.fields.length} fields based on your prompt`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Generation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    if (prompt.trim().length < 10) {
      toast({
        title: "Prompt too short",
        description: "Please provide a more detailed description",
        variant: "destructive",
      });
      return;
    }
    generateMutation.mutate(prompt);
  };

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="ai-prompt" className="text-base font-semibold">
            Describe Your Dataset
          </Label>
          <Textarea
            id="ai-prompt"
            placeholder="Describe the data you need. For example: 'Generate customer data with name, email, phone number, and purchase history' or 'Create employee records with ID, full name, department, hire date, and salary'"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-32 resize-none"
            data-testid="textarea-ai-prompt"
          />
          <p className="text-xs text-muted-foreground">
            Be specific about the fields and data types you need. The AI will create an appropriate schema.
          </p>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={generateMutation.isPending || prompt.trim().length < 10}
          className="w-full"
          data-testid="button-generate-schema"
        >
          {generateMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating Schema...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Schema
            </>
          )}
        </Button>

        {generateMutation.isSuccess && (
          <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <p className="text-sm text-foreground font-medium">
              ✓ Schema generated! Review and customize the fields below.
            </p>
          </div>
        )}

        {generateMutation.isError && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive font-medium">
              Error: {generateMutation.error.message}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

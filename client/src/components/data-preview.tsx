import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Eye, Loader2, RefreshCw } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Field } from "@shared/schema";

interface DataPreviewProps {
  fields: Field[];
  data: any[];
  rowCount: number;
  onRowCountChange: (count: number) => void;
  onDataGenerated: (data: any[]) => void;
}

export function DataPreview({
  fields,
  data,
  rowCount,
  onRowCountChange,
  onDataGenerated,
}: DataPreviewProps) {
  const { toast } = useToast();

  const previewMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/generate-preview", {
        fields,
        rowCount: Math.min(rowCount, 10),
      }) as Promise<{ data: any[] }>;
    },
    onSuccess: (response: { data: any[] }) => {
      onDataGenerated(response.data);
    },
    onError: (error: Error) => {
      toast({
        title: "Preview generation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handlePreview = () => {
    if (fields.length === 0) {
      toast({
        title: "No schema defined",
        description: "Please define at least one field",
        variant: "destructive",
      });
      return;
    }
    previewMutation.mutate();
  };

  const presetCounts = [10, 100, 500, 1000, 5000, 10000];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Data Preview
          </CardTitle>
          <Button
            onClick={handlePreview}
            disabled={fields.length === 0 || previewMutation.isPending}
            size="sm"
            data-testid="button-generate-preview"
          >
            {previewMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Generate Preview
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Row Count</Label>
              <Input
                type="number"
                value={rowCount}
                onChange={(e) => onRowCountChange(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-24 h-8 text-sm"
                min={1}
                max={100000}
                data-testid="input-row-count"
              />
            </div>
            <Slider
              value={[rowCount]}
              onValueChange={([value]) => onRowCountChange(value)}
              min={10}
              max={10000}
              step={10}
              className="w-full"
              data-testid="slider-row-count"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {presetCounts.map((count) => (
              <Button
                key={count}
                variant={rowCount === count ? "default" : "outline"}
                size="sm"
                onClick={() => onRowCountChange(count)}
                data-testid={`button-preset-${count}`}
              >
                {count.toLocaleString()}
              </Button>
            ))}
          </div>
        </div>

        {data.length > 0 ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {data.length} sample rows
              </p>
            </div>
            <ScrollArea className="h-96 rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {fields.map((field) => (
                      <TableHead key={field.id} className="font-semibold bg-muted">
                        {field.name}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((row, rowIndex) => (
                    <TableRow key={rowIndex} data-testid={`row-preview-${rowIndex}`}>
                      {fields.map((field) => (
                        <TableCell key={field.id} className="font-mono text-sm">
                          {String(row[field.name] ?? "")}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        ) : (
          <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <Eye className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              {fields.length === 0
                ? "Define your schema to preview data"
                : "Click 'Generate Preview' to see sample data"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

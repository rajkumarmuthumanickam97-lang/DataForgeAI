import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CloudUpload, File, X } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Field } from "@shared/schema";

interface FileUploadTabProps {
  onFieldsExtracted: (fields: Field[]) => void;
}

export function FileUploadTab({ onFieldsExtracted }: FileUploadTabProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error("Upload failed");
      }
      return response.json();
    },
    onSuccess: (data) => {
      onFieldsExtracted(data.fields);
      toast({
        title: "File uploaded successfully",
        description: `Detected ${data.fields.length} fields from your template`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setUploadedFile(file);
      uploadMutation.mutate(file);
    }
  }, [uploadMutation]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
    },
    maxFiles: 1,
  });

  const removeFile = () => {
    setUploadedFile(null);
    onFieldsExtracted([]);
  };

  return (
    <Card>
      <CardContent className="p-6">
        {!uploadedFile ? (
          <div
            {...getRootProps()}
            className={`min-h-64 border-2 border-dashed rounded-lg flex flex-col items-center justify-center p-8 cursor-pointer transition-colors ${
              isDragActive ? "border-primary bg-primary/5" : "border-border hover-elevate"
            }`}
            data-testid="dropzone-upload"
          >
            <input {...getInputProps()} data-testid="input-file" />
            <CloudUpload className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {isDragActive ? "Drop your file here" : "Drag & drop your template"}
            </h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Supports CSV and Excel files (.csv, .xls, .xlsx)
            </p>
            <Button variant="outline" type="button" data-testid="button-browse">
              Browse Files
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <File className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground" data-testid="text-filename">
                    {uploadedFile.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(uploadedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={removeFile}
                data-testid="button-remove-file"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            {uploadMutation.isPending && (
              <div className="text-center py-4">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-muted-foreground">Processing file...</p>
                </div>
              </div>
            )}
            {uploadMutation.isSuccess && (
              <div className="text-center py-4 bg-primary/10 border border-primary/20 rounded-lg">
                <p className="text-sm text-foreground font-medium">
                  ✓ Schema extracted successfully
                </p>
              </div>
            )}
            {uploadMutation.isError && (
              <div className="text-center py-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive font-medium">
                  Error: {uploadMutation.error.message}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

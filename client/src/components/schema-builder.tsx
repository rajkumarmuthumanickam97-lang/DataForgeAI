import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, GripVertical, Trash2, FileText } from "lucide-react";
import type { Field, DataType } from "@shared/schema";

interface SchemaBuilderProps {
  fields: Field[];
  onFieldsChange: (fields: Field[]) => void;
}

const DATA_TYPE_OPTIONS: { value: DataType; label: string }[] = [
  { value: "string", label: "Text" },
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
  { value: "boolean", label: "Boolean" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "address", label: "Address" },
  { value: "url", label: "URL" },
  { value: "uuid", label: "UUID" },
  { value: "currency", label: "Currency" },
];

export function SchemaBuilder({ fields, onFieldsChange }: SchemaBuilderProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  const addField = () => {
    const newField: Field = {
      id: crypto.randomUUID(),
      name: `field_${fields.length + 1}`,
      type: "string",
      order: fields.length,
    };
    onFieldsChange([...fields, newField]);
    setEditingId(newField.id);
  };

  const updateField = (id: string, updates: Partial<Field>) => {
    onFieldsChange(
      fields.map((field) =>
        field.id === id ? { ...field, ...updates } : field
      )
    );
  };

  const removeField = (id: string) => {
    const newFields = fields
      .filter((field) => field.id !== id)
      .map((field, index) => ({ ...field, order: index }));
    onFieldsChange(newFields);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Schema Builder
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {fields.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-muted-foreground mb-4">
              No fields defined yet. Upload a template, use AI generation, or add fields manually.
            </p>
            <Button onClick={addField} variant="outline" data-testid="button-add-first-field">
              <Plus className="w-4 h-4 mr-2" />
              Add Field
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {fields.map((field, index) => (
                <Card key={field.id} className="hover-elevate" data-testid={`card-field-${index}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label htmlFor={`field-name-${field.id}`} className="text-xs">
                            Field Name
                          </Label>
                          <Input
                            id={`field-name-${field.id}`}
                            value={field.name}
                            onChange={(e) => updateField(field.id, { name: e.target.value })}
                            className="h-9"
                            data-testid={`input-field-name-${index}`}
                          />
                        </div>
                        
                        <div className="space-y-1">
                          <Label htmlFor={`field-type-${field.id}`} className="text-xs">
                            Data Type
                          </Label>
                          <Select
                            value={field.type}
                            onValueChange={(value) =>
                              updateField(field.id, { type: value as DataType })
                            }
                          >
                            <SelectTrigger id={`field-type-${field.id}`} className="h-9" data-testid={`select-field-type-${index}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {DATA_TYPE_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeField(field.id)}
                        className="flex-shrink-0"
                        data-testid={`button-remove-field-${index}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Button
              onClick={addField}
              variant="outline"
              className="w-full"
              data-testid="button-add-field"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Field
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

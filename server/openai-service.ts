import OpenAI from "openai";
import type { Field, DataType } from "@shared/schema";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateSchemaFromPrompt(prompt: string): Promise<Field[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: `You are a data schema expert. Given a user's description of a dataset, generate an appropriate schema with field names and data types.

Available data types: string, number, date, boolean, email, phone, address, url, uuid, currency

Respond with JSON in this exact format:
{
  "fields": [
    { "name": "field_name", "type": "data_type", "order": 0 },
    ...
  ]
}

Be intelligent about field types based on context. For example:
- Names should be "string"
- Ages should be "number"
- Birth dates should be "date"
- Email addresses should be "email"
- Phone numbers should be "phone"
- Prices/amounts should be "currency"
- True/false values should be "boolean"`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    if (!result.fields || !Array.isArray(result.fields)) {
      throw new Error("Invalid response from AI");
    }

    return result.fields.map((field: any, index: number) => ({
      id: crypto.randomUUID(),
      name: field.name,
      type: field.type as DataType,
      order: index,
    }));
  } catch (error: any) {
    console.error("OpenAI schema generation error:", error);
    throw new Error("Failed to generate schema: " + error.message);
  }
}

export async function generateDataForField(fieldName: string, fieldType: DataType): Promise<any> {
  const now = new Date();
  
  switch (fieldType) {
    case "string":
      return generateRandomString(fieldName);
    
    case "number":
      return Math.floor(Math.random() * 1000);
    
    case "date":
      const randomDate = new Date(
        now.getFullYear() - Math.floor(Math.random() * 5),
        Math.floor(Math.random() * 12),
        Math.floor(Math.random() * 28) + 1
      );
      return randomDate.toISOString().split("T")[0];
    
    case "boolean":
      return Math.random() > 0.5;
    
    case "email":
      const randomName = generateRandomString("name").toLowerCase().replace(/\s/g, "");
      const domains = ["gmail.com", "yahoo.com", "outlook.com", "company.com", "example.com"];
      return `${randomName}@${domains[Math.floor(Math.random() * domains.length)]}`;
    
    case "phone":
      return `+1${Math.floor(Math.random() * 9000000000 + 1000000000)}`;
    
    case "address":
      const streetNum = Math.floor(Math.random() * 9999) + 1;
      const streets = ["Main St", "Oak Ave", "Elm St", "Maple Dr", "Pine Rd", "Cedar Ln"];
      const cities = ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix"];
      const street = streets[Math.floor(Math.random() * streets.length)];
      const city = cities[Math.floor(Math.random() * cities.length)];
      const zip = Math.floor(Math.random() * 90000) + 10000;
      return `${streetNum} ${street}, ${city}, CA ${zip}`;
    
    case "url":
      const paths = ["products", "services", "about", "contact", "blog"];
      const path = paths[Math.floor(Math.random() * paths.length)];
      return `https://example.com/${path}`;
    
    case "uuid":
      return crypto.randomUUID();
    
    case "currency":
      return `$${(Math.random() * 10000).toFixed(2)}`;
    
    default:
      return generateRandomString(fieldName);
  }
}

function generateRandomString(fieldName: string): string {
  const name = fieldName.toLowerCase();
  
  if (name.includes("name") || name.includes("first") || name.includes("last")) {
    const firstNames = ["John", "Jane", "Michael", "Sarah", "David", "Emma", "James", "Olivia"];
    const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller"];
    
    if (name.includes("first")) {
      return firstNames[Math.floor(Math.random() * firstNames.length)];
    } else if (name.includes("last")) {
      return lastNames[Math.floor(Math.random() * lastNames.length)];
    } else {
      return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
    }
  }
  
  if (name.includes("title") || name.includes("subject")) {
    const titles = ["Important Update", "Meeting Notes", "Project Review", "Team Discussion", "Weekly Report"];
    return titles[Math.floor(Math.random() * titles.length)];
  }
  
  if (name.includes("description") || name.includes("comment") || name.includes("note")) {
    const descriptions = [
      "This is a sample description",
      "Important information here",
      "Please review this carefully",
      "Updated content available",
      "Action required"
    ];
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  }
  
  if (name.includes("status")) {
    const statuses = ["Active", "Pending", "Completed", "In Progress", "Cancelled"];
    return statuses[Math.floor(Math.random() * statuses.length)];
  }
  
  if (name.includes("category") || name.includes("type")) {
    const categories = ["Type A", "Type B", "Category 1", "Category 2", "Standard"];
    return categories[Math.floor(Math.random() * categories.length)];
  }
  
  return `Sample ${fieldName} ${Math.floor(Math.random() * 1000)}`;
}

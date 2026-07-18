import { GoogleGenAI, Type, Schema } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'MISSING_KEY' });

/**
 * Extracts structured task data from natural language text.
 */
export const parseNaturalLanguageTask = async (text: string) => {
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      title: {
        type: Type.STRING,
        description: "A concise, actionable title for the task.",
      },
      description: {
        type: Type.STRING,
        description: "Any additional context or details provided in the text. Leave empty if none.",
      },
      priority: {
        type: Type.STRING,
        description: "The priority of the task: 'low', 'medium', 'high', or 'urgent'. Default to 'medium' if not specified.",
      },
      dueDate: {
        type: Type.STRING,
        description: "The ISO 8601 date string representing the due date, if mentioned. Otherwise null.",
        nullable: true
      },
    },
    required: ["title", "priority"],
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Extract the task details from the following text:\n\n"${text}"`,
    config: {
      responseMimeType: "application/json",
      responseSchema: schema,
      temperature: 0.1,
    }
  });

  if (!response.text) {
    throw new Error('Failed to parse task from natural language');
  }

  return JSON.parse(response.text);
};

/**
 * Generates a vector embedding for the given text.
 */
export const generateEmbedding = async (text: string): Promise<number[]> => {
  const response = await ai.models.embedContent({
    model: 'text-embedding-004',
    contents: text,
  });

  if (!response.embeddings || response.embeddings.length === 0 || !response.embeddings[0].values) {
    throw new Error('Failed to generate embedding');
  }

  return response.embeddings[0].values;
};

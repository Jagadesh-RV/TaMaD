import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'MISSING_KEY' });

/**
 * Extracts structured task data from natural language text using Gemini.
 */
export const parseNaturalLanguageTask = async (text: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: text,
    config: {
      systemInstruction: 'Extract the task details from the provided text.',
      temperature: 0.1,
      responseMimeType: 'application/json',
      responseSchema: {
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
            enum: ['low', 'medium', 'high', 'urgent'],
            description: "The priority of the task.",
          },
          dueDate: {
            type: Type.STRING,
            description: "The ISO 8601 date string representing the due date, if mentioned. Otherwise null.",
            nullable: true,
          },
        },
        required: ["title", "description", "priority", "dueDate"],
      }
    }
  });

  const responseText = response.text;
  if (!responseText) {
    throw new Error('Failed to parse task from natural language');
  }

  return JSON.parse(responseText);
};

export const askAssistant = async (query: string, context: string) => {
  const prompt = `You are an intelligent AI workspace assistant for TaMaD. 
The user asks: "${query}"

Here is the current workspace context:
${context}

Based on this context, provide a helpful, concise, and structured response in Markdown. 
Do not hallucinate tasks or projects that don't exist. Be encouraging and use emojis naturally.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });
  
  return response.text || 'I am sorry, I could not generate a response.';
};

/**
 * Generates a vector embedding for the given text using Gemini.
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

import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || 'MISSING_KEY' });

/**
 * Extracts structured task data from natural language text.
 */
export const parseNaturalLanguageTask = async (text: string) => {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'Extract the task details from the provided text.'
      },
      {
        role: 'user',
        content: text
      }
    ],
    temperature: 0.1,
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'TaskExtraction',
        schema: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: "A concise, actionable title for the task.",
            },
            description: {
              type: 'string',
              description: "Any additional context or details provided in the text. Leave empty if none.",
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'urgent'],
              description: "The priority of the task.",
            },
            dueDate: {
              type: ['string', 'null'],
              description: "The ISO 8601 date string representing the due date, if mentioned. Otherwise null.",
            },
          },
          required: ["title", "description", "priority", "dueDate"],
          additionalProperties: false
        },
        strict: true
      }
    }
  });

  const responseText = response.choices[0]?.message?.content;
  if (!responseText) {
    throw new Error('Failed to parse task from natural language');
  }

  return JSON.parse(responseText);
};

/**
 * Generates a vector embedding for the given text.
 */
export const generateEmbedding = async (text: string): Promise<number[]> => {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });

  if (!response.data || response.data.length === 0 || !response.data[0].embedding) {
    throw new Error('Failed to generate embedding');
  }

  return response.data[0].embedding;
};

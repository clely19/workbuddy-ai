import { GoogleGenAI, Type } from "@google/genai";

//calling gemini model
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

const today = new Date().toISOString().split("T")[0];

//get pared command with gemini
export const parseCommandWithGemini = async (command) => {
  try {
    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Convert the following command into a structured task JSON. Today is ${today}. Command: "${command}"`,
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            task: {
              type: Type.STRING,
              description: "The task or action to perform",
            },
            datetime: {
              type: Type.STRING,
              description: "ISO timestamp in the format YYYY-MM-DDTHH:mm",
            },
          },
          required: ["task", "datetime"],
          propertyOrdering: ["task", "datetime"],
        },
      },
    });


    // Safely parse the JSON
    const response = await result.text;
    const json = JSON.parse(response);
    console.log("Parsed from Gemini:", json);
    return json;

  } catch (error) {
    console.error("Gemini agent error:", error);
    return null;
  }
};

// Summarized tasks to be shown in the right column
export const summarizeTasks = async (tasks) => {
  const taskText = tasks.map(task => `- ${task.task} at ${task.datetime}`).join('\n');
  
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [
      {
        role: "user",
        parts: [{ text: `Give a TL;DR summary of these tasks:\n${taskText}` }],
      },
    ],
  });

  return response.text; // summary string
};

//asking questions like summary of tasks, priority
export const answerUserQuestion = async (question, tasks) => {
  const context = tasks.map(task => `Task: ${task.task}, When: ${task.datetime}`).join('\n');

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [
      {
        role: "user",
        parts: [{ text: `Tasks:\n${context}\n\nNow answer: ${question}` }],
      },
    ],
  });

  return response.text;
};

//trying to evaluate the intent of the user
export const classifyIntent = async (input) => {
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `Classify the intent of this user input. Choose from: ["new_task", "question", "summarize"]

User input: "${input}"

Respond only with the label.`,
          },
        ],
      },
    ],
  });

  return response.text.trim(); // e.g., "new_task"
};


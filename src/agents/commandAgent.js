import { GoogleGenAI, Type } from "@google/genai";

//calling gemini model
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

const today = new Date().toISOString().split("T")[0];


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



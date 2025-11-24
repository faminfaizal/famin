import { GoogleGenAI } from "@google/genai";
import { AlgorithmType } from "../types";

// Safety check for API Key
const apiKey = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey });

export const fetchAlgorithmExplanation = async (algorithm: AlgorithmType): Promise<string> => {
  if (!apiKey) {
    return "API Key not found. Please set process.env.API_KEY.";
  }

  try {
    const prompt = `
      Explain ${algorithm} to a computer science student in a fun, engaging, and "cyberpunk" style.
      Keep it under 100 words.
      Focus on how it works conceptually. 
      Use analogies (like organizing a deck of neon cards).
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Could not generate explanation.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "AI Module Offline. Unable to fetch explanation.";
  }
};

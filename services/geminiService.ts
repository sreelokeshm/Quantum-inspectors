
import { GoogleGenAI, Type } from "@google/genai";
import { InspectionResult } from "../types";

// Always use the process.env.API_KEY directly as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const COMPARISON_PROMPT = `
You are an expert industrial quality control AI. 
Analyze these two images: 
1. The "Reference Design" (CAD model).
2. The "Physical Output" (Actual forged metal piece).

Identify any deviations in the physical output compared to the design. 
Look for:
- Dimensional inaccuracies (warping, scaling issues)
- Missing features (pockets, holes, edges)
- Surface defects (cracks, excessive scale, uneven texture)
- Geometry failures (angles not matching)

Return a JSON object evaluating if the output is a match. 
If there are any medium or high severity anomalies, mark status as "QA_FAILED".
If it is a perfect or near-perfect match, mark status as "QA_PASSED".
`;

export const compareForgingToCAD = async (cadBase64: string, actualBase64: string): Promise<InspectionResult> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { text: COMPARISON_PROMPT },
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: cadBase64.split(',')[1] || cadBase64,
            },
          },
          {
             text: "Above is the Reference Design. Below is the Physical Output to be inspected."
          },
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: actualBase64.split(',')[1] || actualBase64,
            },
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            status: { type: Type.STRING, description: "QA_PASSED or QA_FAILED" },
            confidence: { type: Type.NUMBER },
            summary: { type: Type.STRING },
            anomalies: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, description: "e.g., Geometry, Surface, Dimension" },
                  severity: { type: Type.STRING, description: "low, medium, or high" },
                  description: { type: Type.STRING },
                  location: { type: Type.STRING }
                },
                required: ["type", "severity", "description", "location"]
              }
            }
          },
          required: ["status", "confidence", "summary", "anomalies"]
        },
      },
    });

    // Access the text property directly (not a method) as per guidelines
    const result = JSON.parse(response.text || '{}');
    return {
      ...result,
      id: `QC-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("Comparison Error:", error);
    throw new Error("Analysis engine failed to compare parts. Ensure both images are clear.");
  }
};

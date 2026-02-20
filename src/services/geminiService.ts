import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getClimateZone(latitude: number, longitude: number): Promise<string> {
  const model = ai.models.generateContent;
  const result = await model({
    model: 'gemini-2.5-flash',
    contents: `Based on the location at latitude ${latitude} and longitude ${longitude}, what is the climate zone? (e.g., Hot-Dry, Warm-Humid, Composite, Cold). Only respond with the climate zone name.`,
    config: {
      tools: [{ googleMaps: {} }],
      toolConfig: {
        retrievalConfig: {
          latLng: {
            latitude: latitude,
            longitude: longitude
          }
        }
      }
    },
  });

  const response = result;
  return response.text.trim();
}

export async function generateFloorPlan(climate: string, length: string, breadth: string): Promise<string> {
  const model = ai.models.generateContent;
  const result = await model({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          text: `Generate a high-fidelity, architecturally sound 2D floor plan. The plan must be drawn to a clear and consistent scale.
Style Prompt: "A professional 2D architectural floor plan, black and white line drawing, Indian residential style. The drawing must be precise, with correct proportions for rooms, furniture, and fixtures. Label all rooms in English. Include key measurements and dimensions for major rooms and overall plot boundaries. Show a North arrow, indicate wall thickness accurately, and include a simple furniture layout."
Plot Details: The plot size is ${length} ft by ${breadth} ft (total area: ${parseInt(length) * parseInt(breadth)} sqft).
Climate: ${climate}.
Constraints:
1. Strictly enforce Vastu rules (NE entrance, SE kitchen, SW Master Bed).
2. The layout must be practical and livable, with logical room adjacencies and circulation paths.
3. All elements must be drawn to scale relative to the overall plot dimensions.`,
        },
      ],
    },
  });

  const response = result;
  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return part.inlineData.data;
    }
  }
  throw new Error('Image generation failed');
}

export async function getEngineeringReport(climate: string, length: string, breadth: string): Promise<string> {
  const model = ai.models.generateContent;
  const result = await model({
    model: 'gemini-3-flash-preview',
    contents: `Generate a construction report in Markdown format for a residential building of size ${length} ft x ${breadth} ft in a ${climate} climate. The total area is ${parseInt(length) * parseInt(breadth)} sqft. Use headings and subheadings. Include:
    ### 1. Architectural Recommendations
    - Based on the ${climate} climate.

    ### 2. Civil Engineering (MaterialWise)
    - Estimate cement (0.45 bags/sqft), steel (4kg/sqft), and bricks (12k per 1000sqft) based on the total area.

    ### 3. Electrical Engineering (PowerWise)
    - Provide a load summary and circuit safety tips.`,
  });

  const response = result;
  return response.text;
}

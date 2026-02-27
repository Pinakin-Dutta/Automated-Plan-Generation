import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getClimateZone(locationName: string): Promise<string> {
  const result = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Search online for the architectural climate zone of the location: ${locationName}. (e.g., Hot-Dry, Warm-Humid, Composite, Cold, Temperate). If the specific location is obscure, approximate it to the closest known major city or region. Return ONLY the climate zone name, with no additional text, punctuation, or explanation.`,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });
  
  // Clean up the response to ensure it's just the zone name
  let text = result.text?.trim() ?? 'Unknown';
  // Remove any trailing periods or newlines
  text = text.replace(/[.\n\r]+$/, '');
  return text;
}

export async function generateFloorPlan(climate: string, length: string, breadth: string, rooms: string, plotSvgBase64: string, vastuCompliant: boolean): Promise<string> {
  const plotDetails = [
    `- Plot Size: ${length} ft by ${breadth} ft (total area: ${parseInt(length) * parseInt(breadth)} sqft).`
  ];
  if (rooms) {
    plotDetails.push(`- Required Rooms: ${rooms}.`);
  }

  const vastuConstraint = vastuCompliant ? '1. Strictly enforce Vastu rules (NE entrance, SE kitchen, SW Master Bed).' : '1. Vastu compliance is not required. Optimize for space and natural light.';

  const text = `Use the provided image of the plot outline as the exact boundary for the floor plan. Draw the entire plan inside the given rectangle, using its dimensions as the architectural scale.\n\nStyle Prompt: "A professional 2D architectural floor plan on a pure white background, black and white line drawing, Indian residential style. The drawing must be precise, with correct proportions for rooms, furniture, and fixtures. Label all rooms in English. Include key measurements and dimensions for major rooms. Show a North arrow and indicate wall thickness accurately."\n\nPlot Details:\n${plotDetails.join('\n')}\nClimate: ${climate}.\n\nConstraints:\n${vastuConstraint}\n2. The layout must be practical and livable.\n3. All elements must be drawn to scale within the provided boundary.\n4. CRITICAL: The overall outer dimensions of the plot are EXACTLY ${length} ft by ${breadth} ft. You MUST annotate the outer boundary walls with these exact dimensions (${length}' x ${breadth}'). Ensure all internal room dimensions are mathematically consistent with this total size.`;

  const result = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'image/png',
            data: plotSvgBase64,
          },
        },
        {
          text,
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1",
      },
    },
  });

  let textResponse = '';
  if (result.candidates && result.candidates[0] && result.candidates[0].content && result.candidates[0].content.parts) {
    for (const part of result.candidates[0].content.parts) {
      if (part.inlineData) {
        return part.inlineData.data;
      } else if (part.text) {
        textResponse += part.text;
      }
    }
  }
  throw new Error(`Floor plan image generation failed. Model returned: ${textResponse || 'No image data'}`);
}

export async function generateConstructionDetailsImage(climate: string): Promise<string> {
  const result = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          text: `A professional architectural cross-section diagram showing a house foundation, wall, and roof. Black and white line drawing.`,
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1",
      },
    },
  });

  let textResponse = '';
  if (result.candidates && result.candidates[0] && result.candidates[0].content && result.candidates[0].content.parts) {
    for (const part of result.candidates[0].content.parts) {
      if (part.inlineData) {
        return part.inlineData.data;
      } else if (part.text) {
        textResponse += part.text;
      }
    }
  }
  throw new Error(`Construction details image generation failed. Model returned: ${textResponse || 'No image data'}`);
}

export async function generateReportCsv(reportText: string): Promise<string> {
  const result = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Summarize the key data from the following construction report into a valid CSV format. The columns must strictly be: 'Category', 'Item', 'Quantity', 'Unit', 'Notes'. Extract all material estimates and key recommendations. Do not include the header row in the output. Ensure fields containing commas are enclosed in double quotes.\n\nReport:\n---\n${reportText}`,
  });
  return result.text?.trim() ?? '';
}

export async function getEstimatedCost(engineeringReport: string, budget: string): Promise<string> {
  const result = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Based on the following engineering report and a ${budget} budget, provide a detailed estimated construction cost breakdown in Indian Rupees (INR). Consider current material and labor costs in India for this budget range. Use appropriate Markdown hierarchy (H3, H4), bold text, and bullet points or tables for readability. Include a clear 'Total Estimated Cost' at the end.\n\nReport:\n---\n${engineeringReport}`,
  });
  return result.text?.trim() ?? 'Not available';
}

export async function getEngineeringReport(climate: string, length: string, breadth: string, budget: string, vastuCompliant: boolean): Promise<string> {
  const vastuSection = vastuCompliant ? `\n\n    ## **4. Vastu Shastra Compliance**\n    - Detail how the design adheres to Vastu principles.\n      - Explain the placement of key rooms (Entrance, Kitchen, Master Bedroom, Pooja Room) according to Vastu.` : '';

  const result = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate a detailed and well-structured construction report in Markdown format for a residential building of size ${length} ft x ${breadth} ft in a ${climate} climate with a ${budget} budget. The total area is ${parseInt(length) * parseInt(breadth)} sqft. The report must be clear, professional, and easy to read. 

    CRITICAL INSTRUCTION: EVERY SINGLE SECTION below must be formatted strictly as a hierarchical list using points and subpoints. DO NOT use paragraphs, and DO NOT use tables anywhere in the report. Use bold text for emphasis.

    The report should include the following sections:

    # **Construction & Engineering Report**

    ## **Executive Summary**
    - Project Overview
      - Plot dimensions
      - Climate zone
    - Key Recommendations
      - Primary architectural strategy
      - Primary structural strategy

    ## **1. Architectural & Climatic Recommendations**
    - Design Recommendations
      - Specific design choices based on the ${climate} climate
      - Specific design choices based on the ${budget} budget
    - Material Recommendations
      - Recommended materials based on climate and budget
    - Technological & Sustainable Additions
      - Sustainable practices that can be incorporated within this budget
      - Technological additions to make the design environmentally responsive

    ## **2. Civil Engineering (Material Estimates)**
    - Foundation
      - Material 1: Estimated quantity and notes
      - Material 2: Estimated quantity and notes
    - Superstructure
      - Cement: Calculate estimate (0.45 bags/sqft) and notes
      - Steel: Calculate estimate (4kg/sqft) and notes
      - Bricks: Calculate estimate (12k per 1000sqft) and notes
    - Finishing
      - Material 1: Estimated quantity and notes
      - Material 2: Estimated quantity and notes

    ## **3. Electrical Engineering (Power Plan)**
    - Estimated Electrical Load
      - Summary of load requirements
    - Circuit Recommendations
      - Key circuit strategies
    - Safety Recommendations
      - Key safety measures${vastuSection}
    `,
  });
  return result.text ?? '';
}

export async function translateReport(text: string, language: string): Promise<string> {
  const result = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Translate the following construction report into ${language}. Preserve the Markdown formatting.\n\nReport:\n---\n${text}`,
  });
  return result.text ?? '';
}

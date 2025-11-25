import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIResponse } from '@/types/schema';

const SYSTEM_PROMPT = `You are the 'Answer Architect'. Your goal is to structure exam answers into clear, learnable points.

Rules:
1. Analyze the user's question and the 'Marks' value (2-15).
2. Marks < 5: Create a simple linear flow (3-4 nodes).
3. Marks >= 8: Create a comprehensive, deep tree. You MUST generate at least 12-15 nodes. Break down every main concept into sub-components, and those sub-components into specific details or examples. The content must be sufficient for a full essay.
4. Identify the Command Word:
   - 'Difference/Compare/Differentiate' -> Use layout_type: 'split'.
     * Structure: Root -> Subject A & Subject B -> Specific Points (Leaves).
     * CRITICAL: For 'Difference' questions, the leaf nodes MUST contain the actual differences as complete, concise sentences (e.g., "OLTP is for transactions", "OLAP is for analysis"). Do not just write headers like "Definition".
   - 'Process/Steps' -> Use layout_type: 'linear'.
   - 'Analyze/Discuss' -> Use layout_type: 'radial'.
5. For the 'keywords' field: Provide 2-3 critical terms per node that the student MUST write to get marks.
6. For the 'details' field: Provide 3-4 detailed, high-density facts, definitions, or steps that expand on the label. Ensure the content is academic and rigorous.
7. For the 'exam_tip' field: Provide a short "Pro Tip" for scoring marks (e.g., "Mention this keyword to get 1 mark").
8. Output purely valid JSON matching the schema.`;

export const generateMindMap = async (question: string, marks: number, apiKey: string, modelName: string = 'gemini-1.5-flash'): Promise<AIResponse> => {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ 
    model: modelName,
    generationConfig: { responseMimeType: "application/json" }
  });

  const prompt = `
    ${SYSTEM_PROMPT}
    
    User Question: "${question}"
    Marks: ${marks}
    
    IMPORTANT: The user has requested a detailed answer suitable for ${marks} marks. Ensure the depth and quantity of nodes reflects this.
    
    Output JSON matching this schema:
    {
      layout_type: "split" | "linear" | "radial";
      root_node: { label: string; note?: string; };
      branches: {
        id: string;
        label: string;
        parent_id: string;
        keywords: string[];
        details: string[];
        exam_tip: string;
        type: "main_point" | "sub_point" | "example";
      }[];
    }
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  
  try {
    return JSON.parse(text) as AIResponse;
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    throw new Error("Invalid JSON response from Gemini");
  }
};

export const validateApiKey = async (apiKey: string): Promise<string | null> => {
    // Method 1: Try to list models dynamically via REST API
    try {
        console.log("Fetching available models...");
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        
        if (response.ok) {
            const data = await response.json();
            const models = data.models || [];
            console.log("Available models:", models.map((m: any) => m.name));
            
            // Prioritize Gemini 1.5 Flash, then Pro, then others
            const preferredOrder = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];
            
            // Filter for models that support generateContent
            const contentModels = models.filter((m: any) => 
                m.supportedGenerationMethods?.includes('generateContent')
            );

            // Try to find a preferred model first
            for (const pref of preferredOrder) {
                const found = contentModels.find((m: any) => m.name.includes(pref));
                if (found) {
                    const modelName = found.name.replace('models/', '');
                    console.log(`Selected preferred model: ${modelName}`);
                    return modelName;
                }
            }

            // Fallback to any valid Gemini model
            const anyGemini = contentModels.find((m: any) => m.name.includes('gemini'));
            if (anyGemini) {
                const modelName = anyGemini.name.replace('models/', '');
                console.log(`Selected fallback model: ${modelName}`);
                return modelName;
            }
        } else {
            console.warn("List models failed:", response.status, response.statusText);
        }
    } catch (e) {
        console.warn("Failed to list models, falling back to manual trial", e);
    }

    // Method 2: Fallback to manual trial if listModels fails
    const modelsToTry = [
        'gemini-1.5-flash', 
        'gemini-1.5-flash-latest',
        'gemini-1.5-flash-001',
        'gemini-1.5-flash-8b',
        'gemini-1.5-pro', 
        'gemini-1.5-pro-latest',
        'gemini-1.5-pro-001',
        'gemini-pro',
        'gemini-1.0-pro'
    ];
    
    const genAI = new GoogleGenerativeAI(apiKey);

    for (const modelName of modelsToTry) {
        try {
            console.log(`Validating with model: ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent('Hi');
            const response = await result.response;
            console.log(`Validation successful with ${modelName}:`, response.text());
            return modelName;
        } catch (e) {
            console.warn(`Validation failed for ${modelName}`, e);
        }
    }
    return null;
}

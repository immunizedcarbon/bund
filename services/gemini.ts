import { GoogleGenAI } from "@google/genai";
import { RESOURCE_CONFIG } from '../constants';
import { GeminiSearchResult, ResourceType } from "../types";

let currentApiKey: string | undefined =
  (typeof process !== 'undefined' && (process.env.GEMINI_API_KEY || process.env.API_KEY)) ||
  undefined;

let ai: GoogleGenAI | null = currentApiKey
  ? new GoogleGenAI({ apiKey: currentApiKey })
  : null;

export const setGeminiApiKey = (key: string) => {
  currentApiKey = key;
  ai = new GoogleGenAI({ apiKey: key });
};

const systemInstruction = `You are a helpful assistant for the German Parliament's (Bundestag) DIP API. Your task is to convert a user's natural language query into a structured JSON object that can be used to query the API.

Here are the available resource types and their filters:
${JSON.stringify(RESOURCE_CONFIG, null, 2)}

**Rules:**
1. The output MUST be a single, valid JSON object and nothing else.
2. The JSON object must have two top-level keys: "resourceType" and "filters".
3. "resourceType" must be one of the following values: '${Object.values(ResourceType).join("', '")}'. Choose the one that best fits the user's query. For queries asking for full text, prefer the '-text' versions (e.g., 'drucksache-text'). If the query is about people, use 'person'. For processes/initiatives, use 'vorgang'. For documents, use 'drucksache' or 'plenarprotokoll'. For actions like speeches, use 'aktivitaet'.
4. "filters" must be an object where keys are the filter names (e.g., 'f.titel', 'f.wahlperiode') and values are the search terms.
5. For filters of type 'textarea' in the config, the value in the output JSON should be an array of strings, as they can accept multiple values. For all other filter types, the value should be a single string or number.
6. If a user's query doesn't map to a specific filter, omit that filter. Do not invent filters or values.
7. Only use filters that are listed for the chosen resourceType.
8. If the user's query is ambiguous or doesn't seem related to parliamentary documents, return a JSON object with a valid but empty filters object: \`{"resourceType": "vorgang", "filters": {}}\`.

**Example User Query:** 'Zeige mir alle Gesetzesvorhaben zum Thema Klimaschutz in der 19. Wahlperiode.'
**Example JSON Output:**
\`\`\`json
{
  "resourceType": "vorgang",
  "filters": {
    "f.vorgangstyp": ["Gesetzgebung"],
    "f.deskriptor": ["Klimaschutz"],
    "f.wahlperiode": 19
  }
}
\`\`\`

Now, process the user's query.
`;

export const generateSearchParameters = async (query: string): Promise<GeminiSearchResult> => {
    if (!ai) {
        throw new Error('Gemini API-Key fehlt. Bitte geben Sie einen gültigen Schlüssel ein.');
    }
    if (!query) {
        // Return a default empty state if the query is empty
        return {
            resourceType: ResourceType.VORGANG,
            filters: {}
        };
    }
    
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-04-17",
        contents: query,
        config: {
            systemInstruction: systemInstruction,
            responseMimeType: "application/json",
            temperature: 0.1,
        }
    });
    
    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
        jsonStr = match[2].trim();
    }

    try {
        const parsedData = JSON.parse(jsonStr);
        if (parsedData.resourceType && parsedData.filters && typeof parsedData.filters === 'object') {
            return parsedData;
        }
        throw new Error("Invalid JSON structure from AI.");
    } catch (e) {
        console.error("Failed to parse JSON response from AI:", e, "\nReceived text:", response.text);
        throw new Error("Die KI-Antwort konnte nicht verarbeitet werden. Bitte versuchen Sie es anders formuliert.");
    }
};

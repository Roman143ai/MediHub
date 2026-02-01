
import { GoogleGenAI, Type } from "@google/genai";
import { PatientProfile, MedicalCase } from "../types";

const cleanJsonString = (str: string) => {
  // Remove markdown code blocks if present
  return str.replace(/```json/g, "").replace(/```/g, "").trim();
};

export const generatePrescription = async (
  profile: PatientProfile,
  medicalCase: MedicalCase
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Generate a professional medical prescription for a patient in Bangladesh. 
    The response MUST be in strictly valid JSON format.
    
    Patient Info:
    - Name: ${profile.name}, Age: ${profile.age}, Gender: ${profile.gender}
    - Symptoms: ${medicalCase.selectedSymptoms.map(s => `${s.name} (${s.intensity})`).join(', ')}
    - Custom Symptoms: ${medicalCase.customSymptoms}
    - Vitals: BP: ${medicalCase.vitals.bp}, Pulse: ${medicalCase.vitals.pulse}, Temp: ${medicalCase.vitals.temp}, Weight: ${medicalCase.vitals.weight}
    - Medical History: ${medicalCase.selectedHistories.join(', ')} | ${medicalCase.customHistory}
    - Current Medications: ${medicalCase.currentMedications.map(m => `${m.name} (${m.dosage})`).join(', ')}
    
    Instructions:
    1. diagnosis: Clear diagnosis in English with Bengali translation.
    2. medications: 
       - name: Format MUST be "English Name (Bengali Name)", e.g., "Napa (নাপা)".
       - genericName: The chemical name.
       - dosage: Format like "1+0+1" with instruction (e.g. "খাবারের পর").
       - purpose: EXPLAIN in Bengali why this medicine is given (e.g., "জ্বর ও ব্যথার জন্য").
       - duration: How many days (e.g., "৫ দিন").
    3. advice: Detailed lifestyle/health tips in Bengali.
    
    Output must be a single JSON object. Do not include any text outside the JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      config: {
        systemInstruction: "You are a professional Bangladeshi Doctor. You provide medically accurate prescriptions based on symptoms. Output MUST be only valid JSON following the schema. No markdown, no commentary.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            diagnosis: { type: Type.STRING },
            advice: { type: Type.STRING },
            medications: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  genericName: { type: Type.STRING },
                  dosage: { type: Type.STRING },
                  duration: { type: Type.STRING },
                  purpose: { type: Type.STRING }
                },
                required: ["name", "genericName", "dosage", "duration", "purpose"]
              }
            }
          },
          required: ["diagnosis", "advice", "medications"]
        }
      },
      contents: [{ parts: [{ text: prompt }] }],
    });

    const text = response.text || "";
    return JSON.parse(cleanJsonString(text));
  } catch (error) {
    console.error("Prescription Generation Error:", error);
    throw error;
  }
};

export const searchMedicine = async (query: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Search for medicine information in Bangladesh for: "${query}".
    
    Instructions:
    1. If the query is a BRAND name: Identify its generic name, then list at least 5-8 alternative brands.
    2. If the query is a GENERIC name: List major brands.
    3. Prices in BDT (Tk).
    4. Names as "English (Bengali)".
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: "You are a pharmaceutical expert in Bangladesh. Return accurate JSON only.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            genericName: { type: Type.STRING },
            searchType: { type: Type.STRING },
            alternatives: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  company: { type: Type.STRING },
                  price: { type: Type.STRING },
                  strength: { type: Type.STRING }
                },
                required: ["name", "company", "price", "strength"]
              }
            }
          },
          required: ["genericName", "searchType", "alternatives"]
        }
      },
      contents: [{ parts: [{ text: prompt }] }],
    });

    const text = response.text || "";
    return JSON.parse(cleanJsonString(text));
  } catch (error) {
    console.error("Medicine Search Error:", error);
    throw error;
  }
};

export const fetchMarketPrice = async (query: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Find price for: "${query}" in Bangladesh. Return JSON.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: "Pricing expert. Return JSON object with name, generic, company, and prices array.",
        responseMimeType: "application/json"
      },
      contents: [{ parts: [{ text: prompt }] }]
    });
    const text = response.text || "";
    return JSON.parse(cleanJsonString(text));
  } catch (err) {
    console.error("Price lookup error:", err);
    throw err;
  }
};

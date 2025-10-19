import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import db from "./firebaseConfig.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Initialize Gemini AI client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const safeParseJSON = (text) => {
  try {
    return JSON.parse(text);
  } catch (err) {
    console.error("Error parsing AI response:", err);
    return {
      focus_areas: ["Could not determine focus areas"],
      therapy_goals: ["Could not generate goals"],
      activities: [
        { title: "Could not generate title", description: "Could not generate description" },
        { title: "Could not generate title", description: "Could not generate description" }
      ]
    };
  }
};

// Route to handle form submissions
app.post("/api/form-data", async (req, res) => {
  try {
    const { age, eyeContact, speechLevel, socialResponse, sensoryReactions } = req.body;

    if (!age || !eyeContact || !speechLevel || !socialResponse || !sensoryReactions?.length) {
      return res.status(400).json({ error: "All fields are required." });
    }

    console.log("Form data received:", { age, eyeContact, speechLevel, socialResponse, sensoryReactions });

    const prompt = `
Based on this child’s responses, provide:
1. 3 short therapy goals
2. 2 activities with title and description
3. Focus areas for improvement (keywords like 'Speech Delay', 'Poor Eye Contact', 'Sensory Sensitivity')

Child details:
Age: ${age}
Eye Contact: ${eyeContact}
Speech Level: ${speechLevel}
Social Response: ${socialResponse}
Sensory Reactions: ${sensoryReactions.join(", ")}

ONLY RETURN RAW JSON, do NOT include any markdown formatting or code blocks.
Format:
{
  "focus_areas": ["Focus Area 1","Focus Area 2"],
  "therapy_goals": ["Goal 1","Goal 2","Goal 3"],
  "activities": [
    {"title": "Activity 1 heading", "description": "Activity 1 description"},
    {"title": "Activity 2 heading", "description": "Activity 2 description"}
  ]
}
`;

    // Call Gemini AI
    const aiResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    let aiText = aiResponse.text?.trim() || "";
    console.log("AI raw text:", aiText);

    aiText = aiText.replace(/```json/g, "").replace(/```/g, "").trim();

    const parsedData = safeParseJSON(aiText);

    await db.collection("formResponses").add({
      age,
      eyeContact,
      speechLevel,
      socialResponse,
      sensoryReactions,
      aiOutput: parsedData,
      createdAt: new Date(),
    });

    // Send data to frontend
    res.json(parsedData);

  } catch (error) {
    console.error("Error in AI processing:", error);
    res.status(500).json({ error: "AI processing failed" });
  }
});

app.listen(PORT, () => {
  console.log(` Server running on http://localhost:${PORT}`);
});

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Check API key
console.log("API KEY LOADED:", !!process.env.GEMINI_API_KEY);

if (!process.env.GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY is missing in .env file");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post("/interview", async (req, res) => {
  try {
    console.log("REQUEST BODY:", req.body);

    const { message, role, company, round } = req.body;

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const prompt = `
You are an AI interviewer.

Role: ${role}
Company: ${company}
Round: ${round}

Candidate answer: ${message}

Instructions:
- Give feedback
- Ask a relevant next interview question
- Keep response short and professional
`;

    const result = await model.generateContent(prompt);

    // ✅ SAFE RESPONSE HANDLING (IMPORTANT FIX)
    const response = result?.response;
    const text = response?.text?.();

    console.log("AI RESPONSE:", text);

    return res.json({
      reply: text || "No response from AI",
    });

  } catch (error) {
    console.error("❌ GEMINI ERROR:", error);

    return res.status(500).json({
      reply: "AI failed. Check backend logs.",
    });
  }
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});

app.get("/", (req, res) => {
  res.send("Interview AI Backend is running 🚀");
});
import { GoogleGenAI, Type } from "@google/genai";
import { InterviewSession, Feedback } from "../types";
import { COMPANIES, ROLES, ROUNDS } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateInterviewIntro(session: InterviewSession) {
  const company = COMPANIES.find(c => c.id === session.companyId)?.name;
  const role = ROLES.find(r => r.id === session.roleId)?.name;
  const round = ROUNDS.find(r => r.id === session.roundId)?.name;

  const prompt = `You are a senior interviewer at ${company}. 
  You are interviewing a candidate for the position of ${role}. 
  This is the ${round} round.
  
  Start the interview by introducing yourself briefly (make up a name or just professional title) and then ask the first question. 
  Keep it professional and realistic to how ${company} conducts interviews.
  Do not provide all questions at once. Only ask the first one.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
  });

  return response.text || "Hello! I'll be your interviewer today. Let's get started. Tell me about yourself?";
}

export async function getNextInterviewResponse(session: InterviewSession) {
  const company = COMPANIES.find(c => c.id === session.companyId)?.name;
  const role = ROLES.find(r => r.id === session.roleId)?.name;
  const round = ROUNDS.find(r => r.id === session.roundId)?.name;

  const systemInstruction = `You are a senior interviewer at ${company} for a ${role} position. 
  This is the ${round} round. 
  Conduct the interview naturally. Ask follow-up questions, dive deeper into technical concepts, and evaluate the candidate's responses.
  Be professional, slightly challenging but fair. 
  If it's a coding round, you can provide a problem and ask them to explain their logic.
  If it's a behavioral round, use the STAR methodology where appropriate.
  
  Maintain the context of the conversation.`;

  const history = session.messages.map(m => ({
    role: m.role,
    parts: [{ text: m.content }]
  }));

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: history,
    config: {
      systemInstruction,
    }
  });

  return response.text || "I'm sorry, I missed that. Could you repeat?";
}

export async function generateFeedback(session: InterviewSession): Promise<Feedback> {
  const company = COMPANIES.find(c => c.id === session.companyId)?.name;
  const role = ROLES.find(r => r.id === session.roleId)?.name;
  const round = ROUNDS.find(r => r.id === session.roundId)?.name;

  const prompt = `Analyze the following interview transcript and provide constructive feedback. 
  Company: ${company}
  Role: ${role}
  Round: ${round}

  Transcript:
  ${session.messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n')}

  Return the feedback in JSON format strictly following this schema:
  {
    "overallScore": number (0-100),
    "technicalSkillsScore": number (0-100),
    "communicationScore": number (0-100),
    "summary": "Short summary of performance",
    "strengths": ["STRENGTH_1", "STRENGTH_2"],
    "improvements": ["IMPROVEMENT_1", "IMPROVEMENT_2"],
    "sampleGoodAnswer": "Provide a sample answer for a question they struggled with"
  }`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          overallScore: { type: Type.NUMBER },
          technicalSkillsScore: { type: Type.NUMBER },
          communicationScore: { type: Type.NUMBER },
          summary: { type: Type.STRING },
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
          sampleGoodAnswer: { type: Type.STRING },
        },
        required: ["overallScore", "technicalSkillsScore", "communicationScore", "summary", "strengths", "improvements"]
      }
    }
  });

  try {
    return JSON.parse(response.text || "{}");
  } catch (e) {
    throw new Error("Failed to parse feedback from AI");
  }
}


export type InterviewStatus = 'setup' | 'interviewing' | 'feedback';

export interface Message {
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export interface InterviewSession {
  companyId: string;
  roleId: string;
  roundId: string;
  messages: Message[];
}

export interface Feedback {
  overallScore: number;
  technicalSkillsScore: number;
  communicationScore: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  sampleGoodAnswer?: string;
}

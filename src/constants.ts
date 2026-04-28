
export interface Company {
  id: string;
  name: string;
  logo: string; // Tailwind color or icon reference
}

export interface Role {
  id: string;
  name: string;
  description: string;
}

export interface Round {
  id: string;
  name: string;
  description: string;
}

export const COMPANIES: Company[] = [
  { id: 'google', name: 'Google', logo: 'bg-gradient-to-br from-blue-500 via-red-500 to-yellow-500' },
  { id: 'meta', name: 'Meta', logo: 'bg-blue-600' },
  { id: 'amazon', name: 'Amazon', logo: 'bg-orange-500' },
  { id: 'microsoft', name: 'Microsoft', logo: 'bg-blue-400' },
  { id: 'nvidia', name: 'NVIDIA', logo: 'bg-emerald-600' },
  { id: 'openai', name: 'OpenAI', logo: 'bg-slate-900' },
  { id: 'atlassian', name: 'Atlassian', logo: 'bg-blue-700' },
  { id: 'startup', name: 'Stealth Startup', logo: 'bg-zinc-800' },
];

export const ROLES: Role[] = [
  { id: 'sde', name: 'Software Development Engineer', description: 'Focus on algorithms, data structures, and system design.' },
  { id: 'ai-eng', name: 'AI/ML Engineer', description: 'Focus on model architecture, training loops, and deployment.' },
  { id: 'ds', name: 'Data Scientist', description: 'Focus on statistics, SQL, modeling, and business insights.' },
  { id: 'frontend', name: 'Frontend Engineer', description: 'Focus on UI/UX, React, performance, and accessibility.' },
  { id: 'backend', name: 'Backend Engineer', description: 'Focus on distributed systems, databases, and APIs.' },
];

export const ROUNDS: Round[] = [
  { id: 'coding', name: 'Coding & Algorithms', description: 'DSA, LeetCode style problems, and complexity analysis.' },
  { id: 'sys-design', name: 'System Design', description: 'Scalability, architecture, and high-level components.' },
  { id: 'ml-theory', name: 'ML Theory & Design', description: 'Architectural choices, optimization, and ML metrics.' },
  { id: 'behavioral', name: 'Behavioral / HR', description: 'Past experiences, conflict resolution, and leadership.' },
  { id: 'technical-deep-dive', name: 'Technical Deep Dive', description: 'In-depth discussion about your specific projects.' },
];

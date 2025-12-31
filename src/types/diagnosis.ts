import { Problem } from './knowledge_base';

export interface SymptomInput {
    name: string; // The symptom ID or key, e.g., "yellow_leaves"
    source: 'user' | 'image_analysis' | 'sensor'; // Where did this symptom come from?
}

export interface DiagnosisInput {
    plantId: string;
    plantConfidence: number; // 0 to 1
    symptoms: SymptomInput[];
}

export interface DiagnosisResult {
    problem: Problem;
    confidence: number; // 0 to 1
    reasons: string[]; // Human-readable reasons for this result
}

import { DiagnosisResult } from '../types/diagnosis';

export class ExplanationService {
    /**
     * Generates a human-readable explanation for a diagnosis.
     *
     * @param result The diagnosis result to explain
     * @param _context Additional context (e.g., retrieved knowledge chunks) - TODO: Use for RAG
     * @returns A string explanation
     */
    public generateExplanation(result: DiagnosisResult, _context?: any): string {
        // TODO: Integrate LLM here.
        // 1. Construct prompt with diagnosis reasons and provided context.
        // 2. Call LLM API.
        // 3. Return generated text.

        // Templated Fallback
        const symptomList = result.reasons
            .filter((r) => r.startsWith('Matches symptom:'))
            .map((r) => r.replace('Matches symptom: ', '').replace(/"/g, ''))
            .join(', ');

        const baseReason = result.reasons.find((r) =>
            r.includes('Common issue')
        );

        let explanation = `We detected ${result.problem.name} (${Math.round(
            result.confidence * 100
        )}% match). `;

        if (symptomList) {
            explanation += `This was indicated by the following symptoms: ${symptomList}. `;
        }

        if (baseReason) {
            explanation += `Additionally, it is a common issue for this type of plant. `;
        }

        explanation += `\n\nTypical treatment involves: ${result.problem.description}`;

        return explanation;
    }
}

import { DiagnosisInput, DiagnosisResult } from '../types/diagnosis';
import { Problem, PlantProblemMatrix } from '../types/knowledge_base';
import problemsData from '../data/problems.json';
import matrixData from '../data/plant_problem_matrix.json';

// Cast data to typed arrays
const defaultProblems: Problem[] = problemsData as Problem[];
const defaultMatrix: PlantProblemMatrix[] = matrixData as PlantProblemMatrix[];

export class DiagnosisEngine {
    private problems: Problem[];
    private matrix: PlantProblemMatrix[];

    constructor(
        problems: Problem[] = defaultProblems,
        matrix: PlantProblemMatrix[] = defaultMatrix
    ) {
        this.problems = problems;
        this.matrix = matrix;
    }

    /**
     * Deterministic diagnosis scoring.
     * Logic:
     * 1. Check Matrix: If plant is susceptible, give base score.
     * 2. Check Symptoms: Calculate overlap (Jaccard-like or coverage).
     * 3. Penalize: (Placeholder for now)
     * 4. Clamp & Rank.
     */
    public diagnosePlant(input: DiagnosisInput): DiagnosisResult[] {
        const results: DiagnosisResult[] = [];

        // 1. Identify Susceptible Problems for this Plant
        const plantMatrix = this.matrix.find((m) => m.plant_id === input.plantId);
        const susceptibleIds = new Set(plantMatrix?.susceptible_problems || []);

        for (const problem of this.problems) {
            let score = 0;
            const reasons: string[] = [];

            // --- FACTOR 1: Base Susceptibility (Matrix) ---
            // If the plant is known to have this problem, start with a boost.
            // Weighted by plantConfidence (if we aren't sure it's a Monstera, we trust the matrix less).
            const isSusceptible = susceptibleIds.has(problem.id);
            if (isSusceptible) {
                const matrixBoost = 0.2 * input.plantConfidence;
                score += matrixBoost;
                reasons.push('Common issue for this plant species');
            }

            // --- FACTOR 2: Symptom Matching ---
            const problemSymptoms = new Set(problem.common_symptoms);
            let matchCount = 0;
            // const contradictionCount = 0;

            for (const inputSymptom of input.symptoms) {
                if (problemSymptoms.has(inputSymptom.name)) {
                    matchCount++;
                    reasons.push(`Matches symptom: "${inputSymptom.name}"`);
                } else {
                    // If we had explicit contradictions, we would check here.
                    // For now, non-matches just don't add to the score.
                }
            }

            // Calculate coverage: How many of the PROBABLE symptoms are present?
            // Avoid division by zero
            const totalProblemSymptoms = problem.common_symptoms.length;
            if (totalProblemSymptoms > 0) {
                const coverageRatio = matchCount / totalProblemSymptoms;
                // Weight coverage heavily (e.g., 0.6 of total score)
                score += coverageRatio * 0.6;
            }

            // Calculate precision: How many of the USER's symptoms are explained?
            if (input.symptoms.length > 0) {
                const precisionRatio = matchCount / input.symptoms.length;
                // Weight precision (e.g., 0.2 of total score)
                score += precisionRatio * 0.2;
            }

            // --- Final Clamp ---
            score = Math.min(Math.max(score, 0), 1);

            // Only return relevant results (some score threshold, e.g., > 0)
            if (score > 0) {
                results.push({
                    problem,
                    confidence: parseFloat(score.toFixed(2)), // Clean float
                    reasons,
                });
            }
        }

        // Sort by confidence descending
        return results.sort((a, b) => b.confidence - a.confidence);
    }
}

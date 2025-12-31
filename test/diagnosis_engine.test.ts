import { describe, it, expect } from 'vitest';
import { createDiagnosisService } from '../src/services/diagnosis_engine';
import { Problem, PlantProblemMatrix } from '../src/types/knowledge_base';
import { DiagnosisInput } from '../src/types/diagnosis';

// Mock Data
const MOCK_PROBLEMS: Problem[] = [
    {
        id: 'prob_root_rot',
        name: 'Root Rot',
        type: 'disease',
        description: 'Rotting roots',
        common_symptoms: ['yellow_leaves', 'wet_soil', 'mushy_roots'],
    },
    {
        id: 'prob_underwatering',
        name: 'Underwatering',
        type: 'environmental',
        description: 'Not enough water',
        common_symptoms: ['yellow_leaves', 'dry_soil', 'drooping'],
    },
];

const MOCK_MATRIX: PlantProblemMatrix[] = [
    {
        plant_id: 'plant_1',
        susceptible_problems: ['prob_root_rot'], // Susceptible to rot, not underwatering
    },
];

describe('DiagnosisEngine', () => {
    const diagnosisService = createDiagnosisService(MOCK_PROBLEMS, MOCK_MATRIX);

    it('SCENARIO 1: Clear Overwatering (Matrix boost + High Overlap)', () => {
        const input: DiagnosisInput = {
            plantId: 'plant_1',
            plantConfidence: 1.0,
            symptoms: [
                { name: 'yellow_leaves', source: 'user' },
                { name: 'wet_soil', source: 'user' },
                { name: 'mushy_roots', source: 'user' },
            ],
        };

        const results = diagnosisService.diagnose(input);

        expect(results.length).toBeGreaterThan(0);
        const topResult = results[0];

        // Root Rot should be #1 because of Matrix match AND 3/3 symptom match
        expect(topResult.problem.id).toBe('prob_root_rot');
        expect(topResult.confidence).toBeGreaterThan(0.8);
        expect(topResult.reasons).toContain('Common issue for this plant species');
    });

    it('SCENARIO 2: Conflicting Symptoms (Discriminator check)', () => {
        const input: DiagnosisInput = {
            plantId: 'plant_1',
            plantConfidence: 1.0,
            symptoms: [
                { name: 'yellow_leaves', source: 'user' },
                { name: 'dry_soil', source: 'user' }, // Matches Underwatering, NOT Rot
            ],
        };

        const results = diagnosisService.diagnose(input);

        const underwatering = results.find(
            (r) => r.problem.id === 'prob_underwatering'
        );
        expect(underwatering).toBeDefined();

        // Ensure we are getting sensible scores
        expect(underwatering?.confidence).toBeGreaterThan(0);
    });

    it('SCENARIO 3: Low Confidence Input', () => {
        const input: DiagnosisInput = {
            plantId: 'plant_unknown', // Not in matrix
            plantConfidence: 0.1,
            symptoms: [{ name: 'yellow_leaves', source: 'user' }],
        };

        const results = diagnosisService.diagnose(input);

        // Should get matches based purely on symptoms
        expect(results.length).toBeGreaterThan(0);
        // Since 'yellow_leaves' is in both, both likely return.
    });
});

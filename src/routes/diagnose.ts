import Router from 'koa-router';
import { z } from 'zod'; // zod is installed
import crypto from 'crypto';
import { createDiagnosisService } from '../services/diagnosis_engine';
import { generateExplanation } from '../services/explanation_service';
import { run } from '../db';

const router = new Router();
const diagnosisService = createDiagnosisService();

// Input Validation Schema
const DiagnosisRequestSchema = z.object({
    plantId: z.string(),
    plantConfidence: z.number().min(0).max(1),
    symptoms: z.array(
        z.object({
            name: z.string(),
            source: z.enum(['user', 'image_analysis', 'sensor']),
        })
    ),
    imagePath: z.string().optional(),
});

router.post('/diagnose', async (ctx) => {
    // 1. Validate Input
    const parseResult = DiagnosisRequestSchema.safeParse(ctx.request.body);
    console.log('Parse Result => ', parseResult);
    if (!parseResult.success) {
        ctx.status = 400;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ctx.body = { error: 'Invalid input', details: (parseResult as any).error.errors };
        return;
    }

    const { plantId, plantConfidence, symptoms, imagePath } = parseResult.data;

    // 2. Run Diagnosis
    const results = diagnosisService.diagnose({
        plantId,
        plantConfidence,
        symptoms,
    });

    // 3. Persist to DB
    const sessionId = crypto.randomUUID();

    // Create Session
    run('INSERT INTO diagnosis_sessions (id) VALUES (?)', [sessionId]);

    // Log Inputs
    run(
        'INSERT INTO diagnosis_inputs (id, session_id, input_key, input_value) VALUES (?, ?, ?, ?)',
        [crypto.randomUUID(), sessionId, 'plant_id', plantId]
    );
    run(
        'INSERT INTO diagnosis_inputs (id, session_id, input_key, input_value) VALUES (?, ?, ?, ?)',
        [crypto.randomUUID(), sessionId, 'plant_confidence', plantConfidence.toString()]
    );
    if (imagePath) {
        run(
            'INSERT INTO diagnosis_inputs (id, session_id, input_key, input_value) VALUES (?, ?, ?, ?)',
            [crypto.randomUUID(), sessionId, 'image_path', imagePath]
        );
    }
    // Log Symptoms individually
    symptoms.forEach((sym) => {
        run(
            'INSERT INTO diagnosis_inputs (id, session_id, input_key, input_value) VALUES (?, ?, ?, ?)',
            [crypto.randomUUID(), sessionId, 'symptom', JSON.stringify(sym)]
        );
    });

    // Log Outputs & Generate Explanations
    const resultsWithExplanation = results.map((res) => {
        // Generate explanation using the service
        const explanation = generateExplanation(res);

        run(
            'INSERT INTO diagnosis_outputs (id, session_id, disease_id, confidence, explanation) VALUES (?, ?, ?, ?, ?)',
            [crypto.randomUUID(), sessionId, res.problem.id, res.confidence, explanation]
        );

        return {
            problem: res.problem,
            confidence: res.confidence,
            reasons: res.reasons,
            explanation,
        };
    });

    // 4. Return Response
    ctx.body = {
        sessionId,
        diagnosis: resultsWithExplanation
    };
});

export default router;

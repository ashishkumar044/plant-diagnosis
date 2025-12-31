export interface Plant {
    id: string;
    common_name: string;
    scientific_name: string;
    family: string;
    hardiness_zone: string;
    ideal_conditions: {
        light: string;
        water_frequency: string;
        humidity_range: string;
        temperature_range: string;
    };
}

export interface Problem {
    id: string;
    name: string;
    type: 'disease' | 'pest' | 'deficiency' | 'environmental';
    description: string;
    common_symptoms: string[]; // List of symptom IDs or keys
}

export interface PlantProblemMatrix {
    plant_id: string;
    susceptible_problems: string[]; // List of Problem IDs
}

export interface TreatmentStep {
    step_number: number;
    description: string;
    duration_minutes?: number;
}

export interface TreatmentPlaybook {
    id: string;
    problem_id: string;
    title: string;
    difficulty: 'easy' | 'medium' | 'hard';
    required_items: string[];
    steps: TreatmentStep[];
}

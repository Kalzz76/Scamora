import { z } from 'zod';

export const createSessionSchema = z.object({
  scenario_id: z.string().min(1, 'Scenario ID wajib diisi.'),
  user_id: z.string().min(1, 'User ID wajib diisi.'),
});

export const submitDecisionSchema = z.object({
  node_id: z.string().min(1, 'Node ID wajib diisi.'),
  option_id: z.string().min(1, 'Option ID wajib diisi.'),
  flags_identified: z.array(z.string()).default([]),
});

export const generateScenarioSchema = z.object({
  category_id: z.string().min(1, 'Category ID wajib diisi.'),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  topic_prompt: z.string().max(300).optional(),
});

export const queryScenariosSchema = z.object({
  category_id: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
});


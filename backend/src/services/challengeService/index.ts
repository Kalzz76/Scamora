import crypto from 'crypto';
import { getSupabaseClient } from '../../config/supabase';
import { isDbConnected, query } from '../../config/db';
import { SEED_CATEGORIES, SEED_SCENARIOS } from '../../data/seedScenarios';
import type {
  ChallengeCategory,
  ChallengeResult,
  ChallengeScenario,
  ChallengeSession,
  DecisionNode,
  DifficultyLevel,
  UserChallengeStatistics,
} from '../../types/challenge';
import { generateScenarioWithGemini } from './geminiScenarioGenerator';

// In-memory state storage (Fallback & caching layer)
const memorySessions = new Map<string, ChallengeSession>();
const memoryResults = new Map<string, ChallengeResult>();
const dynamicScenarios = new Map<string, ChallengeScenario>();

// Prepopulate seed scenarios into dynamic map
for (const s of SEED_SCENARIOS) {
  dynamicScenarios.set(s.id, s);
}

export async function syncScenariosFromDb(): Promise<void> {
  if (!isDbConnected()) return;
  try {
    const res = await query('SELECT * FROM challenge_scenarios ORDER BY created_at ASC');
    if (res && res.rows) {
      for (const row of res.rows) {
        dynamicScenarios.set(row.id, {
          id: row.id,
          categoryId: row.category_id,
          title: row.title,
          difficulty: row.difficulty,
          characterName: row.character_name,
          characterRole: row.character_role,
          characterAvatar: row.character_avatar,
          initialDialogue: typeof row.initial_dialogue === 'string' ? JSON.parse(row.initial_dialogue) : row.initial_dialogue,
          decisionNodes: typeof row.decision_nodes === 'string' ? JSON.parse(row.decision_nodes) : row.decision_nodes,
          redFlags: typeof row.red_flags === 'string' ? JSON.parse(row.red_flags) : row.red_flags,
          learningPoints: typeof row.learning_points === 'string' ? JSON.parse(row.learning_points) : row.learning_points,
          isAiGenerated: row.is_ai_generated || false,
        });
      }
    }
  } catch (err: any) {
    console.warn('[Challenge] syncScenariosFromDb error:', err.message);
  }
}

// Auto sync when connected
setTimeout(() => {
  syncScenariosFromDb().catch(() => {});
}, 1500);

export function listCategories(): ChallengeCategory[] {
  return SEED_CATEGORIES.map((cat) => {
    let count = 0;
    for (const sc of dynamicScenarios.values()) {
      if (sc.categoryId === cat.id) count++;
    }
    return {
      ...cat,
      scenario_count: count,
    };
  });
}

export function listScenarios(
  categoryId?: string,
  difficulty?: DifficultyLevel
): Array<Omit<ChallengeScenario, 'decisionNodes'>> {
  let list = Array.from(dynamicScenarios.values());

  if (categoryId) {
    list = list.filter((s) => s.categoryId === categoryId);
  }
  if (difficulty) {
    list = list.filter((s) => s.difficulty === difficulty);
  }

  return list.map((s) => ({
    id: s.id,
    categoryId: s.categoryId,
    title: s.title,
    difficulty: s.difficulty,
    characterName: s.characterName,
    characterRole: s.characterRole,
    characterAvatar: s.characterAvatar,
    initialDialogue: s.initialDialogue,
    redFlags: s.redFlags,
    learningPoints: s.learningPoints,
    isAiGenerated: s.isAiGenerated,
  }));
}

export function getScenarioById(id: string): ChallengeScenario | null {
  return dynamicScenarios.get(id) || null;
}

export async function generateNewScenario(
  categoryId: string,
  difficulty: DifficultyLevel,
  topicPrompt?: string
): Promise<ChallengeScenario> {
  const scenario = await generateScenarioWithGemini({
    categoryId,
    difficulty,
    topicPrompt,
  });

  dynamicScenarios.set(scenario.id, scenario);

  if (isDbConnected()) {
    query(
      `INSERT INTO challenge_scenarios (
         id, category_id, title, difficulty, character_name, character_role, character_avatar, initial_dialogue, decision_nodes, red_flags, learning_points, is_ai_generated
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, true)
       ON CONFLICT (id) DO UPDATE SET
         title = EXCLUDED.title,
         decision_nodes = EXCLUDED.decision_nodes,
         red_flags = EXCLUDED.red_flags,
         learning_points = EXCLUDED.learning_points`,
      [
        scenario.id,
        scenario.categoryId,
        scenario.title,
        scenario.difficulty,
        scenario.characterName,
        scenario.characterRole,
        scenario.characterAvatar,
        JSON.stringify(scenario.initialDialogue),
        JSON.stringify(scenario.decisionNodes),
        JSON.stringify(scenario.redFlags),
        JSON.stringify(scenario.learningPoints),
      ]
    ).catch(() => {});
  }

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('challenge_scenarios').upsert({
        id: scenario.id,
        category_id: scenario.categoryId,
        title: scenario.title,
        difficulty: scenario.difficulty,
        character_name: scenario.characterName,
        character_role: scenario.characterRole,
        character_avatar: scenario.characterAvatar,
        initial_dialogue: scenario.initialDialogue,
        decision_nodes: scenario.decisionNodes,
        red_flags: scenario.redFlags,
        learning_points: scenario.learningPoints,
      });
    } catch (err) {
      console.warn('Gagal menyimpan skenario ke Supabase:', err);
    }
  }

  return scenario;
}

export async function createSession(
  scenarioId: string,
  userId: string
): Promise<ChallengeSession> {
  const scenario = dynamicScenarios.get(scenarioId);
  if (!scenario) {
    throw new Error('Skenario tidak ditemukan.');
  }

  const sessionId = crypto.randomUUID();
  const now = new Date().toISOString();

  // Initial node is usually 'node_1'
  const startNodeId = 'node_1';

  const newSession: ChallengeSession = {
    id: sessionId,
    userId,
    scenarioId,
    currentNodeId: startNodeId,
    status: 'in_progress',
    messages: [...scenario.initialDialogue],
    history: [],
    detectedRedFlags: [],
    totalScore: 50, // Base starter score
    createdAt: now,
    updatedAt: now,
  };

  memorySessions.set(sessionId, newSession);

  if (isDbConnected()) {
    query(
      `INSERT INTO challenge_sessions (id, user_id, scenario_id, current_node_id, status, history, created_at, updated_at)
       VALUES ($1, $2, $3, $4, 'in_progress', '[]'::jsonb, NOW(), NOW())
       ON CONFLICT (id) DO NOTHING`,
      [sessionId, userId, scenarioId, startNodeId]
    ).catch(() => {});
  }

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase.from('challenge_sessions').insert({
        id: sessionId,
        user_id: userId,
        scenario_id: scenarioId,
        current_node_id: startNodeId,
        status: 'in_progress',
        history: [],
        created_at: now,
        updated_at: now,
      });
    } catch (err) {
      console.warn('Gagal mencatat sesi ke Supabase:', err);
    }
  }

  return newSession;
}

export function getSession(sessionId: string): ChallengeSession | null {
  return memorySessions.get(sessionId) || null;
}

export function getCurrentDecisionNode(session: ChallengeSession): DecisionNode | null {
  if (!session.currentNodeId || session.status !== 'in_progress') {
    return null;
  }
  const scenario = dynamicScenarios.get(session.scenarioId);
  if (!scenario) return null;

  const node = scenario.decisionNodes[session.currentNodeId];
  if (!node) return null;

  // Mask internal scoring and isSafe answers from client view during active session
  return {
    id: node.id,
    prompt: node.prompt,
    options: node.options.map((opt) => ({
      id: opt.id,
      label: opt.label,
      description: opt.description,
      isSafe: false, // Hidden until evaluated
      scoreImpact: 0, // Hidden until evaluated
      nextNodeId: opt.nextNodeId,
      consequenceDialogue: [], // Hidden
      explanation: '', // Hidden
    })),
  };
}

export async function submitDecision(
  sessionId: string,
  nodeId: string,
  optionId: string,
  flagsIdentified: string[] = []
): Promise<{
  session: ChallengeSession;
  result: ChallengeResult | null;
  chosenFeedback: {
    isSafe: boolean;
    explanation: string;
    consequenceMessages: any[];
  };
}> {
  const session = memorySessions.get(sessionId);
  if (!session) {
    throw new Error('Sesi tidak ditemukan.');
  }

  if (session.status !== 'in_progress') {
    throw new Error('Sesi latihan sudah selesai atau dibatalkan.');
  }

  const scenario = dynamicScenarios.get(session.scenarioId);
  if (!scenario) {
    throw new Error('Skenario tidak ditemukan.');
  }

  const node = scenario.decisionNodes[nodeId];
  if (!node) {
    throw new Error('Langkah keputusan tidak valid.');
  }

  const option = node.options.find((o) => o.id === optionId);
  if (!option) {
    throw new Error('Pilihan opsi tidak valid.');
  }

  // Update user score
  session.totalScore = Math.max(0, Math.min(100, session.totalScore + option.scoreImpact));

  // Merge detected red flags
  const newFlags = [...session.detectedRedFlags];
  if (option.redFlagsIdentified) {
    for (const rf of option.redFlagsIdentified) {
      if (!newFlags.includes(rf)) newFlags.push(rf);
    }
  }
  for (const rf of flagsIdentified) {
    if (!newFlags.includes(rf)) newFlags.push(rf);
  }
  session.detectedRedFlags = newFlags;

  // Record user choice message into timeline
  session.messages.push({
    id: `user-msg-${Date.now()}`,
    sender: 'user',
    text: option.label,
    timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
  });

  // Append consequences
  for (const cMsg of option.consequenceDialogue) {
    session.messages.push(cMsg);
  }

  const now = new Date().toISOString();
  session.history.push({
    nodeId,
    chosenOptionId: optionId,
    isSafe: option.isSafe,
    scoreImpact: option.scoreImpact,
    chosenLabel: option.label,
    timestamp: now,
    explanation: option.explanation,
  });

  // Next node or finish
  session.currentNodeId = option.nextNodeId;
  if (!option.nextNodeId) {
    session.status = 'completed';
  }
  session.updatedAt = now;

  let finalResult: ChallengeResult | null = null;
  if (session.status === 'completed') {
    finalResult = buildChallengeResult(session, scenario);
    memoryResults.set(session.id, finalResult);
  }

  if (isDbConnected()) {
    query(
      `UPDATE challenge_sessions SET current_node_id = $1, status = $2, history = $3, updated_at = NOW() WHERE id = $4`,
      [session.currentNodeId, session.status, JSON.stringify(session.history), session.id]
    ).catch(() => {});

    query(
      `INSERT INTO challenge_decisions (id, session_id, node_id, chosen_option_id, is_safe_choice, red_flag_identified, created_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW())`,
      [session.id, nodeId, optionId, option.isSafe, (option.redFlagsIdentified?.length || 0) > 0]
    ).catch(() => {});

    if (finalResult) {
      query(
        `INSERT INTO challenge_results (id, session_id, user_id, scenario_id, score, safety_rating, red_flags_detected_count, red_flags_total_count, feedback_summary, completed_at)
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, NOW())
         ON CONFLICT (session_id) DO UPDATE SET
           score = EXCLUDED.score,
           safety_rating = EXCLUDED.safety_rating,
           feedback_summary = EXCLUDED.feedback_summary`,
        [
          session.id,
          session.userId,
          session.scenarioId,
          finalResult.score,
          finalResult.safetyRating,
          finalResult.redFlagsDetected.length,
          scenario.redFlags.length,
          finalResult.feedbackSummary,
        ]
      ).catch(() => {});
    }
  }

  // Persist to Supabase if available
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      await supabase
        .from('challenge_sessions')
        .update({
          current_node_id: session.currentNodeId,
          status: session.status,
          history: session.history,
          updated_at: now,
        })
        .eq('id', session.id);

      await supabase.from('challenge_decisions').insert({
        session_id: session.id,
        node_id: nodeId,
        chosen_option_id: optionId,
        is_safe_choice: option.isSafe,
        red_flag_identified: (option.redFlagsIdentified?.length || 0) > 0,
      });

      if (finalResult) {
        await supabase.from('challenge_results').insert({
          session_id: session.id,
          user_id: session.userId,
          scenario_id: session.scenarioId,
          score: finalResult.score,
          safety_rating: finalResult.safetyRating,
          red_flags_detected_count: finalResult.redFlagsDetected.length,
          red_flags_total_count: scenario.redFlags.length,
          feedback_summary: finalResult.feedbackSummary,
          completed_at: now,
        });
      }
    } catch (err) {
      console.warn('Gagal menyimpan pembaruan ke Supabase:', err);
    }
  }

  return {
    session,
    result: finalResult,
    chosenFeedback: {
      isSafe: option.isSafe,
      explanation: option.explanation,
      consequenceMessages: option.consequenceDialogue,
    },
  };
}

export function abandonSession(sessionId: string): boolean {
  const session = memorySessions.get(sessionId);
  if (!session) return false;
  session.status = 'abandoned';
  session.updatedAt = new Date().toISOString();

  const supabase = getSupabaseClient();
  if (supabase) {
    Promise.resolve(
      supabase
        .from('challenge_sessions')
        .update({ status: 'abandoned', updated_at: session.updatedAt })
        .eq('id', sessionId)
    ).catch(() => {});
  }
  return true;
}

export function getSessionResult(sessionId: string): ChallengeResult | null {
  const cached = memoryResults.get(sessionId);
  if (cached) return cached;

  const session = memorySessions.get(sessionId);
  if (!session || session.status !== 'completed') return null;

  const scenario = dynamicScenarios.get(session.scenarioId);
  if (!scenario) return null;

  const result = buildChallengeResult(session, scenario);
  memoryResults.set(sessionId, result);
  return result;
}

export function listUserHistory(userId: string): ChallengeResult[] {
  const list: ChallengeResult[] = [];
  for (const res of memoryResults.values()) {
    if (res.userId === userId) {
      list.push(res);
    }
  }
  return list.sort(
    (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  );
}

export function getUserStatistics(userId: string): UserChallengeStatistics {
  const results = listUserHistory(userId);
  if (results.length === 0) {
    return {
      totalAttempts: 0,
      completedAttempts: 0,
      averageScore: 0,
      highestScore: 0,
      guardianBadge: 'Novice Defender',
      strongestArea: 'Belum teruji',
      weakestArea: 'Belum teruji',
    };
  }

  const totalScore = results.reduce((acc, r) => acc + r.score, 0);
  const avg = Math.round(totalScore / results.length);
  const highest = Math.max(...results.map((r) => r.score));

  let badge = 'Novice Defender';
  if (avg >= 85) badge = 'Elite Cyber Guardian 🛡️';
  else if (avg >= 70) badge = 'Senior Security Analyst 🔍';
  else if (avg >= 50) badge = 'Vigilant Defender ⚠️';

  return {
    totalAttempts: results.length,
    completedAttempts: results.length,
    averageScore: avg,
    highestScore: highest,
    guardianBadge: badge,
    strongestArea: 'Identifikasi Ekstensi Berkas & Malware',
    weakestArea: 'Ketahanan terhadap Tekanan Waktu & Urgensi',
  };
}

function buildChallengeResult(
  session: ChallengeSession,
  scenario: ChallengeScenario
): ChallengeResult {
  const score = Math.max(0, Math.min(100, session.totalScore));

  let safetyRating: ChallengeResult['safetyRating'] = 'Rentan Menjadi Korban';
  if (score >= 85) {
    safetyRating = 'Sangat Aman (Cyber Guardian)';
  } else if (score >= 70) {
    safetyRating = 'Waspada & Baik';
  } else if (score >= 50) {
    safetyRating = 'Perlu Waspada Ekstra';
  }

  const redFlagsDetected = scenario.redFlags.filter((rf) =>
    session.detectedRedFlags.includes(rf.id)
  );
  const redFlagsMissed = scenario.redFlags.filter(
    (rf) => !session.detectedRedFlags.includes(rf.id)
  );

  const category = SEED_CATEGORIES.find((c) => c.id === scenario.categoryId);

  const feedbackSummary =
    score >= 70
      ? `Luar biasa! Anda menunjukkan ketelitian tinggi dalam mendeteksi manipulasi pada kasus "${scenario.title}". Refleks keamanan Anda mampu menghentikan serangan rekayasa sosial.`
      : `Anda masih memiliki beberapa celah kerentanan dalam menghadapi intimidasi psikologis atau penyamaran identitas. Pelaku kejahatan siber memanfaatkan kepanikan atau rasa terdesak untuk mengelabui Anda.`;

  return {
    id: `res-${session.id}`,
    sessionId: session.id,
    userId: session.userId,
    scenarioId: scenario.id,
    scenarioTitle: scenario.title,
    difficulty: scenario.difficulty,
    categoryName: category?.name || scenario.categoryId,
    score,
    safetyRating,
    redFlagsDetected,
    redFlagsMissed,
    decisionsSummary: session.history,
    feedbackSummary,
    vulnerabilityAssessment: {
      urgencyResistance: score >= 70 ? 85 : 45,
      authorityResistance: score >= 75 ? 90 : 50,
      greedResistance: score >= 80 ? 90 : 60,
      technicalInspection: redFlagsDetected.length > 0 ? 80 : 30,
      primaryVulnerability:
        score < 60 ? 'Manipulasi Rasa Panik & Batas Waktu Terdesak' : undefined,
    },
    recommendations: scenario.learningPoints,
    completedAt: new Date().toISOString(),
  };
}


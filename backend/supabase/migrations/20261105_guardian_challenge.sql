-- Migration: 20261105_guardian_challenge.sql
-- Description: Schema for Guardian Challenge (AI-Powered Interactive Scam Simulation)

CREATE TABLE IF NOT EXISTS challenge_categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(50) NOT NULL,
    sort_order INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS challenge_scenarios (
    id VARCHAR(100) PRIMARY KEY,
    category_id VARCHAR(50) REFERENCES challenge_categories(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
    character_name VARCHAR(100) NOT NULL,
    character_avatar VARCHAR(255),
    character_role VARCHAR(100),
    initial_dialogue JSONB NOT NULL,
    decision_nodes JSONB NOT NULL,
    red_flags JSONB NOT NULL,
    learning_points JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS challenge_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(100) NOT NULL,
    scenario_id VARCHAR(100) REFERENCES challenge_scenarios(id) ON DELETE CASCADE,
    current_node_id VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('in_progress', 'completed', 'abandoned')),
    history JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS challenge_decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES challenge_sessions(id) ON DELETE CASCADE,
    node_id VARCHAR(50) NOT NULL,
    chosen_option_id VARCHAR(50) NOT NULL,
    is_safe_choice BOOLEAN NOT NULL,
    red_flag_identified BOOLEAN DEFAULT FALSE,
    response_time_seconds INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS challenge_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES challenge_sessions(id) ON DELETE CASCADE UNIQUE,
    user_id VARCHAR(100) NOT NULL,
    scenario_id VARCHAR(100) NOT NULL,
    score INT NOT NULL CHECK (score >= 0 AND score <= 100),
    safety_rating VARCHAR(30) NOT NULL,
    red_flags_detected_count INT NOT NULL,
    red_flags_total_count INT NOT NULL,
    feedback_summary TEXT NOT NULL,
    completed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON challenge_sessions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_results_user ON challenge_results(user_id, completed_at DESC);


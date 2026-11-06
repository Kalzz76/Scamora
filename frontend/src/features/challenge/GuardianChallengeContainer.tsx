import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { challengeService } from '../../services/challengeService';
import type {
  ChallengeCategory,
  ChallengeResult,
  ChallengeScenario,
  ChallengeSession,
  DecisionNode,
  DifficultyLevel,
  UserChallengeStatistics,
} from '../../types/challenge';
import { ChallengeDashboard } from './components/ChallengeDashboard';
import { ChatHeader } from './components/ChatHeader';
import { ChatBubble } from './components/ChatBubble';
import { TypingIndicator } from './components/TypingIndicator';
import { DecisionPanel } from './components/DecisionPanel';
import { RedFlagTracker } from './components/RedFlagTracker';
import { ChallengeResultView } from './components/ChallengeResultView';

export const GuardianChallengeContainer: React.FC = () => {
  const [viewMode, setViewMode] = useState<'dashboard' | 'simulation' | 'result'>('dashboard');

  // Dashboard Data
  const [categories, setCategories] = useState<ChallengeCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('kurir-apk');
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>('easy');
  const [statistics, setStatistics] = useState<UserChallengeStatistics | null>(null);

  // Active Simulation State
  const [activeSession, setActiveSession] = useState<ChallengeSession | null>(null);
  const [activeScenario, setActiveScenario] = useState<ChallengeScenario | null>(null);
  const [currentDecisionNode, setCurrentDecisionNode] = useState<DecisionNode | null>(null);
  const [identifiedFlagIds, setIdentifiedFlagIds] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [lastFeedback, setLastFeedback] = useState<{
    isSafe: boolean;
    explanation: string;
  } | null>(null);

  // Completed Result
  const [finalResult, setFinalResult] = useState<ChallengeResult | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeSession?.messages, isTyping, lastFeedback]);

  // Load Categories & Statistics on mount
  useEffect(() => {
    const initData = async () => {
      try {
        const cats = await challengeService.getCategories();
        setCategories(cats);
        if (cats.length > 0) {
          setSelectedCategoryId(cats[0].id);
        }

        const stats = await challengeService.getUserStatistics();
        setStatistics(stats);
      } catch (err) {
        console.warn('Gagal memuat data tantangan:', err);
      }
    };

    initData();
  }, []);

  // Handle selecting difficulty and immediately generating & starting chat
  const handleSelectDifficultyAndStart = async (diff: DifficultyLevel) => {
    setSelectedDifficulty(diff);
    setIsLoading(true);
    toast.info('tunggu sebentar yahh...');

    try {
      // Generate skenario baru via AI / seed sesuai tingkat kesulitan yang dipilih
      const targetScenario = await challengeService.generateScenario(selectedCategoryId, diff);

      // Langsung buat sesi dan mulai percakapan simulasi chat!
      const data = await challengeService.createSession(targetScenario.id);
      setActiveSession(data.session);
      setActiveScenario(targetScenario);
      setCurrentDecisionNode(data.currentDecisionNode);
      setIdentifiedFlagIds([]);
      setLastFeedback(null);
      setSelectedOptionId(null);
      setViewMode('simulation');

      if (targetScenario.isAiGenerated) {
        toast.success(`Simulasi chat baru berhasil dirancang oleh Gemini AI!`);
      } else {
        toast.info(`Mode kurasi aktif. Pasang GEMINI_API_KEY di backend/.env untuk generate variasi baru via AI.`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Gagal memulai simulasi chat.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Starting a Simulation
  const handleStartSimulation = async () => {
    setIsLoading(true);
    toast.info('tunggu sebentar yahh...');

    try {
      // Selalu generate skenario baru via Gemini AI sesuai kategori & tingkat kesulitan yang dipilih
      const targetScenario = await challengeService.generateScenario(selectedCategoryId, selectedDifficulty);

      const data = await challengeService.createSession(targetScenario.id);
      setActiveSession(data.session);
      setActiveScenario(targetScenario);
      setCurrentDecisionNode(data.currentDecisionNode);
      setIdentifiedFlagIds([]);
      setLastFeedback(null);
      setSelectedOptionId(null);
      setViewMode('simulation');

      if (targetScenario.isAiGenerated) {
        toast.success(`Simulasi chat baru "${targetScenario.title}" dirancang oleh Gemini AI!`);
      } else {
        toast.info(`Mode kurasi aktif. Pasang GEMINI_API_KEY di backend/.env untuk generate variasi baru via AI.`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Gagal memulai simulasi.');
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle user-identified red flags
  const handleToggleFlag = (flagId: string) => {
    if (identifiedFlagIds.includes(flagId)) {
      setIdentifiedFlagIds((prev) => prev.filter((id) => id !== flagId));
    } else {
      setIdentifiedFlagIds((prev) => [...prev, flagId]);
      toast.info('Tanda bahaya ditandai! Pertahankan saat mengambil keputusan.');
    }
  };

  // Submit a decision
  const handleSelectOption = async (optionId: string) => {
    if (!activeSession || !currentDecisionNode) return;
    setSelectedOptionId(optionId);
    setIsLoading(true);

    try {
      const outcome = await challengeService.submitDecision(
        activeSession.id,
        currentDecisionNode.id,
        optionId,
        identifiedFlagIds
      );

      // Show typing indicator briefly before revealing consequence
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setActiveSession(outcome.session);
        setLastFeedback({
          isSafe: outcome.chosenFeedback.isSafe,
          explanation: outcome.chosenFeedback.explanation,
        });

        if (outcome.result) {
          setFinalResult(outcome.result);
        } else {
          setCurrentDecisionNode(outcome.nextDecisionNode);
        }
      }, 1000);
    } catch (err: any) {
      toast.error(err.message || 'Gagal mengirimkan keputusan.');
      setSelectedOptionId(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Continue dialogue after reading feedback
  const handleContinueDialogue = () => {
    setLastFeedback(null);
    setSelectedOptionId(null);

    if (activeSession?.status === 'completed' && finalResult) {
      setViewMode('result');
      // Refresh stats
      challengeService.getUserStatistics().then(setStatistics).catch(() => {});
    }
  };

  // Abandon session
  const handleAbandon = () => {
    if (confirm('Apakah Anda yakin ingin keluar dari sesi simulasi ini? Progres tidak akan disimpan.')) {
      setViewMode('dashboard');
      setActiveSession(null);
      setActiveScenario(null);
      setCurrentDecisionNode(null);
    }
  };

  const handleGenerateAiScenario = async (topicPrompt?: string) => {
    setIsGeneratingAi(true);
    toast.info('tunggu sebentar yahh...');
    try {
      const newScenario = await challengeService.generateScenario(
        selectedCategoryId,
        selectedDifficulty,
        topicPrompt
      );

      // Langsung mulai simulasi chat dengan skenario baru dari AI
      const data = await challengeService.createSession(newScenario.id);
      setActiveSession(data.session);
      setActiveScenario(newScenario);
      setCurrentDecisionNode(data.currentDecisionNode);
      setIdentifiedFlagIds([]);
      setLastFeedback(null);
      setSelectedOptionId(null);
      setViewMode('simulation');

      toast.success(`Skenario baru "${newScenario.title}" berhasil dirancang oleh Gemini AI!`);
    } catch (err: any) {
      toast.error(err.message || 'Gagal merancang skenario via AI.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  return (
    <div className="w-full relative">
      {/* Loading Overlay */}
      {(isLoading || isGeneratingAi) && (
        <div className="fixed inset-0 z-50 bg-black/35 backdrop-blur-[2px] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl px-6 py-5 shadow-2xl flex items-center gap-3.5 border border-surface-container">
            <div className="w-5 h-5 border-2 border-[#143826] border-t-transparent rounded-full animate-spin shrink-0" />
            <span className="text-sm font-bold text-[#143826]">tunggu sebentar yahh...</span>
          </div>
        </div>
      )}
      {viewMode === 'dashboard' && (
        <ChallengeDashboard
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
          selectedDifficulty={selectedDifficulty}
          onSelectDifficulty={handleSelectDifficultyAndStart}
          onStartSimulation={handleStartSimulation}
          onGenerateAiScenario={handleGenerateAiScenario}
          isGeneratingAi={isGeneratingAi}
          statistics={statistics}
          isLoading={isLoading}
        />
      )}

      {viewMode === 'simulation' && activeScenario && activeSession && (
        <div className="max-w-3xl mx-auto space-y-4">
          {/* Main Simulation Window Container */}
          <div className="rounded-3xl bg-surface-container-low border border-surface-container shadow-md overflow-hidden flex flex-col">
            <ChatHeader
              scenario={activeScenario}
              onAbandon={handleAbandon}
              currentScore={activeSession.totalScore}
            />

            {/* Red Flag Visual Radar */}
            <div className="p-3 bg-surface-container-low border-b border-surface-container">
              <RedFlagTracker
                availableFlags={activeScenario.redFlags}
                identifiedFlagIds={identifiedFlagIds}
                onToggleFlag={handleToggleFlag}
              />
            </div>

            {/* Chat Timeline Scroll Area */}
            <div className="p-4 sm:p-6 min-h-[340px] max-h-[500px] overflow-y-auto space-y-2 bg-[#F6F7F9]/70">
              {activeSession.messages.map((msg) => (
                <ChatBubble
                  key={msg.id}
                  message={msg}
                  characterAvatar={activeScenario.characterAvatar}
                />
              ))}

              {isTyping && (
                <TypingIndicator senderName={activeScenario.characterName} />
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Interactive Decision Panel */}
            <DecisionPanel
              decisionNode={currentDecisionNode}
              onSelectOption={handleSelectOption}
              isLoading={isLoading}
              selectedOptionId={selectedOptionId}
              lastFeedback={lastFeedback}
              onContinue={handleContinueDialogue}
              isCompleted={activeSession.status === 'completed'}
            />
          </div>
        </div>
      )}

      {viewMode === 'result' && finalResult && (
        <ChallengeResultView
          result={finalResult}
          onRestart={() => {
            setFinalResult(null);
            handleStartSimulation();
          }}
          onBackToDashboard={() => {
            setViewMode('dashboard');
            setActiveSession(null);
            setFinalResult(null);
          }}
        />
      )}
    </div>
  );
};


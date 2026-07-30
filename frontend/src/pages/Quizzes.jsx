import React, { useState, useEffect } from 'react';
import { HelpCircle, Plus, Loader2, Play, CheckCircle, Clock, Trash2, AlertCircle, X, ChevronRight, Award } from 'lucide-react';
import { quizApi } from '../services/api';

const LEVEL_COLORS = {
  beginner: { bg: '#22c55e', light: '#dcfce7', text: '#15803d' },
  intermediate: { bg: '#f59e0b', light: '#fef3c7', text: '#b45309' },
  advanced: { bg: '#ef4444', light: '#fee2e2', text: '#b91c1c' },
};

const Quizzes = ({ user }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Generate New
  const [showGenerate, setShowGenerate] = useState(false);
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('beginner');
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState('');

  // Active Quiz (Taking or Reviewing)
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [loadingQuiz, setLoadingQuiz] = useState(false);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const res = await quizApi.getAll(1, 50); // Get up to 50 for now
      if (res.success) {
        setQuizzes(res.quizzes);
      }
    } catch (error) {
      console.error("Failed to load quizzes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setGenerating(true);
    setGenerateError('');
    try {
      const res = await quizApi.generate({ topic: topic.trim(), difficulty });
      if (res.success) {
        setQuizzes([res.quiz, ...quizzes]);
        setShowGenerate(false);
        setTopic('');
        openQuiz(res.quiz.id);
      }
    } catch (error) {
      setGenerateError(error.message || 'Failed to generate quiz');
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      await quizApi.delete(id);
      setQuizzes(quizzes.filter(q => q._id !== id && q.id !== id));
      if (activeQuiz?.id === id) setActiveQuiz(null);
    } catch (error) {
      console.error("Failed to delete quiz", error);
    }
  };

  const openQuiz = async (id) => {
    try {
      setLoadingQuiz(true);
      const res = await quizApi.getById(id);
      if (res.success) {
        setActiveQuiz(res.quiz);
      }
    } catch (error) {
      console.error("Failed to fetch quiz details", error);
    } finally {
      setLoadingQuiz(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-5.5rem)] rounded-xl border border-[#ebebeb] dark:border-[#1c1c1c] bg-white dark:bg-[#0f0f0f] overflow-hidden">
      
      {/* ── Left Sidebar (List) ── */}
      <div className="w-72 shrink-0 border-r border-[#ebebeb] dark:border-[#1c1c1c] bg-[#fafafa] dark:bg-[#141414] flex flex-col">
        <div className="p-4 border-b border-[#ebebeb] dark:border-[#1c1c1c]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-[#5438dc]/10 flex items-center justify-center">
                <HelpCircle size={15} className="text-[#5438dc]" />
              </div>
              <span className="text-sm font-bold text-[#111] dark:text-[#e5e5e5]">My Quizzes</span>
            </div>
            <button 
              onClick={() => { setShowGenerate(true); setActiveQuiz(null); }}
              className="p-1.5 bg-[#5438dc] text-white rounded-md hover:bg-[#452bc4] transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loading ? (
            <div className="flex items-center justify-center p-6 text-[#888]">
              <Loader2 size={20} className="animate-spin" />
            </div>
          ) : quizzes.length === 0 ? (
            <div className="p-6 text-center text-sm text-[#888] dark:text-[#555]">
              <HelpCircle size={32} className="mx-auto mb-3 opacity-30" />
              No quizzes yet.<br/>Generate one to test your knowledge!
            </div>
          ) : (
            quizzes.map(q => {
              const isActive = activeQuiz?.id === (q.id || q._id);
              const lc = LEVEL_COLORS[q.difficulty] || LEVEL_COLORS.beginner;
              return (
                <div 
                  key={q.id || q._id} 
                  onClick={() => openQuiz(q.id || q._id)}
                  className={`group relative p-3 rounded-xl cursor-pointer transition-all border ${
                    isActive 
                      ? 'bg-[#5438dc]/5 dark:bg-[#5438dc]/10 border-[#5438dc]/30 shadow-sm' 
                      : 'border-transparent hover:bg-white dark:hover:bg-[#1a1a1a] hover:border-[#ebebeb] dark:hover:border-[#2a2a2a]'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className={`text-sm font-semibold truncate pr-6 ${isActive ? 'text-[#5438dc] dark:text-[#7c64f0]' : 'text-[#111] dark:text-[#e5e5e5]'}`}>
                      {q.title}
                    </h4>
                    <button 
                      onClick={(e) => handleDelete(e, q.id || q._id)}
                      className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 p-1 text-[#aaa] hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: lc.light, color: lc.text }}>
                      {q.difficulty}
                    </span>
                    {q.isCompleted ? (
                      <span className="text-[10px] flex items-center gap-1 font-semibold text-[#15803d] dark:text-[#4ade80]">
                        <CheckCircle size={10} /> {q.score}%
                      </span>
                    ) : (
                      <span className="text-[10px] flex items-center gap-1 text-[#f59e0b]">
                        <Clock size={10} /> Pending
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── Right Content Area ── */}
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#0a0a0a] relative">
        {showGenerate ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-white dark:bg-[#111] rounded-2xl border border-[#ebebeb] dark:border-[#1c1c1c] p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#5438dc]/10 flex items-center justify-center">
                    <HelpCircle size={20} className="text-[#5438dc]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[#111] dark:text-[#e5e5e5]">Generate Quiz</h2>
                    <p className="text-xs text-[#888]">AI will craft a custom assessment</p>
                  </div>
                </div>
                <button onClick={() => setShowGenerate(false)} className="p-2 text-[#aaa] hover:text-[#333] dark:hover:text-[#ccc]">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#555] dark:text-[#aaa] mb-1.5">Topic</label>
                  <input
                    type="text"
                    value={topic}
                    onChange={e => setTopic(e.target.value)}
                    placeholder="e.g. React Hooks, Node.js Events..."
                    className="w-full px-3 py-2.5 text-sm bg-[#fafafa] dark:bg-[#1a1a1a] border border-[#ebebeb] dark:border-[#333] rounded-xl text-[#111] dark:text-[#e5e5e5] placeholder:text-[#aaa] outline-none focus:border-[#5438dc] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#555] dark:text-[#aaa] mb-1.5">Difficulty</label>
                  <div className="flex gap-2">
                    {['beginner', 'intermediate', 'advanced'].map(lvl => (
                      <button
                        key={lvl}
                        onClick={() => setDifficulty(lvl)}
                        className={`flex-1 py-2 rounded-lg text-xs font-medium capitalize transition-all border ${
                          difficulty === lvl 
                            ? 'bg-[#5438dc]/10 border-[#5438dc]/30 text-[#5438dc]' 
                            : 'bg-[#fafafa] dark:bg-[#1a1a1a] border-[#ebebeb] dark:border-[#333] text-[#666] hover:bg-[#f0f0f0] dark:hover:bg-[#222]'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                {generateError && (
                  <div className="flex items-center gap-2 p-3 text-xs text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <AlertCircle size={14} />
                    {generateError}
                  </div>
                )}

                <button
                  onClick={handleGenerate}
                  disabled={!topic.trim() || generating}
                  className="w-full mt-4 flex items-center justify-center gap-2 py-3 bg-[#5438dc] hover:bg-[#452bc4] disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-all shadow-sm shadow-[#5438dc]/20"
                >
                  {generating ? (
                    <><Loader2 size={16} className="animate-spin" /> Crafting Questions...</>
                  ) : (
                    <><Play size={16} /> Start Quiz</>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : loadingQuiz ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 size={32} className="animate-spin text-[#5438dc]" />
          </div>
        ) : activeQuiz ? (
          <QuizTaker 
            quiz={activeQuiz} 
            onUpdate={(updatedQuiz) => {
              setActiveQuiz(updatedQuiz);
              setQuizzes(prev => prev.map(q => q.id === updatedQuiz.id || q._id === updatedQuiz.id ? updatedQuiz : q));
            }}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-20 h-20 rounded-3xl bg-[#f5f5f5] dark:bg-[#1a1a1a] flex items-center justify-center mb-6">
              <HelpCircle size={36} className="text-[#ccc] dark:text-[#444]" />
            </div>
            <h3 className="text-xl font-bold text-[#111] dark:text-[#e5e5e5] mb-2">Test Your Knowledge</h3>
            <p className="text-sm text-[#888] dark:text-[#555] max-w-sm mb-6">
              Select a quiz from the sidebar to review your results, or generate a new one to challenge yourself.
            </p>
            <button
              onClick={() => setShowGenerate(true)}
              className="px-6 py-2.5 bg-[#5438dc] text-white text-sm font-semibold rounded-full shadow-sm hover:bg-[#452bc4] transition-colors"
            >
              Generate New Quiz
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Quiz Taker Subcomponent ───────────────────────────────────────────────────

const QuizTaker = ({ quiz, onUpdate }) => {
  const [answers, setAnswers] = useState(new Array(quiz.questions.length).fill(null));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isCompleted = quiz.isCompleted;

  // Initialize answers if already completed
  useEffect(() => {
    if (isCompleted && quiz.userAnswers) {
      setAnswers(quiz.userAnswers);
    } else {
      setAnswers(new Array(quiz.questions.length).fill(null));
    }
  }, [quiz]);

  const handleSelect = (qIdx, option) => {
    if (isCompleted) return;
    const newAnswers = [...answers];
    newAnswers[qIdx] = option;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    if (answers.includes(null)) {
      setError('Please answer all questions before submitting.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const res = await quizApi.submit(quiz.id || quiz._id, answers);
      if (res.success) {
        onUpdate(res.quiz);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit quiz.');
    } finally {
      setSubmitting(false);
    }
  };

  const lc = LEVEL_COLORS[quiz.difficulty] || LEVEL_COLORS.beginner;

  return (
    <div className="absolute inset-0 overflow-y-auto">
      <div className="max-w-3xl mx-auto py-8 px-6 pb-24">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-[10px] uppercase tracking-wider font-bold" style={{ color: lc.text }}>{quiz.difficulty}</span>
            <span className="text-[10px] text-[#888] font-medium px-2 py-0.5 bg-[#f0f0f0] dark:bg-[#1a1a1a] rounded-full">{quiz.topic}</span>
          </div>
          <h1 className="text-2xl font-bold text-[#111] dark:text-[#e5e5e5]">{quiz.title}</h1>
        </div>

        {/* Results Banner */}
        {isCompleted && (
          <div className={`mb-8 p-6 rounded-2xl border flex items-center justify-between ${
            quiz.score >= 80 ? 'bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-900/30' : 
            quiz.score >= 50 ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/10 dark:border-yellow-900/30' :
            'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-900/30'
          }`}>
            <div>
              <h2 className={`text-lg font-bold mb-1 ${
                quiz.score >= 80 ? 'text-green-800 dark:text-green-400' :
                quiz.score >= 50 ? 'text-yellow-800 dark:text-yellow-400' :
                'text-red-800 dark:text-red-400'
              }`}>
                {quiz.score >= 80 ? 'Excellent Work!' : quiz.score >= 50 ? 'Good Effort!' : 'Keep Practicing!'}
              </h2>
              <p className="text-sm text-[#555] dark:text-[#aaa]">
                You scored {quiz.score}% on this assessment.
              </p>
            </div>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black ${
               quiz.score >= 80 ? 'bg-green-100 text-green-700 dark:bg-green-800/30 dark:text-green-400' :
               quiz.score >= 50 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-800/30 dark:text-yellow-400' :
               'bg-red-100 text-red-700 dark:bg-red-800/30 dark:text-red-400'
            }`}>
              {quiz.score}
            </div>
          </div>
        )}

        {/* Questions List */}
        <div className="space-y-8">
          {quiz.questions.map((q, qIdx) => {
            const isCorrect = isCompleted && answers[qIdx] === q.correctAnswer;
            const isWrong = isCompleted && answers[qIdx] !== q.correctAnswer;

            return (
              <div key={qIdx} className={`p-6 rounded-2xl border ${
                isCompleted 
                  ? isCorrect 
                    ? 'bg-white dark:bg-[#111] border-green-200 dark:border-green-900/30' 
                    : 'bg-white dark:bg-[#111] border-red-200 dark:border-red-900/30'
                  : 'bg-white dark:bg-[#111] border-[#ebebeb] dark:border-[#1c1c1c] shadow-sm'
              }`}>
                <div className="flex gap-4">
                  <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-sm font-bold ${
                    isCompleted 
                      ? isCorrect 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      : 'bg-[#f5f5f5] dark:bg-[#1a1a1a] text-[#888]'
                  }`}>
                    {qIdx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-[#111] dark:text-[#e5e5e5] mb-4 leading-relaxed">
                      {q.questionText}
                    </h3>
                    
                    <div className="space-y-2.5">
                      {q.options.map((opt, oIdx) => {
                        const isSelected = answers[qIdx] === opt;
                        const isCorrectOption = isCompleted && q.correctAnswer === opt;
                        
                        let optionClass = "border-[#ebebeb] dark:border-[#333] hover:bg-[#fafafa] dark:hover:bg-[#1a1a1a]";
                        if (!isCompleted && isSelected) {
                          optionClass = "border-[#5438dc] bg-[#5438dc]/5 text-[#5438dc] dark:text-[#7c64f0]";
                        } else if (isCompleted) {
                          if (isCorrectOption) {
                            optionClass = "border-green-500 bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-400";
                          } else if (isSelected && !isCorrectOption) {
                            optionClass = "border-red-400 bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-400";
                          } else {
                            optionClass = "border-[#ebebeb] dark:border-[#333] opacity-50";
                          }
                        }

                        return (
                          <button
                            key={oIdx}
                            onClick={() => handleSelect(qIdx, opt)}
                            disabled={isCompleted}
                            className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between ${optionClass}`}
                          >
                            <span className="text-sm font-medium">{opt}</span>
                            {isCompleted && isCorrectOption && <CheckCircle size={16} className="text-green-500" />}
                            {isCompleted && isSelected && !isCorrectOption && <X size={16} className="text-red-500" />}
                          </button>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    {isCompleted && q.explanation && (
                      <div className={`mt-4 p-4 rounded-xl text-sm ${
                        isCorrect 
                          ? 'bg-green-50/50 text-green-800 dark:bg-green-900/10 dark:text-green-300' 
                          : 'bg-red-50/50 text-red-800 dark:bg-red-900/10 dark:text-red-300'
                      }`}>
                        <span className="font-bold block mb-1">Explanation:</span>
                        {q.explanation}
                      </div>
                    )}

                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Submit Actions */}
        {!isCompleted && (
          <div className="mt-8 flex flex-col items-end border-t border-[#ebebeb] dark:border-[#1c1c1c] pt-6">
            {error && <p className="text-sm text-red-500 mb-3">{error}</p>}
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-8 py-3 bg-[#5438dc] hover:bg-[#452bc4] text-white text-sm font-bold rounded-xl shadow-sm disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {submitting ? <><Loader2 size={16} className="animate-spin" /> Submitting...</> : "Submit Answers"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Quizzes;

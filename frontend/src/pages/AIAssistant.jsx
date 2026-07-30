import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  Plus,
  Trash2,
  MessageSquare,
  Bot,
  User,
  Loader2,
  ChevronLeft,
  Map,
  ExternalLink
} from 'lucide-react';
import { chatApi, roadmapApi } from '../services/api';

const SUGGESTED_PROMPTS = [
  "Explain Big O notation with a real-world analogy",
  "Create a learning roadmap for Machine Learning",
  "What is the difference between SQL and NoSQL databases?",
  "Create a roadmap for becoming a Full Stack Developer"
];

// ─── Roadmap Link Button ────────────────────────────────────────────────────
const RoadmapLinkButton = ({ roadmapId, onNavigate }) => (
  <button
    onClick={() => onNavigate && onNavigate(roadmapId)}
    className="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 bg-[#5438dc] hover:bg-[#452bc4] text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
  >
    <Map size={12} />
    View Roadmap →
  </button>
);

// Helper to render basic markdown formatting (bold, code blocks, bullet points)
const FormattedMessage = ({ content, onNavigateToRoadmap }) => {
  if (!content) return null;

  // Split code blocks ```code```
  const parts = content.split(/(```[\s\S]*?```)/g);

  // Extract roadmap IDs from text like [VIEW ROADMAP](roadmap:ID) or roadmap:ID
  const roadmapIds = [];
  const roadmapLinkRegex = /\[.*?\]\(roadmap:([a-zA-Z0-9]+)\)|roadmap:([a-zA-Z0-9]+)/g;
  let m;
  const cleanContent = content.replace(roadmapLinkRegex, (match, id1, id2) => {
    const id = id1 || id2;
    roadmapIds.push(id);
    return ''; // Remove from text
  });

  const cleanParts = cleanContent.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-2 text-sm leading-relaxed">
      {cleanParts.map((part, index) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const firstLineEnd = part.indexOf('\n');
          const lang = firstLineEnd !== -1 ? part.substring(3, firstLineEnd).trim() : '';
          const code = firstLineEnd !== -1 ? part.substring(firstLineEnd + 1, part.length - 3) : part.substring(3, part.length - 3);

          return (
            <div key={index} className="my-3 rounded-lg overflow-hidden border border-[#e0e0e0] dark:border-[#262626] bg-[#1e1e1e] text-[#d4d4d4]">
              {lang && (
                <div className="px-3 py-1 bg-[#252526] text-[11px] font-mono text-[#858585] border-b border-[#333]">
                  {lang}
                </div>
              )}
              <pre className="p-3 font-mono text-xs overflow-x-auto whitespace-pre">
                <code>{code}</code>
              </pre>
            </div>
          );
        }

        // Inline formatting for non-code text
        const lines = part.split('\n');
        return (
          <div key={index} className="space-y-1">
            {lines.map((line, lIdx) => {
              if (!line.trim()) return <div key={lIdx} className="h-1" />;

              // Bullet points
              if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
                return (
                  <div key={lIdx} className="flex gap-2 pl-2">
                    <span className="text-[#5438dc]">•</span>
                    <span>{renderInlineBold(line.trim().substring(2))}</span>
                  </div>
                );
              }

              // Numbered lists (e.g. 1. )
              const numMatch = line.trim().match(/^(\d+)\.\s+(.*)/);
              if (numMatch) {
                return (
                  <div key={lIdx} className="flex gap-2 pl-2">
                    <span className="font-semibold text-[#5438dc]">{numMatch[1]}.</span>
                    <span>{renderInlineBold(numMatch[2])}</span>
                  </div>
                );
              }

              return <p key={lIdx}>{renderInlineBold(line)}</p>;
            })}
          </div>
        );
      })}
      {/* Roadmap navigation buttons */}
      {roadmapIds.map((id, i) => (
        <RoadmapLinkButton key={i} roadmapId={id} onNavigate={onNavigateToRoadmap} />
      ))}
    </div>
  );
};

// Helper for bold **text**
const renderInlineBold = (text) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

const AIAssistant = ({ user, onNavigateToRoadmap }) => {
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [showMobileList, setShowMobileList] = useState(false);

  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, sending]);

  // Load all user chat sessions on mount
  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      setLoadingChats(true);
      const data = await chatApi.getChats();
      if (data.success && data.chats) {
        setChats(data.chats);
        if (data.chats.length > 0 && !activeChatId) {
          loadChatHistory(data.chats[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to fetch chat history:", err);
    } finally {
      setLoadingChats(false);
    }
  };

  const loadChatHistory = async (chatId) => {
    try {
      setActiveChatId(chatId);
      setLoadingMessages(true);
      setShowMobileList(false);
      const data = await chatApi.getChatById(chatId);
      if (data.success && data.chat) {
        setMessages(data.chat.messages || []);
      }
    } catch (err) {
      console.error("Failed to load chat:", err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleNewChat = async (topicContext = "") => {
    try {
      setSending(true);
      const data = await chatApi.createChat({
        title: "New Session",
        topic: topicContext || ""
      });
      if (data.success && data.chat) {
        setChats(prev => [data.chat, ...prev]);
        setActiveChatId(data.chat.id);
        setMessages([]);
        setShowMobileList(false);
        return data.chat.id;
      }
    } catch (err) {
      console.error("Failed to create chat:", err);
    } finally {
      setSending(false);
    }
  };

  // Detect if message is a roadmap request
  const isRoadmapRequest = (text) => {
    const lower = text.toLowerCase();
    return (
      (lower.includes('roadmap') || lower.includes('learning path') || lower.includes('study plan')) &&
      (lower.includes('create') || lower.includes('generate') || lower.includes('make') || lower.includes('build') || lower.includes('give me'))
    );
  };

  const handleSendMessage = async (textToSend = null) => {
    const text = textToSend || inputMessage;
    if (!text || !text.trim() || sending) return;

    let targetChatId = activeChatId;

    // If no active chat session, create one first
    if (!targetChatId) {
      targetChatId = await handleNewChat();
      if (!targetChatId) return;
    }

    const tempUserMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, tempUserMsg]);
    setInputMessage('');
    setSending(true);

    try {
      const data = await chatApi.sendMessage(targetChatId, text);
      if (data.success && data.message) {
        let aiMessage = data.message;

        // If roadmap was requested, auto-generate one and embed a link
        if (isRoadmapRequest(text)) {
          // Extract topic from user message
          const topicMatch = text.match(/(?:for|about|on)\s+([^?.!]+)/i);
          const topic = topicMatch ? topicMatch[1].trim() : text.replace(/(create|generate|make|build|give me|a|an)?\s*(roadmap|learning path|study plan)/gi, '').trim();

          if (topic.length > 2) {
            try {
              const rmData = await roadmapApi.generate(topic);
              if (rmData.success && rmData.roadmap) {
                aiMessage = {
                  ...aiMessage,
                  content: aiMessage.content + `\n\n🗺️ I've generated your roadmap! [View Roadmap](roadmap:${rmData.roadmap.id})`
                };
              }
            } catch (rmErr) {
              console.warn('Auto roadmap generation failed:', rmErr.message);
            }
          }
        }

        setMessages(prev => [...prev, aiMessage]);
        if (data.title) {
          setChats(prev => prev.map(c => c.id === targetChatId ? { ...c, title: data.title } : c));
        }
      }
    } catch (err) {
      console.error("Error sending message:", err);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: `⚠️ Error: ${err.message || 'Failed to connect to AI assistant.'}`,
          createdAt: new Date().toISOString()
        }
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleDeleteChat = async (e, chatId) => {
    e.stopPropagation();
    try {
      await chatApi.deleteChat(chatId);
      setChats(prev => prev.filter(c => c.id !== chatId));
      if (activeChatId === chatId) {
        const remaining = chats.filter(c => c.id !== chatId);
        if (remaining.length > 0) {
          loadChatHistory(remaining[0].id);
        } else {
          setActiveChatId(null);
          setMessages([]);
        }
      }
    } catch (err) {
      console.error("Failed to delete chat:", err);
    }
  };

  return (
    <div className="h-[calc(100vh-5.5rem)] flex rounded-xl border border-[#ebebeb] dark:border-[#1c1c1c] bg-white dark:bg-[#0f0f0f] overflow-hidden">
      
      {/* Sidebar: Chat History */}
      <div className={`w-64 border-r border-[#ebebeb] dark:border-[#1c1c1c] bg-[#fafafa] dark:bg-[#141414] flex flex-col shrink-0 ${
        showMobileList ? 'absolute inset-0 z-20 w-full bg-white dark:bg-[#0f0f0f]' : 'hidden md:flex'
      }`}>
        <div className="p-3 border-b border-[#ebebeb] dark:border-[#1c1c1c] flex items-center justify-between">
          <button
            onClick={() => handleNewChat()}
            disabled={sending}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-[#5438dc] hover:bg-[#452bc4] text-white text-xs font-semibold rounded-lg transition-colors shadow-xs disabled:opacity-50"
          >
            <Plus size={15} />
            <span>New Conversation</span>
          </button>
        </div>

        {/* List of chat sessions */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loadingChats ? (
            <div className="flex items-center justify-center h-32 text-[#888]">
              <Loader2 size={18} className="animate-spin" />
            </div>
          ) : chats.length === 0 ? (
            <div className="p-4 text-center text-xs text-[#888] dark:text-[#555]">
              No past conversations
            </div>
          ) : (
            chats.map(chat => {
              const isActive = activeChatId === chat.id;
              return (
                <div
                  key={chat.id}
                  onClick={() => loadChatHistory(chat.id)}
                  className={`group flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-[#5438dc]/10 dark:bg-[#5438dc]/15 text-[#5438dc] dark:text-[#7c64f0]'
                      : 'text-[#555] dark:text-[#888] hover:bg-[#ebebeb] dark:hover:bg-[#1e1e1e] hover:text-[#111] dark:hover:text-[#ccc]'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <MessageSquare size={14} className="shrink-0" />
                    <span className="truncate">{chat.title || 'New Chat'}</span>
                  </div>
                  <button
                    onClick={(e) => handleDeleteChat(e, chat.id)}
                    className="opacity-0 group-hover:opacity-100 text-[#aaa] hover:text-red-500 transition-opacity p-1"
                    title="Delete chat"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#0f0f0f]">
        
        {/* Chat Header */}
        <div className="h-12 px-4 border-b border-[#ebebeb] dark:border-[#1c1c1c] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowMobileList(!showMobileList)}
              className="md:hidden p-1 text-[#888] hover:text-[#333]"
            >
              <ChevronLeft size={18} />
            </button>

            <div className="w-6 h-6 rounded-md bg-[#5438dc]/10 dark:bg-[#5438dc]/20 flex items-center justify-center">
              <Sparkles size={13} className="text-[#5438dc] dark:text-[#7c64f0]" />
            </div>
            <span className="text-xs font-semibold text-[#111] dark:text-[#e5e5e5]">
              AI Learning Assistant
            </span>
          </div>

          {activeChatId && (
            <button
              onClick={() => handleNewChat()}
              className="flex items-center gap-1.5 text-xs text-[#888] hover:text-[#333] dark:hover:text-[#ccc] transition-colors"
            >
              <Plus size={13} />
              <span className="hidden sm:inline">New Chat</span>
            </button>
          )}
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {loadingMessages ? (
            <div className="h-full flex items-center justify-center text-[#888]">
              <Loader2 size={24} className="animate-spin text-[#5438dc]" />
            </div>
          ) : messages.length === 0 ? (
            /* Welcome / Empty State */
            <div className="h-full flex flex-col items-center justify-center max-w-lg mx-auto text-center py-8">
              <div className="w-12 h-12 rounded-2xl bg-[#5438dc]/10 dark:bg-[#5438dc]/20 flex items-center justify-center mb-4">
                <Sparkles size={24} className="text-[#5438dc] dark:text-[#7c64f0]" />
              </div>

              <h2 className="text-lg font-bold text-[#111] dark:text-[#e5e5e5] mb-2 tracking-tight">
                How can I help your learning today?
              </h2>
              <p className="text-xs text-[#888] dark:text-[#666] mb-8 leading-relaxed">
                Ask any question about programming, data structures, system design, or request step-by-step study paths.
              </p>

              {/* Suggested prompts grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full">
                {SUGGESTED_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(prompt)}
                    className="p-3 text-left rounded-xl border border-[#ebebeb] dark:border-[#1e1e1e] bg-[#fafafa] dark:bg-[#141414] hover:border-[#5438dc]/40 hover:bg-white dark:hover:bg-[#181818] transition-all group"
                  >
                    <p className="text-xs font-medium text-[#444] dark:text-[#ccc] group-hover:text-[#5438dc] dark:group-hover:text-[#7c64f0] transition-colors">
                      {prompt}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Active Conversation Messages */
            messages.map((msg, idx) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id || idx}
                  className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
                >
                  {/* Avatar */}
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                    isUser
                      ? 'bg-[#5438dc] text-white'
                      : 'bg-[#fafafa] dark:bg-[#1e1e1e] border border-[#ebebeb] dark:border-[#262626] text-[#5438dc] dark:text-[#7c64f0]'
                  }`}>
                    {isUser ? <User size={14} /> : <Bot size={14} />}
                  </div>

                  {/* Message Bubble */}
                  <div className={`rounded-2xl px-4 py-3 max-w-[85%] ${
                    isUser
                      ? 'bg-[#5438dc] text-white rounded-tr-xs'
                      : 'bg-[#f5f5f5] dark:bg-[#141414] text-[#111] dark:text-[#e5e5e5] border border-[#ebebeb] dark:border-[#1e1e1e] rounded-tl-xs'
                  }`}>
                    <FormattedMessage content={msg.content} onNavigateToRoadmap={onNavigateToRoadmap} />
                  </div>
                </div>
              );
            })
          )}

          {/* Thinking indicator */}
          {sending && (
            <div className="flex gap-3 max-w-3xl">
              <div className="w-7 h-7 rounded-full bg-[#fafafa] dark:bg-[#1e1e1e] border border-[#ebebeb] dark:border-[#262626] text-[#5438dc] dark:text-[#7c64f0] flex items-center justify-center shrink-0">
                <Bot size={14} />
              </div>
              <div className="bg-[#f5f5f5] dark:bg-[#141414] border border-[#ebebeb] dark:border-[#1e1e1e] rounded-2xl rounded-tl-xs px-4 py-3 flex items-center gap-2 text-xs text-[#888] dark:text-[#666]">
                <Loader2 size={14} className="animate-spin text-[#5438dc]" />
                <span>AI is thinking...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 border-t border-[#ebebeb] dark:border-[#1c1c1c] bg-white dark:bg-[#0f0f0f]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2 bg-[#f5f5f5] dark:bg-[#141414] border border-[#e0e0e0] dark:border-[#222] rounded-xl px-3 py-1.5 focus-within:border-[#5438dc] focus-within:ring-2 focus-within:ring-[#5438dc]/10 transition-all"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask anything about your learning path..."
              disabled={sending}
              className="flex-1 bg-transparent border-none text-xs sm:text-sm text-[#111] dark:text-[#e5e5e5] placeholder:text-[#aaa] dark:placeholder:text-[#555] outline-none py-1.5 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || sending}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#5438dc] hover:bg-[#452bc4] text-white disabled:opacity-30 transition-all shrink-0"
            >
              {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={14} />}
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};

export default AIAssistant;

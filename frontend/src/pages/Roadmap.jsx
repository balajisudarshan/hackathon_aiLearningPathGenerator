import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Map, Sparkles, Send, Loader2, ChevronRight, Trash2,
  LayoutList, GitBranch, Circle, Check, ExternalLink,
  BookOpen, Video, FileText, X, AlertCircle, Clock,
  RotateCcw, ZoomIn, ZoomOut, Maximize2, ChevronDown
} from 'lucide-react';
import { roadmapApi } from '../services/api';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const LEVEL_COLORS = {
  beginner: { bg: '#22c55e', light: '#dcfce7', text: '#15803d' },
  intermediate: { bg: '#f59e0b', light: '#fef3c7', text: '#b45309' },
  advanced: { bg: '#ef4444', light: '#fee2e2', text: '#b91c1c' },
};

const LAYOUT_OPTIONS = [
  { id: 'tree-tb', label: 'Tree ↕', icon: GitBranch },
  { id: 'tree-lr', label: 'Tree ↔', icon: GitBranch },
  { id: 'list', label: 'List', icon: LayoutList },
];

const RESOURCE_ICONS = {
  video: Video,
  article: FileText,
  course: Sparkles,
  documentation: BookOpen,
  book: BookOpen,
};

// ─── SVG Graph Engine ──────────────────────────────────────────────────────────

function computeLayout(roadmap, layoutId) {
  if (!roadmap?.sections?.length) return { nodes: [], edges: [] };

  const sections = roadmap.sections;
  const nodes = [];
  const edges = [];
  const NODE_W = 160;
  const NODE_H = 52;
  const H_GAP = 60;
  const V_GAP = 90;
  const TOPIC_W = 140;
  const TOPIC_H = 44;

  if (layoutId === 'tree-tb') {
    // Top-down: sections in a row, topics below each section
    let sectionX = 40;
    sections.forEach((section, sIdx) => {
      const topicsCount = section.topics.length;
      const colWidth = Math.max(NODE_W, topicsCount * (TOPIC_W + 20));
      const sX = sectionX + colWidth / 2 - NODE_W / 2;
      const sY = 40;

      nodes.push({
        id: section.id || section._id,
        type: 'section',
        label: section.title,
        x: sX,
        y: sY,
        w: NODE_W,
        h: NODE_H,
        sectionIdx: sIdx,
        completed: section.topics.every(t => t.isCompleted),
      });

      // Connect sections sequentially
      if (sIdx > 0) {
        const prev = nodes.find(n => n.sectionIdx === sIdx - 1 && n.type === 'section');
        edges.push({
          id: `edge-s${sIdx - 1}-s${sIdx}`,
          fromId: prev.id,
          toId: section.id || section._id,
          fromX: prev.x + NODE_W / 2,
          fromY: prev.y + NODE_H,
          toX: sX + NODE_W / 2,
          toY: sY,
          type: 'section',
        });
      }

      section.topics.forEach((topic, tIdx) => {
        const tX = sectionX + tIdx * (TOPIC_W + 20);
        const tY = sY + NODE_H + V_GAP;
        const tid = topic.id || topic._id;

        nodes.push({
          id: tid,
          type: 'topic',
          label: topic.title,
          description: topic.description,
          resources: topic.resources || [],
          x: tX,
          y: tY,
          w: TOPIC_W,
          h: TOPIC_H,
          sectionId: section.id || section._id,
          topicId: tid,
          completed: topic.isCompleted,
        });

        edges.push({
          id: `edge-s${sIdx}-t${tIdx}`,
          fromId: section.id || section._id,
          toId: tid,
          fromX: sX + NODE_W / 2,
          fromY: sY + NODE_H,
          toX: tX + TOPIC_W / 2,
          toY: tY,
          type: 'topic',
        });
      });

      sectionX += colWidth + H_GAP;
    });

  } else {
    // tree-lr: Left-right layout, sections in a column, topics to the right
    const SEC_X = 40;
    const TOPIC_X = SEC_X + NODE_W + 80;
    let currentY = 40;

    sections.forEach((section, sIdx) => {
      const topicsCount = section.topics.length;
      const blockH = Math.max(NODE_H, topicsCount * (TOPIC_H + 16));
      const sY = currentY + blockH / 2 - NODE_H / 2;

      nodes.push({
        id: section.id || section._id,
        type: 'section',
        label: section.title,
        x: SEC_X,
        y: sY,
        w: NODE_W,
        h: NODE_H,
        sectionIdx: sIdx,
        completed: section.topics.every(t => t.isCompleted),
      });

      if (sIdx > 0) {
        const prev = nodes.find(n => n.sectionIdx === sIdx - 1 && n.type === 'section');
        edges.push({
          id: `edge-s${sIdx - 1}-s${sIdx}`,
          fromId: prev.id,
          toId: section.id || section._id,
          fromX: prev.x + NODE_W / 2,
          fromY: prev.y + NODE_H,
          toX: SEC_X + NODE_W / 2,
          toY: sY,
          type: 'section',
        });
      }

      section.topics.forEach((topic, tIdx) => {
        const tY = currentY + tIdx * (TOPIC_H + 16);
        const tid = topic.id || topic._id;

        nodes.push({
          id: tid,
          type: 'topic',
          label: topic.title,
          description: topic.description,
          resources: topic.resources || [],
          x: TOPIC_X,
          y: tY,
          w: TOPIC_W,
          h: TOPIC_H,
          sectionId: section.id || section._id,
          topicId: tid,
          completed: topic.isCompleted,
        });

        edges.push({
          id: `edge-s${sIdx}-t${tIdx}`,
          fromId: section.id || section._id,
          toId: tid,
          fromX: SEC_X + NODE_W,
          fromY: sY + NODE_H / 2,
          toX: TOPIC_X,
          toY: tY + TOPIC_H / 2,
          type: 'topic',
        });
      });

      currentY += blockH + 40;
    });
  }

  // Compute overall bounding box
  const allX = nodes.map(n => n.x + n.w);
  const allY = nodes.map(n => n.y + n.h);
  const totalW = Math.max(...allX) + 60;
  const totalH = Math.max(...allY) + 60;

  return { nodes, edges, totalW, totalH };
}

// ─── SVG Graph Component ───────────────────────────────────────────────────────

const RoadmapGraph = ({ roadmap, layout, selectedNodeId, onNodeClick, onToggleComplete }) => {
  const { nodes, edges, totalW, totalH } = computeLayout(roadmap, layout);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const svgRef = useRef();

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(s => Math.min(Math.max(s * delta, 0.3), 2.5));
  };

  const handleMouseDown = (e) => {
    if (e.target === svgRef.current || e.target.tagName === 'svg') {
      setDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e) => {
    if (!dragging || !dragStart) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => setDragging(false);

  const resetView = () => { setScale(1); setPan({ x: 0, y: 0 }); };

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  const getEdgePath = (edge) => {
    const dx = edge.toX - edge.fromX;
    const dy = edge.toY - edge.fromY;
    const cx1 = edge.fromX + dx * 0.5;
    const cy1 = edge.fromY;
    const cx2 = edge.toX - dx * 0.5;
    const cy2 = edge.toY;
    if (layout === 'tree-lr') {
      return `M${edge.fromX},${edge.fromY} C${cx1},${cy1} ${cx2},${cy2} ${edge.toX},${edge.toY}`;
    }
    return `M${edge.fromX},${edge.fromY} C${edge.fromX},${edge.fromY + Math.abs(dy) * 0.5} ${edge.toX},${edge.toY - Math.abs(dy) * 0.5} ${edge.toX},${edge.toY}`;
  };

  return (
    <div className="relative w-full h-full select-none overflow-hidden rounded-xl bg-[#fafafa] dark:bg-[#0a0a0a]"
      style={{ backgroundImage: 'radial-gradient(circle, #e0e0e0 1px, transparent 1px), radial-gradient(circle, #e0e0e0 1px, transparent 1px)', backgroundSize: '28px 28px', backgroundPosition: '0 0, 14px 14px' }}>

      {/* Controls */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5">
        <button onClick={() => setScale(s => Math.min(s * 1.2, 2.5))} className="w-8 h-8 flex items-center justify-center bg-white dark:bg-[#1a1a1a] border border-[#e0e0e0] dark:border-[#333] rounded-lg text-[#555] dark:text-[#aaa] hover:text-[#5438dc] transition-colors shadow-sm"><ZoomIn size={14} /></button>
        <button onClick={() => setScale(s => Math.max(s * 0.8, 0.3))} className="w-8 h-8 flex items-center justify-center bg-white dark:bg-[#1a1a1a] border border-[#e0e0e0] dark:border-[#333] rounded-lg text-[#555] dark:text-[#aaa] hover:text-[#5438dc] transition-colors shadow-sm"><ZoomOut size={14} /></button>
        <button onClick={resetView} className="w-8 h-8 flex items-center justify-center bg-white dark:bg-[#1a1a1a] border border-[#e0e0e0] dark:border-[#333] rounded-lg text-[#555] dark:text-[#aaa] hover:text-[#5438dc] transition-colors shadow-sm"><Maximize2 size={14} /></button>
      </div>

      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        className={`cursor-${dragging ? 'grabbing' : 'grab'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <defs>
          <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#c0c0c0" />
          </marker>
          <marker id="arrow-section" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#5438dc" />
          </marker>
          <filter id="shadow">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.08" />
          </filter>
        </defs>

        <g transform={`translate(${pan.x}, ${pan.y}) scale(${scale})`}>
          {/* Edges */}
          {edges.map(edge => (
            <path
              key={edge.id}
              d={getEdgePath(edge)}
              fill="none"
              stroke={edge.type === 'section' ? '#5438dc' : '#d1d5db'}
              strokeWidth={edge.type === 'section' ? 2 : 1.5}
              strokeDasharray={edge.type === 'topic' ? '5,4' : 'none'}
              markerEnd={edge.type === 'section' ? 'url(#arrow-section)' : 'url(#arrow)'}
              opacity={0.7}
            />
          ))}

          {/* Nodes */}
          {nodes.map(node => {
            const isSelected = selectedNodeId === node.id;
            const isSection = node.type === 'section';
            const isDone = node.completed;

            return (
              <g key={node.id} transform={`translate(${node.x}, ${node.y})`}
                className="cursor-pointer"
                onClick={() => onNodeClick(node)}>
                {/* Shadow rect */}
                <rect
                  x={0} y={0}
                  width={node.w} height={node.h}
                  rx={isSection ? 12 : 8}
                  fill="transparent"
                  filter="url(#shadow)"
                />
                {/* Main rect */}
                <rect
                  x={0} y={0}
                  width={node.w} height={node.h}
                  rx={isSection ? 12 : 8}
                  fill={isSection
                    ? (isDone ? '#22c55e' : isSelected ? '#5438dc' : '#fff')
                    : (isDone ? '#dcfce7' : isSelected ? '#ede9fe' : '#fff')
                  }
                  stroke={isSection
                    ? (isDone ? '#16a34a' : '#5438dc')
                    : (isDone ? '#86efac' : isSelected ? '#8b5cf6' : '#e5e7eb')
                  }
                  strokeWidth={isSection ? 2 : 1.5}
                />

                {/* Completed checkmark */}
                {isDone && (
                  <circle cx={node.w - 14} cy={14} r={8}
                    fill={isSection ? '#fff' : '#22c55e'} />
                )}
                {isDone && (
                  <text x={node.w - 14} y={18} textAnchor="middle"
                    fontSize="9" fill={isSection ? '#22c55e' : '#fff'} fontWeight="bold">✓</text>
                )}

                {/* Label */}
                <text
                  x={node.w / 2} y={node.h / 2 + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={isSection ? 12 : 11}
                  fontWeight={isSection ? 600 : 500}
                  fill={isSection
                    ? (isDone || isSelected ? '#fff' : '#1a1a1a')
                    : (isDone ? '#15803d' : isSelected ? '#4c1d95' : '#374151')
                  }
                >
                  {node.label.length > 18 ? node.label.substring(0, 17) + '…' : node.label}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
};

// ─── List View ─────────────────────────────────────────────────────────────────

const RoadmapListView = ({ roadmap, onNodeClick, onToggleComplete }) => {
  const [openSections, setOpenSections] = useState({});

  const toggleSection = (id) => setOpenSections(p => ({ ...p, [id]: !p[id] }));

  return (
    <div className="space-y-3 p-4 overflow-y-auto h-full">
      {roadmap.sections?.map((section, sIdx) => {
        const sid = section.id || section._id;
        const isOpen = openSections[sid] !== false;
        const doneCount = section.topics.filter(t => t.isCompleted).length;
        const total = section.topics.length;

        return (
          <div key={sid} className="rounded-xl border border-[#e5e7eb] dark:border-[#1e1e1e] bg-white dark:bg-[#111] overflow-hidden">
            <button
              onClick={() => toggleSection(sid)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#f9fafb] dark:hover:bg-[#181818] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-[#5438dc]/10 dark:bg-[#5438dc]/20 flex items-center justify-center text-[#5438dc] text-xs font-bold">{sIdx + 1}</div>
                <span className="text-sm font-semibold text-[#111] dark:text-[#e5e5e5]">{section.title}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-[#888]">{doneCount}/{total}</span>
                <ChevronDown size={15} className={`text-[#999] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </div>
            </button>
            {isOpen && (
              <div className="border-t border-[#f0f0f0] dark:border-[#1a1a1a] divide-y divide-[#f0f0f0] dark:divide-[#1a1a1a]">
                {section.topics.map((topic) => {
                  const tid = topic.id || topic._id;
                  return (
                    <div key={tid} className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#fafafa] dark:hover:bg-[#161616] transition-colors">
                      <button
                        onClick={() => onToggleComplete(section.id || section._id, tid, !topic.isCompleted)}
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                          topic.isCompleted
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'border-[#d1d5db] dark:border-[#333] hover:border-[#5438dc]'
                        }`}
                      >
                        {topic.isCompleted && <Check size={11} />}
                      </button>
                      <button
                        onClick={() => onNodeClick({ ...topic, id: tid, topicId: tid, sectionId: section.id || section._id, type: 'topic' })}
                        className="flex-1 text-left text-sm text-[#374151] dark:text-[#ccc] hover:text-[#5438dc] transition-colors"
                      >
                        {topic.title}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ─── Topic Detail Panel ────────────────────────────────────────────────────────

const TopicPanel = ({ node, onClose, onToggleComplete }) => {
  if (!node || node.type === 'section') return null;

  return (
    <div className="w-72 shrink-0 border-l border-[#e5e7eb] dark:border-[#1e1e1e] bg-white dark:bg-[#0f0f0f] flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#f0f0f0] dark:border-[#1a1a1a]">
        <span className="text-xs font-semibold text-[#111] dark:text-[#e5e5e5] leading-snug max-w-[200px]">{node.label || node.title}</span>
        <button onClick={onClose} className="p-1 text-[#aaa] hover:text-[#555] dark:hover:text-[#ccc]"><X size={14} /></button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {node.description && (
          <p className="text-xs text-[#555] dark:text-[#888] leading-relaxed">{node.description}</p>
        )}

        {/* Complete toggle */}
        <button
          onClick={() => onToggleComplete(node.sectionId, node.topicId || node.id, !node.completed)}
          className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all ${
            node.completed
              ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
              : 'bg-[#5438dc]/10 dark:bg-[#5438dc]/20 text-[#5438dc] border border-[#5438dc]/20 hover:bg-[#5438dc]/20'
          }`}
        >
          <Check size={13} />
          {node.completed ? 'Completed ✓' : 'Mark as Complete'}
        </button>

        {/* Resources */}
        {node.resources && node.resources.length > 0 && (
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-[#bbb] dark:text-[#555]">Resources</span>
            <div className="mt-2 space-y-2">
              {node.resources.map((res, i) => {
                const Icon = RESOURCE_ICONS[res.type] || FileText;
                return (
                  <a
                    key={i}
                    href={res.url || `https://www.google.com/search?q=${encodeURIComponent(res.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 p-2.5 rounded-lg bg-[#f5f5f5] dark:bg-[#141414] hover:bg-[#ede9fe] dark:hover:bg-[#1e1a2e] border border-[#e5e7eb] dark:border-[#222] transition-colors group"
                  >
                    <Icon size={13} className="text-[#5438dc] shrink-0" />
                    <span className="text-xs text-[#444] dark:text-[#aaa] group-hover:text-[#5438dc] transition-colors flex-1 leading-snug">{res.title}</span>
                    <ExternalLink size={11} className="text-[#bbb] group-hover:text-[#5438dc] shrink-0" />
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main Roadmap Page ─────────────────────────────────────────────────────────

const Roadmap = ({ user, initialRoadmapId, onNavigateToChat }) => {
  const [roadmaps, setRoadmaps] = useState([]);
  const [activeRoadmap, setActiveRoadmap] = useState(null);
  const [loadingList, setLoadingList] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [loadingRoadmap, setLoadingRoadmap] = useState(false);
  const [topicInput, setTopicInput] = useState('');
  const [layout, setLayout] = useState('tree-tb');
  const [selectedNode, setSelectedNode] = useState(null);
  const [error, setError] = useState('');

  // Load all roadmaps
  useEffect(() => {
    fetchRoadmaps();
  }, []);

  // Load a specific roadmap if navigated from chat
  useEffect(() => {
    if (initialRoadmapId) {
      loadRoadmap(initialRoadmapId);
    }
  }, [initialRoadmapId]);

  const fetchRoadmaps = async () => {
    try {
      setLoadingList(true);
      const data = await roadmapApi.getAll();
      if (data.success) {
        setRoadmaps(data.roadmaps || []);
        // Load first roadmap automatically if no specific one requested
        if (data.roadmaps?.length > 0 && !initialRoadmapId) {
          loadRoadmap(data.roadmaps[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load roadmaps:', err);
    } finally {
      setLoadingList(false);
    }
  };

  const loadRoadmap = async (id) => {
    try {
      setLoadingRoadmap(true);
      setSelectedNode(null);
      const data = await roadmapApi.getById(id);
      if (data.success) {
        setActiveRoadmap(data.roadmap);
      }
    } catch (err) {
      console.error('Failed to load roadmap:', err);
    } finally {
      setLoadingRoadmap(false);
    }
  };

  const handleGenerate = async () => {
    if (!topicInput.trim() || generating) return;
    setError('');
    setGenerating(true);
    try {
      const data = await roadmapApi.generate(topicInput.trim());
      if (data.success) {
        const newRoadmap = data.roadmap;
        setRoadmaps(prev => [
          { id: newRoadmap.id, title: newRoadmap.title, topic: newRoadmap.topic, level: newRoadmap.level, estimatedWeeks: newRoadmap.estimatedWeeks, isCompleted: false, createdAt: newRoadmap.createdAt },
          ...prev
        ]);
        setActiveRoadmap(newRoadmap);
        setTopicInput('');
        setSelectedNode(null);
      }
    } catch (err) {
      setError(err.message || 'Failed to generate roadmap. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteRoadmap = async (e, id) => {
    e.stopPropagation();
    try {
      await roadmapApi.delete(id);
      setRoadmaps(prev => prev.filter(r => r.id !== id));
      if (activeRoadmap?.id === id) {
        setActiveRoadmap(null);
        const remaining = roadmaps.filter(r => r.id !== id);
        if (remaining.length > 0) loadRoadmap(remaining[0].id);
      }
    } catch (err) {
      console.error('Failed to delete roadmap:', err);
    }
  };

  const handleToggleComplete = async (sectionId, topicId, isCompleted) => {
    if (!activeRoadmap) return;
    try {
      const data = await roadmapApi.updateProgress(activeRoadmap.id, sectionId, topicId, isCompleted);
      if (data.success) {
        setActiveRoadmap(data.roadmap);
        // Update the node in place if selected
        if (selectedNode?.topicId === topicId) {
          setSelectedNode(prev => ({ ...prev, completed: isCompleted }));
        }
      }
    } catch (err) {
      console.error('Failed to update progress:', err);
    }
  };

  const handleNodeClick = (node) => {
    if (node.type === 'topic') {
      setSelectedNode(node);
    } else {
      setSelectedNode(null);
    }
  };

  // Calculate progress %
  const getProgress = (roadmap) => {
    if (!roadmap?.sections?.length) return 0;
    let total = 0, done = 0;
    roadmap.sections.forEach(s => {
      s.topics?.forEach(t => {
        total++;
        if (t.isCompleted) done++;
      });
    });
    return total === 0 ? 0 : Math.round((done / total) * 100);
  };

  const progress = getProgress(activeRoadmap);
  const levelColor = activeRoadmap ? (LEVEL_COLORS[activeRoadmap.level] || LEVEL_COLORS.beginner) : null;

  return (
    <div className="flex h-[calc(100vh-5.5rem)] rounded-xl border border-[#ebebeb] dark:border-[#1c1c1c] bg-white dark:bg-[#0f0f0f] overflow-hidden">

      {/* ── Left: History Sidebar ── */}
      <div className="w-60 shrink-0 border-r border-[#ebebeb] dark:border-[#1c1c1c] bg-[#fafafa] dark:bg-[#141414] flex flex-col">
        <div className="p-3 border-b border-[#ebebeb] dark:border-[#1c1c1c]">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-md bg-[#5438dc]/10 flex items-center justify-center">
              <Map size={13} className="text-[#5438dc]" />
            </div>
            <span className="text-xs font-semibold text-[#111] dark:text-[#e5e5e5]">My Roadmaps</span>
          </div>

          {/* Generate Input */}
          <div className="space-y-2">
            <input
              type="text"
              value={topicInput}
              onChange={e => setTopicInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleGenerate()}
              placeholder="e.g. Machine Learning..."
              className="w-full px-3 py-2 text-xs bg-white dark:bg-[#1a1a1a] border border-[#e5e7eb] dark:border-[#2a2a2a] rounded-lg text-[#111] dark:text-[#e5e5e5] placeholder:text-[#aaa] outline-none focus:border-[#5438dc] focus:ring-1 focus:ring-[#5438dc]/20 transition-all"
            />
            <button
              onClick={handleGenerate}
              disabled={!topicInput.trim() || generating}
              className="w-full flex items-center justify-center gap-2 py-2 bg-[#5438dc] hover:bg-[#452bc4] disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              {generating
                ? <><Loader2 size={13} className="animate-spin" /> Generating...</>
                : <><Sparkles size={13} /> Generate Roadmap</>
              }
            </button>
            {error && (
              <div className="flex items-center gap-1.5 text-[10px] text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-1.5 rounded-lg">
                <AlertCircle size={11} />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>

        {/* Roadmap List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loadingList ? (
            <div className="flex items-center justify-center h-20 text-[#888]">
              <Loader2 size={16} className="animate-spin" />
            </div>
          ) : roadmaps.length === 0 ? (
            <div className="p-4 text-center text-xs text-[#888] dark:text-[#555]">
              <Map size={24} className="mx-auto mb-2 opacity-30" />
              No roadmaps yet.<br />Generate your first one!
            </div>
          ) : (
            roadmaps.map(rm => {
              const isActive = activeRoadmap?.id === rm.id;
              const lc = LEVEL_COLORS[rm.level] || LEVEL_COLORS.beginner;
              return (
                <div
                  key={rm.id}
                  onClick={() => loadRoadmap(rm.id)}
                  className={`group relative px-3 py-2.5 rounded-lg cursor-pointer transition-all ${
                    isActive
                      ? 'bg-[#5438dc]/10 dark:bg-[#5438dc]/15 border border-[#5438dc]/20'
                      : 'hover:bg-[#f0f0f0] dark:hover:bg-[#1a1a1a] border border-transparent'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1">
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs font-medium truncate ${isActive ? 'text-[#5438dc] dark:text-[#7c64f0]' : 'text-[#333] dark:text-[#ccc]'}`}>
                        {rm.title}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: lc.light, color: lc.text }}>
                          {rm.level}
                        </span>
                        <span className="text-[10px] text-[#aaa] flex items-center gap-1">
                          <Clock size={9} /> {rm.estimatedWeeks}w
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDeleteRoadmap(e, rm.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-[#ccc] hover:text-red-500 transition-all shrink-0"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── Right: Graph Area ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Topbar */}
        {activeRoadmap && (
          <div className="shrink-0 px-4 py-3 border-b border-[#ebebeb] dark:border-[#1c1c1c] flex items-center justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-[#111] dark:text-[#e5e5e5] truncate">{activeRoadmap.title}</h2>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-[11px] text-[#888]">{activeRoadmap.estimatedWeeks} weeks</span>
                <span className="text-[11px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: levelColor?.light, color: levelColor?.text }}>
                  {activeRoadmap.level}
                </span>
                <div className="flex items-center gap-1.5">
                  <div className="w-24 h-1.5 bg-[#e5e7eb] dark:bg-[#2a2a2a] rounded-full overflow-hidden">
                    <div className="h-full bg-[#22c55e] rounded-full transition-all" style={{ width: `${progress}%` }} />
                  </div>
                  <span className="text-[10px] text-[#888]">{progress}%</span>
                </div>
              </div>
            </div>

            {/* Layout options */}
            <div className="flex items-center gap-1 bg-[#f5f5f5] dark:bg-[#1a1a1a] rounded-lg p-1 shrink-0">
              {LAYOUT_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setLayout(opt.id)}
                  className={`px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all ${
                    layout === opt.id
                      ? 'bg-white dark:bg-[#2a2a2a] text-[#5438dc] shadow-sm'
                      : 'text-[#888] hover:text-[#333] dark:hover:text-[#ccc]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Graph / Content */}
        <div className="flex-1 flex overflow-hidden">
          {!activeRoadmap && !loadingRoadmap ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 rounded-2xl bg-[#5438dc]/10 flex items-center justify-center mb-4">
                <Map size={32} className="text-[#5438dc]" />
              </div>
              <h3 className="text-base font-bold text-[#111] dark:text-[#e5e5e5] mb-2">Create Your Learning Roadmap</h3>
              <p className="text-sm text-[#888] dark:text-[#555] max-w-sm mb-6">
                Enter any topic in the sidebar — AI will generate a personalized, interactive learning path just for you.
              </p>
              <div className="grid grid-cols-2 gap-2 max-w-xs">
                {['Machine Learning', 'React & Next.js', 'Circuit Design', 'Thermodynamics'].map(t => (
                  <button key={t} onClick={() => setTopicInput(t)}
                    className="px-3 py-2 text-xs bg-[#f5f5f5] dark:bg-[#1a1a1a] border border-[#e5e7eb] dark:border-[#2a2a2a] rounded-lg text-[#555] dark:text-[#888] hover:text-[#5438dc] hover:border-[#5438dc]/30 transition-all">
                    {t}
                  </button>
                ))}
              </div>
            </div>
          ) : loadingRoadmap ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Loader2 size={28} className="animate-spin text-[#5438dc] mx-auto mb-3" />
                <p className="text-sm text-[#888]">Loading roadmap…</p>
              </div>
            </div>
          ) : layout === 'list' ? (
            <div className="flex-1 overflow-hidden flex">
              <div className="flex-1 overflow-hidden">
                <RoadmapListView
                  roadmap={activeRoadmap}
                  onNodeClick={handleNodeClick}
                  onToggleComplete={handleToggleComplete}
                />
              </div>
              {selectedNode && (
                <TopicPanel
                  node={selectedNode}
                  onClose={() => setSelectedNode(null)}
                  onToggleComplete={handleToggleComplete}
                />
              )}
            </div>
          ) : (
            <div className="flex-1 overflow-hidden flex">
              <div className="flex-1 overflow-hidden">
                <RoadmapGraph
                  roadmap={activeRoadmap}
                  layout={layout}
                  selectedNodeId={selectedNode?.id}
                  onNodeClick={handleNodeClick}
                  onToggleComplete={handleToggleComplete}
                />
              </div>
              {selectedNode && (
                <TopicPanel
                  node={selectedNode}
                  onClose={() => setSelectedNode(null)}
                  onToggleComplete={handleToggleComplete}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Roadmap;

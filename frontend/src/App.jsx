import { useState, useRef, useEffect } from "react";
import { fetchRepoInfo, fetchRepoIssues, analyzeIssue, askRepoQuestion } from "./api";

// ── Icons ──────────────────────────────────────────────────────────────────
const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

const SparkleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
  </svg>
);

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
  </svg>
);

const StarIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-amber-400">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const ForkIcon = () => (
  <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 text-slate-400">
    <path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

const FileIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14,2 14,8 20,8" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const AlertIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const BulbIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 8v4M12 16h.01" />
  </svg>
);

const ChatIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const SendIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const HelpCircleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const LayersIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
);

// ── Helpers ───────────────────────────────────────────────────────────────
const difficultyConfig = {
  beginner:     { cls: "badge-green",  label: "Beginner" },
  intermediate: { cls: "badge-yellow", label: "Intermediate" },
  advanced:     { cls: "badge-red",    label: "Advanced" },
};

const actionConfig = {
  modify: { cls: "badge-blue",   label: "Modify" },
  create: { cls: "badge-green",  label: "Create" },
  read:   { cls: "badge-purple", label: "Read" },
};

const priorityConfig = {
  high:   "text-red-400",
  medium: "text-amber-400",
  low:    "text-slate-400",
};

// ── Markdown & Code Helpers ────────────────────────────────────────────────
function CodeSnippet({ code, lang }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="relative my-3 rounded-xl border border-dark-600/70 bg-dark-950 overflow-hidden group">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-dark-800/80 border-b border-dark-600/40 text-[11px] font-mono text-slate-400">
        <span>{lang || "code"}</span>
        <button
          onClick={handleCopy}
          className="text-xs text-brand-400 hover:text-brand-300 transition-colors flex items-center gap-1 font-sans"
        >
          {copied ? "✓ Copied" : "Copy"}
        </button>
      </div>
      <pre className="p-3.5 text-xs font-mono text-slate-200 overflow-x-auto whitespace-pre leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function formatInline(text) {
  const tokens = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return tokens.map((token, i) => {
    if (token.startsWith("`") && token.endsWith("`")) {
      return (
        <code key={i} className="px-1.5 py-0.5 rounded bg-dark-700/80 text-brand-300 font-mono text-xs border border-dark-600/40">
          {token.slice(1, -1)}
        </code>
      );
    }
    if (token.startsWith("**") && token.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-slate-100">
          {token.slice(2, -2)}
        </strong>
      );
    }
    return token;
  });
}

function MarkdownContent({ content }) {
  if (!content) return null;
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-3 text-slate-300 text-sm leading-relaxed">
      {parts.map((part, index) => {
        if (part.startsWith("```") && part.endsWith("```")) {
          const lines = part.slice(3, -3).trim().split("\n");
          let lang = "";
          let code = part.slice(3, -3).trim();
          if (lines[0] && !lines[0].includes(" ") && lines.length > 1) {
            lang = lines[0];
            code = lines.slice(1).join("\n");
          }
          return <CodeSnippet key={index} code={code} lang={lang} />;
        }

        const paragraphs = part.split(/\n\n+/);
        return (
          <div key={index} className="space-y-2">
            {paragraphs.map((p, pIdx) => {
              const trimmed = p.trim();
              if (!trimmed) return null;

              if (trimmed.startsWith("### ")) {
                return (
                  <h4 key={pIdx} className="text-base font-bold text-slate-100 mt-3 mb-1">
                    {trimmed.replace("### ", "")}
                  </h4>
                );
              }
              if (trimmed.startsWith("## ")) {
                return (
                  <h3 key={pIdx} className="text-lg font-bold text-slate-100 mt-4 mb-2">
                    {trimmed.replace("## ", "")}
                  </h3>
                );
              }
              if (trimmed.startsWith("# ")) {
                return (
                  <h2 key={pIdx} className="text-xl font-bold text-slate-100 mt-4 mb-2">
                    {trimmed.replace("# ", "")}
                  </h2>
                );
              }

              const lines = trimmed.split("\n");
              if (lines.length > 1 && lines.every(l => l.trim().startsWith("- ") || l.trim().startsWith("* ") || /^\d+\.\s/.test(l.trim()))) {
                return (
                  <ul key={pIdx} className="space-y-1.5 my-2 pl-2">
                    {lines.map((item, iIdx) => {
                      const cleanItem = item.replace(/^[-*]\s+|\d+\.\s+/, "");
                      return (
                        <li key={iIdx} className="flex items-start gap-2 text-slate-300">
                          <span className="text-brand-400 mt-1 flex-shrink-0 text-xs">•</span>
                          <span>{formatInline(cleanItem)}</span>
                        </li>
                      );
                    })}
                  </ul>
                );
              }

              return <p key={pIdx} className="leading-relaxed">{formatInline(trimmed)}</p>;
            })}
          </div>
        );
      })}
    </div>
  );
}

// ── Skeleton Loader ───────────────────────────────────────────────────────
function SkeletonBlock({ className = "" }) {
  return <div className={`shimmer-bg rounded-lg ${className}`} />;
}

function PlanSkeleton() {
  return (
    <div className="space-y-5 animate-fade-in">
      <SkeletonBlock className="h-24 w-full" />
      <div className="grid grid-cols-3 gap-3">
        <SkeletonBlock className="h-20" />
        <SkeletonBlock className="h-20" />
        <SkeletonBlock className="h-20" />
      </div>
      <SkeletonBlock className="h-48 w-full" />
      <SkeletonBlock className="h-48 w-full" />
    </div>
  );
}

// ── Step Card ────────────────────────────────────────────────────────────
function StepCard({ step }) {
  const [open, setOpen] = useState(step.step_number === 1);
  return (
    <div className="glass-card overflow-hidden transition-all duration-300">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-4 p-4 text-left hover:bg-white/5 transition-colors"
      >
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-brand-500/20">
          {step.step_number}
        </div>
        <span className="flex-1 font-semibold text-slate-200 text-sm">{step.title}</span>
        <span className={`text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
          <ChevronDownIcon />
        </span>
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-dark-600/50 pt-4 space-y-3 animate-fade-in">
          <p className="text-slate-300 text-sm leading-relaxed">{step.description}</p>
          {step.code_hint && (
            <pre className="code-block overflow-x-auto whitespace-pre-wrap break-words">
              <code>{step.code_hint}</code>
            </pre>
          )}
        </div>
      )}
    </div>
  );
}

// ── File Card ────────────────────────────────────────────────────────────
function FileCard({ file }) {
  const action = actionConfig[file.action] || { cls: "badge-teal", label: file.action };
  return (
    <div className="glass-card-hover p-4 space-y-2">
      <div className="flex items-start gap-2 justify-between flex-wrap gap-y-1">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-brand-400 flex-shrink-0"><FileIcon /></span>
          <span className="font-mono text-xs text-brand-300 truncate">{file.path}</span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={file.priority ? priorityConfig[file.priority] : "text-slate-400"}>
            <span className="text-xs font-medium capitalize">{file.priority}</span>
          </span>
          <span className={action.cls}>{action.label}</span>
        </div>
      </div>
      <p className="text-slate-400 text-xs leading-relaxed pl-6">{file.reason}</p>
    </div>
  );
}

// ── Issue Card ────────────────────────────────────────────────────────────
function IssueCard({ issue, selected, onSelect }) {
  return (
    <button
      onClick={() => onSelect(issue)}
      className={`w-full text-left p-4 rounded-xl border transition-all duration-200 space-y-2
        ${selected
          ? "border-brand-500/60 bg-brand-500/10 shadow-md shadow-brand-500/10"
          : "border-dark-600 bg-dark-800/40 hover:border-brand-500/30 hover:bg-dark-800/70"}`}
    >
      <div className="flex items-start gap-2 justify-between">
        <span className="font-medium text-sm text-slate-200 leading-snug flex-1">{issue.title}</span>
        {selected && <span className="text-brand-400 flex-shrink-0"><CheckIcon /></span>}
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-slate-500">#{issue.number}</span>
        {issue.labels?.map(l => (
          <span key={l} className="badge-teal text-[10px]">{l}</span>
        ))}
        {issue.comments > 0 && (
          <span className="text-xs text-slate-500">{issue.comments} comments</span>
        )}
      </div>
    </button>
  );
}

// ── Contribution Plan ────────────────────────────────────────────────────
function ContributionPlan({ plan, repoInfo, issueTitle, onAskQuestion }) {
  const diff = difficultyConfig[plan.difficulty] || { cls: "badge-teal", label: plan.difficulty };
  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-start gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="section-title mb-2">Contribution Plan</div>
            <h2 className="text-xl font-bold text-slate-100 leading-snug">{issueTitle}</h2>
          </div>
          <div className="flex gap-2 flex-wrap flex-shrink-0">
            <span className={diff.cls}>{diff.label}</span>
            {onAskQuestion && (
              <button
                onClick={onAskQuestion}
                className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
              >
                <ChatIcon />
                <span>Ask About Repo</span>
              </button>
            )}
          </div>
        </div>
        <p className="text-slate-300 text-sm leading-relaxed">{plan.summary}</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
          <div className="bg-dark-700/50 rounded-xl p-3 border border-dark-600/30">
            <div className="text-xs text-slate-500 mb-1">Est. Time</div>
            <div className="text-sm font-semibold text-slate-200">{plan.estimated_time || "—"}</div>
          </div>
          <div className="bg-dark-700/50 rounded-xl p-3 border border-dark-600/30">
            <div className="text-xs text-slate-500 mb-1">Files to Touch</div>
            <div className="text-sm font-semibold text-slate-200">{plan.relevant_files?.length ?? 0}</div>
          </div>
          <div className="bg-dark-700/50 rounded-xl p-3 border border-dark-600/30">
            <div className="text-xs text-slate-500 mb-1">Steps</div>
            <div className="text-sm font-semibold text-slate-200">{plan.steps?.length ?? 0}</div>
          </div>
        </div>

        {plan.key_concepts?.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {plan.key_concepts.map(c => (
              <span key={c} className="badge-purple">{c}</span>
            ))}
          </div>
        )}
      </div>

      {/* Relevant Files */}
      {plan.relevant_files?.length > 0 && (
        <div className="space-y-3">
          <div className="section-title">Relevant Files</div>
          <div className="space-y-2">
            {plan.relevant_files.map((f, i) => <FileCard key={i} file={f} />)}
          </div>
        </div>
      )}

      {/* Steps */}
      {plan.steps?.length > 0 && (
        <div className="space-y-3">
          <div className="section-title">Step-by-Step Guide</div>
          <div className="space-y-2">
            {plan.steps.map(s => <StepCard key={s.step_number} step={s} />)}
          </div>
        </div>
      )}

      {/* Testing */}
      {plan.testing_approach && (
        <div className="glass-card p-5 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400">
            <CheckIcon />
            <span className="font-semibold text-sm">Testing Approach</span>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed">{plan.testing_approach}</p>
        </div>
      )}

      {/* Risks */}
      {plan.risks_and_gotchas?.length > 0 && (
        <div className="glass-card p-5 space-y-3">
          <div className="flex items-center gap-2 text-amber-400">
            <AlertIcon />
            <span className="font-semibold text-sm">Risks & Gotchas</span>
          </div>
          <ul className="space-y-2">
            {plan.risks_and_gotchas.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                <span className="text-amber-500 mt-0.5 flex-shrink-0">•</span>
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* PR Tips */}
      {plan.good_first_pr_tips && (
        <div className="glass-card p-5 space-y-2 border-brand-500/20">
          <div className="flex items-center gap-2 text-brand-400">
            <BulbIcon />
            <span className="font-semibold text-sm">PR Tips</span>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed">{plan.good_first_pr_tips}</p>
        </div>
      )}
    </div>
  );
}

// ── Repo Q&A Section (Ask Anything) ──────────────────────────────────────
function RepoQASection({ repoUrl, repoInfo }) {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const bottomRef = useRef(null);

  const suggestedPrompts = [
    { label: "🚀 Local Setup", query: "How do I set up, build, and run this project locally?" },
    { label: "🏗️ Architecture", query: "Explain the overall architecture, folder structure, and design patterns used here." },
    { label: "🧪 Running Tests", query: "How do I run tests, what test runner is used, and how do I write new tests?" },
    { label: "🔌 Core Entrypoints", query: "Where are the primary entrypoints, main modules, and API route definitions?" },
    { label: "📦 Tech Stack", query: "What dependencies, tools, and runtime environment does this project rely on?" },
    { label: "🤝 Good 1st PR", query: "What are good areas or tasks for a beginner or first-time contributor to start with?" },
  ];

  async function handleAsk(queryToSubmit) {
    const q = (queryToSubmit || question).trim();
    if (!q || loading) return;

    setLoading(true);
    setError("");
    const userQuestion = q;
    setQuestion("");

    try {
      const data = await askRepoQuestion({ repoUrl, question: userQuestion });
      setHistory(prev => [
        ...prev,
        {
          id: Date.now(),
          question: userQuestion,
          data: data,
        },
      ]);
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err) {
      setError(err.message || "Failed to answer question. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Card */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="inline-flex items-center gap-1.5 badge-teal mb-2">
              <SparkleIcon />
              <span>Interactive Repository Assistant</span>
            </div>
            <h2 className="text-xl font-bold text-slate-100">Ask Anything About {repoInfo.name}</h2>
            <p className="text-slate-400 text-sm mt-1">
              Ask any question about architecture, functions, testing, setup, or code patterns. RepoRescue reads the codebase files and tree to give you precise answers.
            </p>
          </div>
          {history.length > 0 && (
            <button
              onClick={() => setHistory([])}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              Clear conversation
            </button>
          )}
        </div>

        {/* Suggested Quick Prompts */}
        <div className="space-y-2 pt-1">
          <div className="section-title">Suggested Inquiries</div>
          <div className="flex flex-wrap gap-2">
            {suggestedPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleAsk(p.query)}
                disabled={loading}
                className="badge-teal cursor-pointer hover:bg-brand-500/20 transition-all text-xs py-1.5 px-3 disabled:opacity-50"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Q&A Stream / History */}
      <div className="space-y-6">
        {history.map(item => (
          <div key={item.id} className="space-y-4 animate-slide-up">
            {/* User Question */}
            <div className="flex items-start gap-3 justify-end">
              <div className="max-w-2xl bg-gradient-to-r from-brand-600 to-brand-700 text-white p-4 rounded-2xl rounded-tr-sm shadow-md text-sm leading-relaxed font-medium">
                {item.question}
              </div>
              <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                You
              </div>
            </div>

            {/* AI Answer Card */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center text-white text-xs flex-shrink-0 shadow-md shadow-brand-500/20">
                <SparkleIcon />
              </div>
              <div className="flex-1 glass-card p-6 space-y-4 rounded-tl-sm border-brand-500/20">
                {/* Main Explanation */}
                <MarkdownContent content={item.data.answer} />

                {/* Key Takeaways */}
                {item.data.key_takeaways?.length > 0 && (
                  <div className="bg-dark-700/40 rounded-xl p-4 border border-dark-600/40 space-y-2 mt-3">
                    <div className="text-xs font-semibold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                      <CheckIcon />
                      <span>Key Takeaways</span>
                    </div>
                    <ul className="space-y-1.5">
                      {item.data.key_takeaways.map((k, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                          <span className="text-brand-400 mt-0.5">•</span>
                          <span>{k}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Referenced Files */}
                {item.data.relevant_files?.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-dark-600/30">
                    <div className="section-title">Referenced Files in Repo</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {item.data.relevant_files.map((rf, rIdx) => (
                        <div key={rIdx} className="bg-dark-900/60 rounded-lg p-2.5 border border-dark-600/40 flex items-start gap-2">
                          <span className="text-brand-400 flex-shrink-0 mt-0.5"><FileIcon /></span>
                          <div className="min-w-0">
                            <div className="font-mono text-xs text-brand-300 truncate font-semibold">{rf.path}</div>
                            {rf.reason && <p className="text-[11px] text-slate-400 leading-snug mt-0.5">{rf.reason}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggested Follow-Ups */}
                {item.data.suggested_follow_ups?.length > 0 && (
                  <div className="pt-2 border-t border-dark-600/30 space-y-2">
                    <div className="text-xs text-slate-400 flex items-center gap-1">
                      <BulbIcon />
                      <span>Related follow-up questions you might want to ask:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {item.data.suggested_follow_ups.map((fu, fIdx) => (
                        <button
                          key={fIdx}
                          onClick={() => handleAsk(fu)}
                          disabled={loading}
                          className="text-xs text-slate-300 bg-dark-700/60 hover:bg-brand-500/20 hover:text-white border border-dark-600 rounded-lg px-2.5 py-1.5 transition-colors text-left"
                        >
                          👉 {fu}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Loading state indicator */}
        {loading && (
          <div className="flex items-start gap-3 animate-fade-in">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center text-white text-xs flex-shrink-0 shadow-md">
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
            <div className="flex-1 glass-card p-6 space-y-3 rounded-tl-sm border-brand-500/20">
              <div className="flex items-center gap-2 text-xs text-brand-400">
                <span>Inspecting repository files & generating explanation…</span>
              </div>
              <SkeletonBlock className="h-4 w-3/4" />
              <SkeletonBlock className="h-4 w-full" />
              <SkeletonBlock className="h-20 w-full" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input Form Bar */}
      <div className="sticky bottom-4 z-40">
        <form
          onSubmit={e => { e.preventDefault(); handleAsk(); }}
          className="glass-card p-2 sm:p-3 border-brand-500/30 shadow-2xl bg-dark-900/90 backdrop-blur-2xl flex items-center gap-2"
        >
          <div className="pl-3 text-slate-500">
            <ChatIcon />
          </div>
          <input
            type="text"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            placeholder={`Ask anything about ${repoInfo.name} (e.g. "Where is the auth logic?", "How do routes work?")...`}
            className="flex-1 bg-transparent border-none text-slate-100 placeholder-slate-500 text-sm focus:outline-none px-2 py-1 font-sans"
          />
          <button
            type="submit"
            disabled={!question.trim() || loading}
            className="btn-primary py-2 px-4 text-xs flex-shrink-0"
          >
            {loading ? (
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <>
                <span>Ask</span>
                <SendIcon />
              </>
            )}
          </button>
        </form>
      </div>

      {error && (
        <div className="flex items-start gap-2 text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          <AlertIcon />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────
export default function App() {
  const [step, setStep] = useState("input");         // input | repo | analyzing | result
  const [activeTab, setActiveTab] = useState("issues"); // issues | ask
  const [repoUrl, setRepoUrl] = useState("");
  const [repoInfo, setRepoInfo] = useState(null);
  const [issues, setIssues] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [manualIssue, setManualIssue] = useState({ title: "", body: "" });
  const [useManual, setUseManual] = useState(false);
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState("");
  const [loadingRepo, setLoadingRepo] = useState(false);
  const [filterText, setFilterText] = useState("");

  const filteredIssues = issues.filter(
    i =>
      i.title.toLowerCase().includes(filterText.toLowerCase()) ||
      i.labels?.some(l => l.toLowerCase().includes(filterText.toLowerCase()))
  );

  async function handleFetchRepo(e, targetUrl = null) {
    if (e) e.preventDefault();
    const url = targetUrl || repoUrl;
    if (!url.trim()) return;
    setLoadingRepo(true);
    setError("");
    try {
      const [info, { issues: fetchedIssues }] = await Promise.all([
        fetchRepoInfo(url),
        fetchRepoIssues(url),
      ]);
      setRepoInfo(info);
      setIssues(fetchedIssues);
      setStep("repo");
      setActiveTab("issues");
    } catch (err) {
      setError(err.message || "Failed to fetch repository. Check the URL and try again.");
    } finally {
      setLoadingRepo(false);
    }
  }

  async function handleAnalyze() {
    setStep("analyzing");
    setError("");
    try {
      const payload = { repoUrl };
      if (useManual) {
        payload.issueTitle = manualIssue.title;
        payload.issueBody  = manualIssue.body;
      } else if (selectedIssue) {
        payload.issueNumber = selectedIssue.number;
      } else {
        throw new Error("Please select or enter an issue.");
      }
      const result = await analyzeIssue(payload);
      setPlan(result);
      setStep("result");
    } catch (err) {
      setError(err.message || "Analysis failed. Make sure the backend is running and an AI API key is set.");
      setStep("repo");
    }
  }

  function reset() {
    setStep("input");
    setActiveTab("issues");
    setRepoUrl("");
    setRepoInfo(null);
    setIssues([]);
    setSelectedIssue(null);
    setManualIssue({ title: "", body: "" });
    setUseManual(false);
    setPlan(null);
    setError("");
    setFilterText("");
  }

  const issueTitle = useManual ? manualIssue.title : selectedIssue?.title || "";

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-dark-600/50 bg-dark-900/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <button onClick={reset} className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-md shadow-brand-500/30 group-hover:shadow-brand-500/50 transition-shadow">
              <SparkleIcon />
            </div>
            <span className="font-bold text-white tracking-tight">
              Repo<span className="text-gradient">Rescue</span>
            </span>
          </button>
          <div className="flex items-center gap-3">
            {step !== "input" && (
              <button onClick={reset} className="btn-secondary text-xs py-1.5 px-3">
                ← New Repo
              </button>
            )}
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-white transition-colors"
            >
              <GitHubIcon />
            </a>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12">
        {/* ── STEP: INPUT ─────────────────────────────────────────── */}
        {step === "input" && (
          <div className="animate-fade-in">
            {/* Hero */}
            <div className="text-center mb-12 space-y-4">
              <div className="inline-flex items-center gap-2 badge-teal mb-4">
                <SparkleIcon />
                <span>AI-Powered Repository Assistant & Contribution Guide</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight">
                Understand and contribute to<br />
                <span className="text-gradient">any open-source repo</span>
              </h1>
              <p className="text-slate-400 text-lg max-w-xl mx-auto">
                Paste any GitHub repository URL. Ask any question to understand the codebase or pick an issue to generate an actionable step-by-step contribution plan.
              </p>
            </div>

            {/* Input Card */}
            <div className="max-w-2xl mx-auto glass-card p-8 space-y-6">
              <form onSubmit={handleFetchRepo} className="space-y-4">
                <div className="space-y-2">
                  <label className="section-title">GitHub Repository URL</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                      <GitHubIcon />
                    </span>
                    <input
                      type="text"
                      value={repoUrl}
                      onChange={e => setRepoUrl(e.target.value)}
                      placeholder="https://github.com/owner/repository"
                      className="input-field pl-10"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                    <AlertIcon />
                    <span>{error}</span>
                  </div>
                )}

                <button type="submit" disabled={loadingRepo} className="btn-primary w-full justify-center py-3.5">
                  {loadingRepo ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Fetching Repository…
                    </>
                  ) : (
                    <>
                      <ArrowRightIcon />
                      Explore Repository
                    </>
                  )}
                </button>
              </form>

              {/* Examples */}
              <div className="space-y-2">
                <div className="section-title">Try an example</div>
                <div className="flex flex-wrap gap-2">
                  {[
                    "https://github.com/pallets/flask",
                    "https://github.com/psf/requests",
                    "https://github.com/expressjs/express",
                  ].map(url => (
                    <button
                      key={url}
                      onClick={() => {
                        setRepoUrl(url);
                        handleFetchRepo(null, url);
                      }}
                      className="badge-teal cursor-pointer hover:bg-brand-500/20 transition-colors text-xs"
                    >
                      {url.replace("https://github.com/", "")}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Feature grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto mt-8">
              {[
                { icon: "💬", title: "Ask Anything", desc: "Ask any question about setup, architecture, routes, or tests and get instant answers with code snippets." },
                { icon: "🎯", title: "Actionable Fixes", desc: "Pick any GitHub issue and get file paths, code hints, testing guidance, and PR tips." },
                { icon: "⚡", title: "Context Aware", desc: "Analyzes actual files, READMEs, and project tree for grounded, reliable guidance." },
              ].map(f => (
                <div key={f.title} className="glass-card p-5 space-y-2 text-center">
                  <div className="text-2xl">{f.icon}</div>
                  <div className="font-semibold text-sm text-slate-200">{f.title}</div>
                  <div className="text-xs text-slate-400 leading-relaxed">{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP: REPO VIEW (TABS: ISSUES | ASK) ────────────────── */}
        {step === "repo" && repoInfo && (
          <div className="animate-slide-up space-y-6">
            {/* Repo Info Bar */}
            <div className="glass-card p-5 flex flex-wrap gap-4 items-center justify-between">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white flex-shrink-0">
                  <GitHubIcon />
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-slate-100 truncate">{repoInfo.full_name}</div>
                  <div className="text-xs text-slate-400 truncate">{repoInfo.description || "No description"}</div>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-400">
                <span className="flex items-center gap-1"><StarIcon />{repoInfo.stars?.toLocaleString()}</span>
                <span className="flex items-center gap-1"><ForkIcon />{repoInfo.forks?.toLocaleString()}</span>
                {repoInfo.language && <span className="badge-blue">{repoInfo.language}</span>}
              </div>
            </div>

            {/* View Selector Tabs */}
            <div className="flex items-center gap-2 p-1.5 bg-dark-800/80 rounded-xl border border-dark-600/50 w-full sm:w-fit">
              <button
                onClick={() => setActiveTab("issues")}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === "issues"
                    ? "bg-brand-500 text-white shadow-md shadow-brand-500/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <LayersIcon />
                <span>Issues & Contribution Guide</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === "issues" ? "bg-white/20 text-white" : "bg-dark-700 text-slate-400"}`}>
                  {issues.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("ask")}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === "ask"
                    ? "bg-brand-500 text-white shadow-md shadow-brand-500/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <ChatIcon />
                <span>Ask Anything About Repo</span>
                <span className="badge-teal text-[10px] py-0 px-1.5">AI</span>
              </button>
            </div>

            {/* Tab 1: Issues & Contribution */}
            {activeTab === "issues" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
                {/* Issues Panel */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="section-title">Open Issues ({issues.length})</div>
                    <button
                      onClick={() => { setUseManual(m => !m); setSelectedIssue(null); }}
                      className="text-xs text-brand-400 hover:text-brand-300 transition-colors"
                    >
                      {useManual ? "← Pick from list" : "Enter manually →"}
                    </button>
                  </div>

                  {!useManual ? (
                    <>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"><SearchIcon /></span>
                        <input
                          type="text"
                          value={filterText}
                          onChange={e => setFilterText(e.target.value)}
                          placeholder="Filter issues…"
                          className="input-field pl-9 py-2 text-xs"
                        />
                      </div>
                      <div className="space-y-2 max-h-[420px] overflow-y-auto scrollbar-thin pr-1">
                        {filteredIssues.length === 0 ? (
                          <div className="text-center text-slate-500 text-sm py-8">No issues found.</div>
                        ) : filteredIssues.map(issue => (
                          <IssueCard
                            key={issue.number}
                            issue={issue}
                            selected={selectedIssue?.number === issue.number}
                            onSelect={i => { setSelectedIssue(i); setUseManual(false); }}
                          />
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={manualIssue.title}
                        onChange={e => setManualIssue(m => ({ ...m, title: e.target.value }))}
                        placeholder="Issue title"
                        className="input-field"
                      />
                      <textarea
                        value={manualIssue.body}
                        onChange={e => setManualIssue(m => ({ ...m, body: e.target.value }))}
                        placeholder="Issue description (optional)"
                        rows={5}
                        className="input-field resize-none"
                      />
                    </div>
                  )}
                </div>

                {/* Analyze Panel */}
                <div className="space-y-3">
                  <div className="section-title">Ready to Analyze</div>
                  <div className="glass-card p-6 space-y-4 h-full flex flex-col justify-between">
                    {(selectedIssue || (useManual && manualIssue.title)) ? (
                      <div className="space-y-3 flex-1">
                        <div className="text-xs text-slate-500">Selected Issue</div>
                        <div className="font-semibold text-slate-200 text-sm leading-snug">
                          {useManual ? manualIssue.title : selectedIssue.title}
                        </div>
                        {!useManual && selectedIssue?.labels?.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {selectedIssue.labels.map(l => (
                              <span key={l} className="badge-teal">{l}</span>
                            ))}
                          </div>
                        )}
                        {!useManual && selectedIssue?.body && (
                          <p className="text-slate-400 text-xs leading-relaxed line-clamp-4">
                            {selectedIssue.body}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center py-8 space-y-2">
                        <div className="text-3xl">👈</div>
                        <div className="text-sm text-slate-400">Select an issue from the list or enter one manually</div>
                      </div>
                    )}

                    {error && (
                      <div className="flex items-start gap-2 text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
                        <AlertIcon />
                        <span>{error}</span>
                      </div>
                    )}

                    <button
                      onClick={handleAnalyze}
                      disabled={!(selectedIssue || (useManual && manualIssue.title))}
                      className="btn-primary w-full justify-center"
                    >
                      <SparkleIcon />
                      Generate Contribution Plan
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Ask Anything About Repo */}
            {activeTab === "ask" && (
              <RepoQASection repoUrl={repoUrl} repoInfo={repoInfo} />
            )}
          </div>
        )}

        {/* ── STEP: ANALYZING ──────────────────────────────────────── */}
        {step === "analyzing" && (
          <div className="animate-fade-in space-y-6">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 badge-teal">
                <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Analyzing Repository…
              </div>
              <p className="text-slate-400 text-sm">Fetching files, building context, and generating your plan…</p>
            </div>
            <PlanSkeleton />
          </div>
        )}

        {/* ── STEP: RESULT ─────────────────────────────────────────── */}
        {step === "result" && plan && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setStep("repo")}
                className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
              >
                ← Back to Repository
              </button>
              <button
                onClick={() => {
                  setStep("repo");
                  setActiveTab("ask");
                }}
                className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
              >
                <ChatIcon />
                <span>Ask Questions About This Repo</span>
              </button>
            </div>
            <ContributionPlan
              plan={plan}
              repoInfo={repoInfo}
              issueTitle={issueTitle}
              onAskQuestion={() => {
                setStep("repo");
                setActiveTab("ask");
              }}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-dark-600/30 py-6 text-center text-xs text-slate-600">
        RepoRescue — Built for open-source contributors &nbsp;•&nbsp; Powered by AI
      </footer>
    </div>
  );
}

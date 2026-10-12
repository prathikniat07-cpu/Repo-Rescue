import { useState, useRef, useEffect } from "react";
import { fetchRepoInfo, fetchRepoIssues, analyzeIssue, askRepoQuestion } from "./api";

// ── Icons ──────────────────────────────────────────────────────────────────
const GitHubIcon = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

const SparkleIcon = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
  </svg>
);

const ArrowLeftIcon = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

const ArrowRightIcon = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

const SearchIcon = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
  </svg>
);

const StarIcon = ({ className = "w-3.5 h-3.5 text-amber-400" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const ForkIcon = ({ className = "w-3.5 h-3.5 text-slate-400" }) => (
  <svg viewBox="0 0 16 16" fill="currentColor" className={className}>
    <path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z" />
  </svg>
);

const CheckIcon = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const FileIcon = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

const AlertIcon = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const BulbIcon = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
    <path d="M9 18h6" />
    <path d="M10 22h4" />
  </svg>
);

const ChatIcon = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const SendIcon = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m22 2-7 20-4-9-9-4Z" />
    <path d="M22 2 11 13" />
  </svg>
);

const CopyIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </svg>
);

const LayersIcon = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
);

const ExternalLinkIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

// ── Difficulty & Action Badges ──────────────────────────────────────────────
const difficultyConfig = {
  beginner: {
    cls: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
    dot: "bg-emerald-400",
    label: "Beginner Friendly",
  },
  intermediate: {
    cls: "bg-amber-500/15 text-amber-300 border border-amber-500/30",
    dot: "bg-amber-400",
    label: "Intermediate",
  },
  advanced: {
    cls: "bg-rose-500/15 text-rose-300 border border-rose-500/30",
    dot: "bg-rose-400",
    label: "Advanced",
  },
};

const actionConfig = {
  modify:  { cls: "bg-sky-500/10 text-sky-300 border border-sky-500/30", label: "Modify" },
  create:  { cls: "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30", label: "Create" },
  read:    { cls: "bg-purple-500/10 text-purple-300 border border-purple-500/30", label: "Inspect" },
  inspect: { cls: "bg-purple-500/10 text-purple-300 border border-purple-500/30", label: "Inspect" },
};

const priorityConfig = {
  high:   { cls: "text-rose-400 bg-rose-500/10 border-rose-500/20", label: "High Priority" },
  medium: { cls: "text-amber-400 bg-amber-500/10 border-amber-500/20", label: "Medium Priority" },
  low:    { cls: "text-slate-400 bg-slate-500/10 border-slate-500/20", label: "Low Priority" },
};

// ── Code Snippet with Copy ──────────────────────────────────────────────────
function CodeSnippet({ code, lang }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="relative my-3 rounded-xl border border-slate-800 bg-dark-950/95 overflow-hidden shadow-inner group">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-dark-900/90 border-b border-slate-800/80 text-[11px] font-mono text-slate-400">
        <span className="text-teal-400/90 font-semibold">{lang || "bash"}</span>
        <button
          onClick={handleCopy}
          className="text-xs text-slate-400 hover:text-teal-300 transition-colors flex items-center gap-1.5 font-sans"
        >
          {copied ? <CheckIcon className="w-3.5 h-3.5 text-teal-400" /> : <CopyIcon />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
      <pre className="p-4 text-xs font-mono text-slate-200 overflow-x-auto whitespace-pre leading-relaxed scrollbar-thin">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function formatInline(text) {
  if (!text) return "";
  const tokens = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return tokens.map((token, i) => {
    if (token.startsWith("`") && token.endsWith("`")) {
      return (
        <code key={i} className="px-1.5 py-0.5 rounded-md bg-dark-800 text-teal-300 font-mono text-xs border border-slate-700/60">
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
                  <h4 key={pIdx} className="text-base font-bold text-slate-100 mt-4 mb-1">
                    {trimmed.replace("### ", "")}
                  </h4>
                );
              }
              if (trimmed.startsWith("## ")) {
                return (
                  <h3 key={pIdx} className="text-lg font-bold text-slate-100 mt-5 mb-2 text-teal-300">
                    {trimmed.replace("## ", "")}
                  </h3>
                );
              }
              if (trimmed.startsWith("# ")) {
                return (
                  <h2 key={pIdx} className="text-xl font-bold text-slate-100 mt-5 mb-2">
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
                        <li key={iIdx} className="flex items-start gap-2.5 text-slate-300 text-sm">
                          <span className="text-teal-400 mt-1 flex-shrink-0 text-xs">◆</span>
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

// ── Skeleton Loader ────────────────────────────────────────────────────────
function SkeletonBlock({ className = "" }) {
  return <div className={`shimmer-bg rounded-xl ${className}`} />;
}

function PlanSkeleton() {
  return (
    <div className="glass-card p-6 space-y-6 animate-pulse-subtle">
      <div className="flex items-center gap-3">
        <SkeletonBlock className="w-10 h-10 rounded-xl" />
        <div className="space-y-2 flex-1">
          <SkeletonBlock className="h-5 w-2/3" />
          <SkeletonBlock className="h-3.5 w-1/3" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <SkeletonBlock className="h-16" />
        <SkeletonBlock className="h-16" />
        <SkeletonBlock className="h-16" />
      </div>
      <div className="space-y-3 pt-2">
        <SkeletonBlock className="h-4 w-full" />
        <SkeletonBlock className="h-4 w-5/6" />
        <SkeletonBlock className="h-4 w-4/6" />
      </div>
      <div className="space-y-2 pt-2">
        <SkeletonBlock className="h-24 w-full" />
      </div>
    </div>
  );
}

// ── Step Card Component ────────────────────────────────────────────────────
function StepCard({ step }) {
  return (
    <div className="glass-card p-5 space-y-3 hover:border-slate-700/80 transition-all">
      <div className="flex items-start gap-3 justify-between">
        <div className="flex items-center gap-2.5">
          <span className="w-6 h-6 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/40 text-xs font-bold flex items-center justify-center flex-shrink-0 font-mono">
            {step.step_number}
          </span>
          <h4 className="font-semibold text-sm text-slate-100">{step.title}</h4>
        </div>
        {step.estimated_minutes && (
          <span className="text-[11px] text-slate-400 font-mono px-2 py-0.5 rounded-full bg-dark-800 border border-slate-700/60">
            ~{step.estimated_minutes} min
          </span>
        )}
      </div>
      <p className="text-slate-300 text-xs leading-relaxed pl-8">{step.description}</p>
      {step.code_hint && (
        <div className="pl-8 pt-1">
          <CodeSnippet code={step.code_hint} lang={step.lang || "typescript"} />
        </div>
      )}
    </div>
  );
}

// ── File Card Component ────────────────────────────────────────────────────
function FileCard({ file }) {
  const [copied, setCopied] = useState(false);
  const action = actionConfig[file.action?.toLowerCase()] || actionConfig.modify;
  const priority = priorityConfig[file.priority?.toLowerCase()] || priorityConfig.medium;

  function copyPath() {
    navigator.clipboard.writeText(file.path);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="glass-card p-4 space-y-2 hover:border-slate-700/80 transition-all">
      <div className="flex items-start gap-2 justify-between flex-wrap gap-y-1">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-teal-400 flex-shrink-0"><FileIcon /></span>
          <span className="font-mono text-xs text-teal-300 truncate font-semibold">{file.path}</span>
          <button
            onClick={copyPath}
            title="Copy path"
            className="text-slate-500 hover:text-slate-200 transition-colors"
          >
            {copied ? <CheckIcon className="w-3 h-3 text-teal-400" /> : <CopyIcon className="w-3 h-3" />}
          </button>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md border ${priority.cls}`}>
            {priority.label}
          </span>
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${action.cls}`}>
            {action.label}
          </span>
        </div>
      </div>
      <p className="text-slate-400 text-xs leading-relaxed pl-6">{file.reason}</p>
    </div>
  );
}

// ── Issue Card Component ───────────────────────────────────────────────────
function IssueCard({ issue, selected, onSelect }) {
  return (
    <button
      onClick={() => onSelect(issue)}
      className={`w-full text-left p-4 rounded-xl border transition-all duration-150 space-y-2.5 relative group
        ${selected
          ? "border-teal-500/80 bg-teal-500/10 shadow-glow-teal ring-1 ring-teal-500/30"
          : "border-slate-800 bg-dark-850/60 hover:border-slate-700 hover:bg-dark-800/80"}`}
    >
      <div className="flex items-start gap-2.5 justify-between">
        <div className="flex items-center gap-2">
          <span className="text-emerald-400 w-2 h-2 rounded-full flex-shrink-0 shadow-sm" />
          <span className="text-xs font-mono font-medium text-slate-400">#{issue.number}</span>
        </div>
        {selected && (
          <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center flex-shrink-0">
            <CheckIcon className="w-3.5 h-3.5" />
          </span>
        )}
      </div>

      <div className="font-semibold text-sm text-slate-100 leading-snug line-clamp-2">
        {issue.title}
      </div>

      <div className="flex items-center gap-2 flex-wrap pt-1">
        {issue.labels?.map(l => (
          <span key={l} className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-dark-800 border border-slate-700/60 text-slate-300">
            {l}
          </span>
        ))}
        {issue.comments > 0 && (
          <span className="text-[11px] text-slate-500 ml-auto flex items-center gap-1 font-mono">
            <ChatIcon className="w-3 h-3" />
            {issue.comments}
          </span>
        )}
      </div>
    </button>
  );
}

// ── Contribution Plan Component (Result View) ─────────────────────────────
function ContributionPlan({ plan, repoInfo, issueTitle, onBackToIssues, onAskQuestion }) {
  const [copiedPlan, setCopiedPlan] = useState(false);
  const diff = difficultyConfig[plan.difficulty?.toLowerCase()] || difficultyConfig.intermediate;

  function copyFullPlan() {
    const text = `Contribution Plan for: ${issueTitle}\nDifficulty: ${plan.difficulty}\nSummary: ${plan.summary}\n\nEstimated Time: ${plan.estimated_time}\nSteps: ${plan.steps?.length}\nFiles: ${plan.relevant_files?.map(f => f.path).join(", ")}`;
    navigator.clipboard.writeText(text);
    setCopiedPlan(true);
    setTimeout(() => setCopiedPlan(false), 2000);
  }

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Top Action & Navigation Bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <button
          onClick={onBackToIssues}
          className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-2 group hover:border-teal-500/40"
        >
          <ArrowLeftIcon className="w-3.5 h-3.5 text-teal-400 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Issues List</span>
        </button>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={copyFullPlan}
            className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5"
          >
            {copiedPlan ? <CheckIcon className="w-3.5 h-3.5 text-teal-400" /> : <CopyIcon className="w-3.5 h-3.5" />}
            <span>{copiedPlan ? "Plan Copied" : "Copy Plan"}</span>
          </button>

          {onAskQuestion && (
            <button
              onClick={onAskQuestion}
              className="btn-primary text-xs py-2 px-4 flex items-center gap-2"
            >
              <ChatIcon className="w-3.5 h-3.5" />
              <span>Ask AI About This Repo</span>
            </button>
          )}
        </div>
      </div>

      {/* Hero Summary Card */}
      <div className="glass-card p-6 sm:p-8 space-y-6 border-slate-800">
        <div className="flex items-start gap-4 flex-wrap justify-between">
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-400 font-mono">
                Contribution Blueprint
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs text-slate-400 font-mono">{repoInfo.full_name}</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-100 leading-tight tracking-tight">
              {issueTitle}
            </h2>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className={`badge ${diff.cls} px-3 py-1 text-xs font-semibold flex items-center gap-1.5`}>
              <span className={`w-2 h-2 rounded-full ${diff.dot}`} />
              <span>{diff.label}</span>
            </div>
          </div>
        </div>

        <p className="text-slate-300 text-sm leading-relaxed border-l-2 border-teal-500/50 pl-4 py-0.5">
          {plan.summary}
        </p>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
          <div className="bg-dark-900/80 rounded-xl p-3.5 border border-slate-800">
            <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 mb-1">Estimated Time</div>
            <div className="text-base font-bold text-slate-100 font-mono">{plan.estimated_time || "1 - 2 hours"}</div>
          </div>
          <div className="bg-dark-900/80 rounded-xl p-3.5 border border-slate-800">
            <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 mb-1">Affected Files</div>
            <div className="text-base font-bold text-teal-300 font-mono">{plan.relevant_files?.length ?? 0} files</div>
          </div>
          <div className="bg-dark-900/80 rounded-xl p-3.5 border border-slate-800 col-span-2 sm:col-span-1">
            <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 mb-1">Action Steps</div>
            <div className="text-base font-bold text-slate-100 font-mono">{plan.steps?.length ?? 0} steps</div>
          </div>
        </div>

        {plan.key_concepts?.length > 0 && (
          <div className="space-y-2 pt-1 border-t border-slate-800/80">
            <div className="section-title">Key Architectural Concepts</div>
            <div className="flex flex-wrap gap-2">
              {plan.key_concepts.map(c => (
                <span key={c} className="badge-teal text-xs">
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Relevant Files Section */}
      {plan.relevant_files?.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="section-title flex items-center gap-2">
              <FileIcon className="text-teal-400" />
              <span>Target Files To Touch ({plan.relevant_files.length})</span>
            </div>
          </div>
          <div className="space-y-2.5">
            {plan.relevant_files.map((f, i) => (
              <FileCard key={i} file={f} />
            ))}
          </div>
        </div>
      )}

      {/* Steps Implementation Guide */}
      {plan.steps?.length > 0 && (
        <div className="space-y-3">
          <div className="section-title flex items-center gap-2">
            <LayersIcon className="text-teal-400" />
            <span>Step-by-Step Implementation Guide</span>
          </div>
          <div className="space-y-3">
            {plan.steps.map(s => (
              <StepCard key={s.step_number} step={s} />
            ))}
          </div>
        </div>
      )}

      {/* Testing Approach */}
      {plan.testing_approach && (
        <div className="glass-card p-5 space-y-2.5 border-emerald-500/20 bg-emerald-950/10">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
            <CheckIcon className="w-4 h-4" />
            <span>Verification & Testing Strategy</span>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed">{plan.testing_approach}</p>
        </div>
      )}

      {/* Risks & Gotchas */}
      {plan.risks_and_gotchas?.length > 0 && (
        <div className="glass-card p-5 space-y-3 border-amber-500/20 bg-amber-950/10">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
            <AlertIcon className="w-4 h-4" />
            <span>Potential Risks & Breaking Changes</span>
          </div>
          <ul className="space-y-2">
            {plan.risks_and_gotchas.map((r, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                <span className="text-amber-400 mt-0.5">•</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* PR Submission Tips */}
      {plan.good_first_pr_tips && (
        <div className="glass-card p-5 space-y-2 border-teal-500/20 bg-teal-950/10">
          <div className="flex items-center gap-2 text-teal-400 font-semibold text-sm">
            <BulbIcon className="w-4 h-4" />
            <span>Maintainer & Pull Request Best Practices</span>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed">{plan.good_first_pr_tips}</p>
        </div>
      )}
    </div>
  );
}

// ── Interactive AI Codebase Assistant (Q&A Section) ───────────────────────
function RepoQASection({ repoUrl, repoInfo, hasPlan, onBackToPlan, onBackToIssues }) {
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
    { label: "📦 Dependencies", query: "What third-party packages, libraries, and tools does this project rely on?" },
    { label: "🤝 Good First PR", query: "What are good areas or tasks for a first-time contributor to tackle?" },
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
      {/* ── Prominent Back Navigation Header ── */}
      <div className="glass-card p-4 flex items-center justify-between gap-3 flex-wrap border-teal-500/30 bg-dark-850/90 shadow-sm">
        <div className="flex items-center gap-2 flex-wrap">
          {hasPlan && (
            <button
              onClick={onBackToPlan}
              className="btn-primary text-xs py-2 px-3.5 flex items-center gap-2 shadow-sm"
            >
              <ArrowLeftIcon className="w-3.5 h-3.5" />
              <span>Back to Contribution Plan</span>
            </button>
          )}

          <button
            onClick={onBackToIssues}
            className="btn-secondary text-xs py-2 px-3 flex items-center gap-2 hover:border-teal-500/40"
          >
            <ArrowLeftIcon className="w-3.5 h-3.5 text-teal-400" />
            <span>Back to Issues List</span>
          </button>
        </div>

        {history.length > 0 && (
          <button
            onClick={() => setHistory([])}
            className="btn-ghost text-xs py-1.5 px-3 text-slate-400 hover:text-slate-200"
          >
            Clear Conversation
          </button>
        )}
      </div>

      {/* Suggested Inquiries Card */}
      <div className="glass-card p-6 space-y-3.5 border-slate-800">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="inline-flex items-center gap-1.5 badge-teal mb-2">
              <SparkleIcon />
              <span>Repository Intelligence Engine</span>
            </div>
            <h3 className="text-lg font-bold text-slate-100">
              Ask Anything About <span className="text-teal-300 font-mono">{repoInfo.name}</span>
            </h3>
            <p className="text-slate-400 text-xs mt-1">
              Ask questions regarding architecture, internal functions, configuration, or testing. RepoRescue inspects the actual files and directory tree to answer.
            </p>
          </div>
        </div>

        <div className="space-y-2 pt-1 border-t border-slate-800">
          <div className="section-title">Quick Starter Inquiries</div>
          <div className="flex flex-wrap gap-2">
            {suggestedPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleAsk(p.query)}
                disabled={loading}
                className="badge-teal cursor-pointer hover:bg-teal-500/20 active:scale-95 transition-all text-xs py-1.5 px-3 disabled:opacity-50"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Q&A Chat Stream */}
      <div className="space-y-6">
        {history.map(item => (
          <div key={item.id} className="space-y-4 animate-slide-up">
            {/* User Message Bubble */}
            <div className="flex items-start gap-3 justify-end">
              <div className="max-w-2xl bg-gradient-to-r from-teal-600 to-teal-700 text-white p-4 rounded-2xl rounded-tr-sm shadow-md text-sm leading-relaxed font-medium">
                {item.question}
              </div>
              <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm">
                You
              </div>
            </div>

            {/* AI Assistant Response Bubble */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-indigo-500 flex items-center justify-center text-white text-xs flex-shrink-0 shadow-glow-teal">
                <SparkleIcon />
              </div>
              <div className="flex-1 glass-card p-6 space-y-4 rounded-tl-sm border-teal-500/20">
                <MarkdownContent content={item.data.answer} />

                {item.data.key_takeaways?.length > 0 && (
                  <div className="bg-dark-900/80 rounded-xl p-4 border border-teal-500/20 space-y-2 mt-2">
                    <div className="text-xs font-semibold uppercase tracking-wider text-teal-300 flex items-center gap-1.5">
                      <CheckIcon className="w-3.5 h-3.5" />
                      <span>Key Takeaways</span>
                    </div>
                    <ul className="space-y-1.5">
                      {item.data.key_takeaways.map((k, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                          <span className="text-teal-400 mt-0.5">•</span>
                          <span>{k}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {item.data.relevant_files?.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <div className="section-title">Referenced Files in Repository</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {item.data.relevant_files.map((rf, rIdx) => (
                        <div key={rIdx} className="bg-dark-900/90 rounded-lg p-2.5 border border-slate-800 flex items-start gap-2">
                          <span className="text-teal-400 flex-shrink-0 mt-0.5"><FileIcon className="w-3.5 h-3.5" /></span>
                          <div className="min-w-0">
                            <div className="font-mono text-xs text-teal-300 truncate font-semibold">{rf.path}</div>
                            {rf.reason && <p className="text-[11px] text-slate-400 leading-snug mt-0.5">{rf.reason}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {item.data.suggested_follow_ups?.length > 0 && (
                  <div className="pt-2 border-t border-slate-800 space-y-2">
                    <div className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
                      <BulbIcon className="w-3.5 h-3.5 text-teal-400" />
                      <span>Suggested Follow-Up Inquiries</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {item.data.suggested_follow_ups.map((fu, fIdx) => (
                        <button
                          key={fIdx}
                          onClick={() => handleAsk(fu)}
                          disabled={loading}
                          className="text-xs text-slate-300 bg-dark-900 hover:bg-teal-500/20 hover:text-white border border-slate-700/60 rounded-lg px-3 py-1.5 transition-colors text-left"
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

        {loading && (
          <div className="flex items-start gap-3 animate-fade-in">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-indigo-500 flex items-center justify-center text-white text-xs flex-shrink-0 shadow-glow-teal">
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
            <div className="flex-1 glass-card p-6 space-y-3 rounded-tl-sm border-teal-500/20">
              <div className="flex items-center gap-2 text-xs text-teal-300 font-medium">
                <span>Inspecting repository tree & synthesizing answer…</span>
              </div>
              <SkeletonBlock className="h-4 w-3/4" />
              <SkeletonBlock className="h-4 w-full" />
              <SkeletonBlock className="h-16 w-full" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Sticky Bottom Form Bar */}
      <div className="sticky bottom-4 z-40">
        <form
          onSubmit={e => { e.preventDefault(); handleAsk(); }}
          className="glass-card p-2 sm:p-2.5 border-teal-500/40 shadow-2xl bg-dark-900/95 backdrop-blur-2xl flex items-center gap-2"
        >
          <div className="pl-3 text-teal-400">
            <ChatIcon />
          </div>
          <input
            type="text"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            placeholder={`Ask anything about ${repoInfo.name} (e.g., "Where are routes defined?", "How does auth work?")...`}
            className="flex-1 bg-transparent border-none text-slate-100 placeholder-slate-500 text-sm focus:outline-none px-2 py-1.5 font-sans"
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
        <div className="flex items-start gap-2 text-rose-400 text-xs bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">
          <AlertIcon />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

// ── Main Application Component ─────────────────────────────────────────────
export default function App() {
  const [step, setStep] = useState("input");             // "input" | "repo" | "analyzing" | "result"
  const [activeTab, setActiveTab] = useState("issues"); // "issues" | "ask"
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
      setError(err.message || "Failed to fetch repository. Please check the URL and ensure it's a public GitHub repo.");
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
        throw new Error("Please select an issue from the list or enter details manually.");
      }
      const result = await analyzeIssue(payload);
      setPlan(result);
      setStep("result");
    } catch (err) {
      setError(err.message || "Analysis failed. Please try again.");
      setStep("repo");
    }
  }

  function resetToHome() {
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
    <div className="min-h-screen flex flex-col bg-[#070b14] text-slate-100">
      {/* ── Top Navigation Bar ────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-dark-900/85 backdrop-blur-2xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button onClick={resetToHome} className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-400 via-brand-500 to-indigo-600 flex items-center justify-center shadow-glow-teal group-hover:scale-105 transition-transform">
                <SparkleIcon className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <span className="font-extrabold text-base tracking-tight text-white block leading-none">
                  Repo<span className="text-gradient">Rescue</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono tracking-wider">AI CODEBASE INTELLIGENCE</span>
              </div>
            </button>

            {/* Breadcrumb indicator when repo is selected */}
            {repoInfo && (
              <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 border-l border-slate-800 pl-3">
                <span className="text-slate-400 font-medium">{repoInfo.owner}</span>
                <span>/</span>
                <span className="text-teal-300 font-mono font-semibold">{repoInfo.name}</span>
                {step === "result" && (
                  <>
                    <span>/</span>
                    <span className="text-slate-300">Blueprint</span>
                  </>
                )}
                {step === "repo" && activeTab === "ask" && (
                  <>
                    <span>/</span>
                    <span className="text-slate-300">AI Assistant</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            {step !== "input" && (
              <button
                onClick={resetToHome}
                className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
              >
                <ArrowLeftIcon className="w-3.5 h-3.5" />
                <span>New Repo</span>
              </button>
            )}

            <a
              href="https://github.com/prathikniat07-cpu/Repo-Rescue"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-dark-800 transition-all border border-transparent hover:border-slate-700"
              title="View on GitHub"
            >
              <GitHubIcon className="w-4 h-4" />
            </a>
          </div>
        </div>
      </header>

      {/* ── Main Container ─────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-10">
        {/* ── STEP 1: LANDING / INPUT PAGE ─────────────────────────────── */}
        {step === "input" && (
          <div className="animate-fade-in space-y-12">
            {/* Hero Header */}
            <div className="text-center max-w-3xl mx-auto space-y-5 pt-4">
              <div className="inline-flex items-center gap-2 badge-teal px-3.5 py-1.5 text-xs shadow-glow-teal">
                <SparkleIcon className="w-3.5 h-3.5 text-teal-300 animate-pulse-subtle" />
                <span>Deep Repository Intelligence & Contribution Blueprints</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-extrabold text-white leading-tight tracking-tight">
                Navigate any codebase.<br />
                <span className="text-gradient">Solve issues with confidence.</span>
              </h1>

              <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
                Paste any public GitHub repository. Get actionable file-by-file contribution plans, architectural breakdowns, and ask grounded questions powered by Gemini.
              </p>
            </div>

            {/* Input Card */}
            <div className="max-w-2xl mx-auto glass-card p-6 sm:p-8 space-y-6 border-slate-800 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

              <form onSubmit={handleFetchRepo} className="space-y-4 relative z-10">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="section-title">GitHub Repository URL</label>
                    <span className="text-[11px] text-slate-500 font-mono">Public repositories supported</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                      <GitHubIcon className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      value={repoUrl}
                      onChange={e => setRepoUrl(e.target.value)}
                      placeholder="https://github.com/owner/repository"
                      className="input-field pl-10 pr-24 py-3.5 text-sm"
                      required
                    />
                    {navigator.clipboard && (
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            const text = await navigator.clipboard.readText();
                            if (text && text.includes("github.com")) setRepoUrl(text.trim());
                          } catch (_) {}
                        }}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-md text-[11px] bg-dark-800 hover:bg-dark-750 text-slate-400 hover:text-slate-200 border border-slate-700/60 font-mono transition-colors"
                      >
                        Paste
                      </button>
                    )}
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-2.5 text-rose-400 text-xs bg-rose-500/10 border border-rose-500/20 rounded-xl p-3.5">
                    <AlertIcon className="flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loadingRepo || !repoUrl.trim()}
                  className="btn-primary w-full justify-center py-3.5 text-sm font-bold shadow-lg shadow-teal-500/20"
                >
                  {loadingRepo ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span>Analyzing Repository Structure…</span>
                    </>
                  ) : (
                    <>
                      <span>Inspect & Explore Repository</span>
                      <ArrowRightIcon className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Popular Open Source Examples */}
              <div className="space-y-2.5 pt-2 border-t border-slate-800/80">
                <div className="section-title">Try an example repository</div>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "pallets/flask", url: "https://github.com/pallets/flask", stars: "68k" },
                    { label: "psf/requests", url: "https://github.com/psf/requests", stars: "52k" },
                    { label: "expressjs/express", url: "https://github.com/expressjs/express", stars: "64k" },
                    { label: "fastapi/fastapi", url: "https://github.com/fastapi/fastapi", stars: "78k" },
                  ].map(ex => (
                    <button
                      key={ex.url}
                      onClick={() => {
                        setRepoUrl(ex.url);
                        handleFetchRepo(null, ex.url);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-dark-900 hover:bg-dark-800 text-xs text-slate-300 hover:text-teal-300 border border-slate-800 hover:border-teal-500/30 flex items-center gap-1.5 transition-all font-mono"
                    >
                      <span>{ex.label}</span>
                      <span className="text-[10px] text-amber-400">★ {ex.stars}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Feature Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
              <div className="glass-card p-6 space-y-3 border-slate-800/80 hover:border-slate-700 transition-all">
                <div className="w-10 h-10 rounded-xl bg-teal-500/15 text-teal-300 flex items-center justify-center text-lg border border-teal-500/30">
                  📁
                </div>
                <h3 className="font-bold text-slate-100 text-base">File-Level Grounding</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Pinpoints exact files, priority classes, and functions to touch for any selected issue, eliminating guesswork.
                </p>
              </div>

              <div className="glass-card p-6 space-y-3 border-slate-800/80 hover:border-slate-700 transition-all">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-300 flex items-center justify-center text-lg border border-indigo-500/30">
                  ⚡
                </div>
                <h3 className="font-bold text-slate-100 text-base">Actionable Blueprints</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Generates concrete step-by-step code snippets, test execution guides, and PR advice for smooth maintainer approvals.
                </p>
              </div>

              <div className="glass-card p-6 space-y-3 border-slate-800/80 hover:border-slate-700 transition-all">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-300 flex items-center justify-center text-lg border border-cyan-500/30">
                  💬
                </div>
                <h3 className="font-bold text-slate-100 text-base">Deep Codebase Q&A</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Ask any technical question about architecture, auth middleware, or testing setups with immediate AI responses.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 2: REPOSITORY VIEW (ISSUES & ASK TABS) ─────────────── */}
        {step === "repo" && repoInfo && (
          <div className="animate-slide-up space-y-6">
            {/* Repo Info Header Card */}
            <div className="glass-card p-5 sm:p-6 flex flex-wrap gap-4 items-center justify-between border-slate-800">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-indigo-600 flex items-center justify-center text-white flex-shrink-0 shadow-md">
                  <GitHubIcon className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-lg text-slate-100 truncate">{repoInfo.full_name}</h2>
                    <a
                      href={`https://github.com/${repoInfo.full_name}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-white transition-colors"
                    >
                      <ExternalLinkIcon />
                    </a>
                  </div>
                  <p className="text-xs text-slate-400 truncate mt-0.5 max-w-xl">
                    {repoInfo.description || "No description provided."}
                  </p>
                </div>
              </div>

              {/* Stats badges */}
              <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-dark-900 border border-slate-800">
                  <StarIcon /> <span className="font-mono text-slate-200">{repoInfo.stars?.toLocaleString()}</span>
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-dark-900 border border-slate-800">
                  <ForkIcon /> <span className="font-mono text-slate-200">{repoInfo.forks?.toLocaleString()}</span>
                </span>
                {repoInfo.language && (
                  <span className="badge-blue font-mono">{repoInfo.language}</span>
                )}
              </div>
            </div>

            {/* Navigation Tabs Bar */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 p-1.5 bg-dark-900 rounded-xl border border-slate-800 w-full sm:w-fit">
                <button
                  onClick={() => setActiveTab("issues")}
                  className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === "issues"
                      ? "bg-teal-500 text-white shadow-md shadow-teal-500/20"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <LayersIcon />
                  <span>Issues & Blueprints</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${activeTab === "issues" ? "bg-white/20 text-white" : "bg-dark-800 text-slate-400"}`}>
                    {issues.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab("ask")}
                  className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === "ask"
                      ? "bg-teal-500 text-white shadow-md shadow-teal-500/20"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <ChatIcon />
                  <span>Ask Codebase AI</span>
                  <span className="badge-teal text-[10px] py-0 px-1.5">AI</span>
                </button>
              </div>

              {/* If a plan exists in memory, allow jumping straight back to it! */}
              {plan && (
                <button
                  onClick={() => setStep("result")}
                  className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5 shadow-sm"
                >
                  <span>View Generated Plan</span>
                  <ArrowRightIcon className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* TAB 1: ISSUES & CONTRIBUTION BLUEPRINT */}
            {activeTab === "issues" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
                {/* Left: Issues List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="section-title">Open Repository Issues ({issues.length})</div>
                    <button
                      onClick={() => { setUseManual(m => !m); setSelectedIssue(null); }}
                      className="text-xs text-teal-400 hover:text-teal-300 font-medium transition-colors"
                    >
                      {useManual ? "← Pick from issue list" : "+ Enter custom issue →"}
                    </button>
                  </div>

                  {!useManual ? (
                    <>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                          <SearchIcon className="w-3.5 h-3.5" />
                        </span>
                        <input
                          type="text"
                          value={filterText}
                          onChange={e => setFilterText(e.target.value)}
                          placeholder="Search or filter issues…"
                          className="input-field pl-9 py-2 text-xs"
                        />
                      </div>
                      <div className="space-y-2 max-h-[460px] overflow-y-auto scrollbar-thin pr-1">
                        {filteredIssues.length === 0 ? (
                          <div className="text-center text-slate-500 text-xs py-10 glass-card">
                            No matching issues found.
                          </div>
                        ) : (
                          filteredIssues.map(issue => (
                            <IssueCard
                              key={issue.number}
                              issue={issue}
                              selected={selectedIssue?.number === issue.number}
                              onSelect={i => { setSelectedIssue(i); setUseManual(false); }}
                            />
                          ))
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="glass-card p-5 space-y-3.5 border-slate-800">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-300">Custom Issue Title</label>
                        <input
                          type="text"
                          value={manualIssue.title}
                          onChange={e => setManualIssue(m => ({ ...m, title: e.target.value }))}
                          placeholder="e.g. Refactor API authentication error responses"
                          className="input-field text-xs font-sans"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-300">Description or Context</label>
                        <textarea
                          value={manualIssue.body}
                          onChange={e => setManualIssue(m => ({ ...m, body: e.target.value }))}
                          placeholder="Describe the bug, requirements, or what needs to be changed..."
                          rows={6}
                          className="input-field text-xs resize-none font-sans"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: Selected Issue Preview & Action Card */}
                <div className="space-y-3">
                  <div className="section-title">Ready for Analysis</div>
                  <div className="glass-card p-6 space-y-5 h-full flex flex-col justify-between border-slate-800">
                    {(selectedIssue || (useManual && manualIssue.title)) ? (
                      <div className="space-y-4 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-mono text-teal-400 font-semibold uppercase">
                            {useManual ? "Custom Issue Input" : `Issue #${selectedIssue.number}`}
                          </span>
                        </div>
                        <h3 className="font-bold text-slate-100 text-base leading-snug">
                          {useManual ? manualIssue.title : selectedIssue.title}
                        </h3>

                        {!useManual && selectedIssue?.labels?.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {selectedIssue.labels.map(l => (
                              <span key={l} className="badge-teal text-[10px]">{l}</span>
                            ))}
                          </div>
                        )}

                        {(!useManual && selectedIssue?.body) && (
                          <div className="p-3.5 rounded-xl bg-dark-900/90 border border-slate-800 text-slate-400 text-xs leading-relaxed max-h-56 overflow-y-auto scrollbar-thin">
                            {selectedIssue.body}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center py-12 space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-dark-900 border border-slate-800 flex items-center justify-center text-xl text-teal-400">
                          👈
                        </div>
                        <div className="text-sm font-semibold text-slate-200">No Issue Selected</div>
                        <p className="text-xs text-slate-500 max-w-xs">
                          Select an issue from the list on the left or click "Enter custom issue" to generate a step-by-step contribution plan.
                        </p>
                      </div>
                    )}

                    {error && (
                      <div className="flex items-start gap-2 text-rose-400 text-xs bg-rose-500/10 border border-rose-500/20 rounded-xl p-3">
                        <AlertIcon />
                        <span>{error}</span>
                      </div>
                    )}

                    <button
                      onClick={handleAnalyze}
                      disabled={!(selectedIssue || (useManual && manualIssue.title))}
                      className="btn-primary w-full justify-center py-3.5 text-sm font-bold shadow-glow-teal"
                    >
                      <SparkleIcon className="w-4 h-4" />
                      <span>Generate Contribution Blueprint</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: ASK ANYTHING ABOUT REPO */}
            {activeTab === "ask" && (
              <RepoQASection
                repoUrl={repoUrl}
                repoInfo={repoInfo}
                hasPlan={Boolean(plan)}
                onBackToPlan={() => setStep("result")}
                onBackToIssues={() => setActiveTab("issues")}
              />
            )}
          </div>
        )}

        {/* ── STEP 3: ANALYZING STATE ──────────────────────────────────── */}
        {step === "analyzing" && (
          <div className="animate-fade-in space-y-6 max-w-3xl mx-auto">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2.5 badge-teal px-4 py-2 text-xs shadow-glow-teal">
                <svg className="w-4 h-4 animate-spin text-teal-300" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span className="font-semibold">Synthesizing Contribution Blueprint…</span>
              </div>
              <p className="text-slate-400 text-xs max-w-md mx-auto">
                Scanning repository tree, analyzing relevant files, and generating concrete code modifications.
              </p>
            </div>
            <PlanSkeleton />
          </div>
        )}

        {/* ── STEP 4: RESULT BLUEPRINT PAGE ────────────────────────────── */}
        {step === "result" && plan && (
          <ContributionPlan
            plan={plan}
            repoInfo={repoInfo}
            issueTitle={issueTitle}
            onBackToIssues={() => {
              setStep("repo");
              setActiveTab("issues");
            }}
            onAskQuestion={() => {
              setStep("repo");
              setActiveTab("ask");
            }}
          />
        )}
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500 bg-dark-950/60">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-subtle" />
            <span>AI Codebase Intelligence • Powered by Google Gemini</span>
          </div>
          <div>
            RepoRescue &nbsp;•&nbsp; Built for Open-Source Contributors
          </div>
        </div>
      </footer>
    </div>
  );
}

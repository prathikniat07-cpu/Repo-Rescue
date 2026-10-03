const API_BASE = import.meta.env.VITE_API_BASE ?? (import.meta.env.DEV ? "http://localhost:8000" : "");

async function handleResponse(res) {
  if (!res.ok) {
    let errMsg = `HTTP ${res.status}`;
    try {
      const data = await res.json();
      errMsg = data.detail || errMsg;
    } catch (_) {}
    throw new Error(errMsg);
  }
  return res.json();
}

export async function fetchRepoInfo(repoUrl) {
  const res = await fetch(`${API_BASE}/api/repo/info`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ repo_url: repoUrl }),
  });
  return handleResponse(res);
}

export async function fetchRepoIssues(repoUrl) {
  const res = await fetch(`${API_BASE}/api/repo/issues`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ repo_url: repoUrl }),
  });
  return handleResponse(res);
}

export async function analyzeIssue({ repoUrl, issueNumber, issueTitle, issueBody }) {
  const res = await fetch(`${API_BASE}/api/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      repo_url: repoUrl,
      issue_number: issueNumber || undefined,
      issue_title: issueTitle || undefined,
      issue_body: issueBody || undefined,
    }),
  });
  return handleResponse(res);
}

export async function askRepoQuestion({ repoUrl, question }) {
  const res = await fetch(`${API_BASE}/api/repo/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      repo_url: repoUrl,
      question: question,
    }),
  });
  return handleResponse(res);
}

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import re

from github_service import GitHubService
from ai_service import generate_contribution_plan, answer_repo_question

app = FastAPI(title="RepoRescue API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

github_service = GitHubService()


def parse_github_url(url: str):
    """Extract owner and repo from a GitHub URL."""
    pattern = r"github\.com/([^/]+)/([^/?\s#]+)"
    match = re.search(pattern, url)
    if not match:
        raise HTTPException(status_code=400, detail="Invalid GitHub repository URL.")
    owner = match.group(1)
    repo = match.group(2).rstrip("/")
    return owner, repo


class RepoRequest(BaseModel):
    repo_url: str


class RepoQuestionRequest(BaseModel):
    repo_url: str
    question: str


class AnalyzeRequest(BaseModel):
    repo_url: str
    issue_number: Optional[int] = None
    issue_title: Optional[str] = None
    issue_body: Optional[str] = None


@app.get("/")
def root():
    return {"message": "RepoRescue API is running!"}


@app.get("/api/test-ai")
def test_ai():
    """Quick endpoint to test if the Gemini API key works."""
    import os, requests
    from dotenv import load_dotenv, find_dotenv
    load_dotenv(find_dotenv(), override=True)
    key = os.getenv("GEMINI_API_KEY", "").strip()
    if not key:
        return {"status": "error", "detail": "GEMINI_API_KEY not set in .env"}

    models_to_test = [
        "gemini-2.5-flash",
        "gemini-3.6-flash",
        "gemini-3.5-flash",
        "gemini-2.5-flash-lite",
    ]
    results = {}
    for model in models_to_test:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key}"
        try:
            resp = requests.post(url, json={
                "contents": [{"parts": [{"text": "Say hello in one word"}]}]
            }, timeout=15)
            results[model] = {"status": resp.status_code, "ok": resp.ok,
                              "snippet": resp.text[:200] if not resp.ok else "WORKS"}
            if resp.ok:
                break  # found a working model
        except Exception as e:
            results[model] = {"status": "exception", "error": str(e)}
    return {"key_prefix": key[:8] + "...", "models": results}


@app.post("/api/repo/info")
def get_repo_info(request: RepoRequest):
    owner, repo = parse_github_url(request.repo_url)
    info = github_service.get_repo_info(owner, repo)
    return info


@app.post("/api/repo/issues")
def get_issues(request: RepoRequest):
    owner, repo = parse_github_url(request.repo_url)
    issues = github_service.get_open_issues(owner, repo)
    return {"issues": issues}


@app.post("/api/analyze")
def analyze_repo(request: AnalyzeRequest):
    owner, repo = parse_github_url(request.repo_url)

    # Build issue context
    if request.issue_number:
        issue = github_service.get_issue(owner, repo, request.issue_number)
        issue_title = issue.get("title", "")
        issue_body = issue.get("body", "") or ""
    elif request.issue_title:
        issue_title = request.issue_title
        issue_body = request.issue_body or ""
    else:
        raise HTTPException(status_code=400, detail="Provide issue_number or issue_title.")

    # Fetch repo tree and key files
    tree = github_service.get_repo_tree(owner, repo)
    readme = github_service.get_file_content(owner, repo, "README.md")
    context_files = github_service.get_context_files(owner, repo, tree, issue_title + " " + issue_body)

    # Build context string for AI
    context = f"Repository: {owner}/{repo}\n\n"
    if readme:
        context += f"README:\n{readme[:3000]}\n\n"
    context += f"Repository File Tree:\n{chr(10).join(tree[:100])}\n\n"
    for filename, content in context_files.items():
        context += f"\n--- {filename} ---\n{content[:2000]}\n"

    plan = generate_contribution_plan(issue_title, issue_body, context, owner, repo)
    return plan


@app.post("/api/repo/ask")
def ask_repo(request: RepoQuestionRequest):
    owner, repo = parse_github_url(request.repo_url)
    question = request.question.strip()
    if not question:
        raise HTTPException(status_code=400, detail="Please provide a question about the repository.")

    # Fetch repo tree and relevant files based on user question
    tree = github_service.get_repo_tree(owner, repo)
    readme = github_service.get_file_content(owner, repo, "README.md")
    context_files = github_service.get_context_files(owner, repo, tree, question, max_files=8)

    # Build context string for AI
    context = f"Repository: {owner}/{repo}\n\n"
    if readme:
        context += f"README:\n{readme[:3500]}\n\n"
    context += f"Repository File Tree:\n{chr(10).join(tree[:120])}\n\n"
    for filename, content in context_files.items():
        context += f"\n--- {filename} ---\n{content[:2000]}\n"

    answer_data = answer_repo_question(question, context, owner, repo)
    return answer_data

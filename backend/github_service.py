import requests
from fastapi import HTTPException
from typing import Optional
import os
from dotenv import load_dotenv

load_dotenv()

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN", "")
BASE_URL = "https://api.github.com"

RELEVANT_EXTENSIONS = {
    ".py", ".js", ".ts", ".jsx", ".tsx", ".java", ".go", ".rs",
    ".rb", ".php", ".c", ".cpp", ".h", ".cs", ".md", ".txt",
    ".yaml", ".yml", ".toml", ".json", ".sh", ".env.example",
}

IGNORE_DIRS = {
    "node_modules", ".git", "dist", "build", "__pycache__",
    ".venv", "venv", "vendor", ".next", "coverage", "target",
}

IMPORTANT_FILES = [
    "CONTRIBUTING.md", "CONTRIBUTING.rst", "CONTRIBUTING.txt",
    "README.md", "README.rst",
    "ARCHITECTURE.md", "docs/architecture.md",
    "setup.py", "setup.cfg", "pyproject.toml",
    "package.json", "Makefile",
]


class GitHubService:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
        })
        if GITHUB_TOKEN:
            self.session.headers["Authorization"] = f"Bearer {GITHUB_TOKEN}"

    def _get(self, url: str, params: dict = None):
        try:
            response = self.session.get(url, params=params, timeout=15)
            if response.status_code == 404:
                raise HTTPException(status_code=404, detail=f"GitHub resource not found: {url}")
            if response.status_code == 403:
                raise HTTPException(status_code=429, detail="GitHub API rate limit exceeded. Please provide a GITHUB_TOKEN.")
            response.raise_for_status()
            return response.json()
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"GitHub API error: {str(e)}")

    def get_repo_info(self, owner: str, repo: str) -> dict:
        data = self._get(f"{BASE_URL}/repos/{owner}/{repo}")
        return {
            "name": data.get("name"),
            "full_name": data.get("full_name"),
            "description": data.get("description"),
            "stars": data.get("stargazers_count", 0),
            "forks": data.get("forks_count", 0),
            "open_issues": data.get("open_issues_count", 0),
            "language": data.get("language"),
            "topics": data.get("topics", []),
            "html_url": data.get("html_url"),
            "default_branch": data.get("default_branch", "main"),
        }

    def get_open_issues(self, owner: str, repo: str, per_page: int = 20) -> list:
        data = self._get(
            f"{BASE_URL}/repos/{owner}/{repo}/issues",
            params={"state": "open", "per_page": per_page, "sort": "updated", "direction": "desc"},
        )
        issues = []
        for item in data:
            if "pull_request" not in item:
                issues.append({
                    "number": item.get("number"),
                    "title": item.get("title"),
                    "body": item.get("body") or "",
                    "labels": [l.get("name") for l in item.get("labels", [])],
                    "created_at": item.get("created_at"),
                    "html_url": item.get("html_url"),
                    "comments": item.get("comments", 0),
                })
        return issues

    def get_issue(self, owner: str, repo: str, issue_number: int) -> dict:
        return self._get(f"{BASE_URL}/repos/{owner}/{repo}/issues/{issue_number}")

    def get_repo_tree(self, owner: str, repo: str) -> list[str]:
        """Get a flat list of all relevant file paths in the repo."""
        try:
            repo_info = self._get(f"{BASE_URL}/repos/{owner}/{repo}")
            branch = repo_info.get("default_branch", "main")
            data = self._get(
                f"{BASE_URL}/repos/{owner}/{repo}/git/trees/{branch}",
                params={"recursive": "1"},
            )
            files = []
            for item in data.get("tree", []):
                if item.get("type") == "blob":
                    path = item.get("path", "")
                    parts = path.split("/")
                    if any(p in IGNORE_DIRS for p in parts):
                        continue
                    ext = os.path.splitext(path)[1].lower()
                    if ext in RELEVANT_EXTENSIONS or any(path.endswith(f) for f in IMPORTANT_FILES):
                        files.append(path)
            return files
        except Exception:
            return []

    def get_file_content(self, owner: str, repo: str, path: str) -> Optional[str]:
        """Fetch raw content of a specific file."""
        try:
            url = f"https://raw.githubusercontent.com/{owner}/{repo}/HEAD/{path}"
            resp = self.session.get(url, timeout=10)
            if resp.status_code == 200:
                return resp.text
            return None
        except Exception:
            return None

    def get_context_files(
        self, owner: str, repo: str, tree: list[str], query: str, max_files: int = 8
    ) -> dict[str, str]:
        """Fetch the most relevant source files based on the issue query."""
        # First grab always-important files
        priority_files = []
        for path in tree:
            basename = os.path.basename(path).lower()
            if any(basename == f.lower() or path.lower() == f.lower() for f in IMPORTANT_FILES):
                priority_files.append(path)

        # Score remaining files by keyword overlap with the issue
        query_keywords = set(query.lower().split())
        scored = []
        for path in tree:
            if path in priority_files:
                continue
            path_lower = path.lower()
            score = sum(1 for kw in query_keywords if kw in path_lower and len(kw) > 3)
            scored.append((score, path))

        scored.sort(key=lambda x: -x[0])
        candidate_files = priority_files + [p for _, p in scored]

        result = {}
        for path in candidate_files[:max_files]:
            content = self.get_file_content(owner, repo, path)
            if content:
                result[path] = content
        return result

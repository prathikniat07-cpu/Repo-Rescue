import os
import json
import re
import requests
from dotenv import load_dotenv, find_dotenv
from fastapi import HTTPException

# Force reload .env from disk every time this module is imported
load_dotenv(find_dotenv(), override=True)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "").strip()

# Debug: print key status on startup (first 8 chars only for security)
print(f"[AI Service] GEMINI_API_KEY loaded: {'YES (' + GEMINI_API_KEY[:8] + '...)' if GEMINI_API_KEY else 'NO'}")
print(f"[AI Service] OPENAI_API_KEY loaded: {'YES' if OPENAI_API_KEY else 'NO'}")

import time

# Gemini models to try in order (newest first)
GEMINI_MODELS = [
    "gemini-2.5-flash",
    "gemini-3.6-flash",
    "gemini-3.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-2.5-pro",
    "gemini-flash-latest",
]


def _call_gemini(prompt: str) -> str:
    """Call Google Gemini API, trying multiple model names with retries on temporary errors."""
    all_errors = []
    for model in GEMINI_MODELS:
        url = (
            f"https://generativelanguage.googleapis.com/v1beta/models/"
            f"{model}:generateContent?key={GEMINI_API_KEY}"
        )
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"temperature": 0.3, "maxOutputTokens": 4096},
        }

        # Up to 3 attempts per model for transient errors (503, 429)
        for attempt in range(1, 4):
            try:
                resp = requests.post(url, json=payload, timeout=90)
                print(f"[Gemini] {model} (attempt {attempt}) -> HTTP {resp.status_code}")
                if resp.status_code == 404:
                    all_errors.append(f"{model}: 404 not found")
                    break  # Don't retry invalid model names

                if resp.status_code in (429, 503, 500, 502, 504):
                    body = resp.text[:200]
                    print(f"[Gemini] Temporary error on {model}: {resp.status_code}. Retrying ({attempt}/3)...")
                    all_errors.append(f"{model} (attempt {attempt}): HTTP {resp.status_code} – {body}")
                    if attempt < 3:
                        time.sleep(attempt * 2)
                        continue
                    break  # Try next model

                if not resp.ok:
                    body = resp.text[:300]
                    all_errors.append(f"{model}: HTTP {resp.status_code} – {body}")
                    if resp.status_code in (400, 403):
                        print(f"[Gemini] Auth/key error on {model}, stopping retries")
                        raise RuntimeError(f"Gemini API key error: HTTP {resp.status_code} – {body}")
                    break

                data = resp.json()
                return data["candidates"][0]["content"]["parts"][0]["text"]
            except requests.exceptions.Timeout:
                all_errors.append(f"{model} (attempt {attempt}): timeout")
                if attempt < 3:
                    time.sleep(2)
                    continue
                break
            except Exception as e:
                all_errors.append(f"{model} (attempt {attempt}): {e}")
                break

    raise RuntimeError("All Gemini models failed:\n" + "\n".join(all_errors))


def _call_openai(prompt: str) -> str:
    """Call OpenAI API."""
    headers = {"Authorization": f"Bearer {OPENAI_API_KEY}", "Content-Type": "application/json"}
    payload = {
        "model": "gpt-4o-mini",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.3,
        "max_tokens": 4096,
    }
    resp = requests.post("https://api.openai.com/v1/chat/completions", json=payload, headers=headers, timeout=60)
    resp.raise_for_status()
    return resp.json()["choices"][0]["message"]["content"]


def _build_prompt(issue_title: str, issue_body: str, context: str, owner: str, repo: str) -> str:
    return f"""You are RepoRescue, an expert open-source contribution guide. Your goal is to help a new contributor understand exactly how to fix or implement a GitHub issue in a given repository.

Analyze the following GitHub issue and repository context, then produce a detailed, actionable Contribution Plan in strict JSON format.

## Repository: {owner}/{repo}

## Issue Title: {issue_title}

## Issue Description:
{issue_body[:2000] if issue_body else "No description provided."}

## Repository Context:
{context[:8000]}

## Output Format (STRICT JSON - no markdown, no code blocks, just raw JSON):
{{
  "summary": "A 2-3 sentence plain-English summary of what the issue is asking for and why it matters",
  "difficulty": "beginner | intermediate | advanced",
  "estimated_time": "e.g. 30 minutes, 2-4 hours, 1-2 days",
  "relevant_files": [
    {{
      "path": "relative/path/to/file.py",
      "reason": "Why this specific file is relevant to the issue",
      "action": "read | modify | create",
      "priority": "high | medium | low"
    }}
  ],
  "steps": [
    {{
      "step_number": 1,
      "title": "Short step title",
      "description": "Detailed explanation of what to do in this step",
      "code_hint": "Optional short code snippet or command to help"
    }}
  ],
  "testing_approach": "How to test the fix — what commands to run, what to verify",
  "key_concepts": ["concept1", "concept2"],
  "risks_and_gotchas": ["Potential pitfall 1", "Potential pitfall 2"],
  "good_first_pr_tips": "Specific advice for submitting a clean PR for this issue"
}}

Remember: Output ONLY the raw JSON object. Do not wrap it in markdown code blocks or add any explanation."""


def _parse_json_response(text: str) -> dict:
    """Robustly parse JSON from model output."""
    text = text.strip()
    # Strip markdown code fences if present
    text = re.sub(r"^```(?:json)?\s*", "", text, flags=re.MULTILINE)
    text = re.sub(r"```\s*$", "", text, flags=re.MULTILINE)
    text = text.strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        # Try to find JSON object
        match = re.search(r"\{[\s\S]*\}", text)
        if match:
            return json.loads(match.group())
        raise


def _call_ai(prompt: str) -> str:
    """Helper to call Gemini or OpenAI with fallbacks and error handling."""
    load_dotenv(find_dotenv(), override=True)
    gemini_key = os.getenv("GEMINI_API_KEY", "").strip()
    openai_key = os.getenv("OPENAI_API_KEY", "").strip()

    raw_text = None
    error_msg = None

    if gemini_key:
        global GEMINI_API_KEY
        GEMINI_API_KEY = gemini_key
        try:
            raw_text = _call_gemini(prompt)
        except Exception as e:
            error_msg = f"Gemini error: {e}"
            print(f"[AI Service] {error_msg}")

    if raw_text is None and openai_key:
        global OPENAI_API_KEY
        OPENAI_API_KEY = openai_key
        try:
            raw_text = _call_openai(prompt)
        except Exception as e:
            error_msg = f"OpenAI error: {e}"
            print(f"[AI Service] {error_msg}")

    if raw_text is None:
        raise HTTPException(
            status_code=503,
            detail=f"AI generation failed. Error: {error_msg or 'No API keys found in .env'}",
        )
    return raw_text


def generate_contribution_plan(
    issue_title: str, issue_body: str, context: str, owner: str, repo: str
) -> dict:
    """Generate a contribution plan using available AI API."""
    prompt = _build_prompt(issue_title, issue_body, context, owner, repo)
    raw_text = _call_ai(prompt)

    try:
        return _parse_json_response(raw_text)
    except Exception:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to parse AI response as JSON. Raw response: {raw_text[:500]}",
        )


def _build_repo_qa_prompt(question: str, context: str, owner: str, repo: str) -> str:
    return f"""You are RepoRescue, an expert repository and code analysis guide.
A developer is asking a question about the repository: {owner}/{repo}.

## User Question:
{question}

## Repository Context (Files, README, Directory Structure):
{context[:9000]}

Analyze the question using the repository context and provide a comprehensive, accurate, and actionable answer in strict JSON format:
{{
  "answer": "Clear, detailed markdown response answering the question. Include specific code examples, terminal commands, or file paths if helpful.",
  "relevant_files": [
    {{
      "path": "relative/path/to/file",
      "reason": "Why this file is relevant to the question"
    }}
  ],
  "key_takeaways": [
    "Key takeaway point 1",
    "Key takeaway point 2"
  ],
  "suggested_follow_ups": [
    "Relevant follow-up question 1",
    "Relevant follow-up question 2"
  ]
}}

Remember: Output ONLY valid raw JSON without markdown code blocks."""


def answer_repo_question(question: str, context: str, owner: str, repo: str) -> dict:
    """Answer any question about the repository."""
    prompt = _build_repo_qa_prompt(question, context, owner, repo)
    raw_text = _call_ai(prompt)

    try:
        return _parse_json_response(raw_text)
    except Exception:
        # Fallback if model returned plain text instead of JSON
        return {
            "answer": raw_text.strip(),
            "relevant_files": [],
            "key_takeaways": [],
            "suggested_follow_ups": [
                "How is this repository structured?",
                "How do I run tests locally?",
            ],
        }

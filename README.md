# 🚑 RepoRescue

### Understand any repository. Analyze any issue. Ask anything.

RepoRescue is an open-source AI developer assistant that helps developers understand unfamiliar GitHub repositories and contribute to them with confidence.

Instead of spending hours navigating an unfamiliar codebase, RepoRescue uses an open-weight AI model to analyze repository context, explain GitHub issues, identify relevant files, generate contribution plans, recommend tests, and answer questions about the repository.

> From "Where do I start?" to "I understand this codebase."

---

## 🚀 Why RepoRescue?

Contributing to an unfamiliar open-source project can be difficult.

You may encounter an issue such as:

> "Refactor the authentication middleware and improve error handling."

But before writing code, you need to understand:

- Where authentication is implemented
- Which files are involved
- How different components interact
- What the issue actually requires
- Where tests are located
- How the existing codebase is structured

RepoRescue reduces this learning curve by connecting GitHub issues, repository code, and AI-powered analysis into one workflow.

---

## ✨ Features

### 🔍 Repository Analysis

Provide a public GitHub repository and RepoRescue analyzes its structure, documentation, source files, and relevant project context.

### 🎯 Issue Analysis

Select a GitHub issue and receive an AI-generated explanation of:

- What the issue means
- What functionality is affected
- Which parts of the repository are relevant
- What needs to be changed

### 📂 Relevant File Detection

RepoRescue identifies files that are likely related to an issue and explains why each file matters.

Example:

```text
src/auth/middleware.js

Why relevant?
Contains the authentication middleware referenced by the issue.

# SecureFlow 🛡️

SecureFlow is an AI-powered GitHub integration and dashboard that automatically scans Pull Requests for security vulnerabilities. Built with Next.js, Prisma, and the Groq SDK, it leverages LLMs (Llama 3.1) to intelligently identify hardcoded secrets, contextual data leaks, and code flaws. It not only flags issues but also generates concise, actionable AI explanations and remediation steps for developers.

## 🌟 Features

* **Automated PR Scanning**: Integrates seamlessly with GitHub via webhooks to analyze Pull Requests in real-time.
* **AI-Powered Vulnerability Detection**: Uses Groq's fast LLM inference to detect hardcoded secrets, contextual leaks (e.g., logging `process.env`), and misconfigurations while minimizing false positives.
* **Intelligent Remediation**: Automatically generates short, actionable explanations and code snippets to fix identified vulnerabilities.
* **Policy Management**: Create and toggle custom security policies (e.g., strict rules vs. default scanning) per user/repository.
* **Centralized Dashboard**: A beautiful UI built with Radix UI and Tailwind CSS to view repositories, active pull requests, scan results, findings, and audit logs.
* **Developer-Friendly Exclusions**: Smart filtering ignores non-executable files (`.md`, `.lock`, images) and recognizes mock placeholders in seed files and `.env.example`s.

## 🛠️ Tech Stack

* **Framework**: [Next.js 15](https://nextjs.org/) (App Router, Turbopack)
* **Database & ORM**: PostgreSQL with [Prisma](https://www.prisma.io/)
* **Authentication**: [NextAuth.js (v5 Beta)](https://nextjs.org/docs/app/building-your-application/authentication)
* **AI / LLM**: [Groq SDK](https://groq.com/) (`llama-3.1-8b-instant`) & [Genkit](https://firebase.google.com/docs/genkit)
* **GitHub Integration**: [Octokit](https://github.com/octokit/octokit.js)
* **Styling & UI**: [Tailwind CSS](https://tailwindcss.com/) & [Radix UI primitives](https://www.radix-ui.com/)

## 🚀 Getting Started

### Prerequisites

* Node.js (v20+ recommended)
* PostgreSQL database
* A Groq API Key
* A GitHub App set up for webhooks

### 1. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/gauravkarakoti/secureflow.git
cd secureflow
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory based on the provided `.env.example`:

```bash
cp .env.example .env
```
Populate your `.env` with your actual credentials

### 3. Database Setup
Initialize your database schema using Prisma:

```bash
# Generate Prisma Client
npm run db:gen

# Push the schema to your database
npm run db:push

# Seed the database with initial policy templates
npm run db:seed
```

### 4. Running the Development Server
Start the Next.js development server with Turbopack:

```bash
npm run dev
```
The application will be available at `http://localhost:9002`.

If you are working on the AI explanations flow, you can also start the Genkit development environment:

```bash
npm run genkit:dev
```

## 🧠 How it Works

1. **Webhook Event:** A developer opens or synchronizes a Pull Request on a linked GitHub repository.
2. **Diff Extraction:** SecureFlow intercepts the webhook and extracts the newly added/modified lines of code using Octokit.
3. **LLM Security Audit:** `ArmorIQScanner` consolidates the code snippets and prompts Groq to look for secrets and logic flaws based on the user's active policy templates.
4. **Finding Generation:** Vulnerabilities are parsed securely, mapped to specific files/lines, and stored in the database.
5. **AI Explanations:** For every valid finding, SecureFlow triggers a secondary AI flow to generate a precise 2-sentence explanation and a concise remediation block.
6. **Reporting:** Results are presented back to the developer via the web dashboard and GitHub PR comments.

## 📝 Scripts

- `npm run dev` - Starts the Next.js dev server on port 9002.
- `npm run build` - Builds the application for production.
- `npm run start` - Starts the production server.
- `npm run lint` - Runs Next.js ESLint.
- `npm run typecheck` - Runs TypeScript compiler checks.
- `npm run db:migrate` - Runs Prisma migrations.
# 🚀 LeadFast AI

<p align="center">
  <strong>AI-powered lead response platform for home service contractors.</strong>
</p>

<p align="center">
  Capture leads • Generate AI responses • Reply instantly • Never miss a customer
</p>

<p align="center">

![Next.js](https://img.shields.io/badge/Next.js-000000?logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-06B6D4?logo=tailwindcss&logoColor=white)
![Claude](https://img.shields.io/badge/Claude-AI-orange)
![Vercel](https://img.shields.io/badge/Vercel-000000?logo=vercel&logoColor=white)

</p>

---

## 📖 Overview

LeadFast AI is a real-world SaaS platform that helps home service contractors respond to customer inquiries within seconds. It captures website form submissions, generates personalized AI-powered replies, sends emails automatically, and stores every interaction in a secure dashboard. 0

---

## ✨ Features

- ⚡ Instant lead capture
- 🤖 AI-generated responses
- 📧 Automated email delivery
- 📊 Lead management dashboard
- 🔐 Secure authentication
- 🛡️ Row-Level Security (RLS)
- ☁️ Serverless deployment
- 📱 Responsive interface

---

## 🛠 Tech Stack

| Category | Technologies |
|----------|--------------|
| **Frontend** | Next.js • TypeScript • Tailwind CSS |
| **Backend** | Next.js API Routes |
| **Database** | Supabase • PostgreSQL |
| **Authentication** | Supabase Auth |
| **AI** | Anthropic Claude API |
| **Email** | Resend |
| **Deployment** | Vercel |
| **Version Control** | Git & GitHub |

---

## 🏗 Architecture

```text
Customer
    │
    ▼
Website Contact Form
    │
    ▼
 Embed Script
    │
    ▼
 Next.js API
    │
    ├────────────► Supabase Database
    │                     │
    ▼                     ▼
Claude AI          Dashboard
    │
    ▼
Resend API
    │
    ▼
Customer Reply
```

---

## 📂 Project Structure

```text
LeadFast_AI/
│
├── NextJs/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── public/
│   └── ...
│
├── Supabase/
│   ├── schema.sql
│   └── rls.sql
│
└── README.md
```

---

## ⚙️ How It Works

1. Customer submits a website form.
2. Lead is captured by the embed script.
3. Next.js processes the request.
4. Claude AI generates a personalized reply.
5. Resend sends the email.
6. Supabase stores the lead and response.
7. Contractors manage everything from the dashboard. 1

---

## 🚀 Quick Start

### Clone the repository

```bash
git clone https://github.com/adoka254/LeadFast_AI.git
cd LeadFast_AI/NextJs
```

### Install dependencies

```bash
npm install
```

### Configure environment variables

```env
NEXT_PUBLIC_SUPABASE_URL=

NEXT_PUBLIC_SUPABASE_ANON_KEY=

SUPABASE_SERVICE_ROLE_KEY=

ANTHROPIC_API_KEY=

RESEND_API_KEY=
```

### Run locally

```bash
npm run dev
```

---

## 🔒 Security

- Supabase Authentication
- Row-Level Security (RLS)
- Secure API Routes
- Protected Environment Variables

---

## 🌍 Deployment

| Service | Purpose |
|---------|---------|
| ▲ Vercel | Hosting |
| 🗄 Supabase | Database & Authentication |
| 🤖 Claude API | AI Responses |
| 📧 Resend | Email Delivery |

---

## 👥 Team

| | |
|---|---|
| **Benoline Mildren** | **Shamah Kibet** |
| **Samuel Muriithi** | **Steve Were** |
| **Valentine Ombunga** | **Bacil Otieno** |
| **Frank Nyaundi** | **Dorcas Adoka** |

---

## 📚 Documentation

Project documentation includes:

- System Architecture
- Database Design
- AI Workflow
- Deployment Strategy
- Product Roadmap
- Risk Assessment

See the full documentation for implementation details and technical decisions. 2

---

## 📄 License

This repository showcases **LeadFast AI**, a real-world SaaS platform built to automate lead engagement and improve customer response times for home service contractors.

---

<p align="center">
Built with ❤️ using Next.js, Supabase, Claude AI & Vercel.
</p>

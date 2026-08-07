# 🚀 LeadFast AI

<p align="center">
  <strong>AI-powered lead response platform for home service contractors.</strong>
</p>

<p align="center">
  Capture website leads • Generate AI-powered responses • Deliver emails in seconds
</p>

<p align="center">

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-38BDF8?logo=tailwind-css&logoColor=white)
![Claude AI](https://img.shields.io/badge/Claude-AI-orange)
![Resend](https://img.shields.io/badge/Resend-Email-black)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?logo=vercel)

</p>

---

## 📖 Overview

LeadFast AI is a real-world SaaS application designed to help home service contractors respond instantly to new customer inquiries. The platform captures website contact form submissions, generates personalized AI-powered responses, delivers them via email, and logs every interaction in a secure dashboard.

Designed for speed, reliability, and scalability, LeadFast AI helps businesses reduce response times, improve customer engagement, and prevent lost sales opportunities through intelligent automation. The application targets contractors in industries such as HVAC, plumbing, roofing, and other home services where fast response times directly impact customer conversion. 0

---

## ✨ Features

- ⚡ Instant lead capture from website contact forms
- 🤖 AI-generated personalized email responses
- 📧 Automated email delivery
- 🔐 Secure contractor authentication
- 📊 Lead management dashboard
- 🎯 Business-specific AI customization
- 💾 Real-time database storage
- 🛡️ Row-Level Security (RLS)
- 📱 Responsive user interface
- ☁️ Serverless deployment on Vercel

---

---

## 🛠️ Technology Stack

| Category | Technology |
|----------|------------|
| **Frontend** | Next.js, TypeScript, Tailwind CSS |
| **Backend** | Next.js API Routes |
| **Database** | PostgreSQL (Supabase) |
| **Authentication** | Supabase Auth |
| **Artificial Intelligence** | Anthropic Claude API |
| **Email Service** | Resend |
| **Deployment** | Vercel |
| **Version Control** | Git & GitHub |

---

## 🏗️ System Architecture

```text
                  Website Contact Form
                          │
                          ▼
            JavaScript Embed Script
                          │
                          ▼
               Next.js API Route
                          │
                          ▼
             Anthropic Claude API
                          │
                          ▼
          AI-Generated Personalized Reply
                          │
                          ▼
                   Resend Email API
                          │
                          ▼
                 Customer Receives Email

                          │
                          ▼
          Supabase PostgreSQL Database
                          │
                          ▼
           Contractor Dashboard & Logs
```

---

## ⚙️ How It Works

1. A visitor submits a contact form on the contractor's website.
2. The embedded JavaScript intercepts the submission and securely sends the lead information to the backend.
3. A Next.js API Route processes the request.
4. Anthropic Claude AI generates a personalized response based on the customer's inquiry and the contractor's business information.
5. The generated response is delivered to the customer through the Resend Email API.
6. The lead information, AI response, and delivery status are stored securely in Supabase.
7. Contractors can view and manage all captured leads through the LeadFast AI dashboard.

The complete workflow is designed to respond to customer inquiries within **15–30 seconds**, helping contractors engage potential customers before they contact competitors. 0

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
│   ├── middleware.ts
│   ├── package.json
│   ├── next.config.ts
│   ├── tsconfig.json
│   └── ...
│
├── Supabase/
│   ├── schema.sql
│   └── rls.sql
│
└── README.md
```

---

## 🗄️ Database

LeadFast AI uses **Supabase PostgreSQL** to securely manage business and customer data.

### Core Tables

- 🏢 **Businesses** – Stores contractor account information and subscription details.
- 👤 **Leads** – Stores incoming customer inquiries captured from website forms.
- 🤖 **AI Responses** – Stores AI-generated responses and delivery status.
- ⚙️ **Settings** – Stores business-specific preferences such as reply tone and notification settings.

To protect customer data, **Row-Level Security (RLS)** is implemented across all database tables, ensuring contractors can only access records associated with their own business. 1

---

## 🚀 Getting Started

### Clone the Repository

```bash
git clone https://github.com/adoka254/LeadFast_AI.git
```

```bash
cd LeadFast_AI/NextJs
```

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

Create a `.env.local` file inside the **NextJs** directory.

```env
NEXT_PUBLIC_SUPABASE_URL=

NEXT_PUBLIC_SUPABASE_ANON_KEY=

SUPABASE_SERVICE_ROLE_KEY=

ANTHROPIC_API_KEY=

RESEND_API_KEY=
```

### Start the Development Server

```bash
npm run dev
```

Visit:

```
http://localhost:3000
```

---

## 🔒 Security

LeadFast AI follows modern security best practices, including:

- 🔐 Supabase Authentication
- 🛡️ Row-Level Security (RLS)
- 🔑 Protected environment variables
- ⚡ Secure server-side API Routes
- 🏢 Business-level data isolation
- 🗄️ PostgreSQL security policies

---

## 🌐 Deployment

LeadFast AI is deployed using **Vercel** with a fully serverless architecture.

Production services include:

- ▲ Next.js Serverless Functions
- 🗄️ Supabase PostgreSQL
- 🤖 Anthropic Claude API
- 📧 Resend Email API

This architecture delivers a scalable, reliable, and cost-effective solution capable of handling real-time lead processing while minimizing infrastructure overhead. 2

---

## 🔮 Future Enhancements

- 📱 SMS notifications for contractors
- 🔗 CRM integrations
- 📊 Advanced analytics dashboard
- 🏢 Multi-location business support
- 🎯 AI prompt customization
- 📲 Mobile application
- 📈 Enhanced reporting and customer insights

---

## 👥 Contributors

LeadFast AI was collaboratively designed and developed by:

| Team Members |
|--------------|
| Benoline Mildren |
| Shamah Kibet |
| Samuel Muriithi |
| Steven Were |
| Valentine Ombunga |
| Bacil Otieno |
| Frank Nyaundi |
| Dorcas Adoka |

---

## 📚 Documentation

The project is supported by comprehensive technical documentation covering:

- Product overview
- System architecture
- Technology stack
- Database schema
- AI prompt design
- Pricing model
- Go-to-market strategy
- Risk assessment and mitigation

These documents guided the development of LeadFast AI from concept through implementation. 3

---

## 💡 About the Project

LeadFast AI is a real-world software solution built to address one of the biggest challenges faced by home service contractors—responding quickly to customer inquiries.

By combining Artificial Intelligence, serverless computing, and modern web technologies, the platform enables businesses to automate lead engagement, improve response times, and increase customer conversion through intelligent automation.

The project demonstrates the practical application of AI within a Software-as-a-Service (SaaS) platform, delivering measurable business value through speed, automation, and reliability. 4

---

## 📄 License

This repository showcases the architecture, implementation, and collaborative development of **LeadFast AI**, a real-world SaaS application built to automate lead engagement for home service businesses.

© 2026 LeadFast AI Team. All rights reserved.

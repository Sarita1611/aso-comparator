# ASOvision — AI-Powered ASO Comparison Tool

Compare up to 4 apps side-by-side with AI-powered ASO analysis using RAG (Retrieval Augmented Generation).

---

## Tech Stack

| Layer | Tool |
|---|---|
| Frontend | React + Vite + Tailwind CSS |
| Backend | Node.js + Express |
| iOS Data | iTunes Search API (free, no key) |
| Android Data | google-play-scraper (free) |
| AI Analysis | Groq (Llama 3.3 70B) — free |
| RAG Knowledge | Supabase (pgvector) |
| Auth + History | Supabase Auth + Database |
| PDF Export | html2canvas + jsPDF |

---

## Setup Instructions

### Step 1: Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a project
2. Go to **SQL Editor** and run this SQL:

```sql
-- ASO Knowledge base (RAG)
create table aso_knowledge (
  id text primary key,
  topic text not null,
  content text not null,
  created_at timestamptz default now()
);

-- Analysis history
create table analysis_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  apps_analyzed jsonb not null,
  report jsonb not null,
  app_count int not null,
  winner text,
  created_at timestamptz default now()
);

-- Row Level Security
alter table analysis_history enable row level security;
create policy "Users can manage own history" on analysis_history
  for all using (auth.uid() = user_id);

alter table aso_knowledge enable row level security;
create policy "Anyone can read knowledge" on aso_knowledge
  for select using (true);
create policy "Service role can write knowledge" on aso_knowledge
  for all using (true);
```

3. Go to **Project Settings → API** and copy:
   - Project URL
   - `anon` public key (for frontend)
   - `service_role` secret key (for backend)

---

### Step 2: Groq API Key

1. Go to [console.groq.com](https://console.groq.com)
2. Create a free account
3. Generate an API key

---

### Step 3: Backend Setup

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```
GROQ_API_KEY=your_groq_api_key
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
PORT=5000
```

Install dependencies:
```bash
npm install
```

**Seed the RAG knowledge base** (run once):
```bash
npm run seed-rag
```

Start the backend:
```bash
npm run dev
```

---

### Step 4: Frontend Setup

```bash
cd frontend
cp .env.example .env
```

Edit `.env`:
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:5000
```

Install and run:
```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Usage

1. Type an app name (e.g. "Duolingo") or paste an App Store / Play Store URL
2. Add up to 4 apps
3. Click **Analyze** — AI runs full ASO audit using the knowledge base
4. View detailed scores, insights, and recommendations
5. Export report as PDF
6. Sign up to save all analyses to history

---

## Project Structure

```
aso-comparator/
├── backend/
│   ├── routes/
│   │   ├── appData.js      # iTunes + Play Store data fetching
│   │   ├── analyze.js      # RAG retrieval + Groq AI analysis
│   │   └── history.js      # User history CRUD
│   ├── lib/
│   │   ├── supabase.js     # Supabase client
│   │   ├── groq.js         # Groq client
│   │   ├── rag.js          # RAG logic
│   │   ├── asoKnowledge.js # ASO knowledge base (15 expert chunks)
│   │   └── seedRag.js      # One-time seed script
│   └── server.js
│
└── frontend/
    └── src/
        ├── pages/
        │   ├── Landing.jsx   # Main analysis page
        │   ├── History.jsx   # Saved reports
        │   ├── Login.jsx
        │   └── Register.jsx
        ├── components/
        │   ├── Navbar.jsx
        │   ├── AppInputCard.jsx
        │   ├── ReportSection.jsx
        │   ├── ScoreCard.jsx
        │   └── PDFExport.jsx
        ├── context/AuthContext.jsx
        └── lib/
            ├── api.js
            └── supabase.js
```

---

## Deploying to Production

**Frontend → Vercel:**
```bash
cd frontend
npm run build
# Deploy /dist folder to Vercel
# Set environment variables in Vercel dashboard
```

**Backend → Railway or Render:**
```bash
# Connect your GitHub repo
# Set environment variables in dashboard
# Deploy automatically on push
```

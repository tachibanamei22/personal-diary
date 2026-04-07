# My Diary

A personal diary web app built with Next.js 15, Supabase, and Tiptap.

## Features

- **Rich text editor** - bold, italic, underline, headings, lists, blockquotes, alignment
- **Mood tracking** - tag each entry with an emoji mood (Amazing, Happy, Okay, Sad, Awful)
- **Tags** - organize entries with custom tags
- **Full-text search** - search across all entry titles and content
- **Calendar widget** - visualize which days you wrote and which you missed
- **Writing streak** - track consecutive days of journaling
- **Authentication** - private entries secured with Supabase Auth (email/password)

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) + TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Database + Auth | Supabase (PostgreSQL + Row-Level Security) |
| Rich Text Editor | Tiptap |
| Deployment | Vercel |

## Getting Started

### 1. Clone the repo

```bash
git clone <your-repo-url>
cd personal-diary
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the migration file:
   `supabase/migrations/001_initial_schema.sql`
3. Copy your project URL and anon key from **Project Settings → API**

### 3. Configure environment variables

Create a `.env.local` file in the root:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploying to Vercel

1. Push this repo to GitHub
2. Import it at [vercel.com/new](https://vercel.com/new)
3. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel's project environment settings
4. Deploy

## Project Structure

```
src/
├── app/
│   ├── auth/callback/      # Supabase OAuth callback
│   ├── dashboard/          # Protected diary pages
│   │   ├── entries/[id]/   # View / edit a single entry
│   │   └── entries/new/    # Create a new entry
│   ├── login/              # Login page
│   └── signup/             # Signup page
├── components/
│   ├── diary/              # Entry cards, calendar, mood picker, search, tags
│   └── editor/             # Tiptap rich text editor
├── lib/
│   ├── actions/            # Server actions (CRUD for entries)
│   ├── hooks/              # useDebounce
│   └── supabase/           # Supabase client (browser + server)
└── types/                  # TypeScript types + mood constants
supabase/
└── migrations/             # SQL schema
```

## What's Next?

- [ ] Photo / image attachments
- [ ] Dark mode toggle
- [ ] Export entries to PDF / Markdown
- [ ] Mood trend charts
- [ ] Weekly email digest

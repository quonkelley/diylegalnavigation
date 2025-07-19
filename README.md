# DIY Legal Navigator

AI-powered web assistant that guides self-represented litigants through complex court forms and legal processes in Indiana.

## Environment Setup

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be set up (this takes a few minutes)

### 2. Get Your Supabase Credentials
1. In your Supabase dashboard, go to Settings → API
2. Copy your Project URL and anon/public key

### 3. Set Up Environment Variables
Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 4. Set Up Database
1. In your Supabase dashboard, go to the SQL Editor
2. Copy the entire content from `supabase/migrations/001_create_tables.sql`
3. Paste it into a new query and run it

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Complete the environment setup above

3. Start the development server:
```bash
npm run dev
```

4. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Database Schema

The application uses three main tables:
- `conversations`: Tracks user sessions and form progress
- `messages`: Stores chat message history
- `form_submissions`: Completed forms ready for PDF generation

## Features

- Conversational AI for Indiana eviction forms
- Real-time chat interface
- Form data persistence with Supabase
- Structured question flow for legal forms 
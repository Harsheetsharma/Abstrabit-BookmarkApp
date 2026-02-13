# Smart Bookmark App

A minimal full-stack bookmark manager built with Next.js App Router and Supabase.

Users authenticate with Google, create personal bookmarks, see updates in real time across multiple tabs, and delete their own data.  
All data access is protected using Row Level Security.

Live Demo: <YOUR_VERCEL_URL>  
GitHub: <YOUR_REPO_LINK>

---

## Tech Stack

- Next.js (App Router)
- Supabase (Auth, Postgres, Realtime)
- Tailwind CSS
- pnpm / npm

Supabase acts as the backend (database, authentication, authorization, realtime layer).

---

## Features

- Google OAuth login (no email/password)
- Add bookmark (title + URL)
- User-private data
- Real-time sync across tabs
- Delete own bookmarks
- Deployed on Vercel

---

## Architecture Overview

The client communicates directly with Supabase.

- Client (Next.js)
- Supabase Auth → session (JWT)
- Postgres + Row Level Security
- Realtime via WebSocket

There is no custom backend server.

Security and isolation are enforced at the database layer using policies tied to the authenticated user.

---

## Authentication Flow

1. User signs in with Google.
2. Supabase issues a session.
3. Every request to the database carries the user identity.
4. Row Level Security policies ensure users can only access their own rows.

---

## Database Schema

### bookmarks

- id (uuid, primary key)
- user_id (uuid → auth.users)
- title (text)
- url (text)
- created_at (timestamp)

---

## Row Level Security

RLS is enabled.

Policies:

- Users can read their own bookmarks.
- Users can insert rows only if `user_id = auth.uid()`.
- Users can delete only their rows.

This guarantees strict per-user isolation even if someone tries to bypass the UI.

---

## Realtime Strategy

The app subscribes to Postgres changes on the bookmarks table.

Whenever an insert or delete occurs, the client refetches the list.

This approach is simple, reliable, and sufficient for small datasets.

In production at scale, we might patch local state instead of refetching.

---

## Problems Faced & Solutions

### 1. Data not appearing after login

The session was available but bookmarks were not fetched.
Solution: trigger fetching once the user state becomes available.

---

### 2. CRUD silently failing

Operations were blocked due to RLS.
Solution: added proper policies and logged Supabase errors to the console.

---

### 3. Realtime not firing

Replication was not enabled for the table.
Solution: enabled replication from Supabase dashboard.

---

### 4. OAuth session timing

`getUser()` alone was unreliable after redirects.
Solution: added `onAuthStateChange` listener.

---

## Tradeoffs

For simplicity:

- Refetching is used instead of optimistic UI.
- No pagination.
- Minimal validation.

These keep the solution easy to reason about while fulfilling requirements.

---

## What I Would Improve With More Time

- Optimistic updates for instant UI feedback.
- Edit bookmarks.
- Better URL validation.
- Pagination / infinite scroll.
- Rate limiting.
- Unit and integration tests.
- Error toasts instead of console logs.

---

## Running Locally

```
Create `.env.local`:

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

<!-- Install & run: -->
pnpm install
pnpm dev
```

## Deployment

Hosted on Vercel with environment variables configured in project settings.

---

## Author

## Harsheet

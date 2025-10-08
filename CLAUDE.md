# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI-powered coworking space search and booking application for Montreal. Uses Next.js 15 with App Router, OpenAI GPT-4o for conversational search, and Supabase for user/booking storage.

## Development Commands

```bash
npm run dev          # Start dev server with Turbopack
npm run build        # Production build with Turbopack
npm start            # Start production server
npm run lint         # Run ESLint
```

## Architecture

### AI Chat Flow
- User queries are sent to [app/api/chat/route.ts](app/api/chat/route.ts) via Vercel AI SDK
- OpenAI GPT-4o model with two tools: `searchCoworkings` and `createBooking`
- Tools defined in [lib/ai/tools.ts](lib/ai/tools.ts)
- System prompt adapts based on user authentication state
- Responses stream back as UI messages with tool invocations

### Tool System
1. **searchCoworkings**: Searches [lib/coworkings.montreal.json](lib/coworkings.montreal.json) with ranking by:
   - District match (priority)
   - Rating
   - Text hits in name/amenities/address
   - Price filtering (client-side after search)
   - Returns main results + fallback suggestions

2. **createBooking**: Requires authenticated user
   - Validates user from context passed in request body
   - Searches for space details
   - Saves to Supabase via [lib/save-booking.ts](lib/save-booking.ts)

### User Authentication
- Client-side context provider in [providers/user-context.tsx](providers/user-context.tsx)
- Stores user in localStorage + syncs to Supabase `users` table
- User ref pattern in [app/page.tsx](app/page.tsx) ensures fresh user data in AI SDK fetch override
- No server-side auth - user object passed in chat API requests

### Message Rendering
Messages are rendered in [app/page.tsx](app/page.tsx) with custom part handlers:
- `text` parts: Chat bubbles
- `tool-searchCoworkings` parts: Renders [components/coworking-card-list.tsx](components/coworking-card-list.tsx) with loading skeleton
- `tool-createBooking` parts: Renders [components/booking-confirmation.tsx](components/booking-confirmation.tsx)

### State Management
- User: React Context ([providers/user-context.tsx](providers/user-context.tsx))
- Chat: Vercel AI SDK `useChat` hook
- Modals: Local component state in [app/page.tsx](app/page.tsx)

## Key Dependencies
- `@ai-sdk/react` + `@ai-sdk/openai`: AI chat with streaming
- `@supabase/supabase-js`: Database (users, bookings)
- `next-themes`: Theme switching (configured but not actively used)
- `zod`: Runtime validation for tools and data
- `sonner`: Toast notifications
- Tailwind CSS v4 + Radix UI components

## Environment Variables
Expected in `.env.local`:
- `OPENAI_API_KEY`: For GPT-4o model
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key

## Data Flow Example
1. User types "find quiet space under $30 in Plateau"
2. Chat API receives message + user object
3. GPT-4o calls `searchCoworkings` with parsed filters
4. [lib/search-coworking.ts](lib/search-coworking.ts) ranks results
5. Tool output streamed back to client
6. [app/page.tsx](app/page.tsx) renders `CoworkingCardList` with results
7. User clicks "Book" → triggers `createBooking` tool
8. Booking saved to Supabase + confirmation shown

## Import Aliases
- `@/*` maps to project root (configured in [tsconfig.json](tsconfig.json))

## Image Handling
- Next.js Image component configured for `images.unsplash.com` in [next.config.ts](next.config.ts)

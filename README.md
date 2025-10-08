# 🤖 AI-Powered Coworking Space Search & Booking

An intelligent coworking space discovery platform that leverages AI for natural language search, conversational filtering, and instant booking - built with Next.js 15, Vercel AI SDK, and Supabase.

🌐 **[Live Demo](https://ai-sdk-coworking-chat.vercel.app)**

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Vercel AI SDK](https://img.shields.io/badge/Vercel%20AI%20SDK-latest-black)
![Supabase](https://img.shields.io/badge/Supabase-latest-green)

## ✨ Features

### 🎯 AI-Powered Search
- **Natural Language Queries**: "Find quiet spaces under $30 in Plateau"
- **Multi-turn Conversations**: AI asks clarifying questions to understand your needs
- **Smart Filtering**: Budget, team size, amenities - all through conversation
- **Generative UI**: Search results stream in real-time as interactive components

### 🔄 Conversational Experience
- AI collects requirements through natural dialogue
- No forms - just chat like you're talking to a concierge
- Context-aware responses based on previous messages
- Multi-step tool orchestration for complex queries

### 📅 Instant Booking
- Natural language booking: "Book WeWork at 2pm for 4 hours"
- Auth guard - sign in required for bookings
- Booking confirmation with full details
- Persistent storage with Supabase

### 🎨 Modern UI/UX
- Glassmorphism design with backdrop blur effects
- Black & white minimalist theme
- Skeleton loaders with smooth animations
- Mobile-responsive layout
- Progressive enhancement

## 🏗️ Architecture

```
User Query → AI Tool Calling → Stream Data →
Generate UI Components → Interactive Booking
```

### Key Components:
- **Vercel AI SDK**: Tool calling, streaming responses, multi-step conversations
- **OpenAI GPT-4o**: Natural language understanding and generation
- **Supabase**: User authentication and booking persistence
- **Next.js 15**: App Router, Server Components, Streaming
- **Tailwind CSS v4**: Utility-first styling with custom design system

## 🚀 Tech Stack

- **Framework**: Next.js 15 with Turbopack
- **UI Library**: React 19
- **Language**: TypeScript 5
- **AI/Chat**: Vercel AI SDK (@ai-sdk/react), OpenAI GPT-4o
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS v4, shadcn/ui
- **State Management**: React Context + localStorage
- **Deployment**: Vercel

## 📦 Installation

### Prerequisites
- Node.js 18+
- npm/yarn/pnpm
- Supabase account
- OpenAI API key

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/jhn07/ai-sdk-coworking-chat.git
cd ai-coworking-chat
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up Supabase**

Create a new Supabase project and run this SQL in the SQL Editor:

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT NOT NULL REFERENCES users(email) ON DELETE CASCADE,
  coworking_name TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  duration TEXT NOT NULL,
  price TEXT,
  address TEXT,
  lat NUMERIC,
  lng NUMERIC,
  timezone TEXT DEFAULT 'America/Toronto',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Public access policies (for demo purposes)
CREATE POLICY "Allow all operations on users" ON users FOR ALL USING (true);
CREATE POLICY "Allow all operations on bookings" ON bookings FOR ALL USING (true);
```

4. **Configure environment variables**

Create `.env.local` in the root directory:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
```

5. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 🎯 Usage Examples

### Conversational Search
```
👤 User: "I need a workspace"
🤖 AI: "Are you looking for a solo workspace or something for a team?"
👤 User: "Just me, under $30"
🤖 AI: "Any specific amenities? Like meeting rooms or 24/7 access?"
👤 User: "Need good wifi and quiet"
🤖 AI: [Shows 3 filtered spaces under $30 with good wifi]
```

### Direct Search
```
👤 User: "Show me coworking spaces in Plateau with meeting rooms"
🤖 AI: [Instantly displays relevant spaces]
```

### Natural Language Booking
```
👤 User: "Book Notman House tomorrow at 2pm for 6 hours"
🤖 AI: [Creates booking confirmation with all details]
```

## 📁 Project Structure

```
├── app/
│   ├── api/chat/route.ts          # AI chat endpoint with streaming
│   ├── api/bookings/route.ts      # Booking history API
│   └── page.tsx                   # Main chat interface
├── components/                     # React components (cards, modals, UI)
├── lib/
│   ├── ai/tools.ts                # AI tools: searchCoworkings, createBooking
│   ├── search-coworking.ts        # Search algorithm with ranking
│   ├── save-booking.ts            # Supabase booking persistence
│   └── coworkings.montreal.json   # Sample data (51 spaces)
├── providers/
│   └── user-context.tsx           # User authentication state
└── hooks/                         # Custom React hooks
```

## 🔧 AI Tools Configuration

### searchCoworkings Tool
Finds coworking spaces based on user criteria with smart filtering.

**Parameters:**
```typescript
{
  city: string              // Default: "Montreal"
  district?: string         // e.g., "Plateau", "Downtown"
  query?: string           // General search terms
  max: number              // Max results (1-10)
  maxPrice?: number        // Budget filter in CAD
  teamSize?: string        // "solo" | "small" | "large"
  amenities?: string[]     // Required amenities
}
```

**Returns:**
```typescript
// Success case:
{
  success: true
  coworkings: Coworking[]
  fallback: Coworking[]
  total: number
  appliedFilters: {
    maxPrice?: number
    teamSize?: "solo" | "small" | "large"
    amenities?: string[]
  }
}

// Error case:
{
  success: false
  error: string
  coworkings: []
  fallback: []
  total: 0
}
```

### createBooking Tool
Creates booking confirmations with user authentication check.

**Parameters:**
```typescript
{
  coworkingName: string
  time: string             // 24h format (e.g., "14:00")
  duration: string         // e.g., "2h", "4h", "Full day"
  date?: string           // YYYY-MM-DD (defaults to today)
}
```

**Returns:**
```typescript
// Success case:
{
  success: true
  booking: {
    coworking: string
    date: string
    time: string
    duration: string
    price: string
    timezone: string
    address?: string
    lat?: number
    lng?: number
  }
  message: string
  confirmationId: string
}

// Error case:
{
  success: false
  error: string
  message: string
}
```

## 🎨 Design Philosophy

- **Minimalist**: Clean black & white color scheme
- **Glassmorphism**: Subtle backdrop blur effects throughout
- **Conversational**: Natural dialogue instead of forms
- **Progressive**: Works without JS, enhanced with it
- **Mobile-First**: Fully responsive for all devices
- **Accessible**: Semantic HTML and keyboard navigation

## 🚢 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com) and import your repository
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `OPENAI_API_KEY`
4. Deploy!

Your app will be live at `https://your-project.vercel.app`

## 🧪 Development Commands

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linter
npm run lint
```

## 🔒 Security Notes

- Row Level Security (RLS) enabled on all Supabase tables
- User authentication required for bookings
- API keys stored in environment variables
- No sensitive data in client-side code

## 🌟 Key Highlights

- **Zero Forms**: Everything through natural conversation
- **Real-time Streaming**: UI components appear as AI generates them
- **Multi-turn Context**: AI remembers conversation history
- **Smart Fallbacks**: Shows nearby alternatives when exact matches not found
- **Applied Filters Display**: Visual chips showing active filters

## 📚 Learn More

- [Vercel AI SDK Documentation](https://sdk.vercel.ai/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [OpenAI API Reference](https://platform.openai.com/docs)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

MIT License - feel free to use this project for learning and inspiration!

## 🙏 Acknowledgments

- [Vercel AI SDK](https://sdk.vercel.ai) for the powerful AI toolkit
- [Supabase](https://supabase.com) for the backend infrastructure
- [shadcn/ui](https://ui.shadcn.com) for the beautiful component library
- [OpenAI](https://openai.com) for GPT-4o API

---

**Built with ❤️ using Next.js 15, Vercel AI SDK, and Supabase**

*This project showcases modern AI integration patterns, generative UI, and conversational interfaces for B2C applications.*

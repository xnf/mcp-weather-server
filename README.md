# Weather Forecast App (Built by a Vibe Coder Who Gets Things Done \* 🚀)

Hey there! 👋 I'm a vibe coder who believes in shipping fast and keeping things simple. I built this weather app that understands both English and Latvian because why not? Next.js was the obvious choice - it's like having a Swiss Army knife for web dev, but with better vibes.

## Why Next.js?

Look, I could've used anything, but Next.js just vibes with my workflow:

- It's got that "just works" energy we all love
- The docs are clean AF and actually helpful
- It's React but without the existential crisis
- Perfect for when you want to ship something that doesn't suck

## What's This App Do?

It's a weather app that's actually useful:

- Shows current weather and forecasts (duh)
- Speaks both English and Latvian (because why limit yourself?)
- Has a clean, minimal UI (Tailwind is my spirit animal)
- Uses MCP pattern (Model-Context-Protocol) because I like my code organized

## The Architecture (Yes, I Actually Thought About This)

I structured this thing in a way that makes sense to anyone who's not a masochist:

1. **Model Layer** (`src/mcp/model/weather.ts`)

   - Where the data shapes live
   - Uses Zod because type safety is sexy
   - Keeps the data clean and predictable

2. **Context Layer** (`src/mcp/context/weather.ts`)

   - The brains of the operation
   - Handles all the weather data magic
   - Makes error handling look easy

3. **Protocol Layer** (`src/mcp/protocol/weather.ts`)

   - Makes the app bilingual (because monolingual is so 2020)
   - Has some slick regex patterns
   - Turns natural language into actual queries

4. **Frontend** (`src/app/page.tsx`)
   - The part that makes users go "ooh"
   - Built with Tailwind (because writing CSS is so 2010)
   - Has a chat-like interface because I'm not a monster

## How to Run This Thing

1. Clone this repo (use whatever Git client vibes with you)
2. Run `npm install` (grab a coffee, this might take a minute)
3. Create a `.env.local` file with:
   ```
   WEATHER_API_URL=https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=56.9496&lon=24.1052
   WEATHER_API_KEY=your_api_key_here
   ```
4. Run `npm run dev` (watch the magic happen)
5. Open http://localhost:3000 in your browser

## Tech Stack (The Good Stuff)

- Next.js (because it's 2024 and we're not savages)
- TypeScript (type safety is a vibe)
- tRPC (end-to-end types, because we're fancy like that)
- React Query (for that smooth data fetching experience)
- Tailwind CSS (utility-first is the way)
- Zod (because runtime type checking is hot)
- Axios (for making HTTP requests without the drama)

## Project Structure

```
src/
├── app/                    # Frontend vibes
│   └── page.tsx           # Main page (where the magic happens)
├── mcp/                    # Clean architecture, but make it fashion
│   ├── model/             # Data models (keeping it type-safe)
│   ├── context/           # Business logic (the brain)
│   └── protocol/          # API layer (making it bilingual)
└── utils/                 # Helper functions (the unsung heroes)
```

## Disclaimer

I'm a vibe coder who believes in shipping fast and iterating faster. This code might have some spicy takes, but it works and it's maintainable. Feel free to fork it, but maybe throw a star my way if it vibes with you! ⭐

## License

MIT (because sharing is caring, and I'm not a monster)

---

- - Sarcasm. Joke.

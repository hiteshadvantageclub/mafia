# Mafia Game

A real-time multiplayer Mafia game built with Next.js and WebSocket using Vercel Edge Runtime.

## Deployment Instructions

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your GitHub repository
4. Add the following environment variable:
   - `NEXT_PUBLIC_SOCKET_URL`: Your Vercel deployment URL with `wss://` protocol (e.g., `wss://your-app.vercel.app`)

### Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env.local` with:
   ```
   NEXT_PUBLIC_SOCKET_URL=ws://localhost:3000/api/ws
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open http://localhost:3000 in your browser

## Environment Variables

- Development:
  ```
  NEXT_PUBLIC_SOCKET_URL=ws://localhost:3000/api/ws
  ```

- Production:
  ```
  NEXT_PUBLIC_SOCKET_URL=wss://your-app.vercel.app/api/ws
  ```

Make sure to replace `your-app.vercel.app` with your actual Vercel deployment URL.

## Technical Details

This application uses Vercel's Edge Runtime to handle WebSocket connections. The WebSocket server is implemented as an Edge API route in `/app/api/ws/route.ts`. This allows us to:

1. Handle real-time WebSocket connections
2. Store game state in memory
3. Deploy everything to Vercel without needing a separate WebSocket server

Note: Since the game state is stored in memory and Vercel's Edge functions are distributed, each instance will have its own state. For a production application, you might want to use a database or Redis to store the game state.

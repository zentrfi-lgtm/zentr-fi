Zentrfi (Zentra Finance) is a Web4 AI travel orchestration UI: a futuristic control-center experience where a swarm of specialized agents simulates planning, negotiating, and booking trips.

## Getting Started

### Environment

- Copy `ENV.example` to `.env.local` and fill in values.
- **WalletConnect (required for wallet connect UI)**:
  - `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID="5261912a5c184ed019675c830f491d1a"`
  - You can also set the original prompt variable `VITE_WALLETCONNECT_PROJECT_ID` — this Next.js app maps it automatically.
- **Mapbox (optional)**:
  - `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN="..."`
  - If missing, the dashboard shows a fallback route visualization.

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Routes:

- `/`: Landing page (Particles + Three.js hero + Framer Motion scroll reveals)
- `/dashboard`: ChatGPT-style dashboard (chat + options + booking details + mock escrow signature + map panel)

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

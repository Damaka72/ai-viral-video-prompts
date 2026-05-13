# AI Viral Video Prompts — Site Dev Guide

## Stack
Static HTML/CSS/JS — deployed on Vercel. No build step.

## Key files
- `index.html` — main product/sales page
- `data/` — agent output files (agent-summaries/*.json feeds the Command Hub)
- `social-agent.html` — legacy social agent (Blotato now handles scheduling)

## Revenue
Products sold via Gumroad. GUMROAD_API_KEY set in Vercel — revenue shows live on Command Hub.

## Platforms
Instagram + TikTok + Pinterest + YouTube (all connected via Blotato)

## Commit format
`feat: ...` / `fix: ...` — push to `main`, Vercel auto-deploys

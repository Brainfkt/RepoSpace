# RepoSpace
An interactive 3D map of your GitHub repositories

## Development

```bash
npm install
npm run dev
```

The app fetches public repository metadata and complete Git trees from the
GitHub REST API, then normalizes them into the same nested format consumed by
the 3D scene. If GitHub is unavailable or rate limited, the bundled mock data in
`src/data/repos.js` remains available as a visible fallback.

Copy `.env.example` to `.env` to change the public GitHub profile:

```bash
VITE_GITHUB_USERNAME=Brainfkt
```

Do not place a GitHub token in any `VITE_*` variable. Vite exposes those values
to browsers. If authentication is needed later for private repositories or
higher rate limits, configure a server-side proxy through
`VITE_GITHUB_API_BASE_URL` and keep `GITHUB_TOKEN` only in that server
environment.

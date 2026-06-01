// Public GitHub profile to visualize. Override this frontend-safe value in .env.
export const GITHUB_USERNAME =
  import.meta.env.VITE_GITHUB_USERNAME?.trim() || "Brainfkt";

// Keep tokens out of this browser bundle. For authenticated requests, configure
// a server-side proxy URL here and inject GITHUB_TOKEN only on that server.
export const GITHUB_API_BASE_URL = (
  import.meta.env.VITE_GITHUB_API_BASE_URL?.trim() || "https://api.github.com"
).replace(/\/$/, "");

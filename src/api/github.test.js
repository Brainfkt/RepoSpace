import { describe, expect, it } from "vitest";
import {
  fetchGitHubRepositories,
  fetchRepositoryTree,
  inferFileLanguage,
} from "./github";

const repository = {
  default_branch: "main",
  description: "Example repository.",
  forks_count: 3,
  full_name: "octocat/hello",
  html_url: "https://github.com/octocat/hello",
  language: "TypeScript",
  name: "hello",
  owner: { login: "octocat" },
  size: 42,
  stargazers_count: 1200,
  updated_at: "2026-06-01T10:00:00Z",
};

describe("GitHub REST adapter", () => {
  it("fetches and normalizes public repository metadata, languages, and files", async () => {
    const fetchImpl = createFetchMock({
      "/users/octocat/repos?per_page=100&page=1&type=owner&sort=updated": [
        repository,
      ],
      "/repos/octocat/hello/languages": { TypeScript: 4200, CSS: 900 },
      "/repos/octocat/hello/git/trees/main?recursive=1": {
        tree: [
          { path: "src", sha: "src-sha", type: "tree" },
          { path: "src/App.tsx", sha: "app-sha", size: 2048, type: "blob" },
          { path: "README.md", sha: "readme-sha", size: 800, type: "blob" },
        ],
        truncated: false,
      },
    });

    const [normalized] = await fetchGitHubRepositories({
      baseUrl: "https://api.github.test",
      fetchImpl,
      username: "octocat",
    });

    expect(normalized).toMatchObject({
      id: "hello",
      name: "hello",
      fullName: "octocat/hello",
      primaryLanguage: "TypeScript",
      languages: { TypeScript: 4200, CSS: 900 },
      size: 42 * 1024,
      stats: { stars: "1.2K", forks: 3 },
      updatedAt: "2026-06-01T10:00:00Z",
    });
    expect(normalized.children.map((node) => node.path)).toEqual([
      "hello/src",
      "hello/README.md",
    ]);
    expect(normalized.children[0].children[0]).toMatchObject({
      type: "file",
      name: "App.tsx",
      path: "hello/src/App.tsx",
      repositoryPath: "src/App.tsx",
      language: "TypeScript",
      size: 2048,
      githubUrl: "https://github.com/octocat/hello/blob/main/src/App.tsx",
    });
  });

  it("recovers a complete tree subtree-by-subtree when GitHub truncates recursion", async () => {
    const fetchImpl = createFetchMock({
      "/repos/octocat/hello/git/trees/main?recursive=1": {
        tree: [],
        truncated: true,
      },
      "/repos/octocat/hello/git/trees/main": {
        tree: [
          { path: "src", sha: "src-sha", type: "tree" },
          { path: "README.md", sha: "readme-sha", size: 800, type: "blob" },
        ],
      },
      "/repos/octocat/hello/git/trees/src-sha": {
        tree: [
          { path: "App.tsx", sha: "app-sha", size: 2048, type: "blob" },
        ],
      },
    });

    const entries = await fetchRepositoryTree(repository, {
      baseUrl: "https://api.github.test",
      fetchImpl,
    });

    expect(entries.map((entry) => entry.path)).toEqual([
      "src",
      "src/App.tsx",
      "README.md",
    ]);
  });

  it("uses each file's own extension or a neutral text fallback", () => {
    expect(inferFileLanguage("App.tsx")).toBe("TypeScript");
    expect(inferFileLanguage("styles.scss")).toBe("CSS");
    expect(inferFileLanguage("Dockerfile")).toBe("Dockerfile");
    expect(inferFileLanguage(".gitignore")).toBe("Text");
    expect(inferFileLanguage("unknown.custom")).toBe("Text");
  });
});

function createFetchMock(responses) {
  return async (url) => {
    const { pathname, search } = new URL(url);
    const response = responses[`${pathname}${search}`];

    if (response === undefined) {
      return jsonResponse({ message: `Unhandled test URL: ${url}` }, 404);
    }

    return jsonResponse(response);
  };
}

function jsonResponse(body, status = 200) {
  return {
    headers: new Headers(),
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  };
}

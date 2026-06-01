import { create } from "zustand";
import { fetchGitHubRepositories, describeGitHubError } from "../api/github";
import { GITHUB_USERNAME } from "../config/github";
import { repos as mockRepos } from "../data/repos";

let inFlightRequest = null;

const initialState = {
  error: null,
  repositories: mockRepos,
  source: "mock",
  status: "idle",
  username: GITHUB_USERNAME,
};

export const useRepositoryStore = create((set, get) => ({
  ...initialState,
  loadRepositories: (options = {}) => {
    const { force = false } = options;

    if (!force && ["loading", "ready", "empty"].includes(get().status)) {
      return inFlightRequest ?? Promise.resolve(get().repositories);
    }

    if (inFlightRequest) return inFlightRequest;

    set({ error: null, status: "loading" });
    inFlightRequest = fetchGitHubRepositories({ username: get().username })
      .then((repositories) => {
        set({
          error: null,
          repositories,
          source: "github",
          status: repositories.length ? "ready" : "empty",
        });
        return repositories;
      })
      .catch((error) => {
        set({
          error: describeGitHubError(error),
          repositories: mockRepos,
          source: "mock",
          status: "fallback",
        });
        return mockRepos;
      })
      .finally(() => {
        inFlightRequest = null;
      });

    return inFlightRequest;
  },
}));

export function getRuntimeRepoById(repoId) {
  return (
    useRepositoryStore
      .getState()
      .repositories.find((repository) => repository.id === repoId) ?? null
  );
}

import { GITHUB_API_BASE_URL, GITHUB_USERNAME } from "../config/github";

const GITHUB_HEADERS = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
};
const REPOSITORIES_PER_PAGE = 100;
const REPOSITORY_CONCURRENCY = 4;

const LANGUAGE_BY_FILENAME = {
  ".env": "Text",
  ".gitattributes": "Text",
  ".gitignore": "Text",
  dockerfile: "Dockerfile",
  license: "Text",
  makefile: "Makefile",
};

const LANGUAGE_BY_EXTENSION = {
  c: "C",
  cpp: "C++",
  cs: "C#",
  css: "CSS",
  csv: "CSV",
  frag: "GLSL",
  glsl: "GLSL",
  go: "Go",
  h: "C",
  hpp: "C++",
  html: "HTML",
  java: "Java",
  js: "JavaScript",
  jsx: "JavaScript",
  json: "JSON",
  kt: "Kotlin",
  less: "CSS",
  md: "Markdown",
  mdx: "Markdown",
  pdf: "PDF",
  php: "PHP",
  png: "PNG",
  py: "Python",
  rb: "Ruby",
  rs: "Rust",
  sass: "CSS",
  scss: "CSS",
  sh: "Shell",
  sql: "SQL",
  swift: "Swift",
  svg: "SVG",
  txt: "Text",
  ts: "TypeScript",
  tsx: "TypeScript",
  vert: "GLSL",
  vue: "Vue",
  xml: "XML",
  yaml: "YAML",
  yml: "YAML",
};

export class GitHubApiError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "GitHubApiError";
    Object.assign(this, details);
  }
}

export async function fetchGitHubRepositories(options = {}) {
  const {
    baseUrl = GITHUB_API_BASE_URL,
    fetchImpl = fetch,
    username = GITHUB_USERNAME,
  } = options;
  const repositories = await fetchUserRepositories(username, { baseUrl, fetchImpl });

  return mapWithConcurrency(repositories, REPOSITORY_CONCURRENCY, async (repository) => {
    const [languages, treeEntries] = await Promise.all([
      fetchRepositoryLanguages(repository, { baseUrl, fetchImpl }),
      fetchRepositoryTree(repository, { baseUrl, fetchImpl }),
    ]);

    return normalizeGitHubRepository(repository, languages, treeEntries);
  });
}

export async function fetchUserRepositories(username, options = {}) {
  const { baseUrl = GITHUB_API_BASE_URL, fetchImpl = fetch } = options;
  const repositories = [];
  let page = 1;

  while (true) {
    const pageRepositories = await requestJson(
      `/users/${encodeURIComponent(username)}/repos?per_page=${REPOSITORIES_PER_PAGE}&page=${page}&type=owner&sort=updated`,
      { baseUrl, fetchImpl },
    );

    repositories.push(...pageRepositories);
    if (pageRepositories.length < REPOSITORIES_PER_PAGE) return repositories;
    page += 1;
  }
}

export async function fetchRepositoryLanguages(repository, options = {}) {
  const { baseUrl = GITHUB_API_BASE_URL, fetchImpl = fetch } = options;
  const path = getRepositoryPath(repository);

  try {
    return await requestJson(`${path}/languages`, { baseUrl, fetchImpl });
  } catch (error) {
    if (isRateLimitError(error)) throw error;
    return {};
  }
}

export async function fetchRepositoryTree(repository, options = {}) {
  const { baseUrl = GITHUB_API_BASE_URL, fetchImpl = fetch } = options;
  const path = getRepositoryPath(repository);
  const treeRef = repository.default_branch || "HEAD";

  try {
    const payload = await requestJson(
      `${path}/git/trees/${encodeURIComponent(treeRef)}?recursive=1`,
      { baseUrl, fetchImpl },
    );

    if (!payload.truncated) return payload.tree ?? [];
    return fetchTreeBySubtree(path, treeRef, { baseUrl, fetchImpl });
  } catch (error) {
    if (error.status === 409) return [];
    throw error;
  }
}

async function fetchTreeBySubtree(repositoryPath, treeSha, options, prefix = "") {
  const payload = await requestJson(
    `${repositoryPath}/git/trees/${encodeURIComponent(treeSha)}`,
    options,
  );
  const entries = [];

  for (const entry of payload.tree ?? []) {
    const path = prefix ? `${prefix}/${entry.path}` : entry.path;
    const normalizedEntry = { ...entry, path };
    entries.push(normalizedEntry);

    if (entry.type === "tree") {
      entries.push(
        ...(await fetchTreeBySubtree(repositoryPath, entry.sha, options, path)),
      );
    }
  }

  return entries;
}

export function normalizeGitHubRepository(repository, languages, treeEntries) {
  const root = { children: [] };
  const folders = new Map([["", root]]);

  for (const entry of [...treeEntries].sort(sortTreeEntries)) {
    if (entry.type === "tree") {
      ensureFolder(repository, folders, entry.path);
      continue;
    }

    if (entry.type !== "blob") continue;

    const parts = entry.path.split("/");
    const name = parts.pop();
    const parentPath = parts.join("/");
    const parent = ensureFolder(repository, folders, parentPath);
    const language = inferFileLanguage(name);

    parent.children.push({
      type: "file",
      name,
      path: `${repository.name}/${entry.path}`,
      repositoryPath: entry.path,
      extension: getExtension(name),
      language,
      size: entry.size ?? 0,
      description: `${language} file from ${repository.name}.`,
      githubUrl: `${repository.html_url}/blob/${encodeURIComponent(
        repository.default_branch || "HEAD",
      )}/${encodeGitHubPath(entry.path)}`,
    });
  }

  sortTreeChildren(root.children);

  return {
    id: repository.name,
    name: repository.name,
    fullName: repository.full_name,
    owner: repository.owner?.login,
    description: repository.description || "GitHub repository.",
    githubUrl: repository.html_url,
    primaryLanguage: repository.language || "Default",
    languages,
    stats: {
      forks: repository.forks_count ?? 0,
      stars: formatCompactNumber(repository.stargazers_count ?? 0),
    },
    size: (repository.size ?? 0) * 1024,
    updatedAt: repository.updated_at,
    defaultBranch: repository.default_branch || "HEAD",
    children: root.children,
  };
}

export function inferFileLanguage(fileName) {
  const normalizedName = fileName.toLowerCase();
  const extension = getExtension(fileName);
  return (
    LANGUAGE_BY_FILENAME[normalizedName] ||
    LANGUAGE_BY_EXTENSION[extension] ||
    "Text"
  );
}

export function describeGitHubError(error) {
  if (isRateLimitError(error)) {
    return "GitHub API rate limit reached. Showing the bundled demo repositories.";
  }

  if (error.status === 404) {
    return "GitHub profile was not found. Showing the bundled demo repositories.";
  }

  return "GitHub data could not be loaded. Showing the bundled demo repositories.";
}

async function requestJson(path, options = {}) {
  const { baseUrl = GITHUB_API_BASE_URL, fetchImpl = fetch } = options;
  let response;

  try {
    response = await fetchImpl(`${baseUrl}${path}`, {
      headers: GITHUB_HEADERS,
    });
  } catch (error) {
    throw new GitHubApiError("GitHub request failed.", { cause: error });
  }

  if (!response.ok) {
    throw new GitHubApiError(`GitHub request failed with ${response.status}.`, {
      rateLimitRemaining: response.headers.get("x-ratelimit-remaining"),
      rateLimitReset: response.headers.get("x-ratelimit-reset"),
      status: response.status,
    });
  }

  return response.json();
}

function ensureFolder(repository, folders, relativePath) {
  if (!relativePath) return folders.get("");
  if (folders.has(relativePath)) return folders.get(relativePath);

  const parts = relativePath.split("/");
  const name = parts.pop();
  const parentPath = parts.join("/");
  const parent = ensureFolder(repository, folders, parentPath);
  const folder = {
    type: "folder",
    name,
    path: `${repository.name}/${relativePath}`,
    repositoryPath: relativePath,
    children: [],
  };

  parent.children.push(folder);
  folders.set(relativePath, folder);
  return folder;
}

function sortTreeEntries(left, right) {
  return left.path.localeCompare(right.path);
}

function sortTreeChildren(children) {
  children.sort((left, right) => {
    if (left.type !== right.type) return left.type === "folder" ? -1 : 1;
    return left.name.localeCompare(right.name);
  });

  for (const child of children) {
    if (child.type === "folder") sortTreeChildren(child.children);
  }
}

function getRepositoryPath(repository) {
  return `/repos/${encodeURIComponent(repository.owner.login)}/${encodeURIComponent(
    repository.name,
  )}`;
}

function getExtension(fileName) {
  const periodIndex = fileName.lastIndexOf(".");
  return periodIndex === -1 ? "" : fileName.slice(periodIndex + 1).toLowerCase();
}

function encodeGitHubPath(path) {
  return path.split("/").map(encodeURIComponent).join("/");
}

function formatCompactNumber(value) {
  return Intl.NumberFormat("en", { notation: "compact" }).format(value);
}

function isRateLimitError(error) {
  return (
    (error.status === 403 || error.status === 429) &&
    (error.rateLimitRemaining === "0" || error.status === 429)
  );
}

async function mapWithConcurrency(items, concurrency, mapper) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await mapper(items[currentIndex], currentIndex);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, () => worker()),
  );
  return results;
}

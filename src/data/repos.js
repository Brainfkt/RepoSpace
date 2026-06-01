function file(name, path, language, size, description) {
  return {
    type: "file",
    name,
    path,
    extension: name.includes(".") ? name.split(".").pop() : "",
    language,
    size,
    description,
    githubUrl: `https://github.com/example/${path.split("/")[0]}/blob/main/${path
      .split("/")
      .slice(1)
      .join("/")}`,
  };
}

function folder(name, path, children) {
  return { type: "folder", name, path, children };
}

export const repos = [
  {
    id: "atlas-dashboard",
    name: "atlas-dashboard",
    description: "Spatial analytics workspace for product teams.",
    githubUrl: "https://github.com/example/atlas-dashboard",
    primaryLanguage: "TypeScript",
    stats: { stars: "2.8k", forks: 318 },
    children: [
      folder("src", "atlas-dashboard/src", [
        folder("components", "atlas-dashboard/src/components", [
          file(
            "Scene.jsx",
            "atlas-dashboard/src/components/Scene.jsx",
            "TypeScript",
            12698,
            "Main 3D scene composition and camera rig.",
          ),
          file(
            "MetricsGrid.tsx",
            "atlas-dashboard/src/components/MetricsGrid.tsx",
            "TypeScript",
            9234,
            "Responsive analytics metric grid.",
          ),
          file(
            "CommandBar.tsx",
            "atlas-dashboard/src/components/CommandBar.tsx",
            "TypeScript",
            6144,
            "Keyboard-driven dashboard command surface.",
          ),
          file(
            "ChartCanvas.tsx",
            "atlas-dashboard/src/components/ChartCanvas.tsx",
            "TypeScript",
            10440,
            "Composable chart canvas for workspace panels.",
          ),
          file(
            "FilterDock.tsx",
            "atlas-dashboard/src/components/FilterDock.tsx",
            "TypeScript",
            5480,
            "Compact data filter controls.",
          ),
          file(
            "WorkspaceHeader.tsx",
            "atlas-dashboard/src/components/WorkspaceHeader.tsx",
            "TypeScript",
            5160,
            "Workspace title and command actions.",
          ),
          file(
            "EmptyState.tsx",
            "atlas-dashboard/src/components/EmptyState.tsx",
            "TypeScript",
            3190,
            "Fallback surface for unconfigured workspaces.",
          ),
          file(
            "PanelFrame.tsx",
            "atlas-dashboard/src/components/PanelFrame.tsx",
            "TypeScript",
            6770,
            "Shared analytics panel wrapper.",
          ),
          file(
            "StatusRail.tsx",
            "atlas-dashboard/src/components/StatusRail.tsx",
            "TypeScript",
            4520,
            "Live workspace status indicators.",
          ),
        ]),
        folder("hooks", "atlas-dashboard/src/hooks", [
          file(
            "useWorkspace.ts",
            "atlas-dashboard/src/hooks/useWorkspace.ts",
            "TypeScript",
            7420,
            "Workspace selection and panel state hook.",
          ),
          file(
            "useResize.ts",
            "atlas-dashboard/src/hooks/useResize.ts",
            "TypeScript",
            2830,
            "Viewport resize observer utilities.",
          ),
        ]),
        folder("styles", "atlas-dashboard/src/styles", [
          file(
            "theme.css",
            "atlas-dashboard/src/styles/theme.css",
            "CSS",
            4680,
            "Dashboard design tokens and shared surfaces.",
          ),
          file(
            "layout.css",
            "atlas-dashboard/src/styles/layout.css",
            "CSS",
            3520,
            "Grid and panel layout primitives.",
          ),
        ]),
      ]),
      folder("config", "atlas-dashboard/config", [
        file(
          "widgets.json",
          "atlas-dashboard/config/widgets.json",
          "JSON",
          5860,
          "Default workspace widget registry.",
        ),
        file(
          "vite.config.js",
          "atlas-dashboard/config/vite.config.js",
          "JavaScript",
          1490,
          "Local build and preview configuration.",
        ),
      ]),
      folder("tests", "atlas-dashboard/tests", [
        file(
          "workspace.test.ts",
          "atlas-dashboard/tests/workspace.test.ts",
          "TypeScript",
          4780,
          "Workspace navigation regression coverage.",
        ),
      ]),
      file(
        "README.md",
        "atlas-dashboard/README.md",
        "Markdown",
        8192,
        "Project overview and local development guide.",
      ),
    ],
  },
  {
    id: "signal-api",
    name: "signal-api",
    description: "Event processing API with typed ingestion pipelines.",
    githubUrl: "https://github.com/example/signal-api",
    primaryLanguage: "Python",
    stats: { stars: "1.9k", forks: 226 },
    children: [
      folder("app", "signal-api/app", [
        folder("routes", "signal-api/app/routes", [
          file(
            "events.py",
            "signal-api/app/routes/events.py",
            "Python",
            11840,
            "HTTP routes for batched event ingestion.",
          ),
          file(
            "health.py",
            "signal-api/app/routes/health.py",
            "Python",
            1840,
            "Readiness and liveness checks.",
          ),
        ]),
        folder("services", "signal-api/app/services", [
          file(
            "pipeline.py",
            "signal-api/app/services/pipeline.py",
            "Python",
            16520,
            "Validation and event transformation pipeline.",
          ),
          file(
            "archive.py",
            "signal-api/app/services/archive.py",
            "Python",
            6840,
            "Cold archive write-through service.",
          ),
        ]),
        file(
          "settings.py",
          "signal-api/app/settings.py",
          "Python",
          4350,
          "Application configuration model.",
        ),
      ]),
      folder("schemas", "signal-api/schemas", [
        file(
          "event.json",
          "signal-api/schemas/event.json",
          "JSON",
          3710,
          "Event payload JSON schema.",
        ),
        file(
          "archive.json",
          "signal-api/schemas/archive.json",
          "JSON",
          2990,
          "Archive manifest JSON schema.",
        ),
      ]),
      file(
        "README.md",
        "signal-api/README.md",
        "Markdown",
        6520,
        "API overview, setup, and operational notes.",
      ),
    ],
  },
  {
    id: "papertrail-docs",
    name: "papertrail-docs",
    description: "Documentation system for a distributed platform.",
    githubUrl: "https://github.com/example/papertrail-docs",
    primaryLanguage: "Markdown",
    stats: { stars: "1.3k", forks: 194 },
    children: [
      folder("guides", "papertrail-docs/guides", [
        file(
          "getting-started.md",
          "papertrail-docs/guides/getting-started.md",
          "Markdown",
          13820,
          "First-run guide for new platform users.",
        ),
        file(
          "deployment.md",
          "papertrail-docs/guides/deployment.md",
          "Markdown",
          11220,
          "Production deployment recommendations.",
        ),
        file(
          "troubleshooting.md",
          "papertrail-docs/guides/troubleshooting.md",
          "Markdown",
          9870,
          "Common issues and recovery paths.",
        ),
      ]),
      folder("reference", "papertrail-docs/reference", [
        file(
          "api.md",
          "papertrail-docs/reference/api.md",
          "Markdown",
          18220,
          "HTTP API endpoint reference.",
        ),
        file(
          "events.json",
          "papertrail-docs/reference/events.json",
          "JSON",
          6240,
          "Example event payload catalog.",
        ),
      ]),
      folder("styles", "papertrail-docs/styles", [
        file(
          "docs.css",
          "papertrail-docs/styles/docs.css",
          "CSS",
          5370,
          "Documentation typography and layout.",
        ),
      ]),
      file(
        "README.md",
        "papertrail-docs/README.md",
        "Markdown",
        4220,
        "Documentation repository contribution guide.",
      ),
    ],
  },
  {
    id: "forge-cli",
    name: "forge-cli",
    description: "Developer command-line toolkit for repeatable releases.",
    githubUrl: "https://github.com/example/forge-cli",
    primaryLanguage: "JavaScript",
    stats: { stars: "986", forks: 142 },
    children: [
      folder("src", "forge-cli/src", [
        folder("commands", "forge-cli/src/commands", [
          file(
            "build.js",
            "forge-cli/src/commands/build.js",
            "JavaScript",
            8840,
            "Build command orchestration.",
          ),
          file(
            "publish.js",
            "forge-cli/src/commands/publish.js",
            "JavaScript",
            10240,
            "Release publishing workflow.",
          ),
          file(
            "inspect.js",
            "forge-cli/src/commands/inspect.js",
            "JavaScript",
            6580,
            "Local package inspection command.",
          ),
        ]),
        folder("lib", "forge-cli/src/lib", [
          file(
            "logger.js",
            "forge-cli/src/lib/logger.js",
            "JavaScript",
            3360,
            "Structured terminal output helpers.",
          ),
          file(
            "manifest.js",
            "forge-cli/src/lib/manifest.js",
            "JavaScript",
            7920,
            "Package manifest parsing utilities.",
          ),
        ]),
      ]),
      folder("templates", "forge-cli/templates", [
        file(
          "defaults.json",
          "forge-cli/templates/defaults.json",
          "JSON",
          4250,
          "Generated project defaults.",
        ),
      ]),
      file(
        "README.md",
        "forge-cli/README.md",
        "Markdown",
        5980,
        "CLI installation and command reference.",
      ),
    ],
  },
  {
    id: "vector-lab",
    name: "vector-lab",
    description: "WebGL studies for interactive data rendering.",
    githubUrl: "https://github.com/example/vector-lab",
    primaryLanguage: "GLSL",
    stats: { stars: "742", forks: 119 },
    children: [
      folder("src", "vector-lab/src", [
        folder("shaders", "vector-lab/src/shaders", [
          file(
            "field.glsl",
            "vector-lab/src/shaders/field.glsl",
            "GLSL",
            9240,
            "Vector field fragment shader.",
          ),
          file(
            "particles.glsl",
            "vector-lab/src/shaders/particles.glsl",
            "GLSL",
            12600,
            "Particle update and rendering shader.",
          ),
        ]),
        folder("runtime", "vector-lab/src/runtime", [
          file(
            "renderer.ts",
            "vector-lab/src/runtime/renderer.ts",
            "TypeScript",
            9880,
            "WebGL renderer setup and frame loop.",
          ),
          file(
            "controls.ts",
            "vector-lab/src/runtime/controls.ts",
            "TypeScript",
            4660,
            "Pointer input and camera controls.",
          ),
        ]),
        file(
          "main.ts",
          "vector-lab/src/main.ts",
          "TypeScript",
          3870,
          "Interactive study application entry point.",
        ),
      ]),
      folder("styles", "vector-lab/styles", [
        file(
          "lab.css",
          "vector-lab/styles/lab.css",
          "CSS",
          2940,
          "Canvas layout and controls styling.",
        ),
      ]),
      file(
        "README.md",
        "vector-lab/README.md",
        "Markdown",
        4920,
        "Experiment index and rendering notes.",
      ),
    ],
  },
];

export function getRepoById(repoId) {
  return repos.find((repo) => repo.id === repoId) ?? null;
}

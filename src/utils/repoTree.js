const FILE_MIN_SIZE = 0.32;
const FILE_MAX_SIZE = 1.12;
const FOLDER_MIN_SIZE = 1.15;
const FOLDER_MAX_SIZE = 2.45;

export function getDescendantSize(node) {
  if (!node) return 0;
  if (node.type === "file") return node.size;
  return (node.children ?? []).reduce(
    (total, child) => total + getDescendantSize(child),
    0,
  );
}

export function findNodeByPath(root, path) {
  if (!root || !path || root.id === path || root.path === path) return root;

  for (const child of root.children ?? []) {
    if (child.path === path) return child;
    if (child.type === "folder" && path.startsWith(`${child.path}/`)) {
      const found = findNodeByPath(child, path);
      if (found) return found;
    }
  }

  return null;
}

export function getVisibleChildren(repo, folderPath = "") {
  const currentNode = folderPath ? findNodeByPath(repo, folderPath) : repo;
  return currentNode?.children ?? [];
}

export function getDescendantFiles(nodeOrNodes) {
  if (!nodeOrNodes) return [];
  if (Array.isArray(nodeOrNodes)) {
    return nodeOrNodes.flatMap((node) => getDescendantFiles(node));
  }
  if (nodeOrNodes.type === "file") return [nodeOrNodes];
  return getDescendantFiles(nodeOrNodes.children ?? []);
}

export function clampFileSize(bytes) {
  const scaled = 0.22 + Math.cbrt(Math.max(bytes, 1) / 1024) * 0.24;
  return clamp(scaled, FILE_MIN_SIZE, FILE_MAX_SIZE);
}

export function clampFolderSize(bytes) {
  const scaled = 0.84 + Math.cbrt(Math.max(bytes, 1) / 1024) * 0.2;
  return clamp(scaled, FOLDER_MIN_SIZE, FOLDER_MAX_SIZE);
}

export function getRepoScale(bytes) {
  return clamp(2.9 + Math.cbrt(Math.max(bytes, 1) / 1024) * 0.22, 3.5, 4.7);
}

export function layoutBlocks(nodes, options = {}) {
  const {
    columns = 3,
    spacing = 2.25,
    rowSpacing = spacing + 0.52,
    depthOffset = 0.14,
  } = options;
  const rows = Math.max(1, Math.ceil(nodes.length / columns));

  return nodes.map((node, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    const depthStep = (column + row) % 3;

    return {
      node,
      position: [
        (column - (Math.min(columns, nodes.length) - 1) / 2) * spacing,
        ((rows - 1) / 2 - row) * rowSpacing,
        (depthStep - 1) * depthOffset,
      ],
    };
  });
}

export function layoutPreviewFiles(files, shellSize) {
  if (!files.length) return [];

  const columns = Math.ceil(Math.cbrt(files.length));
  const rows = Math.ceil(Math.sqrt(files.length / columns));
  const layers = Math.ceil(files.length / (columns * rows));
  const largestDimension = Math.max(columns, rows, layers);
  const cellSize = shellSize / (largestDimension + 0.9);

  return files.map((file, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns) % rows;
    const layer = Math.floor(index / (columns * rows));
    const relativeSize = clampFileSize(file.size) / FILE_MAX_SIZE;

    return {
      file,
      position: [
        (column - (columns - 1) / 2) * cellSize,
        ((rows - 1) / 2 - row) * cellSize,
        (layer - (layers - 1) / 2) * cellSize,
      ],
      size: cellSize * (0.44 + relativeSize * 0.42),
    };
  });
}

export function getBreadcrumbItems(repo, folderPath = "") {
  if (!repo) return [{ label: "All repos", path: null }];

  const items = [
    { label: "All repos", path: null },
    { label: repo.name, path: "" },
  ];

  if (!folderPath) return items;

  const relativePath = folderPath.replace(`${repo.id}/`, "");
  let currentPath = repo.id;

  for (const segment of relativePath.split("/")) {
    currentPath = `${currentPath}/${segment}`;
    items.push({ label: segment, path: currentPath });
  }

  return items;
}

export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum);
}

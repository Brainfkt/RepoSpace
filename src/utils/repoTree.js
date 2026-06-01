const FILE_MIN_SIZE = 0.32;
const FILE_MAX_SIZE = 1.12;
const FOLDER_MIN_SIZE = 1.15;
const FOLDER_MAX_SIZE = 2.45;
const FOLDER_ROW_WEIGHT = 1.35;

export const REPOSITORY_INTERIOR = {
  bandGap: 0.5,
  depthOffset: 0.14,
  height: 6.55,
  width: 10.7,
  yCenter: 0.18,
};

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

export function getRenderedFilesForView(repositories, activeRepoId, folderPath = "") {
  if (!activeRepoId) return getDescendantFiles(repositories);

  const repo = repositories.find((repository) => repository.id === activeRepoId);
  return getVisibleChildren(repo, folderPath).flatMap((node) =>
    node.type === "file" ? [node] : getDescendantFiles(node),
  );
}

export function getVisibleFileTypes(files) {
  return [...new Set(files.map((file) => file.language || "Default"))].sort((left, right) =>
    left.localeCompare(right),
  );
}

export function clampFileSize(bytes) {
  const scaled = 0.22 + Math.cbrt(Math.max(bytes, 1) / 1024) * 0.24;
  return clamp(scaled, FILE_MIN_SIZE, FILE_MAX_SIZE);
}

export function clampFolderSize(bytes, fileCount = 0) {
  const byteScaled = 0.84 + Math.cbrt(Math.max(bytes, 1) / 1024) * 0.2;
  const countScaled = 0.98 + Math.cbrt(Math.max(fileCount, 1)) * 0.22;
  return clamp(Math.max(byteScaled, countScaled), FOLDER_MIN_SIZE, FOLDER_MAX_SIZE);
}

export function getRepoScale(bytes) {
  return clamp(2.9 + Math.cbrt(Math.max(bytes, 1) / 1024) * 0.22, 3.5, 4.7);
}

export function layoutBlocks(nodes, options = {}) {
  const {
    bandGap = REPOSITORY_INTERIOR.bandGap,
    depthOffset = REPOSITORY_INTERIOR.depthOffset,
    height = REPOSITORY_INTERIOR.height,
    width = REPOSITORY_INTERIOR.width,
    yCenter = REPOSITORY_INTERIOR.yCenter,
  } = options;
  const folders = nodes.filter((node) => node.type === "folder");
  const files = nodes.filter((node) => node.type === "file");
  const gap = folders.length && files.length ? bandGap : 0;
  const grid = chooseInteriorGrid(folders.length, files.length, width, height - gap);
  const unitRowHeight =
    (height - gap) /
    Math.max(1, grid.folderRows * FOLDER_ROW_WEIGHT + grid.fileRows);
  const top = yCenter + height / 2;
  const folderHeight = grid.folderRows * unitRowHeight * FOLDER_ROW_WEIGHT;
  const fileTop = top - folderHeight - gap;

  return [
    ...layoutBand(folders, {
      columns: grid.folderColumns,
      depthOffset,
      kind: "folder",
      rowHeight: unitRowHeight * FOLDER_ROW_WEIGHT,
      top,
      width,
    }),
    ...layoutBand(files, {
      columns: grid.fileColumns,
      depthOffset,
      kind: "file",
      rowHeight: unitRowHeight,
      top: folders.length ? fileTop : top,
      width,
    }),
  ];
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

function chooseInteriorGrid(folderCount, fileCount, width, height) {
  const folderCandidates = getGridCandidates(folderCount, "folder", width, height);
  const fileCandidates = getGridCandidates(fileCount, "file", width, height);
  let bestGrid = null;

  for (const folderGrid of folderCandidates) {
    for (const fileGrid of fileCandidates) {
      const rowUnits = folderGrid.rows * FOLDER_ROW_WEIGHT + fileGrid.rows;
      const unitRowHeight = height / Math.max(1, rowUnits);
      const folderCellSize = getCellSize(
        width,
        folderGrid.columns,
        unitRowHeight * FOLDER_ROW_WEIGHT,
        "folder",
      );
      const fileCellSize = getCellSize(
        width,
        fileGrid.columns,
        unitRowHeight,
        "file",
      );
      const visibleCellSizes = [
        folderCount ? folderCellSize : null,
        fileCount ? fileCellSize : null,
      ].filter((size) => size !== null);
      const score = visibleCellSizes.length ? Math.min(...visibleCellSizes) : 0;
      const emptyCells = folderGrid.emptyCells + fileGrid.emptyCells;
      const totalRows = folderGrid.rows + fileGrid.rows;

      if (
        !bestGrid ||
        score > bestGrid.score ||
        (score === bestGrid.score && emptyCells < bestGrid.emptyCells) ||
        (score === bestGrid.score &&
          emptyCells === bestGrid.emptyCells &&
          totalRows < bestGrid.totalRows)
      ) {
        bestGrid = {
          emptyCells,
          fileColumns: fileGrid.columns,
          fileRows: fileGrid.rows,
          folderColumns: folderGrid.columns,
          folderRows: folderGrid.rows,
          score,
          totalRows,
        };
      }
    }
  }

  return bestGrid;
}

function getGridCandidates(count, kind, width, height) {
  if (!count) return [{ columns: 0, emptyCells: 0, rows: 0 }];

  const baseColumns = kind === "folder" ? 4 : 5;
  const maximumColumns = Math.max(
    baseColumns,
    Math.ceil(Math.sqrt(count * (width / height))),
  );
  const minimumRows = Math.ceil(count / maximumColumns);
  const maximumRows = Math.min(count, Math.ceil(Math.sqrt(count) * 2.4) + 2);
  const candidates = [];

  for (let rows = minimumRows; rows <= maximumRows; rows += 1) {
    const columns = Math.ceil(count / rows);
    candidates.push({
      columns,
      emptyCells: rows * columns - count,
      rows,
    });
  }

  return candidates;
}

function layoutBand(nodes, options) {
  if (!nodes.length) return [];

  const { columns, depthOffset, kind, rowHeight, top, width } = options;
  const cellWidth = width / columns;
  const maxVisualSize = getCellSize(width, columns, rowHeight, kind);

  return nodes.map((node, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    const itemsInRow = Math.min(columns, nodes.length - row * columns);
    const labelMode =
      cellWidth >= getEstimatedLabelWidth(node.name) &&
      rowHeight >= (kind === "folder" ? 1.32 : 1.02)
        ? "always"
        : "hover";

    return {
      labelMode,
      labelOffset: [
        ((column + row) % 3 - 1) * 0.08,
        (column % 2) * -0.04,
        0,
      ],
      maxVisualSize,
      node,
      position: [
        (column - (itemsInRow - 1) / 2) * cellWidth,
        top - (row + 0.5) * rowHeight,
        (((column + row) % 3) - 1) * depthOffset,
      ],
    };
  });
}

function getCellSize(width, columns, rowHeight, kind) {
  if (!columns) return Infinity;
  const maximum = kind === "folder" ? FOLDER_MAX_SIZE : FILE_MAX_SIZE;
  return Math.min(maximum, (width / columns) * 0.72, rowHeight * 0.68);
}

function getEstimatedLabelWidth(name) {
  return Math.min(3.4, Math.max(1.1, 0.62 + name.length * 0.075));
}

function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum);
}

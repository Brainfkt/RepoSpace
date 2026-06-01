import { describe, expect, it } from "vitest";
import { repos } from "../data/repos";
import {
  clampFileSize,
  clampFolderSize,
  findNodeByPath,
  formatBytes,
  getBreadcrumbItems,
  getDescendantFiles,
  getDescendantSize,
  getRenderedFilesForView,
  getVisibleChildren,
  getVisibleFileTypes,
  layoutBlocks,
  layoutPreviewFiles,
  REPOSITORY_INTERIOR,
} from "./repoTree";

const atlasRepo = repos[0];

describe("repoTree", () => {
  it("finds nested nodes and visible children by path", () => {
    const components = findNodeByPath(atlasRepo, "atlas-dashboard/src/components");

    expect(components.name).toBe("components");
    expect(getVisibleChildren(atlasRepo, components.path).map((node) => node.name)).toEqual([
      "Scene.jsx",
      "MetricsGrid.tsx",
      "CommandBar.tsx",
      "ChartCanvas.tsx",
      "FilterDock.tsx",
      "WorkspaceHeader.tsx",
      "EmptyState.tsx",
      "PanelFrame.tsx",
      "StatusRail.tsx",
    ]);
  });

  it("sums all descendant bytes", () => {
    const src = findNodeByPath(atlasRepo, "atlas-dashboard/src");
    const manualTotal = src.children
      .flatMap((folder) => folder.children)
      .reduce((total, node) => total + node.size, 0);

    expect(getDescendantSize(src)).toBe(manualTotal);
  });

  it("returns each real descendant file exactly once", () => {
    const files = getDescendantFiles(atlasRepo);
    const paths = files.map((file) => file.path);

    expect(files).toHaveLength(17);
    expect(new Set(paths).size).toBe(files.length);
    expect(files.every((file) => file.type === "file")).toBe(true);
  });

  it("lays out recursive folder previews without filler or truncation", () => {
    const src = findNodeByPath(atlasRepo, "atlas-dashboard/src");
    const files = getDescendantFiles(src);
    const previews = layoutPreviewFiles(files, 2.4);

    expect(files).toHaveLength(13);
    expect(previews).toHaveLength(files.length);
    expect(previews.map(({ file }) => file.path)).toEqual(files.map((file) => file.path));
    expect(previews.every(({ file }) => file.type === "file")).toBe(true);
  });

  it("keeps preview layouts deterministic and empty shells empty", () => {
    const files = getDescendantFiles(atlasRepo);

    expect(layoutPreviewFiles(files, 4)).toEqual(layoutPreviewFiles(files, 4));
    expect(layoutPreviewFiles([], 4)).toEqual([]);
  });

  it("clamps rendered file sizes to a bounded visual range", () => {
    expect(clampFileSize(1)).toBeGreaterThanOrEqual(0.32);
    expect(clampFileSize(1024 * 1024 * 1024)).toBeLessThanOrEqual(1.12);
  });

  it("lets descendant count increase folder size before the grid cap is applied", () => {
    expect(clampFolderSize(1, 64)).toBeGreaterThan(clampFolderSize(1, 1));
    expect(clampFolderSize(1024 * 1024 * 1024, 64)).toBeLessThanOrEqual(2.45);
  });

  it("produces deterministic spatial positions", () => {
    const children = getVisibleChildren(atlasRepo);

    expect(layoutBlocks(children)).toEqual(layoutBlocks(children));
    expect(layoutBlocks(children)[0].position).toHaveLength(3);
  });

  it("keeps sibling nodes on a readable plane with separate folder and file bands", () => {
    const blocks = layoutBlocks(getVisibleChildren(atlasRepo));
    const depths = blocks.map(({ position }) => Math.abs(position[2]));
    const folderBlocks = blocks.filter(({ node }) => node.type === "folder");
    const fileBlocks = blocks.filter(({ node }) => node.type === "file");

    expect(Math.max(...depths)).toBeLessThanOrEqual(0.14);
    expect(Math.min(...folderBlocks.map(({ position }) => position[1]))).toBeGreaterThan(
      Math.max(...fileBlocks.map(({ position }) => position[1])),
    );
    expect(new Set(folderBlocks.map(({ position }) => position[0])).size).toBeGreaterThan(1);
  });

  it.each([1, 2, 16, 120])(
    "keeps every one of %i mixed sibling nodes inside the padded repository bounds",
    (count) => {
      const nodes = Array.from({ length: count }, (_, index) =>
        index % 3 === 0 ? createFolder(index) : createFile(index),
      );
      const blocks = layoutBlocks(nodes);
      const halfWidth = REPOSITORY_INTERIOR.width / 2;
      const halfHeight = REPOSITORY_INTERIOR.height / 2;
      const minimumY = REPOSITORY_INTERIOR.yCenter - halfHeight;
      const maximumY = REPOSITORY_INTERIOR.yCenter + halfHeight;

      expect(blocks).toHaveLength(nodes.length);
      expect(new Set(blocks.map(({ node }) => node.path)).size).toBe(nodes.length);
      expect(
        blocks.every(
          ({ maxVisualSize, position }) =>
            Math.abs(position[0]) + maxVisualSize / 2 <= halfWidth &&
            position[1] - maxVisualSize / 2 >= minimumY &&
            position[1] + maxVisualSize / 2 <= maximumY,
        ),
      ).toBe(true);
    },
  );

  it("keeps all dense blocks while switching crowded labels to hover mode", () => {
    const nodes = Array.from({ length: 120 }, (_, index) => createFile(index));
    const blocks = layoutBlocks(nodes);

    expect(blocks).toHaveLength(nodes.length);
    expect(blocks.every(({ labelMode }) => labelMode === "hover")).toBe(true);
  });

  it("derives visible file types from direct blocks and rendered folder previews", () => {
    const renderedFiles = getRenderedFilesForView([atlasRepo], atlasRepo.id);

    expect(renderedFiles.map((file) => file.path)).toContain(
      "atlas-dashboard/src/components/Scene.jsx",
    );
    expect(renderedFiles.map((file) => file.path)).toContain("atlas-dashboard/README.md");
    expect(getVisibleFileTypes(renderedFiles)).toEqual([
      "CSS",
      "JavaScript",
      "JSON",
      "Markdown",
      "TypeScript",
    ]);
  });

  it("builds breadcrumb items and formats byte values", () => {
    expect(getBreadcrumbItems(atlasRepo, "atlas-dashboard/src/components")).toEqual([
      { label: "All repos", path: null },
      { label: "atlas-dashboard", path: "" },
      { label: "src", path: "atlas-dashboard/src" },
      { label: "components", path: "atlas-dashboard/src/components" },
    ]);
    expect(formatBytes(12698)).toBe("12.4 KB");
  });
});

function createFile(index) {
  return {
    language: "Text",
    name: `file-${index}.txt`,
    path: `repo/file-${index}.txt`,
    size: 1024,
    type: "file",
  };
}

function createFolder(index) {
  return {
    children: [createFile(index)],
    name: `folder-${index}`,
    path: `repo/folder-${index}`,
    type: "folder",
  };
}

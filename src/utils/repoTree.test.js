import { describe, expect, it } from "vitest";
import { repos } from "../data/repos";
import {
  clampFileSize,
  findNodeByPath,
  formatBytes,
  getBreadcrumbItems,
  getDescendantFiles,
  getDescendantSize,
  getVisibleChildren,
  layoutBlocks,
  layoutPreviewFiles,
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

  it("produces deterministic spatial positions", () => {
    const children = getVisibleChildren(atlasRepo);

    expect(layoutBlocks(children)).toEqual(layoutBlocks(children));
    expect(layoutBlocks(children)[0].position).toHaveLength(3);
  });

  it("keeps sibling nodes on a readable plane with label row clearance", () => {
    const blocks = layoutBlocks(getVisibleChildren(atlasRepo), {
      columns: 3,
      spacing: 3.15,
      rowSpacing: 3.72,
      depthOffset: 0.14,
    });
    const depths = blocks.map(({ position }) => Math.abs(position[2]));

    expect(Math.max(...depths)).toBeLessThanOrEqual(0.14);
    expect(blocks[0].position[1] - blocks[3].position[1]).toBe(3.72);
    expect(new Set(blocks.slice(0, 3).map(({ position }) => position[0])).size).toBe(3);
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

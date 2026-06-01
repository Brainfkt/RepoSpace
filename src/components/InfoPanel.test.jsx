import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { repos } from "../data/repos";
import { useNavigationStore } from "../store/useNavigationStore";
import { findNodeByPath } from "../utils/repoTree";
import InfoPanel from "./InfoPanel";

const file = findNodeByPath(repos[0], "atlas-dashboard/src/components/Scene.jsx");

describe("InfoPanel", () => {
  beforeEach(() => {
    useNavigationStore.getState().resetNavigation();
  });

  it("renders selected-file metadata and a safe GitHub link", () => {
    render(<InfoPanel file={file} />);

    expect(screen.getByRole("heading", { name: "Scene.jsx" })).toBeInTheDocument();
    expect(screen.getByText("atlas-dashboard/src/components/Scene.jsx")).toBeInTheDocument();
    expect(screen.getByText("12.4 KB")).toBeInTheDocument();
    expect(screen.getByText("Main 3D scene composition and camera rig.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View on GitHub" })).toHaveAttribute(
      "href",
      "https://github.com/example/atlas-dashboard/blob/main/src/components/Scene.jsx",
    );
  });
});

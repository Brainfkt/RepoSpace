import { act, cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { getLanguageColor } from "../constants/languages";
import { repos } from "../data/repos";
import { useNavigationStore } from "../store/useNavigationStore";
import { useRepositoryStore } from "../store/useRepositoryStore";
import LanguageLegend from "./LanguageLegend";

const repository = {
  children: [
    folder("src", "truth/src", [
      file("App.tsx", "truth/src/App.tsx", "TypeScript"),
      file("records.csv", "truth/src/records.csv", "CSV"),
    ]),
    folder("docs", "truth/docs", [file("README.md", "truth/docs/README.md", "Markdown")]),
    folder("empty", "truth/empty", []),
    file("config.json", "truth/config.json", "JSON"),
  ],
  id: "truth",
  name: "truth",
};

afterEach(() => {
  cleanup();
  useNavigationStore.getState().resetNavigation();
  useRepositoryStore.setState({ repositories: repos });
});

describe("LanguageLegend", () => {
  it("lists only types rendered by direct blocks and folder previews with matching flat colors", () => {
    useRepositoryStore.setState({ repositories: [repository] });
    useNavigationStore.setState({ activeRepoId: repository.id, currentFolderPath: "" });

    render(<LanguageLegend />);

    expect(getLegendLabels()).toEqual(["CSV", "JSON", "Markdown", "TypeScript"]);
    expect(screen.queryByText("Python")).not.toBeInTheDocument();

    const csvSwatch = within(screen.getByText("CSV").closest("li")).getByRole("generic");
    expect(csvSwatch).toHaveStyle({ backgroundColor: getLanguageColor("CSV") });
    expect(csvSwatch.style.boxShadow).toBe("");
    expect(csvSwatch.style.filter).toBe("");
  });

  it("updates for the current folder and disappears for an empty view", () => {
    useRepositoryStore.setState({ repositories: [repository] });
    useNavigationStore.setState({
      activeRepoId: repository.id,
      currentFolderPath: "truth/docs",
    });

    const { rerender } = render(<LanguageLegend />);

    expect(getLegendLabels()).toEqual(["Markdown"]);
    expect(screen.queryByText("TypeScript")).not.toBeInTheDocument();

    act(() => {
      useNavigationStore.setState({ currentFolderPath: "truth/empty" });
    });
    rerender(<LanguageLegend />);

    expect(screen.queryByLabelText("Language colors")).not.toBeInTheDocument();
  });
});

function getLegendLabels() {
  return within(screen.getByLabelText("Language colors"))
    .getAllByRole("listitem")
    .map((item) => item.textContent);
}

function file(name, path, language) {
  return { language, name, path, size: 1024, type: "file" };
}

function folder(name, path, children) {
  return { children, name, path, type: "folder" };
}

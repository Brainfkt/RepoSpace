import { beforeEach, describe, expect, it } from "vitest";
import { repos } from "../data/repos";
import { findNodeByPath } from "../utils/repoTree";
import { useNavigationStore } from "./useNavigationStore";

const atlasRepo = repos[0];
const componentsFolder = findNodeByPath(atlasRepo, "atlas-dashboard/src/components");
const sceneFile = findNodeByPath(atlasRepo, "atlas-dashboard/src/components/Scene.jsx");

describe("useNavigationStore", () => {
  beforeEach(() => {
    useNavigationStore.getState().resetNavigation();
  });

  it("opens repos and drills into folders", () => {
    useNavigationStore.getState().openRepo(atlasRepo.id);
    useNavigationStore.getState().openFolder(componentsFolder);

    expect(useNavigationStore.getState()).toMatchObject({
      activeRepoId: "atlas-dashboard",
      currentFolderPath: "atlas-dashboard/src/components",
      selectedFile: null,
    });
  });

  it("backs out through file, folder, repo, and overview states", () => {
    const store = useNavigationStore.getState();
    store.openRepo(atlasRepo.id);
    store.openFolder(componentsFolder);
    store.selectFile(sceneFile);

    expect(useNavigationStore.getState().goBack()).toBe("file");
    expect(useNavigationStore.getState().selectedFile).toBeNull();
    expect(useNavigationStore.getState().goBack()).toBe("folder");
    expect(useNavigationStore.getState().currentFolderPath).toBe("atlas-dashboard/src");
    expect(useNavigationStore.getState().goBack()).toBe("folder");
    expect(useNavigationStore.getState().currentFolderPath).toBe("");
    expect(useNavigationStore.getState().goBack()).toBe("repo");
    expect(useNavigationStore.getState().activeRepoId).toBeNull();
    expect(useNavigationStore.getState().goBack()).toBe("overview");
  });
});

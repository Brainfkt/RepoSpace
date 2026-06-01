import { create } from "zustand";
import { getRuntimeRepoById } from "./useRepositoryStore";
import { findNodeByPath } from "../utils/repoTree";

const initialState = {
  activeRepoId: null,
  currentFolderPath: "",
  selectedFile: null,
};

export const useNavigationStore = create((set, get) => ({
  ...initialState,
  openRepo: (repoId) =>
    set({
      activeRepoId: repoId,
      currentFolderPath: "",
      selectedFile: null,
    }),
  openFolder: (folderNode) =>
    set({
      currentFolderPath: folderNode.path,
      selectedFile: null,
    }),
  navigateToPath: (path) =>
    set({
      currentFolderPath: path ?? "",
      selectedFile: null,
    }),
  selectFile: (fileNode) => set({ selectedFile: fileNode }),
  clearSelection: () => set({ selectedFile: null }),
  resetNavigation: () => set(initialState),
  goBack: () => {
    const { activeRepoId, currentFolderPath, selectedFile } = get();

    if (selectedFile) {
      set({ selectedFile: null });
      return "file";
    }

    if (!activeRepoId) return "overview";

    if (!currentFolderPath) {
      set(initialState);
      return "repo";
    }

    const repo = getRuntimeRepoById(activeRepoId);
    const currentNode = findNodeByPath(repo, currentFolderPath);
    const parentPath = currentNode?.path.split("/").slice(0, -1).join("/") ?? "";

    set({
      currentFolderPath: parentPath === activeRepoId ? "" : parentPath,
      selectedFile: null,
    });
    return "folder";
  },
}));

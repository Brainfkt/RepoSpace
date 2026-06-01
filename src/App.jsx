import { lazy, Suspense, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Breadcrumbs from "./components/Breadcrumbs";
import InfoPanel from "./components/InfoPanel";
import LanguageLegend from "./components/LanguageLegend";
import { useNavigationStore } from "./store/useNavigationStore";
import { useRepositoryStore } from "./store/useRepositoryStore";

const Scene = lazy(() => import("./components/Scene"));

function BrandMark() {
  return (
    <div className="brand" aria-label="RepoSpace">
      <svg aria-hidden="true" viewBox="0 0 32 32">
        <path d="M16 2.8 27 9.1v13L16 28.4 5 22.1v-13L16 2.8Z" />
        <path d="m5.5 9.4 10.5 6.1 10.5-6.1M16 15.5v12.1" />
      </svg>
      <span>RepoSpace</span>
    </div>
  );
}

function DesktopApp() {
  const activeRepoId = useNavigationStore((state) => state.activeRepoId);
  const resetNavigation = useNavigationStore((state) => state.resetNavigation);
  const selectedFile = useNavigationStore((state) => state.selectedFile);
  const goBack = useNavigationStore((state) => state.goBack);
  const repositories = useRepositoryStore((state) => state.repositories);
  const loadRepositories = useRepositoryStore((state) => state.loadRepositories);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") goBack();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goBack]);

  useEffect(() => {
    void loadRepositories();
  }, [loadRepositories]);

  useEffect(() => {
    if (
      activeRepoId &&
      !repositories.some((repository) => repository.id === activeRepoId)
    ) {
      resetNavigation();
    }
  }, [activeRepoId, repositories, resetNavigation]);

  return (
    <main className="desktop-app">
      <Suspense fallback={<div className="scene-loading">Mapping repositories...</div>}>
        <Scene />
      </Suspense>
      <div className="hud-layer" aria-label="Repository navigation">
        <Breadcrumbs />
        <BrandMark />
        <RepositoryStatus />
        <LanguageLegend />
        <AnimatePresence>
          {!activeRepoId ? (
            <motion.p
              animate={{ opacity: 1, y: 0 }}
              className="explore-hint"
              exit={{ opacity: 0, y: 8 }}
              initial={{ opacity: 0, y: 8 }}
              key="overview-hint"
              transition={{ duration: 0.35 }}
            >
              <span aria-hidden="true">&gt;</span>
              Select a repository to explore
            </motion.p>
          ) : null}
        </AnimatePresence>
        <AnimatePresence>
          {selectedFile ? <InfoPanel file={selectedFile} key={selectedFile.path} /> : null}
        </AnimatePresence>
      </div>
    </main>
  );
}

function RepositoryStatus() {
  const error = useRepositoryStore((state) => state.error);
  const loadRepositories = useRepositoryStore((state) => state.loadRepositories);
  const status = useRepositoryStore((state) => state.status);
  const username = useRepositoryStore((state) => state.username);

  if (status === "idle" || status === "ready") return null;

  return (
    <motion.aside
      animate={{ opacity: 1, y: 0 }}
      className={`repository-status repository-status--${status}`}
      initial={{ opacity: 0, y: -8 }}
    >
      {status === "loading" ? <p>Syncing GitHub repositories...</p> : null}
      {status === "empty" ? <p>No public repositories found for {username}.</p> : null}
      {status === "fallback" ? (
        <>
          <p>{error}</p>
          <button onClick={() => void loadRepositories({ force: true })} type="button">
            Retry GitHub sync
          </button>
        </>
      ) : null}
    </motion.aside>
  );
}

function DesktopRequired() {
  return (
    <main className="desktop-required">
      <div className="desktop-required__mark">
        <BrandMark />
      </div>
      <div>
        <p className="desktop-required__eyebrow">Spatial repository map</p>
        <h1>RepoSpace needs a wider viewport.</h1>
        <p>
          This first release is designed for desktop exploration. Open it on a
          screen at least 900px wide.
        </p>
      </div>
    </main>
  );
}

export default function App() {
  return (
    <>
      <DesktopApp />
      <DesktopRequired />
    </>
  );
}

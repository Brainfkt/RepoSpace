import { motion } from "framer-motion";
import { useNavigationStore } from "../store/useNavigationStore";
import { getRuntimeRepoById } from "../store/useRepositoryStore";
import { getBreadcrumbItems } from "../utils/repoTree";

export default function Breadcrumbs() {
  const activeRepoId = useNavigationStore((state) => state.activeRepoId);
  const currentFolderPath = useNavigationStore((state) => state.currentFolderPath);
  const navigateToPath = useNavigationStore((state) => state.navigateToPath);
  const resetNavigation = useNavigationStore((state) => state.resetNavigation);
  const repo = getRuntimeRepoById(activeRepoId);
  const items = getBreadcrumbItems(repo, currentFolderPath);

  return (
    <motion.nav
      animate={{ opacity: 1, y: 0 }}
      aria-label="Breadcrumb"
      className="breadcrumbs"
      initial={{ opacity: 0, y: -8 }}
    >
      {items.map((item, index) => {
        const isCurrent = index === items.length - 1;

        return (
          <span className="breadcrumbs__item" key={`${item.label}-${item.path}`}>
            {index ? <span className="breadcrumbs__separator">&gt;</span> : null}
            <button
              aria-current={isCurrent ? "page" : undefined}
              className="breadcrumbs__button"
              disabled={isCurrent}
              onClick={() => (item.path === null ? resetNavigation() : navigateToPath(item.path))}
              type="button"
            >
              {item.label}
            </button>
          </span>
        );
      })}
    </motion.nav>
  );
}

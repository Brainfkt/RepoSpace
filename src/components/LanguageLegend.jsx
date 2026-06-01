import { useMemo } from "react";
import { motion } from "framer-motion";
import { getLanguageColor, getLanguageLabel } from "../constants/languages";
import { useNavigationStore } from "../store/useNavigationStore";
import { useRepositoryStore } from "../store/useRepositoryStore";
import { getRenderedFilesForView, getVisibleFileTypes } from "../utils/repoTree";

export default function LanguageLegend() {
  const activeRepoId = useNavigationStore((state) => state.activeRepoId);
  const currentFolderPath = useNavigationStore((state) => state.currentFolderPath);
  const repositories = useRepositoryStore((state) => state.repositories);
  const visibleTypes = useMemo(
    () =>
      getVisibleFileTypes(
        getRenderedFilesForView(repositories, activeRepoId, currentFolderPath),
      ),
    [activeRepoId, currentFolderPath, repositories],
  );

  if (!visibleTypes.length) return null;

  return (
    <motion.aside
      animate={{ opacity: 1, x: 0 }}
      aria-label="Language colors"
      className="language-legend"
      initial={{ opacity: 0, x: -10 }}
      transition={{ delay: 0.18, duration: 0.35 }}
    >
      <p>Languages / types</p>
      <ul>
        {visibleTypes.map((language) => (
          <li key={language}>
            <span style={{ backgroundColor: getLanguageColor(language) }} />
            {getLanguageLabel(language)}
          </li>
        ))}
      </ul>
    </motion.aside>
  );
}

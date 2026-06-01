import { motion } from "framer-motion";
import { getLanguageColor, getLanguageLabel } from "../constants/languages";
import { useNavigationStore } from "../store/useNavigationStore";
import { formatBytes } from "../utils/repoTree";

function getLanguageInitials(language) {
  const label = getLanguageLabel(language);

  return language === "TypeScript"
    ? "TS"
    : language === "JavaScript"
      ? "JS"
      : label.slice(0, 2).toUpperCase();
}

export default function InfoPanel({ file }) {
  const clearSelection = useNavigationStore((state) => state.clearSelection);
  const color = getLanguageColor(file.language);

  return (
    <motion.aside
      animate={{ opacity: 1, x: 0 }}
      aria-label="File details"
      className="info-panel"
      exit={{ opacity: 0, x: 24 }}
      initial={{ opacity: 0, x: 40 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      <button
        aria-label="Close file details"
        className="info-panel__close"
        onClick={clearSelection}
        type="button"
      >
        <span />
        <span />
      </button>
      <div className="info-panel__content">
        <div className="info-panel__heading">
          <span className="file-monogram" style={{ "--file-color": color }}>
            {getLanguageInitials(file.language)}
          </span>
          <h2>{file.name}</h2>
        </div>
        <p className="info-panel__path">{file.path}</p>
        <dl className="info-panel__metadata">
          <div>
            <dt>Language</dt>
            <dd style={{ color }}>{getLanguageLabel(file.language)}</dd>
          </div>
          <div>
            <dt>Size</dt>
            <dd>{formatBytes(file.size)}</dd>
          </div>
        </dl>
        <p className="info-panel__description">{file.description}</p>
        <a
          className="info-panel__link"
          href={file.githubUrl}
          rel="noreferrer"
          target="_blank"
        >
          <span aria-hidden="true">↗</span>
          View on GitHub
        </a>
      </div>
    </motion.aside>
  );
}

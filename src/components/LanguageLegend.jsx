import { motion } from "framer-motion";
import { getLanguageColor, LEGEND_LANGUAGES } from "../constants/languages";

export default function LanguageLegend() {
  return (
    <motion.aside
      animate={{ opacity: 1, x: 0 }}
      aria-label="Language colors"
      className="language-legend"
      initial={{ opacity: 0, x: -10 }}
      transition={{ delay: 0.18, duration: 0.35 }}
    >
      <p>Languages</p>
      <ul>
        {LEGEND_LANGUAGES.map((language) => (
          <li key={language}>
            <span style={{ backgroundColor: getLanguageColor(language) }} />
            {language}
          </li>
        ))}
      </ul>
    </motion.aside>
  );
}

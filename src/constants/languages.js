export const LANGUAGE_COLORS = {
  JavaScript: "#f2af3a",
  TypeScript: "#3978ff",
  CSS: "#8f5ae8",
  Python: "#36b7b4",
  Markdown: "#8b96a5",
  JSON: "#d88b35",
  GLSL: "#d161d9",
  Default: "#647386",
};

export const LEGEND_LANGUAGES = [
  "JavaScript",
  "TypeScript",
  "CSS",
  "Python",
  "Markdown",
];

export function getLanguageColor(language) {
  return LANGUAGE_COLORS[language] ?? LANGUAGE_COLORS.Default;
}

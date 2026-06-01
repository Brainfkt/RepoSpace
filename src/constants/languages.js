export const LANGUAGE_COLORS = {
  C: "#6f84d8",
  "C#": "#8067d8",
  "C++": "#6574cf",
  CSS: "#8f5ae8",
  CSV: "#62ad72",
  Dockerfile: "#4799c1",
  GIF: "#7f93d1",
  JSON: "#d88b35",
  GLSL: "#d161d9",
  Go: "#45aeca",
  HTML: "#e47752",
  INI: "#a6a46b",
  JPEG: "#5d95ce",
  Java: "#bd7652",
  JavaScript: "#f2af3a",
  "Jupyter Notebook": "#dc9845",
  Kotlin: "#bb6bbf",
  Makefile: "#b69a65",
  Markdown: "#8b96a5",
  PDF: "#d46f6b",
  PHP: "#7779c6",
  PNG: "#55a9d8",
  Python: "#36b7b4",
  Ruby: "#ca6969",
  Rust: "#bd7d5e",
  Shell: "#7cb36f",
  SQL: "#ec718f",
  SVG: "#d46cbd",
  Swift: "#e8835c",
  TOML: "#9e9e70",
  Text: "#a5aeba",
  TypeScript: "#3978ff",
  Vue: "#54b58b",
  WebP: "#4d9eaa",
  XML: "#ae82d1",
  YAML: "#e08067",
  Default: "#647386",
};

export function getLanguageColor(language) {
  return LANGUAGE_COLORS[language] ?? LANGUAGE_COLORS.Default;
}

export function getLanguageLabel(language) {
  return language === "Default" ? "Other" : language;
}

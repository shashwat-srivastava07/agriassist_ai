export type Theme = "light" | "dark" | "system";

export const THEME_STORAGE_KEY = "agriassist-theme";

export function getStoredTheme(): Theme {
  if (typeof window === "undefined") {
    return "system";
  }

  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);

  if (
    savedTheme === "light" ||
    savedTheme === "dark" ||
    savedTheme === "system"
  ) {
    return savedTheme;
  }

  return "system";
}

export function resolveTheme(theme: Theme): "light" | "dark" {
  if (theme === "light") {
    return "light";
  }

  if (theme === "dark") {
    return "dark";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  const resolvedTheme = resolveTheme(theme);

  root.classList.toggle("dark", resolvedTheme === "dark");
  root.classList.toggle("light", resolvedTheme === "light");

  localStorage.setItem(THEME_STORAGE_KEY, theme);

  window.dispatchEvent(
    new CustomEvent("agriassist-theme-change", {
      detail: theme,
    }),
  );
}

export function getResolvedTheme(): "light" | "dark" {
  return resolveTheme(getStoredTheme());
}
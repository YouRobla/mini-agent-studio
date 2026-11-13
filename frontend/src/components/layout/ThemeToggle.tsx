import { useState } from "react";

export function ThemeToggle() {
  const [theme, setTheme] = useState(() =>
    document.documentElement.dataset.theme === "coffee" ? "dark" : "light",
  );

  function changeTheme(checked: boolean) {
    const next = checked ? "dark" : "light";
    setTheme(next);
    // CSS theme-controller applies the theme; data-theme also preserves the
    // unchecked theme and the initial paint before React mounts.
    document.documentElement.dataset.theme = next === "dark" ? "coffee" : "coffee-light";
    try {
      localStorage.setItem("studio-theme", next);
    } catch {
      // The control still works when storage is unavailable.
    }
  }
  const label = theme === "dark" ? "Activar tema claro" : "Activar tema oscuro";

  return (
    <label className="swap swap-rotate btn btn-ghost btn-square focus-within:outline-2 focus-within:outline-offset-2" title={label}>
      <input
        type="checkbox"
        className="theme-controller"
        value="coffee"
        checked={theme === "dark"}
        aria-label="Tema oscuro"
        onChange={(event) => changeTheme(event.target.checked)}
      />
      <svg
        className="swap-on size-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" />
      </svg>
      <svg
        className="swap-off size-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        aria-hidden="true"
      >
        <path d="M20.8 13.3A9 9 0 0 1 10.7 3.2 9 9 0 1 0 20.8 13.3Z" />
      </svg>
    </label>
  );
}

import { useState } from "react";

/** Conmutador de tema claro/oscuro (`swap` + `theme-controller` de daisyUI). */
export function ThemeToggle() {
  const [theme, setTheme] = useState(() =>
    document.documentElement.dataset.theme === "studio-dark" ? "dark" : "light",
  );

  function changeTheme(checked: boolean) {
    const next = checked ? "dark" : "light";
    setTheme(next);
    // El theme-controller de daisyUI aplica el tema por CSS; data-theme guarda
    // también el tema claro y el que pinta index.html antes de montar React.
    document.documentElement.dataset.theme =
      next === "dark" ? "studio-dark" : "studio-light";
    try {
      localStorage.setItem("studio-theme", next);
    } catch {
      // Si el navegador bloquea el almacenamiento, el conmutador sigue funcionando.
    }
  }
  const label = theme === "dark" ? "Activar tema claro" : "Activar tema oscuro";

  return (
    <label
      className="swap swap-rotate btn btn-ghost btn-square focus-within:outline-2 focus-within:outline-offset-2"
      title={label}
    >
      <input
        type="checkbox"
        className="theme-controller"
        value="studio-dark"
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

import { useState } from "react";
import { MoonIcon, SunIcon } from "../ui/icons.tsx";

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
      <SunIcon className="swap-on size-5" />
      <MoonIcon className="swap-off size-5" />
    </label>
  );
}

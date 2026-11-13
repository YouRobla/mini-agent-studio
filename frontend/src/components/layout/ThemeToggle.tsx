import { MoonIcon, SunIcon } from "../ui/icons.tsx";

/**
 * Conmutador de tema claro/oscuro con `theme-controller` y `swap` de daisyUI, sin
 * estado de React ni JavaScript de tema: al cargar manda el tema del sistema
 * (`prefersdark` en `index.css`) y, mientras la casilla está marcada, daisyUI
 * aplica el tema contrario. El icono muestra el tema al que se cambia.
 */
export function ThemeToggle() {
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const otherTheme = systemDark ? "studio-light" : "studio-dark";
  const [OffIcon, OnIcon] = systemDark
    ? [SunIcon, MoonIcon]
    : [MoonIcon, SunIcon];

  return (
    <label
      className="swap swap-rotate btn btn-ghost btn-square focus-within:outline-2 focus-within:outline-offset-2"
      title="Cambiar tema"
    >
      <input
        type="checkbox"
        className="theme-controller"
        value={otherTheme}
        aria-label={systemDark ? "Tema claro" : "Tema oscuro"}
      />
      <OnIcon className="swap-on size-5" />
      <OffIcon className="swap-off size-5" />
    </label>
  );
}

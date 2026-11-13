interface AppLogoProps {
  className?: string;
}

/** Logotipo de la aplicación: núcleo de IA rodeado por un nodo agente en órbita. */
export function AppLogo({ className }: AppLogoProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M20.89 9.62A9.2 9.2 0 1 1 14.38 3.11"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
      <circle cx="18.5" cy="5.5" r="2.1" fill="currentColor" />
      <path
        d="M12 6.2Q13.4 10.6 17.8 12Q13.4 13.4 12 17.8Q10.6 13.4 6.2 12Q10.6 10.6 12 6.2Z"
        fill="currentColor"
      />
    </svg>
  );
}

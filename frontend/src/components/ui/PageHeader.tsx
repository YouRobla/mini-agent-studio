interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
}

export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <header>
      <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-base-content/65">
        {eyebrow}
      </p>
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        {title}
      </h1>
      <p className="mt-1 max-w-2xl text-sm text-base-content/70">
        {description}
      </p>
    </header>
  );
}

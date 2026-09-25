interface LegalSection {
  id: string;
  title: string;
  body: string[];
}

interface LegalPageProps {
  eyebrow: string;
  title: string;
  updated: string;
  intro?: string;
  sections: LegalSection[];
}

/**
 * Shared chrome for the storefront's policy pages: consistent header
 * with the site's eyebrow treatment, a sticky table of contents, and
 * numbered sections with anchors.
 */
export function LegalPage({
  eyebrow,
  title,
  updated,
  intro,
  sections,
}: LegalPageProps) {
  return (
    <article className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
      <header className="border-b border-border/50 pb-7 pt-10">
        <p className="mb-2.5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-purple-accent">
          <span className="h-px w-6 bg-purple-accent/60" />
          {eyebrow}
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          {title}
        </h1>
        <p className="mt-2.5 text-[13px] text-gray-muted">{updated}</p>
      </header>

      <div className="grid gap-10 py-10 lg:grid-cols-[230px_minmax(0,1fr)]">
        {/* Table of contents */}
        <nav aria-label="محتويات الصفحة" className="hidden lg:block">
          <div className="sticky top-[100px] rounded-2xl border border-border bg-surface/60 p-4">
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-purple-accent">
              المحتويات
            </p>
            <ul className="space-y-1.5">
              {sections.map((section, i) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="flex items-start gap-2 text-[13px] leading-snug text-gray-text transition-colors hover:text-white"
                  >
                    <span className="mt-px w-4 shrink-0 text-[11px] font-bold text-gray-muted">
                      {i + 1}
                    </span>
                    {section.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Content */}
        <div className="min-w-0 space-y-9">
          {intro && (
            <p className="border-r-2 border-purple-accent/50 pr-4 text-[15px] leading-relaxed text-gray-text">
              {intro}
            </p>
          )}

          {sections.map((section, i) => (
            <section key={section.id} id={section.id} className="scroll-mt-28">
              <h2 className="flex items-center gap-3 text-xl font-bold tracking-tight text-white">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-purple-accent/10 text-[12px] font-bold text-purple-accent ring-1 ring-purple-accent/20">
                  {i + 1}
                </span>
                {section.title}
              </h2>
              <div className="mt-3.5 space-y-3 text-[14.5px] leading-[1.9] text-gray-text">
                {section.body.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}

          <div className="rounded-2xl border border-border bg-surface/60 p-5 text-[13.5px] leading-relaxed text-gray-text">
            لديك سؤال حول هذه الصفحة؟ فريقنا متاح على{" "}
            <a
              href="https://discord.gg/fluxstore"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-purple-accent underline-offset-4 transition-colors hover:text-violet hover:underline"
            >
              ديسكورد
            </a>{" "}
            للإجابة على أي استفسار.
          </div>
        </div>
      </div>
    </article>
  );
}

import Link from "next/link";

const pipeline = [
  {
    stage: "Interpret",
    detail:
      "Your prompt becomes a validated spec: pages, data, roles, integrations, assumptions made explicit.",
  },
  {
    stage: "Plan",
    detail:
      "Routes, schema, components, and a full file manifest — before a single file is written.",
  },
  {
    stage: "Generate",
    detail:
      "Files are written against the plan, in dependency order, inside an isolated workspace.",
  },
  {
    stage: "Validate",
    detail: "Typecheck, lint, and a real build run. Failures are shown, never hidden.",
  },
  {
    stage: "Repair",
    detail:
      "Only runs when Validate fails — a targeted patch, then a re-run, up to a limit you set.",
    attention: true,
  },
  {
    stage: "Ship",
    detail: "Push to GitHub, deploy to Vercel, get back a real URL.",
  },
];

const ownership = [
  {
    title: "Local or your own keys",
    body: "Point it at Ollama or any OpenAI-compatible endpoint for unlimited local inference, or connect your own Anthropic, OpenAI, Gemini, or OpenRouter key. Nothing routes through a metered middleman.",
  },
  {
    title: "No credits, ever",
    body: "No build allowances, no locked project counts, no upgrade wall between you and a working app. You pay for your own model usage and hosting — nothing else.",
  },
  {
    title: "Yours the moment it exists",
    body: "Every project is a real repository from the first file. Export it, push it, run it without this platform. Nothing generated here is licensed back to you.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <span className="font-mono text-sm font-medium tracking-tight text-graphite-900">
          DON&rsquo;T PUCK APP
        </span>
        <nav className="flex items-center gap-6 text-sm text-graphite-600">
          <Link href="/login" className="hover:text-graphite-900">
            Sign in
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-ledger-500 px-4 py-2 font-medium text-white shadow-panel transition hover:bg-ledger-600"
          >
            Get building
          </Link>
        </nav>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-6 pt-16 pb-24">
          <div className="max-w-2xl">
            <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-ledger-600">
              AI application builder
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-balance text-graphite-900 sm:text-5xl">
              Say what you want built. Get a real repository back.
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-graphite-600">
              Describe it. Build it. Own it. Deploy it. Don&rsquo;t Puck App turns a plain-English
              request into working, typed, tested code — then pushes it to GitHub and deploys it
              to Vercel.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-6">
              <Link
                href="/register"
                className="rounded-full bg-ledger-500 px-6 py-3 text-sm font-medium text-white shadow-panel-lg transition hover:bg-ledger-600"
              >
                Start a build
              </Link>
              <Link
                href="#pipeline"
                className="text-sm font-medium text-graphite-700 hover:text-graphite-900"
              >
                See how it builds &rarr;
              </Link>
            </div>
          </div>

          <div id="pipeline" className="mt-20 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {pipeline.map((step, i) => (
              <div key={step.stage} className="glass-panel rounded-2xl p-4">
                <span className="font-mono text-xs text-graphite-600">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-graphite-900">
                  {step.attention && (
                    <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-signal-600" />
                  )}
                  {step.stage}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-graphite-200 bg-white/70">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <h2 className="text-2xl font-semibold tracking-tight text-graphite-900">
              No credits. No lock-in.
            </h2>
            <div className="mt-10 grid gap-10 sm:grid-cols-3">
              {ownership.map((item) => (
                <div key={item.title}>
                  <h3 className="text-sm font-semibold text-ledger-600">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-graphite-600">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-2xl font-semibold tracking-tight text-graphite-900">
            Six stages, not one guess
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-graphite-600">
            Nothing gets generated in one uncontrolled pass. Every build moves through the same
            pipeline, in order, and you can see exactly where it is.
          </p>
          <ol className="mt-10 space-y-4">
            {pipeline.map((step, i) => (
              <li key={step.stage} className="glass-panel flex items-start gap-4 rounded-2xl p-5">
                <span className="font-mono text-sm text-ledger-500">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-graphite-900">
                    {step.attention && (
                      <span
                        aria-hidden="true"
                        className="h-1.5 w-1.5 rounded-full bg-signal-600"
                      />
                    )}
                    {step.stage}
                  </p>
                  <p className="mt-1 text-sm text-graphite-600">{step.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="border-t border-graphite-200 bg-graphite-900">
          <div className="mx-auto max-w-6xl px-6 py-20 text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-white">
              Ships where you already ship
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-graphite-300">
              Real GitHub repositories, real Vercel deployments. Connect both from your dashboard
              and every build lands where your other projects already live.
            </p>
          </div>
        </section>
      </main>

      <footer className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-10 text-xs text-graphite-600 sm:flex-row sm:items-center sm:justify-between">
        <span>&copy; {new Date().getFullYear()} Don&rsquo;t Puck App.</span>
        <span className="font-mono">Built in the open. Owned by you.</span>
      </footer>
    </div>
  );
}

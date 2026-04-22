import Link from "next/link";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center px-4 pt-40 pb-20 text-[var(--color-beige)] sm:px-8">
      <section className="w-full max-w-3xl border border-white/15 bg-[#3f5666]/82 px-6 py-8 shadow-[0_18px_55px_rgba(0,0,0,0.35)] backdrop-blur-sm sm:ml-6 sm:px-10 sm:py-10">
        <div className="mb-8 flex items-center gap-4">
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-[var(--color-beige)]/25 bg-[var(--color-blue)]/35"
            aria-hidden="true"
          >
            <svg
              viewBox="0 0 48 48"
              className="h-9 w-9"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10 29C14.5 31.5 19 31.5 23.5 29C28 26.5 32.5 26.5 37 29"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M14 35C17.5 36.8 21 36.8 24.5 35C28 33.2 31.5 33.2 35 35"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                opacity="0.72"
              />
              <path
                d="M24 11L31 26H17L24 11Z"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              <path
                d="M24 11V26"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-[var(--color-beige)]/65">
              404
            </p>
            <h1 className="mt-1 text-3xl leading-tight tracking-wide text-[var(--color-beige)] sm:text-5xl">
              This route drifted away.
            </h1>
          </div>
        </div>

        <p className="max-w-xl text-base leading-7 text-[var(--color-beige)]/78 sm:text-lg">
          The page you were looking for is no longer moored here. Head back to
          the main deck, check availability, or contact us from the navigation.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-3 rounded-xl bg-[var(--color-beige)] px-5 py-3 text-sm font-medium tracking-wide text-[var(--color-blue)] transition hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-beige)]/70"
          >
            <span>Return home</span>
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              className="h-4 w-4"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 10H15"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M10 5L15 10L10 15"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
          <Link
            href="/account"
            className="inline-flex items-center justify-center rounded-xl border border-[var(--color-beige)]/45 px-5 py-3 text-sm font-medium tracking-wide text-[var(--color-beige)] transition hover:border-[var(--color-beige)] hover:bg-[var(--color-blue)]/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-beige)]/50"
          >
            View account
          </Link>
        </div>
      </section>
    </main>
  );
}

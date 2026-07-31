import Link from "next/link";

export default function Home() {
  return (
    <div className="py-12 text-center">
      <p className="text-xs uppercase tracking-[0.2em] text-gold">
        A commonplace book, built from your own notes
      </p>
      <h1 className="mt-3 font-display text-4xl text-ink sm:text-5xl">
        Turn what you upload into what you know.
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-ink-soft">
        Upload a PDF, slide deck, or homework set. Commonplace pulls out the concepts, writes
        quizzes from them, and answers questions grounded in your own material.
      </p>
      <div className="mt-8 flex justify-center gap-4">
        <Link
          href="/student"
          className="rounded-md bg-ink px-5 py-2.5 text-sm font-medium text-paper hover:opacity-90"
        >
          I&rsquo;m a student
        </Link>
        <Link
          href="/educator"
          className="rounded-md border border-ink px-5 py-2.5 text-sm font-medium text-ink transition hover:bg-ink hover:text-paper"
        >
          I&rsquo;m an educator
        </Link>
      </div>
    </div>
  );
}

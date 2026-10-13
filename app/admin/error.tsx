"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="cms-card">
      <h1>Unable to load administration</h1>
      <p>Check database availability and migrations, then try again.</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}

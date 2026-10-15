import Seo from "../components/ui/Seo";
import Button from "../components/ui/Button";
import { FiHome } from "react-icons/fi";

export default function NotFound() {
  return (
    <>
      <Seo
        title="404"
        description="The page you're looking for doesn't exist."
        path="/404"
        noindex
      />
      <section className="flex min-h-[70vh] items-center py-20">
        <div className="container-app text-center">
          <p className="eyebrow justify-center">// error</p>
          <pre className="mt-4 inline-block rounded-xl border border-ink-700 light:border-paper-300 bg-ink-800 light:bg-paper-100 p-6 text-left font-mono text-sm text-paper-200 light:text-ink-800">
{`Uncaught PageNotFoundError:`}{"\n"}
{`  route `}<span className="text-amber-400">"{window.location.pathname}"</span>{` was not found`}
          </pre>
          <h1 className="mt-6 font-display text-3xl font-semibold text-paper-100 light:text-ink-950">
            404 — Page not found
          </h1>
          <p className="mx-auto mt-2 max-w-md text-paper-300 light:text-ink-700">
            The page you're looking for may have been moved or never existed. Let's get you back on track.
          </p>
          <div className="mt-8 flex justify-center">
            <Button to="/" icon={FiHome}>Back to Home</Button>
          </div>
        </div>
      </section>
    </>
  );
}

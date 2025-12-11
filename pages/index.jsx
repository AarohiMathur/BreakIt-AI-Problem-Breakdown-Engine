import { useState } from "react";

export default function Home() {
  const [problem, setProblem] = useState("");
  const [frameworks, setFrameworks] = useState({
    mece: true,
    swot: true,
    fiveWhys: false,
    firstPrinciples: true,
    porter: false,
  });
  const [tone, setTone] = useState("practical");
  const [length, setLength] = useState("concise");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const toggle = (key) => setFrameworks((f) => ({ ...f, [key]: !f[key] }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!problem.trim()) {
      setError("Please enter a problem to break down.");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const payload = {
        problem: problem.trim(),
        frameworks: Object.keys(frameworks).filter((k) => frameworks[k]),
        tone,
        length,
      };
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Server error");
      }
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-6 md:p-12 font-sans">
      <div className="max-w-4xl mx-auto bg-white/80 backdrop-blur-md shadow-lg rounded-2xl p-8">
        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold">BreakIt</h1>
            <p className="text-gray-600 mt-1">
              Turn messy problems into clear, structured solutions — MECE, SWOT,
              5-Whys and more.
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Demo • Resume project</p>
            <p className="text-xs text-gray-400">Aarohi Mathur • Fast build</p>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Describe the problem
            </label>
            <textarea
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              rows={5}
              className="mt-2 w-full rounded-xl border-gray-200 shadow-sm p-4 resize-y focus:ring-2 focus:ring-indigo-200"
              placeholder='Example: "Our onboarding drop-off is high — users sign up but never finish their first task."'
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <fieldset className="col-span-2 rounded-xl border p-4">
              <legend className="text-sm font-semibold">Frameworks</legend>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => toggle("mece")}
                  className={`px-3 py-1 rounded-lg border ${
                    frameworks.mece ? "bg-indigo-600 text-white" : "bg-white"
                  }`}
                >
                  MECE
                </button>
                <button
                  type="button"
                  onClick={() => toggle("swot")}
                  className={`px-3 py-1 rounded-lg border ${
                    frameworks.swot ? "bg-indigo-600 text-white" : "bg-white"
                  }`}
                >
                  SWOT
                </button>
                <button
                  type="button"
                  onClick={() => toggle("fiveWhys")}
                  className={`px-3 py-1 rounded-lg border ${
                    frameworks.fiveWhys ? "bg-indigo-600 text-white" : "bg-white"
                  }`}
                >
                  5-Whys
                </button>
                <button
                  type="button"
                  onClick={() => toggle("firstPrinciples")}
                  className={`px-3 py-1 rounded-lg border ${
                    frameworks.firstPrinciples ? "bg-indigo-600 text-white" : "bg-white"
                  }`}
                >
                  First Principles
                </button>
                <button
                  type="button"
                  onClick={() => toggle("porter")}
                  className={`px-3 py-1 rounded-lg border ${
                    frameworks.porter ? "bg-indigo-600 text-white" : "bg-white"
                  }`}
                >
                  Porter's 5 Forces
                </button>
              </div>
            </fieldset>

            <div className="space-y-3 p-4 rounded-xl border">
              <div>
                <label className="text-sm font-medium">Tone</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="mt-2 w-full rounded-lg p-2 border"
                >
                  <option value="practical">Practical & actionable</option>
                  <option value="consulting">Consulting / Structured</option>
                  <option value="empathetic">Empathetic & coaching</option>
                  <option value="concise">Short bullet points</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Length</label>
                <select
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  className="mt-2 w-full rounded-lg p-2 border"
                >
                  <option value="concise">Concise</option>
                  <option value="detailed">Detailed</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl py-2 font-semibold shadow-md bg-indigo-600 text-white"
                >
                  {loading ? "Breaking down..." : "Break it down"}
                </button>
              </div>
            </div>
          </div>
        </form>

        {error && <div className="mt-4 text-red-600">{error}</div>}

        <section className="mt-6">
          {result ? (
            <div className="space-y-6">
              <h2 className="text-xl font-bold">Result</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.outputs.map((out, i) => (
                  <article key={i} className="rounded-xl border p-4 bg-white">
                    <h3 className="font-semibold mb-2">{out.title}</h3>
                    <div
                      className="prose max-w-none text-sm"
                      dangerouslySetInnerHTML={{ __html: out.html }}
                    />
                  </article>
                ))}
              </div>

              <div className="mt-4 text-sm text-gray-500">
                Tip: Share these breakdowns as a LinkedIn carousel!
              </div>
            </div>
          ) : (
            <div className="mt-8 text-gray-500">
              Enter a problem and choose frameworks to get a structured breakdown.
            </div>
          )}
        </section>

        <footer className="mt-8 text-xs text-gray-400">
          Built with ❤️ by Aarohi.
        </footer>
      </div>
    </div>
  );
}

import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") return res.status(405).send("Method not allowed");
    const { problem, frameworks, tone, length } = req.body || {};
    if (!problem) return res.status(400).send("Missing problem");

    const prompt = buildPrompt(problem, frameworks, tone, length);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
        max_tokens: 900,
      }),
    });

    if (!response.ok) {
      const txt = await response.text();
      return res.status(response.status).send(txt);
    }

    const json = await response.json();
    const text = json.choices?.[0]?.message?.content || "";

    const outputs = parseToSections(text);
    res.status(200).json({ outputs });
  } catch (err) {
    console.error(err);
    res.status(500).send(String(err));
  }
}

function buildPrompt(problem, frameworks, tone, length) {
  const fw =
    frameworks && frameworks.length
      ? frameworks.join(", ")
      : "MECE, SWOT, 5-Whys, First Principles";
  return `You are an expert consultant. Break down the following problem using the requested frameworks: ${fw}.\n\nProblem:\n\"\"\"${problem}\"\"\"\n\nFor each framework requested, provide:\n- A short explanation of the framework (1 line).\n- A structured breakdown with numbered lists / bullet points.\n- 3 practical next steps that the user can implement in the next 7 days.\n\nOutput in clear markdown. Tone: ${tone}. Length: ${length}. Keep sections labelled with the framework name.`;
}

function parseToSections(markdownText) {
  const sections = [];
  const secParts = markdownText.split(/\n##\s+/);
  if (secParts.length <= 1) {
    return [{ title: "Breakdown", html: markdownToHtml(markdownText) }];
  }
  secParts.forEach((p) => {
    const lines = p.split("\n");
    const title = lines[0].replace(/^#+/, "").trim().slice(0, 60) || "Section";
    sections.push({ title, html: markdownToHtml(p) });
  });
  return sections;
}

function markdownToHtml(md) {
  let html = md;
  html = html.replace(/^###\s*(.*)$/mg, "<h3>$1</h3>");
  html = html.replace(/^##\s*(.*)$/mg, "<h2>$1</h2>");
  html = html.replace(/^#\s*(.*)$/mg, "<h1>$1</h1>");
  html = html.replace(/^\-\s*(.*)$/mg, "<li>$1</li>");
  html = html.replace(/\n{2,}/g, "<br/>");
  html = html.replace(/(<li>.*?<\/li>)/gs, "<ul>$1</ul>");
  return html;
}

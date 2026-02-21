import type { Context } from "hono";

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>AST demo</title>
</head>
<body>
  <h1>AST demo</h1>
  <p>Fetches <code>GET /ast</code> and displays the result.</p>
  <div id="result">Loading…</div>
  <script>
    fetch("/ast")
      .then((r) => r.json())
      .then((data) => {
        document.getElementById("result").textContent =
          "variableDeclarations: " + data.variableDeclarations;
      })
      .catch((e) => {
        document.getElementById("result").textContent = "Error: " + e.message;
      });
  </script>
</body>
</html>
`;

// deno-lint-ignore function-length/function-length
export function getAstDemo(_c: Context) {
  return new Response(HTML, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

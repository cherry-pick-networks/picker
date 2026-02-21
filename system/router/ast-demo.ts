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

function htmlResponse(): Response {
  const headers = { "Content-Type": "text/html; charset=utf-8" };
  return new Response(HTML, { headers });
}

export const handler = {
  GET() {
    return htmlResponse();
  },
};

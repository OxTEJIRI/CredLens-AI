import "dotenv/config";
import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { runCredLensPipeline } from "./src/runCredLens.js";

const PORT = Number(process.env.PORT ?? 3001);

function sendJson(res: ServerResponse, statusCode: number, payload: unknown) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });

  res.end(JSON.stringify(payload, null, 2));
}

async function readJsonBody(req: IncomingMessage): Promise<any> {
  let raw = "";

  for await (const chunk of req) {
    raw += chunk;
  }

  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw);
  } catch {
    throw new Error("Request body must be valid JSON.");
  }
}

function isValidTxHash(value: unknown): value is string {
  return typeof value === "string" && /^0x[a-fA-F0-9]{64}$/.test(value.trim());
}

const server = createServer(async (req, res) => {
  if (!req.url || !req.method) {
    return sendJson(res, 400, { ok: false, error: "Invalid request." });
  }

  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host ?? "localhost"}`);

  if (req.method === "GET" && url.pathname === "/health") {
    return sendJson(res, 200, {
      ok: true,
      service: "CredLens AI API",
      status: "healthy",
    });
  }

  if (req.method === "POST" && url.pathname === "/score") {
    try {
      const body = await readJsonBody(req);
      const txHash = body?.txHash;

      if (!isValidTxHash(txHash)) {
        return sendJson(res, 400, {
          ok: false,
          error: "txHash is required and must be a valid 0x-prefixed transaction hash.",
        });
      }

      const result = await runCredLensPipeline(txHash.trim());

      return sendJson(res, 200, {
        ok: true,
        result,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown server error.";

      return sendJson(res, 500, {
        ok: false,
        error: message,
      });
    }
  }

  return sendJson(res, 404, {
    ok: false,
    error: "Route not found.",
  });
});

server.listen(PORT, () => {
  console.log(`CredLens AI API listening on http://localhost:${PORT}`);
  console.log(`Health check: GET http://localhost:${PORT}/health`);
  console.log(`Score endpoint: POST http://localhost:${PORT}/score`);
});

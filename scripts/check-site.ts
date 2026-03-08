const baseUrl = process.env.SITE_URL ?? "http://127.0.0.1:3000";

async function ensureTextStatus(url: string, expectedText: RegExp) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "urbanmetrics-uk-site-monitor/0.1",
    },
  });

  if (!response.ok) {
    throw new Error(`Expected 2xx from ${url}, received ${response.status}`);
  }

  const body = await response.text();
  if (!expectedText.test(body)) {
    throw new Error(`Expected response from ${url} to match ${expectedText}`);
  }
}

async function ensureHealthyApi(url: string) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "urbanmetrics-uk-site-monitor/0.1",
    },
  });

  if (!response.ok) {
    throw new Error(`Expected 2xx from ${url}, received ${response.status}`);
  }

  const payload = (await response.json()) as { status?: unknown; generatedAt?: unknown };
  if (payload.status !== "ok" && payload.status !== "warning") {
    throw new Error(`Expected site health to be ok or warning at ${url}, received ${String(payload.status)}`);
  }

  if (typeof payload.generatedAt !== "string" || payload.generatedAt.length === 0) {
    throw new Error(`Expected health payload from ${url} to include generatedAt.`);
  }
}

async function main() {
  await ensureTextStatus(baseUrl, /Urban Metrics UK/i);
  await ensureTextStatus(`${baseUrl}/status`, /Service status|Operational status/i);
  await ensureHealthyApi(`${baseUrl}/api/health`);
  console.log(`Smoke checks passed for ${baseUrl}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

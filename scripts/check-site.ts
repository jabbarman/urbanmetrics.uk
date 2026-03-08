const baseUrl = process.env.SITE_URL ?? "http://127.0.0.1:3000";

async function ensureStatus(url: string, expectedText?: RegExp) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "west-midland-signals-site-monitor/0.1",
    },
  });

  if (!response.ok) {
    throw new Error(`Expected 2xx from ${url}, received ${response.status}`);
  }

  if (expectedText) {
    const body = await response.text();
    if (!expectedText.test(body)) {
      throw new Error(`Expected response from ${url} to match ${expectedText}`);
    }
  }
}

async function main() {
  await ensureStatus(baseUrl, /West Midlands Signals/i);
  await ensureStatus(`${baseUrl}/status`, /Service status|Operational status/i);
  await ensureStatus(`${baseUrl}/api/health`, /ok|warning|degraded/i);
  console.log(`Smoke checks passed for ${baseUrl}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

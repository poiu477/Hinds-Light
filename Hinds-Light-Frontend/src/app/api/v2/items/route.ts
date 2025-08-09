import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const backendBaseUrl = process.env.API_URL ?? "http://localhost:4000";
  const url = new URL(req.url);
  const target = `${backendBaseUrl}/api/v1/items${url.search}`;

  try {
    const res = await fetch(target, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    const body = await res.text();
    const contentType = res.headers.get("content-type") ?? "application/json";

    return new Response(body, {
      status: res.status,
      headers: {
        "content-type": contentType,
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Proxy request failed", details: String(err) }),
      { status: 502, headers: { "content-type": "application/json" } }
    );
  }
}



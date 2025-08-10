// Use the standard Request type for route handlers; avoid framework-specific types

// Generic pass-through proxy: forwards /api/* to backend API_URL
// Note: define specific routes above this file to override behavior when needed

export async function GET(req: Request, context: { params: Promise<{ proxy: string[] }> }) {
  const params = await context.params;
  return handleProxy(req, { proxy: params.proxy });
}

export async function POST(req: Request, context: { params: Promise<{ proxy: string[] }> }) {
  const params = await context.params;
  return handleProxy(req, { proxy: params.proxy }, "POST");
}

export async function PUT(req: Request, context: { params: Promise<{ proxy: string[] }> }) {
  const params = await context.params;
  return handleProxy(req, { proxy: params.proxy }, "PUT");
}

export async function DELETE(req: Request, context: { params: Promise<{ proxy: string[] }> }) {
  const params = await context.params;
  return handleProxy(req, { proxy: params.proxy }, "DELETE");
}

async function handleProxy(req: Request, { proxy }: { proxy: string[] }, method?: string) {
  const backendBaseUrl = process.env.API_URL ?? "http://localhost:4000";
  const upstreamPath = proxy.join("/");
  const url = new URL(req.url);
  const target = `${backendBaseUrl}/api/${upstreamPath}${url.search}`;

  const backendStaticToken = process.env.API_TOKEN;
  const init: RequestInit = {
    method: method ?? "GET",
    headers: filterHeaders(req.headers, backendStaticToken),
    cache: "no-store",
  };

  if (method && method !== "GET" && method !== "HEAD") {
    init.body = await req.text();
  }

  try {
    const res = await fetch(target, init);
    const body = await res.arrayBuffer();
    const headers = new Headers();
    const contentType = res.headers.get("content-type");
    if (contentType) headers.set("content-type", contentType);
    return new Response(body, { status: res.status, headers });
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: `Proxy failed: ${String(err)}` }),
      { status: 502, headers: { "content-type": "application/json" } }
    );
  }
}



function filterHeaders(incoming: Headers, backendStaticToken?: string): HeadersInit {
  const headers: Record<string, string> = { Accept: "application/json" };
  const auth = incoming.get("authorization");
  if (auth) headers["authorization"] = auth;
  else if (backendStaticToken) headers["authorization"] = `Bearer ${backendStaticToken}`;
  return headers;
}



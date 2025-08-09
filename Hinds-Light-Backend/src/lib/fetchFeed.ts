import got, { OptionsOfTextResponseBody } from 'got';
import { CookieJar } from 'tough-cookie';
import { env } from '../config/env.js';

const defaultUserAgent =
  env.FEED_USER_AGENT ||
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:141.0) Gecko/20100101 Firefox/141.0';

const cookieJar = new CookieJar();

export type FetchOptions = {
  userAgent?: string;
  http2?: boolean;
  referer?: string;
};

function buildGotOptions(url: string, opts?: FetchOptions): OptionsOfTextResponseBody {
  return {
    http2: opts?.http2 ?? true,
    timeout: { request: 15000 },
    headers: {
      'User-Agent': opts?.userAgent || defaultUserAgent,
      Accept: 'application/rss+xml, application/xml;q=0.9, text/xml;q=0.8, */*;q=0.7',
      'Accept-Language': 'he-IL,he;q=0.9,en-US;q=0.8,en;q=0.7',
      Referer: opts?.referer || new URL(url).origin + '/',
      DNT: '1',
      'Cache-Control': 'no-cache',
      'Accept-Encoding': 'gzip, deflate, br'
    },
    cookieJar,
    followRedirect: true,
    maxRedirects: 5,
    decompress: true,
    retry: {
      limit: 2,
      methods: ['GET'],
      statusCodes: [408, 413, 429, 500, 502, 503, 504],
      errorCodes: ['ETIMEDOUT', 'ECONNRESET', 'EAI_AGAIN', 'ECONNREFUSED']
    }
  };
}

export async function warmUpOrigin(url: string): Promise<void> {
  try {
    const origin = new URL(url).origin + '/';
    await got(origin, buildGotOptions(origin));
  } catch {
    // ignore warm-up errors
  }
}

export async function fetchFeedXml(url: string, opts?: FetchOptions): Promise<string> {
  const res = await got(url, buildGotOptions(url, opts));
  return res.body as string;
}

export async function politeDelay(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export function sanitizeXml(xml: string): string {
  // Escape stray ampersands not starting an entity and strip null bytes
  return xml
    .replace(/&(?!amp;|lt;|gt;|quot;|apos;|#[0-9]+;|#x[0-9A-Fa-f]+;)/g, '&amp;')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
}



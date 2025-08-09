import 'dotenv/config';
import { prisma } from '../lib/prisma.js';
import { enqueueIngestSource } from '../queues/ingestQueue.js';

type RssSource = { name: string; displayName?: string; alignment?: string; url: string; language?: string };

const sources: RssSource[] = [
  // Working general feeds
  { name: 'סרוגים', displayName: 'Srugim', alignment: 'Religious Zionist', url: 'https://www.srugim.co.il/feed', language: 'he' },
  { name: 'ישראל היום', displayName: 'Israel Hayom', alignment: 'Right-wing populist, pro-Likud, nationalist', url: 'https://www.israelhayom.co.il/rss.xml', language: 'he' },
  { name: 'JDN', displayName: 'JDN News', alignment: 'Haredi', url: 'https://www.jdn.co.il/feed/', language: 'he' },

  // Working security/category-specific feeds
  { name: 'ערוץ 7 – ביטחון', displayName: 'Arutz Sheva – Security', alignment: 'Religious Zionist / Far-right', url: 'https://www.inn.co.il/Rss.aspx?i=2', language: 'he' },
  { name: 'מקור ראשון – ביטחון', displayName: 'Makor Rishon – Security', alignment: 'Religious Zionist / Right-wing', url: 'https://www.makorrishon.co.il/category/security/feed/', language: 'he' },
  { name: 'חדשות JDN – ביטחון', displayName: 'JDN News – Security', alignment: 'Haredi', url: 'https://archive.jdn.co.il/category/security/feed/', language: 'he' }
  
  // Removed (404/blocked/no RSS):
  // - ערוץ 14 – חדשות ביטחוניות (14news.co.il) – feed unreachable
  // - 0404 – no valid RSS endpoint
  // - חדשות כיכר השבת – no valid RSS endpoint
  // - הקול היהודי – feed endpoints return 404/500
  // - ערוץ 7 (general) and בשבע duplicated inn.co.il feed; keeping only security feed to avoid duplicates
];

async function main() {
  const createdOrFoundIds: string[] = [];
  for (const s of sources) {
    const existing = await prisma.source.findFirst({ where: { type: 'RSS', name: s.name } });
    if (existing) {
      createdOrFoundIds.push(existing.id);
      continue;
    }
    const created = await prisma.source.create({
      data: {
        type: 'RSS',
        name: s.name,
        url: s.url,
        displayName: s.displayName,
        alignment: s.alignment,
        language: s.language ?? 'he',
        active: true
      }
    });
    createdOrFoundIds.push(created.id);
  }

  // Kick off ingestion for all sources immediately
  for (const id of createdOrFoundIds) {
    await enqueueIngestSource(id);
  }

  console.log(`Seeded ${createdOrFoundIds.length} RSS sources and enqueued ingestion.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });



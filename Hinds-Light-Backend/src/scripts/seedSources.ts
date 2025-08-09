import 'dotenv/config';
import { prisma } from '../lib/prisma.js';
import { enqueueIngestSource } from '../queues/ingestQueue.js';

type RssSource = { name: string; displayName?: string; alignment?: string; url: string; language?: string };

const sources: RssSource[] = [
  { name: 'ערוץ 7', displayName: 'Arutz Sheva', alignment: 'Religious Zionist / Far-right', url: 'https://www.inn.co.il/Rss.aspx', language: 'he' },
  { name: 'מקור ראשון', displayName: 'Makor Rishon', alignment: 'Right-wing / Religious Zionist', url: 'https://www.makorrishon.co.il/feed/', language: 'he' },
  { name: 'בשבע', displayName: "B'Sheva", alignment: 'Religious Zionist', url: 'https://www.inn.co.il/Rss.aspx', language: 'he' },
  { name: 'סרוגים', displayName: 'Srugim', alignment: 'Religious Zionist', url: 'https://www.srugim.co.il/feed', language: 'he' },
  { name: 'הקול היהודי', displayName: 'HaKol HaYehudi', alignment: 'Far-right nationalist', url: 'https://www.hakolhayehudi.co.il/rss.xml', language: 'he' }
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



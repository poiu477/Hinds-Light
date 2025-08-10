import 'dotenv/config';
import { prisma } from '../lib/prisma.js';
import { enqueueIngestSource } from '../queues/ingestQueue.js';

async function main() {
  console.log('🔄 Starting reingestion of all RSS sources...');
  
  const sources = await prisma.source.findMany({
    where: { active: true, type: 'RSS', NOT: { url: null } }
  });
  
  console.log(`📡 Found ${sources.length} active RSS sources to reingest:`);
  
  let enqueuedCount = 0;
  for (const source of sources) {
    try {
      await enqueueIngestSource(source.id);
      console.log(`  ✅ Enqueued: ${source.name} (${source.displayName || 'no display name'})`);
      enqueuedCount++;
    } catch (error) {
      console.error(`  ❌ Failed to enqueue: ${source.name} - ${error}`);
    }
  }
  
  console.log(`\n🎉 Successfully enqueued ${enqueuedCount}/${sources.length} sources for reingestion.`);
  console.log('📊 The ingestion worker will now:');
  console.log('   1. Re-fetch RSS feeds');
  console.log('   2. Extract Hebrew categories from <category> tags');
  console.log('   3. Translate categories to English');
  console.log('   4. Update existing articles with translated categories');
  console.log('\n⏳ This process may take several minutes depending on the number of articles...');
}

main()
  .catch((e) => {
    console.error('💥 Error during reingestion:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

# Hinds Light Backend

A robust Node.js backend service that powers the Hinds Light news translation platform. Built with Fastify, it handles content ingestion, translation processing, and API services for the frontend application.

## 🏗️ Tech Stack

### Core Framework
- **Fastify**: High-performance web framework for Node.js
- **TypeScript**: Full type safety and modern JavaScript features
- **Node.js**: 18+ runtime environment

### Database & ORM
- **PostgreSQL**: Primary database for content storage
- **Prisma**: Type-safe database ORM with migrations
- **Redis**: Cache and job queue storage

### Queue System
- **BullMQ**: Robust job queue for background processing
- **IORedis**: Redis client for queue management

### Translation Services
- **Google Translate API**: Production translation service
- **Dummy Provider**: Development/testing translation mock

### Content Processing
- **RSS Parser**: Feed parsing and content extraction
- **Got**: HTTP client for reliable feed fetching
- **Tough Cookie**: Cookie management for scraping

### Validation & Security
- **Zod**: Runtime type validation for API inputs
- **Rate Limiter Flexible**: Request rate limiting
- **CORS**: Cross-origin resource sharing configuration

## 📁 Project Structure

```
src/
├── app.ts                  # Fastify application setup
├── index.ts               # Application entry point
├── config/
│   └── env.ts             # Environment variable validation
├── lib/
│   ├── prisma.ts          # Database client configuration
│   ├── redis.ts           # Redis client setup
│   └── fetchFeed.ts       # Advanced feed fetching utilities
├── plugins/
│   └── rateLimiter.ts     # API rate limiting configuration
├── routes/
│   ├── health.ts          # Health check endpoints
│   ├── items.ts           # Content items API
│   ├── sources.ts         # Content sources management
│   ├── posts.ts           # Posts API (future social media)
│   └── translate.ts       # Translation API
├── queues/
│   ├── ingestQueue.ts     # Content ingestion job queue
│   └── translationQueue.ts # Translation job queue
├── workers/
│   ├── ingestWorker.ts    # Background content ingestion
│   └── translationWorker.ts # Background translation processing
├── services/
│   └── translation/
│       ├── TranslationProvider.ts # Translation service interface
│       └── providers/
│           ├── dummy.ts    # Mock translation provider
│           └── google.ts   # Google Translate integration
├── scripts/
│   └── seedSources.ts     # Database seeding scripts
└── utils/
    └── apiResponse.ts     # Standardized API response utilities
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Yarn 4.x (via Corepack)
- PostgreSQL 16+
- Redis 7+

### Local Development

1. **Environment Setup**
   
   Create `.env` file:
   ```env
   PORT=4000
   NODE_ENV=development
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/hinds_light?schema=public
   REDIS_URL=redis://localhost:6379
   TRANSLATION_PROVIDER=dummy
   FEED_USER_AGENT="Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:141.0) Gecko/20100101 Firefox/141.0"
   
   # Optional: Google Translate (Production)
   GOOGLE_TRANSLATE_API_KEY=your_api_key_here
   GOOGLE_PROJECT_ID=your_project_id
   ```

2. **Install Dependencies**
   ```bash
   yarn install
   yarn prisma generate
   ```

3. **Start Databases**
   ```bash
   # PostgreSQL
   docker run -d --name hl-postgres -p 5432:5432 \
     -e POSTGRES_USER=postgres \
     -e POSTGRES_PASSWORD=postgres \
     -e POSTGRES_DB=hinds_light \
     postgres:16-alpine

   # Redis
   docker run -d --name hl-redis -p 6379:6379 redis:7-alpine
   ```

4. **Database Migration**
   ```bash
   yarn prisma migrate dev --name init
   ```

5. **Seed Initial Data**
   ```bash
   yarn seed:sources
   ```

6. **Start Services**
   ```bash
   # Terminal 1: Main API
   yarn dev

   # Terminal 2: Content Ingestion Worker
   yarn worker:ingest

   # Terminal 3: Translation Worker  
   yarn worker:translation
   ```

### Docker Deployment

**Development Mode:**
```bash
docker compose up -d --build
```

**Production Deployment:**
```bash
# Build production images
docker compose -f docker-compose.yml up -d --build

# Run migrations
docker compose exec api yarn prisma migrate deploy
```

**Individual Service Management:**
```bash
# Rebuild specific services
docker compose up -d --build api worker-ingest worker-translation

# View logs
docker compose logs -f worker-ingest

# Stop all services
docker compose down
```

## 🔧 Configuration

### Translation Providers

**Dummy Provider (Development):**
```env
TRANSLATION_PROVIDER=dummy
```
Returns mock translations for testing.

**Google Translate (Production):**
```env
TRANSLATION_PROVIDER=google
GOOGLE_TRANSLATE_API_KEY=your_api_key
GOOGLE_PROJECT_ID=your_project_id
```

### RSS Feed Configuration

Configure User-Agent for better feed access:
```env
FEED_USER_AGENT="Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:141.0) Gecko/20100101 Firefox/141.0"
```

The system includes retry logic, cookie handling, and polite delays between requests.

### Queue Configuration

- **Concurrency**: Ingest (1), Translation (3)
- **Retry Logic**: Exponential backoff with configurable attempts
- **Job Cleanup**: Automatic removal of completed/failed jobs

## 📊 Background Processing

### Content Ingestion Flow
1. **Scheduler**: Repeatable job every 5 minutes
2. **Feed Fetching**: HTTP/2 requests with retry logic
3. **Content Parsing**: RSS XML parsing and sanitization
4. **Deduplication**: URL and content hash-based
5. **Translation Queuing**: Automatic translation job creation

### Translation Flow
1. **Job Processing**: Background translation of content items
2. **Provider Selection**: Dummy or Google Translate
3. **Error Handling**: Failed translations marked for retry
4. **Status Tracking**: PENDING → TRANSLATED/FAILED

## 🛡️ Security Features

- **Rate Limiting**: Configurable per-endpoint limits
- **Input Validation**: Zod schema validation on all inputs
- **Environment Validation**: Runtime environment variable checking
- **CORS Protection**: Cross-origin request configuration
- **SQL Injection Prevention**: Prisma ORM parameterized queries

## 📝 API Endpoints

### Health & Monitoring
- `GET /api/v1/health` - Application health check

### Content Management
- `GET /api/v1/items` - Paginated content items with translations
  - Query params: `limit`, `before`, `sourceId`, `lang`
- `GET /api/v1/items/:id` - Individual content item

### Source Management  
- `GET /api/v1/sources` - List all content sources
- `POST /api/v1/sources` - Add new RSS source
  - Body: `{ type, name, url, language?, active? }`

### Translation Services
- `POST /api/v1/translate` - Manual translation endpoint
  - Body: `{ contentItemId, targetLanguage? }`

## 🔍 Monitoring & Debugging

### Logging
- **Structured Logging**: JSON format via Pino
- **Log Levels**: Configurable via `LOG_LEVEL` environment variable
- **Request Tracing**: Automatic request/response logging

### Database Tools
```bash
# Prisma Studio (GUI)
yarn prisma studio

# Database inspection
yarn prisma db pull
yarn prisma db push
```

### Queue Monitoring
- Queue events logged to console
- Job completion/failure tracking
- Redis-based queue inspection

## 🧪 Testing & Development

### Available Scripts
```bash
yarn dev              # Development server with hot reload
yarn build            # Production build
yarn start            # Production server
yarn worker:ingest    # Ingestion worker only
yarn worker:translation # Translation worker only
yarn seed:sources     # Seed database with RSS sources
yarn prisma:generate  # Generate Prisma client
yarn prisma:migrate   # Run database migrations
```

### Testing
```bash
yarn test             # Run test suite
yarn test:watch       # Watch mode testing
yarn lint             # ESLint checking
yarn type-check       # TypeScript validation
```

## 🔮 Future Enhancements

### Planned Features
- **Social Media Integration**: X (Twitter), Facebook, Instagram APIs
- **Government Source Monitoring**: Official press releases and statements
- **Advanced Translation**: Multiple language support
- **Content Categorization**: AI-powered content classification
- **Real-time Notifications**: WebSocket updates for breaking news
- **Analytics Dashboard**: Content performance and translation metrics

### Scalability Considerations
- **Horizontal Scaling**: Stateless worker design
- **Database Optimization**: Query optimization and indexing
- **Caching Strategy**: Redis-based content caching
- **Load Balancing**: Multiple API instance support

## 🆘 Troubleshooting

### Common Issues

**Database Connection Issues:**
```bash
# Check PostgreSQL status
docker ps | grep postgres
# Reset database
docker compose down && docker compose up -d postgres
```

**Redis Connection Issues:**
```bash
# Check Redis status
docker ps | grep redis
# Clear Redis data
docker exec -it hl-redis redis-cli FLUSHALL
```

**Translation Issues:**
- Verify `TRANSLATION_PROVIDER` setting
- Check Google Translate API quota (if using Google)
- Review translation worker logs

**Feed Ingestion Issues:**
- Verify RSS source URLs are accessible
- Check User-Agent configuration
- Review ingestion worker logs

For additional support, check the logs and open an issue in the repository.



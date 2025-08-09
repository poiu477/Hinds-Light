# Hinds Light

A modern, real-time Hebrew news translation platform that aggregates content from RSS feeds, social media, and official government sources, providing instant English translations for better accessibility and understanding.

## 🌟 Overview

Hinds Light is a comprehensive news aggregation and translation system designed to provide real-time access to Hebrew news content with high-quality English translations. The platform monitors multiple content sources and uses advanced translation services to make Hebrew news accessible to English-speaking audiences.

### 🎯 Future Vision

The platform is designed to expand into multiple specialized content categories:

- **📰 RSS Feeds**: Traditional news sources and media outlets
- **📱 Social Media**: Selected accounts from X (Twitter) and other platforms from independent journalists and commentators
- **🏛️ Government Officials**: Official accounts of Israeli government officials and public figures
- **📋 Official Press**: Government and IDF press releases and official communications

## 🏗️ Architecture

### Backend (`Hinds-Light-Backend`)
- **Framework**: Fastify (Node.js)
- **Database**: PostgreSQL with Prisma ORM
- **Queue System**: BullMQ with Redis
- **Translation**: Google Translate API (with dummy provider for development)
- **Content Processing**: RSS parsing, background workers for ingestion and translation

### Frontend (`Hinds-Light-Frontend`)
- **Framework**: Next.js 15 with React 19
- **Styling**: Tailwind CSS with modern design system
- **State Management**: TanStack Query for server state, Zustand for client state
- **UI/UX**: Responsive design with dark mode support, infinite scroll, real-time updates

## 🚀 Quick Start

### Prerequisites

- **Node.js**: 18+ (recommended: 20+)
- **Yarn**: 4.x (using Corepack)
- **Docker**: For running databases and services
- **PostgreSQL**: 16+ (can be run via Docker)
- **Redis**: 7+ (can be run via Docker)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Hinds-Light
   ```

2. **Enable Yarn 4 via Corepack**
   ```bash
   corepack enable
   yarn --version  # Should show 4.x
   ```

3. **Install dependencies for all workspaces**
   ```bash
   yarn install
   ```

4. **Set up environment variables**
   
   Create `.env` files in both backend and frontend directories:
   
   **Backend** (`Hinds-Light-Backend/.env`):
   ```env
   PORT=4000
   NODE_ENV=development
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/hinds_light?schema=public
   REDIS_URL=redis://localhost:6379
   TRANSLATION_PROVIDER=dummy
   # Optional: For Google Translate
   GOOGLE_TRANSLATE_API_KEY=your_api_key_here
   GOOGLE_PROJECT_ID=your_project_id
   FEED_USER_AGENT="Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:141.0) Gecko/20100101 Firefox/141.0"
   ```

5. **Start databases with Docker**
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

6. **Set up the database**
   ```bash
   cd Hinds-Light-Backend
   yarn prisma generate
   yarn prisma migrate dev --name init
   ```

7. **Seed initial data (optional)**
   ```bash
   yarn seed:sources
   ```

### Development

Start all services in development mode:

```bash
# Terminal 1: Backend API
cd Hinds-Light-Backend
yarn dev

# Terminal 2: Ingest Worker
cd Hinds-Light-Backend
yarn worker:ingest

# Terminal 3: Translation Worker
cd Hinds-Light-Backend
yarn worker:translation

# Terminal 4: Frontend
cd Hinds-Light-Frontend
yarn dev
```

**Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- API Health: http://localhost:4000/api/v1/health

### Docker Deployment

For production or containerized development:

```bash
# Backend services (API + Workers + Databases)
cd Hinds-Light-Backend
docker compose up -d --build

# Frontend (development mode)
cd Hinds-Light-Frontend
docker compose up -d --build

# Or production frontend
docker build --target production -t frontend-prod .
```

## 📁 Project Structure

```
Hinds-Light/
├── README.md                    # This file
├── package.json                 # Workspace configuration
├── yarn.lock                    # Dependency lock file
├── .yarnrc.yml                  # Yarn configuration
├── Hinds-Light-Backend/         # Backend service
│   ├── src/
│   │   ├── routes/              # API endpoints
│   │   ├── workers/             # Background job processors
│   │   ├── queues/              # Job queue definitions
│   │   ├── services/            # Business logic services
│   │   ├── lib/                 # Utilities and configurations
│   │   └── scripts/             # Database seeding and maintenance
│   ├── prisma/                  # Database schema and migrations
│   ├── Dockerfile               # Backend container configuration
│   └── docker-compose.yml       # Backend services orchestration
└── Hinds-Light-Frontend/        # Frontend application
    ├── src/
    │   ├── app/                 # Next.js app router pages
    │   ├── components/          # Reusable UI components
    │   ├── features/            # Feature-specific code
    │   ├── lib/                 # Client-side utilities
    │   └── types/               # TypeScript type definitions
    ├── public/                  # Static assets
    ├── Dockerfile               # Frontend container configuration
    └── docker-compose.yml       # Frontend service configuration
```

## 🔧 Configuration

### Translation Providers

- **Dummy Provider**: For development, returns mock translations
- **Google Translate**: Production-ready translation service

### RSS Sources

The system includes pre-configured Hebrew news sources. Add more sources via:
```bash
cd Hinds-Light-Backend
yarn seed:sources
```

### Rate Limiting

The API includes rate limiting to prevent abuse. Configure limits in `src/plugins/rateLimiter.ts`.

## 🧪 Testing

```bash
# Backend tests
cd Hinds-Light-Backend
yarn test

# Frontend tests  
cd Hinds-Light-Frontend
yarn test

# Linting
yarn lint
```

## 📝 API Documentation

The backend provides RESTful APIs:

- `GET /api/v1/health` - System health check
- `GET /api/v1/items` - Fetch translated articles with pagination
- `GET /api/v1/sources` - Manage content sources
- `POST /api/v1/sources` - Add new content sources

## 🛠️ Development Tools

- **TypeScript**: Full type safety across the stack
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting
- **Prisma Studio**: Database GUI (`yarn prisma studio`)
- **React DevTools**: Frontend debugging and profiling

## 🔒 Security

- Rate limiting on all API endpoints
- Input validation with Zod schemas
- CORS configuration for cross-origin requests
- Environment variable validation

## 📈 Monitoring

- Application logs via Pino (structured JSON logging)
- Queue monitoring via BullMQ dashboard
- Database query monitoring via Prisma

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For questions, issues, or contributions, please open an issue on the repository or contact the development team.

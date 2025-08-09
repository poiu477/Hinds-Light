# Hinds Light Frontend

A modern, responsive React application that provides an intuitive interface for browsing translated Hebrew news content. Built with Next.js 15 and featuring a clean, accessible design with dark mode support.

## 🏗️ Tech Stack

### Core Framework
- **Next.js 15**: React framework with App Router
- **React 19**: Latest React with concurrent features
- **TypeScript**: Full type safety across the application

### Styling & UI
- **Tailwind CSS 4**: Modern utility-first CSS framework
- **Geist Font**: Optimized typography from Vercel
- **Custom Design System**: Consistent colors, spacing, and components
- **Dark Mode**: Automatic system preference detection

### State Management
- **TanStack Query**: Powerful server state management with caching
- **Zustand**: Lightweight client state management
- **React Query DevTools**: Development debugging tools

### Development & Build
- **Turbopack**: Next.js's fast bundler for development
- **ESLint**: Code quality and consistency
- **PostCSS**: CSS processing and optimization

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles and CSS variables
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Home page
│   ├── providers.tsx      # App-wide providers (Query, etc.)
│   ├── news/
│   │   └── NewsFeed.tsx   # Main news feed component
│   ├── api/
│   │   └── [...proxy]/    # API proxy to backend
│   └── store/
│       └── appStore.ts    # Zustand store configuration
├── components/            # Reusable UI components
│   ├── Header.tsx         # Application header with navigation
│   ├── ArticleCard.tsx    # Individual article display
│   ├── LoadingSpinner.tsx # Loading state component
│   └── ErrorState.tsx     # Error state component
├── features/              # Feature-specific components
│   └── posts/
│       ├── api.ts         # Post-related API calls
│       └── hooks.ts       # Custom hooks for posts
├── lib/                   # Utility libraries
│   ├── apiClient.ts       # HTTP client configuration
│   └── queryClient.ts     # TanStack Query configuration
└── types/                 # TypeScript type definitions
    └── api.ts             # API response types
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Yarn 4.x (via Corepack)
- Backend API running (see Backend README)

### Local Development

1. **Install Dependencies**
   ```bash
   yarn install
   ```

2. **Environment Configuration**
   
   Create `.env.local` file:
   ```env
   # Backend API URL for server-side requests
   API_URL=http://localhost:4000
   
   # Backend API URL for client-side requests
   NEXT_PUBLIC_API_URL=http://localhost:4000
   ```

3. **Start Development Server**
   ```bash
   yarn dev
   ```

4. **Access Application**
   - Frontend: http://localhost:3000
   - With backend running, you'll see translated news content

### Docker Development

**Development Mode (Recommended):**
```bash
docker compose up -d --build
```

This provides:
- Hot reloading for instant feedback
- Volume mounts for live code changes
- React DevTools profiling support
- Full debugging capabilities

**Production Build:**
```bash
docker build --target production -t frontend-prod .
docker run -p 3000:3000 frontend-prod
```

## 🎨 Features

### Current Features
- **Modern UI**: Clean, responsive design with professional styling
- **Real-time Updates**: Live content fetching and updates
- **Infinite Scroll**: Seamless content loading as you browse
- **Dark Mode**: Automatic system preference detection
- **Bilingual Display**: Side-by-side Hebrew original and English translation
- **Source Attribution**: Clear source and timestamp information
- **External Links**: Direct links to original articles
- **Loading States**: Smooth loading animations and skeleton screens
- **Error Handling**: User-friendly error messages and retry options
- **Mobile Responsive**: Optimized for all device sizes

### Planned Features (Future Roadmap)
- **📑 Tabbed Interface**: Multiple content categories
  - **RSS Feeds**: Traditional news sources
  - **Social Media**: Independent journalists and commentators  
  - **Government Officials**: Official accounts and statements
  - **Press Releases**: Government and IDF official communications
- **🔍 Search & Filtering**: Advanced content discovery
- **📊 Analytics**: Reading patterns and content engagement
- **🔔 Notifications**: Breaking news alerts
- **💾 Bookmarks**: Save articles for later reading
- **📱 PWA**: Progressive Web App capabilities

## 🎨 Design System

### Color Palette
- **Primary**: Blue tones for interactive elements
- **Success**: Green for positive states
- **Warning**: Orange for attention items  
- **Error**: Red for error states
- **Neutral**: Grays for text and backgrounds

### Typography
- **Primary**: Geist Sans for clean, modern text
- **Monospace**: Geist Mono for code and technical content
- **Hebrew Support**: Proper RTL text rendering

### Components
- **Cards**: Elevated content containers with hover effects
- **Buttons**: Consistent interactive elements with focus states
- **Loading**: Animated spinners and skeleton screens
- **Navigation**: Sticky header with backdrop blur

## 🔧 Configuration

### Environment Variables

**Required:**
- `API_URL`: Backend API URL for server-side requests
- `NEXT_PUBLIC_API_URL`: Backend API URL for client-side requests

**Optional:**
- `NODE_ENV`: Environment (development/production)
- `PORT`: Server port (default: 3000)

### API Integration

The frontend communicates with the backend via:
- **Proxy Route**: `/api/[...proxy]` for server-side requests
- **Direct Fetch**: Client-side API calls to backend
- **TanStack Query**: Caching and state management

### Build Configuration

**Development:**
- Turbopack for fast bundling
- Hot reloading enabled
- Source maps for debugging
- React DevTools support

**Production:**
- Optimized bundle with tree shaking
- Image optimization
- Static generation where possible
- Standalone output for Docker

## 🧪 Development Tools

### Available Scripts
```bash
yarn dev              # Development server with Turbopack
yarn build            # Production build
yarn start            # Production server
yarn lint             # ESLint checking
yarn type-check       # TypeScript validation
```

### Development Features
- **Hot Reloading**: Instant updates on code changes
- **TypeScript**: Full type checking and IntelliSense
- **ESLint**: Code quality enforcement
- **TanStack Query DevTools**: API state debugging
- **React DevTools**: Component debugging and profiling

### Code Quality
- **TypeScript**: Strict type checking enabled
- **ESLint**: Next.js recommended rules
- **Prettier**: Code formatting (via ESLint)
- **Import Sorting**: Organized import statements

## 📱 Responsive Design

### Breakpoints
- **Mobile**: 640px and below
- **Tablet**: 641px - 1024px
- **Desktop**: 1025px and above

### Mobile Optimizations
- Touch-friendly tap targets
- Optimized text sizes
- Gesture-friendly navigation
- Fast loading on mobile networks

## 🔍 Performance

### Optimization Features
- **Code Splitting**: Automatic route-based splitting
- **Image Optimization**: Next.js automatic image optimization
- **Font Optimization**: Geist font with automatic optimization
- **Lazy Loading**: Components and images load on demand
- **Caching**: TanStack Query with intelligent cache management

### Metrics
- **Core Web Vitals**: Optimized for Google's performance metrics
- **Lighthouse Score**: High performance and accessibility scores
- **Bundle Analysis**: Optimized bundle sizes

## 🛡️ Security

- **Content Security Policy**: Configured for production
- **XSS Protection**: React's built-in protections
- **CORS**: Proper cross-origin configuration
- **Environment Variables**: Secure handling of sensitive data

## 🚀 Deployment

### Docker Deployment
```bash
# Development
docker compose up -d --build

# Production
docker build --target production -t hinds-light-frontend .
docker run -p 3000:3000 hinds-light-frontend
```

### Traditional Deployment
```bash
# Build
yarn build

# Start
yarn start
```

### Vercel Deployment
The app is ready for Vercel deployment with zero configuration:
```bash
vercel --prod
```

## 🔮 Future Architecture

### Planned Enhancements
- **Multi-tab Interface**: Category-based content organization
- **Real-time Updates**: WebSocket integration for live updates
- **Offline Support**: PWA with offline reading capabilities
- **Performance Monitoring**: Real user monitoring integration
- **A/B Testing**: Feature flag system for experiments

### Scalability
- **CDN Integration**: Static asset optimization
- **Edge Computing**: Vercel Edge Functions for API routes
- **Database Caching**: Redis integration for faster data access
- **Image Optimization**: Advanced image processing pipeline

## 🆘 Troubleshooting

### Common Issues

**Build Errors:**
```bash
# Clear Next.js cache
rm -rf .next
yarn build
```

**TypeScript Errors:**
```bash
# Restart TypeScript server in your IDE
# Or run type checking
yarn type-check
```

**API Connection Issues:**
- Verify backend is running on correct port
- Check environment variables
- Ensure CORS configuration allows frontend domain

**Development Server Issues:**
```bash
# Kill process on port 3000
npx kill-port 3000
yarn dev
```

For additional support, check the browser console for errors and open an issue in the repository.

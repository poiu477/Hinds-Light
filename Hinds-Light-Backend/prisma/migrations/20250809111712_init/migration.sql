-- CreateEnum
CREATE TYPE "public"."SourceType" AS ENUM ('RSS', 'X', 'TELEGRAM', 'YOUTUBE', 'WEBSITE');

-- CreateEnum
CREATE TYPE "public"."ContentType" AS ENUM ('ARTICLE', 'POST', 'TWEET', 'THREAD', 'VIDEO');

-- CreateEnum
CREATE TYPE "public"."TranslationStatus" AS ENUM ('PENDING', 'TRANSLATED', 'FAILED');

-- CreateTable
CREATE TABLE "public"."Source" (
    "id" TEXT NOT NULL,
    "type" "public"."SourceType" NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT,
    "language" TEXT NOT NULL DEFAULT 'he',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Source_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ContentItem" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "type" "public"."ContentType" NOT NULL,
    "title" TEXT,
    "url" TEXT,
    "originalLanguage" TEXT NOT NULL DEFAULT 'he',
    "originalText" TEXT NOT NULL,
    "translatedLanguage" TEXT,
    "translatedText" TEXT,
    "translationStatus" "public"."TranslationStatus" NOT NULL DEFAULT 'PENDING',
    "publishedAt" TIMESTAMP(3),
    "rawJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Source_type_active_idx" ON "public"."Source"("type", "active");

-- CreateIndex
CREATE UNIQUE INDEX "ContentItem_url_key" ON "public"."ContentItem"("url");

-- CreateIndex
CREATE INDEX "ContentItem_sourceId_publishedAt_idx" ON "public"."ContentItem"("sourceId", "publishedAt");

-- CreateIndex
CREATE INDEX "ContentItem_translationStatus_idx" ON "public"."ContentItem"("translationStatus");

-- CreateIndex
CREATE INDEX "ContentItem_publishedAt_idx" ON "public"."ContentItem"("publishedAt");

-- AddForeignKey
ALTER TABLE "public"."ContentItem" ADD CONSTRAINT "ContentItem_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "public"."Source"("id") ON DELETE CASCADE ON UPDATE CASCADE;

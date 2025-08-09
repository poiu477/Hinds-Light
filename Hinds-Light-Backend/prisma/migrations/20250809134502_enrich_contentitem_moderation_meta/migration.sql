-- AlterTable
ALTER TABLE "public"."ContentItem" ADD COLUMN     "authorDisplayName" TEXT,
ADD COLUMN     "authorFollowerCount" INTEGER,
ADD COLUMN     "authorUsername" TEXT,
ADD COLUMN     "authorVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "flagNote" TEXT,
ADD COLUMN     "flagReason" TEXT,
ADD COLUMN     "flagged" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "flaggedAt" TIMESTAMP(3),
ADD COLUMN     "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "metricsLikes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "metricsReplies" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "metricsShares" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "sentiment" TEXT,
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "translationConfidence" DOUBLE PRECISION,
ADD COLUMN     "verified" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "ContentItem_sentiment_idx" ON "public"."ContentItem"("sentiment");

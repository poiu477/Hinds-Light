/*
  Warnings:

  - A unique constraint covering the columns `[contentHash]` on the table `ContentItem` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."ContentItem" ADD COLUMN     "contentHash" TEXT;

-- AlterTable
ALTER TABLE "public"."Source" ADD COLUMN     "alignment" TEXT,
ADD COLUMN     "displayName" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "ContentItem_contentHash_key" ON "public"."ContentItem"("contentHash");

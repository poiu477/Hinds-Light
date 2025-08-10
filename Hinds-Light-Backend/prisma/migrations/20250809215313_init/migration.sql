-- AlterTable
ALTER TABLE "public"."ContentItem" ADD COLUMN     "translatedTags" TEXT[] DEFAULT ARRAY[]::TEXT[];

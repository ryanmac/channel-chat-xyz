/*
  Warnings:

  - You are about to drop the column `embeddedTranscripts` on the `Channel` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Channel" DROP COLUMN "embeddedTranscripts",
ADD COLUMN     "totalEmbeddings" INTEGER NOT NULL DEFAULT 0;

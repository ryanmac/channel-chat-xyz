/*
  Warnings:

  - You are about to drop the column `topic` on the `Debate` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Debate" DROP COLUMN "topic",
ADD COLUMN     "topicDescription" TEXT,
ADD COLUMN     "topicTitle" TEXT;

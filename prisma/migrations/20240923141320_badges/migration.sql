/*
  Warnings:

  - Made the column `transactionId` on table `UserBadge` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "UserBadge" DROP CONSTRAINT "UserBadge_transactionId_fkey";

-- AlterTable
ALTER TABLE "UserBadge" ALTER COLUMN "transactionId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "UserBadge" ADD CONSTRAINT "UserBadge_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

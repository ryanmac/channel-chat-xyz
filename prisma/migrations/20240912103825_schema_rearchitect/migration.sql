/*
  Warnings:

  - You are about to drop the `SessionTransaction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserTransaction` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "SessionTransaction" DROP CONSTRAINT "SessionTransaction_channelId_fkey";

-- DropForeignKey
ALTER TABLE "UserTransaction" DROP CONSTRAINT "UserTransaction_channelId_fkey";

-- DropForeignKey
ALTER TABLE "UserTransaction" DROP CONSTRAINT "UserTransaction_userId_fkey";

-- DropTable
DROP TABLE "SessionTransaction";

-- DropTable
DROP TABLE "UserTransaction";

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "type" "TransactionType" NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Transaction_channelId_idx" ON "Transaction"("channelId");

-- CreateIndex
CREATE INDEX "Transaction_userId_idx" ON "Transaction"("userId");

-- CreateIndex
CREATE INDEX "Transaction_sessionId_idx" ON "Transaction"("sessionId");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

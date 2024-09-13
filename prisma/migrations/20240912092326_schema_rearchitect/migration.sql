/*
  Warnings:

  - You are about to drop the column `isActive` on the `Channel` table. All the data in the column will be lost.
  - You are about to alter the column `activationFunding` on the `Channel` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `activationGoal` on the `Channel` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `value` on the `ChannelBoost` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to drop the column `isUser` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `credits` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `ChannelCredit` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ChannelUsage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CreditTransaction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PasswordResetToken` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Sponsorship` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Subscription` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VerificationToken` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `YouTubeChannel` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_UserSponsoredChannels` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `subscriberCount` to the `Channel` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Channel` table without a default value. This is not possible if the table is not empty.
  - Added the required column `videoCount` to the `Channel` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `boostType` on the `ChannelBoost` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `type` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('USER', 'AI');

-- CreateEnum
CREATE TYPE "ChannelStatus" AS ENUM ('PENDING', 'ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "ChannelBoostType" AS ENUM ('MEMORY', 'TOKENS', 'FINE_TUNING');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('ACTIVATION', 'CREDIT_PURCHASE');

-- CreateEnum
CREATE TYPE "SettingType" AS ENUM ('STRING', 'INTEGER', 'BOOLEAN', 'FLOAT');

-- DropForeignKey
ALTER TABLE "ChannelCredit" DROP CONSTRAINT "ChannelCredit_channelId_fkey";

-- DropForeignKey
ALTER TABLE "ChannelUsage" DROP CONSTRAINT "ChannelUsage_channelId_fkey";

-- DropForeignKey
ALTER TABLE "Chat" DROP CONSTRAINT "Chat_channelId_fkey";

-- DropForeignKey
ALTER TABLE "CreditTransaction" DROP CONSTRAINT "CreditTransaction_channelId_fkey";

-- DropForeignKey
ALTER TABLE "Sponsorship" DROP CONSTRAINT "Sponsorship_channelId_fkey";

-- DropForeignKey
ALTER TABLE "Sponsorship" DROP CONSTRAINT "Sponsorship_userId_fkey";

-- DropForeignKey
ALTER TABLE "Subscription" DROP CONSTRAINT "Subscription_userId_fkey";

-- DropForeignKey
ALTER TABLE "_UserSponsoredChannels" DROP CONSTRAINT "_UserSponsoredChannels_A_fkey";

-- DropForeignKey
ALTER TABLE "_UserSponsoredChannels" DROP CONSTRAINT "_UserSponsoredChannels_B_fkey";

-- AlterTable
ALTER TABLE "Channel" DROP COLUMN "isActive",
ADD COLUMN     "bannerUrl" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "status" "ChannelStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "subscriberCount" INTEGER NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "videoCount" INTEGER NOT NULL,
ADD COLUMN     "viewCount" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "activationFunding" SET DEFAULT 0,
ALTER COLUMN "activationFunding" SET DATA TYPE INTEGER,
ALTER COLUMN "activationGoal" SET DEFAULT 10,
ALTER COLUMN "activationGoal" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "ChannelBoost" DROP COLUMN "boostType",
ADD COLUMN     "boostType" "ChannelBoostType" NOT NULL,
ALTER COLUMN "value" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "isUser",
ADD COLUMN     "type" "MessageType" NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "credits";

-- DropTable
DROP TABLE "ChannelCredit";

-- DropTable
DROP TABLE "ChannelUsage";

-- DropTable
DROP TABLE "CreditTransaction";

-- DropTable
DROP TABLE "PasswordResetToken";

-- DropTable
DROP TABLE "Sponsorship";

-- DropTable
DROP TABLE "Subscription";

-- DropTable
DROP TABLE "VerificationToken";

-- DropTable
DROP TABLE "YouTubeChannel";

-- DropTable
DROP TABLE "_UserSponsoredChannels";

-- CreateTable
CREATE TABLE "ChannelMetrics" (
    "id" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "views" INTEGER NOT NULL,
    "chats" INTEGER NOT NULL,

    CONSTRAINT "ChannelMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionTransaction" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "type" "TransactionType" NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SessionTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserTransaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "type" "TransactionType" NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ChannelMetrics_channelId_date_key" ON "ChannelMetrics"("channelId", "date");

-- CreateIndex
CREATE INDEX "SessionTransaction_sessionId_channelId_idx" ON "SessionTransaction"("sessionId", "channelId");

-- CreateIndex
CREATE INDEX "UserTransaction_userId_channelId_idx" ON "UserTransaction"("userId", "channelId");

-- CreateIndex
CREATE INDEX "Channel_name_idx" ON "Channel"("name");

-- CreateIndex
CREATE INDEX "Chat_userId_channelId_idx" ON "Chat"("userId", "channelId");

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChannelMetrics" ADD CONSTRAINT "ChannelMetrics_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionTransaction" ADD CONSTRAINT "SessionTransaction_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTransaction" ADD CONSTRAINT "UserTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTransaction" ADD CONSTRAINT "UserTransaction_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "Channel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

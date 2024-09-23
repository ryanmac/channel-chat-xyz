/*
  Warnings:

  - A unique constraint covering the columns `[userId,badgeId,channelId]` on the table `UserBadge` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "UserBadge_userId_badgeId_channelId_key" ON "UserBadge"("userId", "badgeId", "channelId");

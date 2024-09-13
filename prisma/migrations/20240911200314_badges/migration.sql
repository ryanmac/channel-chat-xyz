/*
  Warnings:

  - You are about to drop the `_BadgeToUser` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[sessionId]` on the table `SessionBadge` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "_BadgeToUser" DROP CONSTRAINT "_BadgeToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_BadgeToUser" DROP CONSTRAINT "_BadgeToUser_B_fkey";

-- DropTable
DROP TABLE "_BadgeToUser";

-- CreateTable
CREATE TABLE "UserBadge" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserBadge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SessionBadge_sessionId_key" ON "SessionBadge"("sessionId");

-- AddForeignKey
ALTER TABLE "UserBadge" ADD CONSTRAINT "UserBadge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBadge" ADD CONSTRAINT "UserBadge_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "Badge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

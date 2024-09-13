-- CreateTable
CREATE TABLE "SessionBadge" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "badges" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SessionBadge_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Channel" ALTER COLUMN "subscriberCount" DROP NOT NULL,
ALTER COLUMN "videoCount" DROP NOT NULL,
ALTER COLUMN "viewCount" DROP NOT NULL;

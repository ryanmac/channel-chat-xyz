/*
  Warnings:

  - The values [PROCESSING] on the enum `ChannelStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ChannelStatus_new" AS ENUM ('PENDING', 'ACTIVE', 'INACTIVE');
ALTER TABLE "Channel" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Channel" ALTER COLUMN "status" TYPE "ChannelStatus_new" USING ("status"::text::"ChannelStatus_new");
ALTER TYPE "ChannelStatus" RENAME TO "ChannelStatus_old";
ALTER TYPE "ChannelStatus_new" RENAME TO "ChannelStatus";
DROP TYPE "ChannelStatus_old";
ALTER TABLE "Channel" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

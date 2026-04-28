-- AlterTable
ALTER TABLE "Game" ADD COLUMN     "average_rating" DECIMAL(3,2),
ADD COLUMN     "rating_count" INTEGER NOT NULL DEFAULT 0;

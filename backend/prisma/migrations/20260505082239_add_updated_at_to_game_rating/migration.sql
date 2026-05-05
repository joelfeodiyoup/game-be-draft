/*
  Warnings:

  - Added the required column `updated_at` to the `GameRating` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable

-- add column as nullable first.
ALTER TABLE "GameRating" ADD COLUMN     "updated_at" TIMESTAMPTZ;

-- set updated_at to created_at for all existing rows
UPDATE "GameRating" SET "updated_at" = "created_at";

-- make the column NOT NULL now that it has values
ALTER TABLE "GameRating" ALTER COLUMN "updated_at" SET NOT NULL;

/*
  Warnings:

  - You are about to drop the `Rating` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Rating" DROP CONSTRAINT "Rating_player_id_fkey";

-- DropForeignKey
ALTER TABLE "Rating" DROP CONSTRAINT "Rating_scenario_id_fkey";

-- DropTable
DROP TABLE "Rating";

-- CreateTable
CREATE TABLE "AuthRole" (
    "role" VARCHAR(5) NOT NULL,
    "player_id" UUID NOT NULL,

    CONSTRAINT "AuthRole_pkey" PRIMARY KEY ("player_id","role")
);

-- CreateTable
CREATE TABLE "GameRating" (
    "player_id" UUID NOT NULL,
    "game_id" UUID NOT NULL,
    "rating" SMALLINT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GameRating_pkey" PRIMARY KEY ("player_id","game_id")
);

-- CreateIndex
CREATE INDEX "AuthRole_player_id_idx" ON "AuthRole"("player_id");

-- CreateIndex
CREATE INDEX "GameRating_game_id_idx" ON "GameRating"("game_id");

-- AddForeignKey
ALTER TABLE "AuthRole" ADD CONSTRAINT "AuthRole_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameRating" ADD CONSTRAINT "GameRating_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameRating" ADD CONSTRAINT "GameRating_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

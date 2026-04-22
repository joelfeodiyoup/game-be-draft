/*
  Warnings:

  - You are about to drop the `Session` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_player_id_fkey";

-- DropTable
DROP TABLE "Session";

-- CreateTable
CREATE TABLE "GameSession" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_time" TIMESTAMP(3),
    "game_id" UUID NOT NULL,
    "player_id" UUID NOT NULL,

    CONSTRAINT "GameSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthSession" (
    "id" UUID NOT NULL,
    "player_id" UUID NOT NULL,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuthSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GameSession_player_id_idx" ON "GameSession"("player_id");

-- CreateIndex
CREATE INDEX "GameSession_game_id_idx" ON "GameSession"("game_id");

-- CreateIndex
CREATE INDEX "GameSession_created_at_game_id_idx" ON "GameSession"("created_at", "game_id");

-- CreateIndex
CREATE INDEX "GameSession_end_time_idx" ON "GameSession"("end_time");

-- CreateIndex
CREATE INDEX "AuthSession_player_id_expires_at_idx" ON "AuthSession"("player_id", "expires_at");

-- AddForeignKey
ALTER TABLE "GameSession" ADD CONSTRAINT "GameSession_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameSession" ADD CONSTRAINT "GameSession_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthSession" ADD CONSTRAINT "AuthSession_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

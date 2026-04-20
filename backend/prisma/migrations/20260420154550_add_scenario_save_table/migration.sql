/*
  Warnings:

  - You are about to drop the `GameSave` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `game_id` to the `Scenario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mongo_state_id` to the `Scenario` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "GameSave" DROP CONSTRAINT "GameSave_player_id_fkey";

-- DropForeignKey
ALTER TABLE "GameSave" DROP CONSTRAINT "GameSave_scenario_id_fkey";

-- AlterTable
ALTER TABLE "Scenario" ADD COLUMN     "game_id" UUID NOT NULL,
ADD COLUMN     "mongo_state_id" CHAR(24) NOT NULL;

-- DropTable
DROP TABLE "GameSave";

-- CreateTable
CREATE TABLE "Game" (
    "id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScenarioSave" (
    "id" UUID NOT NULL,
    "player_id" UUID NOT NULL,
    "mongodb_state_id" CHAR(24) NOT NULL,
    "time_played_in_seconds" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "scenario_id" UUID NOT NULL,

    CONSTRAINT "ScenarioSave_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerProgress" (
    "player_id" UUID NOT NULL,
    "scenario_id" UUID NOT NULL,
    "completed" BOOLEAN NOT NULL,

    CONSTRAINT "PlayerProgress_pkey" PRIMARY KEY ("player_id","scenario_id")
);

-- CreateIndex
CREATE INDEX "ScenarioSave_player_id_idx" ON "ScenarioSave"("player_id");

-- CreateIndex
CREATE INDEX "ScenarioSave_created_at_idx" ON "ScenarioSave"("created_at");

-- AddForeignKey
ALTER TABLE "ScenarioSave" ADD CONSTRAINT "ScenarioSave_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScenarioSave" ADD CONSTRAINT "ScenarioSave_scenario_id_fkey" FOREIGN KEY ("scenario_id") REFERENCES "Scenario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scenario" ADD CONSTRAINT "Scenario_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerProgress" ADD CONSTRAINT "PlayerProgress_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerProgress" ADD CONSTRAINT "PlayerProgress_scenario_id_fkey" FOREIGN KEY ("scenario_id") REFERENCES "Scenario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

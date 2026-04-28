import { Prisma } from "@prisma/client";
import { Seed } from "./seed.types";
import prisma from "@/databases/postgres/db";
import { createGamesRepository } from "@/repositories/games.repository";

const games: Prisma.GameCreateInput[] = [
  {
    title: "transport tycoon",
    description: "connect towns and industries with transport",
  },
  {
    title: "zeus: master of olympus",
    description: "build a city in ancient greece",
  },
  { title: "rollercoaster tycoon", description: "build a rollercoaster park" },
];

export const seedGames: Seed = {
  seed: async function (): Promise<void> {
    // seed games
    const createdGames = [];
    for (const game of games) {
      const createdGame = await prisma.game.create({ data: game });
      createdGames.push(createdGame);
    };
  },
  delete: async function (): Promise<void> {
    return prisma.$transaction(async tx => {
        await createGamesRepository(tx).deleteAll();
    });
  },
};

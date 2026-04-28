import { Seed } from "./seed.types";
import { authOrchestrators } from "@/domains/auth/auth.orchestrator";

export const seedUsers: Seed = {
  delete: async function (): Promise<void> {
    return await authOrchestrators.deleteAllUsers();
  },
  seed: async function (): Promise<void> {
    // seed users
    const users: { username: string; password: string; isAdmin: boolean }[] = [
      { username: "agata", password: "password", isAdmin: false },
      { username: "admin", password: "admin", isAdmin: true },
    ];
    for (const { username, password, isAdmin } of users) {
      const player = await authOrchestrators.register({username, password});
      if (isAdmin) {
        await authOrchestrators.assignRole({playerId: (await player).id, role: 'ADMIN'});
      }
    }
  },
};

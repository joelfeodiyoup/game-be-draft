import { Seed } from "./seed.types";
import { authOrchestrators } from "@/domains/auth/auth.orchestrator";
import { faker } from '@faker-js/faker';

export const seedUsers: Seed = {
  delete: async function (): Promise<void> {
    return await authOrchestrators.deleteAllUsers();
  },
  seed: async function (): Promise<void> {
    // seed users
    const users: { username: string; password: string; isAdmin: boolean }[] = [
      { username: "admin", password: "admin", isAdmin: true },
      ...Array.from(Array(10), () => ({username: faker.person.firstName(), password: 'password', isAdmin: false}))
    ];
    for (const { username, password, isAdmin } of users) {
      const player = await authOrchestrators.register({username, password});
      if (isAdmin) {
        await authOrchestrators.assignRole({playerId: (await player).id, role: 'ADMIN'});
      }
    }
    return Promise.resolve();
  },
};

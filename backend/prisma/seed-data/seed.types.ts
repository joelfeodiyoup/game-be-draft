export interface Seed {
    seed: () => Promise<void>;
    delete: () => Promise<void>;
}
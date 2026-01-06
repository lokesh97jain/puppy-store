// ~500–800ms simulated delay

// If TypeScript complains, ensure tsconfig has: "resolveJsonModule": true
 
// @ts-ignore
import puppiesData from '../../data/puppies.json';
export type Puppy = {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  age?: number;
  location?: string;
};

// Toggle these for interview demos
export let SIMULATE_ERROR = false;
export const SIMULATE_EMPTY = false;

export function setSimulateError(value: boolean) {
  SIMULATE_ERROR = value;
}

const DELAY_MS = 700; // ~500–800ms simulated delay

export type PuppyPage = { data: Puppy[]; nextCursor?: string };

export async function fetchPuppiesPage(params?: { cursor?: string; limit?: number }): Promise<PuppyPage> {
  const { cursor, limit = 12 } = params || {};
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (SIMULATE_ERROR) {
        reject(new Error('Failed to load puppies. Please try again.'));
        return;
      }
      let all = (puppiesData as unknown) as Puppy[];
      if (SIMULATE_EMPTY) all = [];

      // Find start index using cursor id (keyset). IDs are like "pup-1" ... "pup-30".
      let startIdx = 0;
      if (cursor) {
        const idx = all.findIndex((p) => p.id === cursor);
        startIdx = idx >= 0 ? idx + 1 : 0;
      }
      const slice = all.slice(startIdx, startIdx + limit);
      const next = startIdx + limit < all.length ? slice[slice.length - 1]?.id : undefined;
      resolve({ data: slice, nextCursor: next });
    }, DELAY_MS);
  });
}

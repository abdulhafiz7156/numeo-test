import type { User } from "../types";

export function computeExpensiveScore(user: User): number {
  let hash = user.id * 97 + user.age * 31;
  const seed = `${user.email}|${user.status}|${user.city}`;
  for (let i = 0; i < 4000; i += 1) {
    const code = seed.charCodeAt(i % seed.length);
    hash = (hash * 33 + code + i) % 10000019;
  }
  return Number(((hash % 1000) / 10).toFixed(1));
}

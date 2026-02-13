import type { User, UserPatch, UserStatus } from "../types";

const FIRST_NAMES = [
  "Ava",
  "Liam",
  "Noah",
  "Emma",
  "Mia",
  "Olivia",
  "Sophia",
  "Elijah",
  "Amelia",
  "Lucas",
  "Harper",
  "Ethan",
  "Mason",
  "Isabella",
  "Charlotte",
  "James",
  "Evelyn",
  "Henry"
];

const LAST_NAMES = [
  "Johnson",
  "Williams",
  "Brown",
  "Jones",
  "Garcia",
  "Miller",
  "Davis",
  "Lopez",
  "Wilson",
  "Anderson",
  "Thomas",
  "Taylor",
  "Moore",
  "Jackson"
];

const CITIES = [
  "New York",
  "San Francisco",
  "Austin",
  "Seattle",
  "Chicago",
  "Miami",
  "Denver",
  "Boston"
];

const STATUSES: UserStatus[] = ["active", "inactive", "pending"];

function randomFrom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function makeName(): string {
  return `${randomFrom(FIRST_NAMES)} ${randomFrom(LAST_NAMES)}`;
}

function makeEmail(name: string, id: number): string {
  return `${name.toLowerCase().replace(/\s+/g, ".")}.${id}@numeo.test`;
}

export function generateUsers(total: number): User[] {
  const users: User[] = [];
  for (let id = 1; id <= total; id += 1) {
    const name = makeName();
    users.push({
      id,
      name,
      email: makeEmail(name, id),
      age: 18 + Math.floor(Math.random() * 48),
      status: randomFrom(STATUSES),
      city: randomFrom(CITIES),
      updatedAt: Date.now() - Math.floor(Math.random() * 1000 * 3600 * 24 * 90)
    });
  }
  return users;
}

export async function fetchUsers(total = 10000): Promise<User[]> {
  await sleep(900);
  if (Math.random() < 0.08) {
    throw new Error("Simulated network failure while loading users.");
  }
  return generateUsers(total);
}

export async function saveUserPatch(
  previousUser: User,
  patch: UserPatch
): Promise<User> {
  await sleep(650 + Math.floor(Math.random() * 350));
  if (Math.random() < 0.3) {
    throw new Error("Simulated save failure. Rollback applied.");
  }
  return {
    ...previousUser,
    ...patch,
    updatedAt: Date.now()
  };
}

import type { Stargazer } from "./stargazers";

export type HouseLookup = "missing" | "unavailable" | "full" | "accessDenied";

export function normalizeHouseLogin(value: string): string | null {
  const login = value.trim().replace(/^@/, "");
  return /^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i.test(login) && !login.includes("--") ? login : null;
}

/** Match real residents only; placeholder house names must never claim a login. */
export function findResidentHouse(login: string, residents: Stargazer[], count: number): number {
  return residents.slice(0, count).findIndex((resident) => resident.login.toLowerCase() === login.toLowerCase());
}

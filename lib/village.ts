import { MAX_HOUSES } from "./layout";
import type { Stargazer } from "./stargazers";

/** Reserve slot zero for the owner without changing the real GitHub star count. */
export function villageHouses(stars: number, visitors: Stargazer[] | null, ownerLogin: string) {
  const owner = visitors?.find((visitor) => visitor.login.toLowerCase() === ownerLogin.toLowerCase());
  const resident: Stargazer = { ...(owner ?? {
    login: ownerLogin,
    avatarUrl: `https://github.com/${ownerLogin}.png`,
    profileUrl: `https://github.com/${ownerLogin}`,
  }), isOwner: true };
  const guests = (visitors ?? []).filter((visitor) => visitor.login.toLowerCase() !== ownerLogin.toLowerCase());
  const count = Math.min(MAX_HOUSES, Math.max(0, Math.floor(stars)) + 1 - (owner ? 1 : 0));
  return { count: Math.max(1, count), residents: [resident, ...guests].slice(0, MAX_HOUSES) };
}

/** A configured repository selects its owner's visible house, if present. */
export function doveHouseIndex(repo: string, residents: Stargazer[] | null, count: number): number {
  const match = /^([a-z\d-]+)\/[^/\s]+$/i.exec(repo.trim());
  if (!match) return -1;
  const index = residents?.findIndex((resident) => resident.login.toLowerCase() === match[1].toLowerCase()) ?? -1;
  return index >= 0 && index < count ? index : -1;
}

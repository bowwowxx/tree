# GitHub Star Tree

A living 3D portfolio scene where a GitHub repository grows into a small treehouse village. The tracked repo's stars grow a village with a permanent owner house and houses for stargazers, up to 60 visible houses. The world reacts to live mountain weather from Gossensaß / Colle Isarco in South Tyrol.

Built as a polished real-time WebGL experience with Next.js, React Three Fiber, shader-driven weather, animated UI, and deterministic GitHub data mapping.

## Overview

GitHub Star Tree turns repository activity into a calm, explorable 3D scene:

- Stars grow the tree and determine how dense the village becomes.
- Stargazers are rendered as houses placed deterministically around the tree.
- The repository owner always has a house, even with zero stars. An owner who
  stars the repository keeps the same single house.
- House rarity is based on GitHub profile clout plus contributor status.
- The scene mirrors live weather from Gossensaß / Gemeinde Brenner.
- Night mode adds stars and a procedural moon phase.
- Users can orbit, zoom, pan, fly around, search houses, inspect profiles, and override weather for demos.

## Highlights

### Living GitHub Village

- Live stargazer count from a single configured repository.
- Deterministic layout, so houses do not reshuffle on reload.
- Per-stargazer rarity tiers using profile signals and contributor bonus.
- Profile panel with GitHub information and repository context.
- Search and highlight flow for quickly finding a house.
- Find my house: enter a GitHub username to focus its house. Missing residents
  trigger a data recheck, with messages for unavailable data and the 60-house limit.

### Real-Time Weather

The environment follows Open-Meteo data for Gossensaß / Colle Isarco:

- Temperature, humidity, pressure, visibility.
- Rain, snow, fog, storm state.
- Wind speed, gusts, and wind direction.
- Low, mid, and high cloud cover.
- Day/night lighting based on local time.
- Seasonal foliage and snow accumulation.

Weather affects lighting, fog, volumetric clouds, grass, leaves, branch sway, precipitation drift, and the overall scene mood.

### Night Sky

- GPU-friendly star field with subtle color variation and twinkle.
- Procedural moon with calculated phase, illumination, halo, and crater detail.
- Stars and moon visibility are suppressed by daylight, cloud cover, fog, and rain.
- A locally served moon albedo texture adds surface detail, with a procedural fallback if it cannot load.

### Dove and Memorial Church

The small ivory dove is a hidden memorial, tucked into the rear of the village.
Finding and clicking it opens the church of Boden as a full-screen scroll walk.
Set `DOVE_REPO=owner/repository` to put the dove on that owner's house instead.
If unset or the owner has no visible house, the original rear-platform selection
is used. Use Orbit mode to click the dove, then scroll to explore the church.
GSAP ScrollTrigger drives a camera path along the central aisle, with
quiet typography and a link to the memorial page. Reduced-motion mode
keeps the camera still. The scan, Draco decoder, and fonts are served locally;
the island pauses while the church is open and the church renders on demand.
Asset and font licenses are included with the project.

The existing memorial text and link commemorate Franz Plattner. Changing
`DOVE_REPO` only changes which house hosts the dove; it does not replace the
church scene, memorial text, or destination link.

### Performance-Focused 3D

- React Three Fiber and Drei scene composition.
- Adaptive DPR and cloud quality based on frame budget.
- Shader-driven volumetric clouds.
- Instanced or batched effects where practical.
- Reduced-quality path while camera/fly controls are moving.
- Pointer-lock fly controls for smooth movement.
- Graphics presets: Auto, Low, Medium, High, Extreme and Ultra, with an optional FPS display.

## Tech Stack

| Area | Technology |
| --- | --- |
| Framework | Next.js App Router |
| Language | TypeScript |
| UI | React, Tailwind CSS |
| 3D | Three.js, React Three Fiber, Drei |
| Animation | GSAP, React frame loops |
| Data | GitHub REST API, Open-Meteo |
| Deployment | Next.js server / Vercel; Cloudflare Workers requires additional setup |

## Project Structure

```text
app/
  layout.tsx                  Server-side owner and village configuration
  page.tsx                    Main client experience shell
  api/
    stargazers/route.ts       GitHub star + stargazer data
    weather/route.ts          Live Open-Meteo weather
    gh-user/route.ts          Profile panel data

components/
  Experience.tsx              Main R3F canvas scene
  Tree.tsx                    Tree, growth, foliage and wind response
  Houses.tsx                  Owner and stargazer houses and interactions
  FindMyHouse.tsx             Account lookup dialog
  SearchBar.tsx               House search and Find my house entry
  VillageConfig.tsx           Public scene configuration
  Dove.tsx                    Configurable dove placement
  MemorialSecret.tsx          Memorial text and scroll journey
  MemorialChurch.tsx          Boden church scan
  NightSky.tsx                Stars and procedural moon
  Weather.tsx                 Rain, snow and storm particles
  SettingsMenu.tsx            Live/manual weather and quality controls
  LoadingOverlay.tsx          Animated loading experience

lib/
  weather.ts                  Weather mapping, moon phase and scene params
  rarity.ts                   Rarity scoring
  stargazers.ts               Stargazer types and naming helpers
  growth.ts                   Visible-house count to tree growth mapping
  village.ts                  Permanent owner and visitor house mapping
  findHouse.ts                Username validation and resident lookup
  ownerHouse.ts               Procedural owner cottage geometry
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy the example environment file:

```bash
cp .env.local.example .env.local
```

For this project, configure the tracked repository and owner as follows:

```dotenv
GITHUB_REPO=bowwowxx/tree
GITHUB_USER=bowwowxx
OWNER_HOUSE_STYLE=fisherman
DOVE_REPO=bowwowxx/tree
```

These are example settings, not the application's unset defaults. Restart the
local server after changing `.env.local`. On a hosted deployment, configure
the same variables on the platform and rebuild/redeploy.

Available variables:

| Variable | Required | Description |
| --- | --- | --- |
| `GITHUB_REPO` | No | Repository to visualize. Defaults to `bowwowxx/tree`. |
| `GITHUB_TOKEN` | Yes for account mapping | Server-side token authorized for the tracked repository, from an owner/admin or collaborator account; also raises API rate limits. |
| `GITHUB_USER` | No | Permanent house owner. Defaults to the owner of `GITHUB_REPO`. |
| `OWNER_HOUSE_STYLE` | No | Owner house model: `cottage` (default) or `fisherman`. |
| `DOVE_REPO` | No | Place the dove on this repo owner's visible house; otherwise use the original placement. |
| `DEMO_STARS` | No | Fallback star count if GitHub is unavailable. |
| `NEXT_PUBLIC_DEV_CONTROLS` | No | Enables local star +/- controls for development. |

### 3. Run locally

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

If port 3000 is already in use:

```bash
npm run dev -- --port 3001
```

Then open `http://localhost:3001`.

### 4. Build

```bash
npm run build
npm run start
```

## Using the Village

### Find your house

1. Star the repository configured by `GITHUB_REPO` on GitHub.
2. Open the village and click **Find my house** below the search box.
3. Enter your GitHub username, for example `bowwowxx` or `@bowwowxx`.
4. Click **Take me home** to focus the camera on your house.

The lookup matches the full username without regard to letter case. It remembers
the last entered username on that browser; no GitHub sign-in is required.
If no visible house matches, it rechecks the star feed and displays a message
for missing houses, unavailable data, or a known resident outside the visible limit.

GitHub data refreshes on page load and every five minutes while the page is
visible. Lookup rechecks respect the same server cache, so starring the repository
and immediately clicking the button may still require waiting a few minutes.
The feature does not bypass the 60-house limit. If GitHub rejects access to the
star list, the site shows an authorization notice instead of silently implying
that no one has starred the repository. The star count can remain visible even
when account names cannot be fetched.
Unmapped houses are labeled `Account pending #N`; these labels are not GitHub
usernames and do not link to a fabricated GitHub profile.

GitHub restricted stargazer-list access to repository admins and collaborators in
2026. Authorize `GITHUB_TOKEN` for the repository selected by `GITHUB_REPO`.
See [GitHub’s access restriction announcement](https://github.blog/changelog/2026-06-30-upcoming-access-restrictions-to-public-api-endpoints-and-ui-views/).

### Permanent owner house

The account configured by `GITHUB_USER` always occupies the first house slot,
even with zero stars. If unset, the owner is taken from `GITHUB_REPO`. If that
account also stars the repository, it retains one house rather than receiving a
second one. The displayed GitHub star count is not increased by the owner house.

Choose the owner's appearance with `OWNER_HOUSE_STYLE`:

| Value | Appearance |
| --- | --- |
| `fisherman` | Fisherman Market from the existing village model pack, sized for the owner platform. |
| `cottage` | Cream walls, green pitched roof, flower boxes, porch and warm window light at night. This is the unset default. |

The owner's model choice is separate from GitHub rarity scoring. Visitor models
remain Carrot Farm, Fisherman Market, Forge House and Barracks, according to their tier.

### Find and click the dove

With `DOVE_REPO=bowwowxx/tree`, the dove sits on the `bowwowxx` house's
outer railing. Only the repository's owner portion selects the house; this
setting does not change the repository whose stars populate the village.

If `DOVE_REPO` is unset, invalid, or its owner has no visible house, the original
placement is used: a rear-facing platform near mid-trunk height when at least two
houses are visible, otherwise a small rear branch.

Use **Orbit** mode, rotate to the dove's side of the tree, zoom in and click it.
Dove clicks are disabled in Fly and Walk modes. Scroll inside the church to move
along the aisle. Press Escape or the top-right **Zurück zur Insel** button to return.

### Graphics and movement

Open Settings to select a graphics preset or enable the FPS display. Auto runs a
local graphics benchmark; Low and Medium can reduce rendering cost. Adaptive
resolution and cloud detail adjustments run automatically.

Orbit mode supports rotating, zooming and panning. On desktop, Fly and Walk use
WASD and mouse look; Escape releases pointer lock. Walk also supports Space to jump.

## License

This repository is a personal portfolio project. Check individual model licenses in `CREDITS.md` before reusing assets.

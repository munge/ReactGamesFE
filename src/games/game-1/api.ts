/**
 * Game 1 — data loader.
 * Called by the React Router loader in src/games/registry.ts before the route renders.
 * Return type is available via useLoaderData() inside Game1.
 */

export interface Game1LoaderData {
  // Define your loader data shape here
}

export async function game1Loader(): Promise<Game1LoaderData> {
  // Fetch from import.meta.env.VITE_API_URL if needed
  return {}
}

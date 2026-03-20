/**
 * Game 2 — data loader.
 * Called by the React Router loader in src/games/registry.ts before the route renders.
 * Return type is available via useLoaderData() inside Game2.
 */

export interface Game2LoaderData {
  // Define your loader data shape here
}

export async function game2Loader(): Promise<Game2LoaderData> {
  // Fetch from import.meta.env.VITE_API_URL if needed
  return {}
}

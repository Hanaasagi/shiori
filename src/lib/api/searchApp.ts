import { invoke } from "@tauri-apps/api/core";

export interface DesktopEntry {
  id: string;
  name: string;
  lower_name: string;
  type: string | null;
  categories: string[];
  keywords: string[];
  comment: string | null;
  exec: string | null;
  path: string;
  iconPath: string | null;
}

export async function listApplications(
  query: string | null,
  offset: number,
  limit: number = 10,
): Promise<DesktopEntry[]> {
  return await invoke<DesktopEntry[]>("list_applications", {
    query,
    offset: offset,
    limit: limit,
  });
}

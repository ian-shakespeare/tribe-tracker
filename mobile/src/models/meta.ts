import DB from "../db";

export async function getDatabaseSize(): Promise<
  { success: true; size: number } | { success: false; error: Error }
> {
  const query = `
  SELECT page_count * page_size AS size
  FROM pragma_page_count(),
    pragma_page_size()
  `;

  const result = await DB.getFirstAsync<{ size: number }>(query);
  if (!result) {
    return { success: false, error: new Error("Failed to get database size.") };
  }

  return { success: true, size: result.size };
}

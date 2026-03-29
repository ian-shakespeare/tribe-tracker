import DB from "../db";

export type Location = {
  id: string;
  user: string;
  lat: number;
  lon: number;
  createdAt: Date;
};

export async function upsertLocations(locations: Location[]) {
  const statement = await DB.prepareAsync(`
  INSERT INTO locations (
    id,
    user,
    lat,
    lon,
    createdAt
  ) VALUES (
    $id, $user, $lat, $lon, $createdAt
  )
  ON CONFLICT (ID)
  DO UPDATE SET lat = excluded.lat,
    lon = excluded.lon
  `);

  await Promise.all(
    locations.map(({ id, user, lat, lon, createdAt }) =>
      statement.executeAsync({
        $id: id,
        $user: user,
        $lat: lat,
        $lon: lon,
        $createdAt: createdAt.toISOString(),
      }),
    ),
  );

  await statement.finalizeAsync();
}

export async function deleteAllLocations() {
  await DB.runAsync("DELETE FROM locations");
}

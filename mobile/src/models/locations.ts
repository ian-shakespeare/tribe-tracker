import DB from "../db";

export type Location = {
  id: string;
  user: string;
  coordinates: { lat: number; lon: number };
  createdAt: Date;
};

export async function createLocations(locations: Location[]) {
  const statement = await DB.prepareAsync(`
  INSERT INTO locations (
    id,
    user,
    coordinates,
    createdAt
  ) VALUES (
    $id, $user, $coordinates, $createdAt
  )
  `);

  await Promise.all(
    locations.map(({ id, user, coordinates, createdAt }) =>
      statement.executeAsync({
        $id: id,
        $user: user,
        $coordinates: JSON.stringify(coordinates),
        $createdAt: createdAt.toISOString(),
      }),
    ),
  );

  await statement.finalizeAsync();
}

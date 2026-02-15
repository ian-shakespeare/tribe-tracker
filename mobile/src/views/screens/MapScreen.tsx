import PlatformMap from "../components/PlatformMap";
import { useLiveQuery } from "../../db/liveQuery";
import { getUserLocations } from "../../models/user";
import { toTitleCase } from "../../utils/strings";

export default function MapScreen() {
  const query = useLiveQuery(getUserLocations);

  // TODO: post user location somewhere

  return (
    <PlatformMap
      markers={
        query.isLoading
          ? []
          : query.result.map(({ firstName, lastName, coordinates }) => ({
              title: toTitleCase(`${firstName} ${lastName}`),
              coordinates: {
                latitude: coordinates.lat,
                longitude: coordinates.lon,
              },
            }))
      }
    />
  );
}

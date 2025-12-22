import PlatformMap from "../components/PlatformMap";
import { toTitleCase } from "../lib/strings";
import { useLocations } from "../contexts/Locations";

export default function MapScreen() {
  const { locations } = useLocations();

  return (
    <PlatformMap
      markers={locations.map(({ firstName, lastName, coordinates }) => ({
        title: toTitleCase(`${firstName} ${lastName}`),
        coordinates,
      }))}
    />
  );
}

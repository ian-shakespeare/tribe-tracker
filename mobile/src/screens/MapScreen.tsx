import { useEffect, useState } from "react";
import PlatformMap from "../components/PlatformMap";
import { MemberLocations } from "../lib/models";
import * as SecureStore from "expo-secure-store";
import { SELECTED_FAMILY_KEY } from "../lib/constants";
import { pb } from "../lib";
import { toTitleCase } from "../lib/strings";

export default function MapScreen() {
  const [memberLocations, setMemberLocations] = useState<MemberLocations[]>([]);

  /*
   * TODO:
   * - move the set family stuff into a context so it updates live
   * - pull member locations on an interval
   * - move pocketbase calls to separate functions so they're easier to change
   */

  useEffect(() => {
    const selectedFamily = SecureStore.getItem(SELECTED_FAMILY_KEY);
    if (!selectedFamily) return; // TODO: toast something here

    pb.send<MemberLocations[]>(
      `/mobile/families/${selectedFamily}/members/locations`,
      {},
    ).then(setMemberLocations);
  }, []);

  return (
    <PlatformMap
      markers={memberLocations.map(({ firstName, lastName, coordinates }) => ({
        title: toTitleCase(`${firstName} ${lastName}`),
        coordinates,
      }))}
    />
  );
}

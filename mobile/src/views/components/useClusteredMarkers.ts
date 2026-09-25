import { useMemo } from "react";
import Supercluster from "supercluster";
import type { Feature, Point } from "geojson";
import type { UserLocation } from "../../models/user";
import { toTitleCase } from "../../utils/strings";

const WORLD_BBOX: [number, number, number, number] = [-180, -85, 180, 85];

// Supercluster expects an integer zoom level.
const MAX_ZOOM = 20;

type UserLocationProperties = {
  userLocation: UserLocation;
};

export type ClusterMarker = {
  kind: "cluster";
  id: string;
  clusterId: number;
  title: string;
  coordinates: { latitude: number; longitude: number };
  count: number;
};

export type UserMarker = {
  kind: "user";
  id: string;
  title: string;
  coordinates: { latitude: number; longitude: number };
  userLocation: UserLocation;
};

export type ClusteredMarker = ClusterMarker | UserMarker;

/**
 * Groups nearby user locations into clusters based on the current map zoom
 * level, using screen-pixel proximity (via supercluster) rather than raw
 * lat/lon distance. As the user zooms in, clusters automatically split back
 * into individual markers.
 */
export function useClusteredMarkers(
  userLocations: UserLocation[],
  zoom: number,
) {
  const index = useMemo(() => {
    const cluster = new Supercluster<UserLocationProperties>({
      radius: 50,
      maxZoom: MAX_ZOOM,
    });

    const points: Feature<Point, UserLocationProperties>[] = userLocations.map(
      (userLocation) => ({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [userLocation.lon, userLocation.lat],
        },
        properties: { userLocation },
      }),
    );

    cluster.load(points);

    return cluster;
  }, [userLocations]);

  const markers = useMemo<ClusteredMarker[]>(() => {
    const integerZoom = Math.min(Math.max(Math.round(zoom), 0), MAX_ZOOM);
    const clusters = index.getClusters(WORLD_BBOX, integerZoom);

    return clusters.map((feature) => {
      const [longitude, latitude] = feature.geometry.coordinates;

      if ("cluster" in feature.properties && feature.properties.cluster) {
        const count = feature.properties.point_count;

        return {
          kind: "cluster",
          id: `cluster-${feature.properties.cluster_id}`,
          clusterId: feature.properties.cluster_id,
          title: `${count} People`,
          coordinates: { latitude, longitude },
          count,
        };
      }

      const { userLocation } = feature.properties;

      return {
        kind: "user",
        id: userLocation.id,
        title: toTitleCase(
          `${userLocation.firstName} ${userLocation.lastName}`,
        ),
        coordinates: { latitude, longitude },
        userLocation,
      };
    });
  }, [index, zoom]);

  function getUserLocationsInCluster(clusterId: number): UserLocation[] {
    return index
      .getLeaves(clusterId, Infinity)
      .map((leaf) => leaf.properties.userLocation);
  }

  return { markers, getUserLocationsInCluster };
}

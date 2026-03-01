import * as TaskManager from "expo-task-manager";
import * as Location from "expo-location";
import * as API from "../controllers/api";

const TASK_NAME = "BACKGROUND_LOCATION_TASK";

TaskManager.defineTask(TASK_NAME, async ({ data, error }) => {
  if (error) {
    return;
  }

  if (!API.isSignedIn()) {
    return;
  }

  const { locations } = data as { locations: Location.LocationObject[] };
  if (!locations || locations.length === 0) {
    return;
  }

  // Use the most recent location from the batch
  const latest = locations[locations.length - 1];
  const { latitude, longitude } = latest.coords;

  await API.createLocation(latitude, longitude).catch(() => {
    /* couldn't reach the server */
  });
});

export async function startBackgroundTracking(): Promise<boolean> {
  const { status: foreground } =
    await Location.requestForegroundPermissionsAsync();
  if (foreground !== "granted") {
    return false;
  }

  const { status: background } =
    await Location.requestBackgroundPermissionsAsync();
  if (background !== "granted") {
    return false;
  }

  const isActive = await Location.hasStartedLocationUpdatesAsync(TASK_NAME);
  if (isActive) {
    return true;
  }

  await Location.startLocationUpdatesAsync(TASK_NAME, {
    accuracy: Location.LocationAccuracy.Balanced,
    distanceInterval: 500,
    timeInterval: 15 * 60 * 1000, // 15 minutes
    deferredUpdatesInterval: 15 * 60 * 1000,
    showsBackgroundLocationIndicator: false,
    foregroundService: {
      notificationTitle: "Tribe Tracker",
      notificationBody: "Tracking your location in the background.",
      notificationColor: "#1A2138",
    },
  });

  return true;
}

export async function stopBackgroundTracking(): Promise<void> {
  const isActive = await Location.hasStartedLocationUpdatesAsync(TASK_NAME);
  if (isActive) {
    await Location.stopLocationUpdatesAsync(TASK_NAME);
  }
}

export async function isTrackingActive(): Promise<boolean> {
  return await Location.hasStartedLocationUpdatesAsync(TASK_NAME);
}

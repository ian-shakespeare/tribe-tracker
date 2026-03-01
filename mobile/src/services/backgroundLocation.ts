import * as TaskManager from "expo-task-manager";
import * as Location from "expo-location";
import { createLocation, isSignedIn } from "../controllers/api";
import { logger } from "react-native-logs";

const log = logger.createLogger();

const TASK_NAME = "BACKGROUND_LOCATION_TASK";

TaskManager.defineTask(TASK_NAME, async ({ data, error }) => {
  if (error) {
    log.warn("Background location task error:", error.message);
    return;
  }

  if (!isSignedIn()) {
    return;
  }

  const { locations } = data as { locations: Location.LocationObject[] };
  if (!locations || locations.length === 0) {
    return;
  }

  // Use the most recent location from the batch
  const latest = locations[locations.length - 1];
  const { latitude, longitude } = latest.coords;

  try {
    await createLocation(latitude, longitude);
  } catch {
    // Discard on failure -- no offline queueing
    log.warn("Background location push failed, discarding.");
  }
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

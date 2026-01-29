// apps/mobile/hooks/use-ota-updates.ts
// Hook for managing EAS OTA (Over-The-Air) updates
// Automatically checks for updates on app launch and periodically

import * as Updates from "expo-updates";
import { useCallback, useEffect, useState } from "react";
import { AppState, type AppStateStatus } from "react-native";

export type UpdateStatus =
	| "checking"
	| "available"
	| "downloading"
	| "ready"
	| "up-to-date"
	| "error";

export type UseOTAUpdatesReturn = {
	// Status
	status: UpdateStatus;
	isUpdateAvailable: boolean;
	isUpdatePending: boolean;
	isChecking: boolean;
	isDownloading: boolean;

	// Update info
	updateId: string | null;

	// Actions
	checkForUpdate: () => Promise<void>;
	downloadUpdate: () => Promise<void>;
	applyUpdate: () => Promise<void>;

	// Error
	error: Error | null;
};

// Configuration
const CHECK_INTERVAL_MS = 5 * 60 * 1000; // Check every 5 minutes
const CHECK_ON_FOREGROUND = true; // Check when app comes to foreground

export function useOTAUpdates(): UseOTAUpdatesReturn {
	// Status state
	const [status, setStatus] = useState<UpdateStatus>("up-to-date");
	const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
	const [isUpdatePending, setIsUpdatePending] = useState(false);

	// Update info
	const [updateId, setUpdateId] = useState<string | null>(null);

	// Error state
	const [error, setError] = useState<Error | null>(null);

	// Check for updates
	const checkForUpdate = useCallback(async () => {
		// Skip if in development mode
		if (__DEV__) {
			console.log("[OTA] Skipping check in development mode");
			return;
		}

		try {
			setStatus("checking");
			setError(null);

			console.log("[OTA] Checking for updates...");
			const update = await Updates.checkForUpdateAsync();

			if (update.isAvailable) {
				console.log("[OTA] Update available");
				setStatus("available");
				setIsUpdateAvailable(true);
				setUpdateId(update.manifest?.id?.slice(0, 8) || null);
			} else {
				console.log("[OTA] App is up to date");
				setStatus("up-to-date");
				setIsUpdateAvailable(false);
			}
		} catch (err) {
			console.error("[OTA] Error checking for updates:", err);
			setStatus("error");
			setError(err instanceof Error ? err : new Error(String(err)));
		}
	}, []);

	// Download update
	const downloadUpdate = useCallback(async () => {
		if (__DEV__) {
			console.log("[OTA] Skipping download in development mode");
			return;
		}

		if (!isUpdateAvailable) {
			console.log("[OTA] No update available to download");
			return;
		}

		try {
			setStatus("downloading");
			setError(null);

			console.log("[OTA] Downloading update...");
			await Updates.fetchUpdateAsync();

			console.log("[OTA] Update downloaded and ready");
			setStatus("ready");
			setIsUpdatePending(true);
			setIsUpdateAvailable(false);
		} catch (err) {
			console.error("[OTA] Error downloading update:", err);
			setStatus("error");
			setError(err instanceof Error ? err : new Error(String(err)));
		}
	}, [isUpdateAvailable]);

	// Apply update (reloads the app)
	const applyUpdate = useCallback(async () => {
		if (__DEV__) {
			console.log("[OTA] Skipping apply in development mode");
			return;
		}

		if (!isUpdatePending) {
			console.log("[OTA] No pending update to apply");
			return;
		}

		try {
			console.log("[OTA] Applying update and reloading...");
			await Updates.reloadAsync();
		} catch (err) {
			console.error("[OTA] Error applying update:", err);
			setStatus("error");
			setError(err instanceof Error ? err : new Error(String(err)));
		}
	}, [isUpdatePending]);

	// Check on mount
	useEffect(() => {
		// Initial check after a short delay (let app finish loading)
		const initialCheckTimeout = setTimeout(() => {
			checkForUpdate();
		}, 3000);

		return () => clearTimeout(initialCheckTimeout);
	}, [checkForUpdate]);

	// Periodic checks
	useEffect(() => {
		if (__DEV__) return;

		const interval = setInterval(() => {
			checkForUpdate();
		}, CHECK_INTERVAL_MS);

		return () => clearInterval(interval);
	}, [checkForUpdate]);

	// Check when app comes to foreground
	useEffect(() => {
		if (__DEV__ || !CHECK_ON_FOREGROUND) return;

		const subscription = AppState.addEventListener(
			"change",
			(nextAppState: AppStateStatus) => {
				if (nextAppState === "active") {
					console.log("[OTA] App came to foreground, checking for updates...");
					checkForUpdate();
				}
			},
		);

		return () => subscription.remove();
	}, [checkForUpdate]);

	return {
		// Status
		status,
		isUpdateAvailable,
		isUpdatePending,
		isChecking: status === "checking",
		isDownloading: status === "downloading",

		// Update info
		updateId,

		// Actions
		checkForUpdate,
		downloadUpdate,
		applyUpdate,

		// Error
		error,
	};
}

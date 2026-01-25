// plugins/withCarPlay.js
// Expo config plugin to enable CarPlay for navigation apps

const {
	withInfoPlist,
	withEntitlementsPlist,
	withXcodeProject,
} = require("@expo/config-plugins");

/**
 * Add CarPlay capabilities to iOS app
 * This plugin configures:
 * 1. Info.plist with background modes for CarPlay
 * 2. Entitlements with CarPlay navigation entitlement
 *
 * Note: Scene-based lifecycle is NOT used because Expo dev client
 * uses AppDelegate-based lifecycle. CarPlay integration will use
 * the traditional CPApplicationDelegate approach instead.
 */
function withCarPlay(config) {
	// Step 1: Configure Info.plist
	config = withInfoPlist(config, (config) => {
		// Remove any scene manifest that might break AppDelegate lifecycle
		// Expo dev client requires AppDelegate-based lifecycle
		delete config.modResults.UIApplicationSceneManifest;

		// Ensure background modes include audio for voice guidance
		const existingModes = config.modResults.UIBackgroundModes || [];
		const requiredModes = ["audio", "location", "fetch", "remote-notification"];

		for (const mode of requiredModes) {
			if (!existingModes.includes(mode)) {
				existingModes.push(mode);
			}
		}
		config.modResults.UIBackgroundModes = existingModes;

		// Add CarPlay capability declaration
		config.modResults.UIRequiredDeviceCapabilities =
			config.modResults.UIRequiredDeviceCapabilities || [];

		return config;
	});

	// Step 2: Configure Entitlements
	config = withEntitlementsPlist(config, (config) => {
		// Add CarPlay navigation entitlement
		// Note: This requires Apple approval for navigation apps
		config.modResults["com.apple.developer.carplay-navigation"] = true;

		// Alternative: Use carplay-audio if you only need audio/voice guidance
		// config.modResults["com.apple.developer.carplay-audio"] = true;

		return config;
	});

	return config;
}

module.exports = withCarPlay;

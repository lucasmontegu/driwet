// apps/mobile/app/(auth)/onboarding/signup.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { SignupScreen } from "@/components/onboarding";

const ONBOARDING_COMPLETE_KEY = "@driwet/onboarding-v2-complete";

export default function SignupRoute() {
	const router = useRouter();

	const handleCreateAccount = () => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		router.replace("/(auth)/sign-in");
	};

	const handleContinueAsGuest = async () => {
		try {
			await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, "true");
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
			router.replace("/(app)/(tabs)");
		} catch (error) {
			console.error("Failed to save onboarding state:", error);
			// Still proceed
			router.replace("/(app)/(tabs)");
		}
	};

	return (
		<View style={styles.container}>
			<SignupScreen
				onCreateAccount={handleCreateAccount}
				onContinueAsGuest={handleContinueAsGuest}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});

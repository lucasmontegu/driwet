// apps/mobile/app/(auth)/onboarding/hook.tsx

import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { HookScreen } from "@/components/onboarding";

export default function HookRoute() {
	const router = useRouter();

	const handleComplete = () => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		router.push("/onboarding/promise");
	};

	return (
		<Animated.View entering={FadeIn.duration(400)} style={styles.container}>
			<Pressable onPress={handleComplete} style={styles.pressable}>
				<HookScreen onComplete={handleComplete} />
			</Pressable>
		</Animated.View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	pressable: {
		flex: 1,
	},
});

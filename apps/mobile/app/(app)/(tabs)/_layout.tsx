import { Tabs, usePathname, useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { BottomTabBar } from "@/components/navigation/bottom-tab-bar";

export default function TabLayout() {
	const router = useRouter();
	const pathname = usePathname();

	const getActiveRoute = () => {
		if (pathname.includes("/alerts")) return "alerts";
		if (pathname.includes("/routes")) return "routes";
		if (pathname.includes("/profile")) return "profile";
		return "(tabs)";
	};

	const activeRoute = getActiveRoute();

	const handleTabPress = (route: string) => {
		if (route === "(tabs)") {
			router.push("/");
		} else if (route === "alerts") {
			router.push("/alerts");
		} else if (route === "routes") {
			router.push("/routes");
		} else if (route === "profile") {
			router.push("/profile");
		}
	};

	return (
		<View style={styles.container}>
			<Tabs
				screenOptions={{
					headerShown: false,
					tabBarStyle: {
						display: "none",
					},
				}}
			>
				<Tabs.Screen name="index" options={{ title: "Mapa" }} />
				<Tabs.Screen name="alerts" options={{ title: "Alertas" }} />
				<Tabs.Screen name="routes" options={{ title: "Rutas" }} />
				<Tabs.Screen name="profile" options={{ title: "Perfil" }} />
			</Tabs>

			<BottomTabBar activeRoute={activeRoute} onTabPress={handleTabPress} />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});

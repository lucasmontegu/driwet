// apps/mobile/components/provider-guard.tsx
// Guards against rendering when providers aren't ready (React Compiler + Fast Refresh issue)

import { createContext, type ReactNode, useContext } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

// Create a simple context to check if we're inside the provider tree
const ProviderCheckContext = createContext<boolean>(false);

export function ProviderCheckProvider({ children }: { children: ReactNode }) {
	return (
		<ProviderCheckContext.Provider value={true}>
			{children}
		</ProviderCheckContext.Provider>
	);
}

export function useProvidersReady(): boolean {
	return useContext(ProviderCheckContext);
}

type ProviderGuardProps = {
	children: ReactNode;
	fallback?: ReactNode;
};

export function ProviderGuard({ children, fallback }: ProviderGuardProps) {
	const isReady = useProvidersReady();

	if (!isReady) {
		if (fallback) {
			return <>{fallback}</>;
		}

		return (
			<View style={styles.container}>
				<ActivityIndicator size="large" color="#0936d6" />
			</View>
		);
	}

	return <>{children}</>;
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#000",
	},
});

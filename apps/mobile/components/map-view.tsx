import Mapbox, { Camera, LocationPuck, MapView as RNMapView, PointAnnotation, UserTrackingMode } from "@rnmapbox/maps";
import { useEffect, useState, useCallback } from "react";
import { StyleSheet, View, type LayoutChangeEvent, ActivityIndicator } from "react-native";

import { env } from "@driwet/env/mobile";
import { useLocation } from "@/hooks/use-location";
import { useThemeColors } from "@/hooks/use-theme-colors";

// Initialize Mapbox with access token
Mapbox.setAccessToken(env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN);

export type WeatherAlert = {
  id: string;
  type: string;
  severity: "extreme" | "severe" | "moderate" | "minor";
  headline?: string;
  polygon: {
    type: "Polygon";
    coordinates: number[][][];
  } | null;
};

type MapViewProps = {
  alerts?: WeatherAlert[];
  onMapReady?: () => void;
};

const SEVERITY_COLORS = {
  extreme: "rgba(220, 38, 38, 0.4)", // red
  severe: "rgba(249, 115, 22, 0.4)", // orange
  moderate: "rgba(234, 179, 8, 0.4)", // yellow
  minor: "rgba(34, 197, 94, 0.4)", // green
};

const SEVERITY_STROKE_COLORS = {
  extreme: "rgba(220, 38, 38, 0.8)",
  severe: "rgba(249, 115, 22, 0.8)",
  moderate: "rgba(234, 179, 8, 0.8)",
  minor: "rgba(34, 197, 94, 0.8)",
};

// Minimum dimensions to render the map (avoid "Invalid size" error)
const MIN_MAP_DIMENSION = 100;

export function MapViewComponent({ alerts = [], onMapReady }: MapViewProps) {
  const { location } = useLocation();
  const colors = useThemeColors();
  const [mapLoaded, setMapLoaded] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const initialCenter = location
    ? [location.longitude, location.latitude]
    : [-64.18, -31.42]; // Default: Córdoba, Argentina

  // Track container dimensions to avoid "Invalid size" error
  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setDimensions({ width, height });
  }, []);

  const hasValidDimensions = dimensions.width >= MIN_MAP_DIMENSION && dimensions.height >= MIN_MAP_DIMENSION;

  useEffect(() => {
    if (mapLoaded && onMapReady) {
      onMapReady();
    }
  }, [mapLoaded, onMapReady]);

  return (
    <View style={styles.container} onLayout={handleLayout}>
      {!hasValidDimensions ? (
        <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
      <RNMapView
        style={styles.map}
        styleURL={Mapbox.StyleURL.Dark}
        logoEnabled={false}
        attributionEnabled={false}
        scaleBarEnabled={false}
        zoomEnabled={true}
        scrollEnabled={true}
        rotateEnabled={true}
        pitchEnabled={true}
        onDidFinishLoadingMap={() => setMapLoaded(true)}
      >
        <Camera
          zoomLevel={14}
          centerCoordinate={location ? [location.longitude, location.latitude] : initialCenter}
          followUserLocation={!!location}
          followUserMode={UserTrackingMode.Follow}
          animationMode="flyTo"
          animationDuration={1000}
        />

        {/* User location puck */}
        <LocationPuck
          puckBearing="heading"
          puckBearingEnabled
          pulsing={{ isEnabled: true, color: "#3b82f6", radius: 50 }}
        />

        {/* Alert polygons */}
        {alerts
          .filter((alert) => alert.polygon !== null)
          .map((alert) => (
            <Mapbox.ShapeSource
              key={alert.id}
              id={`alert-source-${alert.id}`}
              shape={{
                type: "Feature",
                geometry: alert.polygon!,
                properties: {
                  severity: alert.severity,
                  type: alert.type,
                },
              }}
            >
              <Mapbox.FillLayer
                id={`alert-fill-${alert.id}`}
                style={{
                  fillColor: SEVERITY_COLORS[alert.severity],
                  fillOpacity: 0.6,
                }}
              />
              <Mapbox.LineLayer
                id={`alert-line-${alert.id}`}
                style={{
                  lineColor: SEVERITY_STROKE_COLORS[alert.severity],
                  lineWidth: 2,
                }}
              />
            </Mapbox.ShapeSource>
          ))}

        {/* Alert Markers */}
        {alerts
            .filter((alert) => alert.polygon)
            .map((alert) => {
              // Simple centroid approximation for marker placement
               const coordinates = alert.polygon?.coordinates[0][0];
               if(!coordinates) return null;

               return (
                <PointAnnotation
                  key={`marker-${alert.id}`}
                  id={`marker-${alert.id}`}
                  coordinate={coordinates}
                >
                  <View style={{ 
                    width: 30, 
                    height: 30, 
                    borderRadius: 15, 
                    backgroundColor: SEVERITY_COLORS[alert.severity],
                    borderColor: "white",
                    borderWidth: 2,
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                    <View style={{
                      width: 10,
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: SEVERITY_STROKE_COLORS[alert.severity]
                    }} />
                  </View>
                </PointAnnotation>
               )
            })
        }
      </RNMapView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

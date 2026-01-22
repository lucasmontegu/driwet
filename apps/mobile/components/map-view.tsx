import Mapbox, { Camera, LocationPuck, MapView as RNMapView, PointAnnotation, UserTrackingMode } from "@rnmapbox/maps";
import { useEffect, useState, useCallback } from "react";
import { StyleSheet, View, type LayoutChangeEvent, ActivityIndicator } from "react-native";

import { env } from "@driwet/env/mobile";
import { useLocation } from "@/hooks/use-location";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { RouteWeatherLayer } from "./route-weather-layer";
import type { RouteWeatherSegment } from "@/hooks/use-route-weather";

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
  /** Route weather segments for colored route display */
  routeSegments?: RouteWeatherSegment[];
  /** Whether to show weather icons along the route */
  showRouteIcons?: boolean;
  /** Destination coordinates for camera fitting */
  destination?: { latitude: number; longitude: number };
  /** Callback when map is ready */
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

export function MapViewComponent({
  alerts = [],
  routeSegments = [],
  showRouteIcons = true,
  destination,
  onMapReady,
}: MapViewProps) {
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

  // Calculate bounds to fit both origin and destination if route is displayed
  const cameraBounds = useCallback(() => {
    if (destination && location) {
      const minLng = Math.min(location.longitude, destination.longitude);
      const maxLng = Math.max(location.longitude, destination.longitude);
      const minLat = Math.min(location.latitude, destination.latitude);
      const maxLat = Math.max(location.latitude, destination.latitude);

      // Add padding
      const padding = 0.1;
      return {
        ne: [maxLng + padding, maxLat + padding] as [number, number],
        sw: [minLng - padding, minLat - padding] as [number, number],
      };
    }
    return null;
  }, [destination, location]);

  useEffect(() => {
    if (mapLoaded && onMapReady) {
      onMapReady();
    }
  }, [mapLoaded, onMapReady]);

  const bounds = cameraBounds();
  const hasRoute = routeSegments.length > 0;

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
        {/* Camera - either follow user or fit to route bounds */}
        {bounds && hasRoute ? (
          <Camera
            bounds={bounds}
            padding={{ paddingTop: 80, paddingBottom: 200, paddingLeft: 40, paddingRight: 40 }}
            animationMode="flyTo"
            animationDuration={1500}
          />
        ) : (
          <Camera
            zoomLevel={14}
            centerCoordinate={location ? [location.longitude, location.latitude] : initialCenter}
            followUserLocation={!!location && !hasRoute}
            followUserMode={UserTrackingMode.Follow}
            animationMode="flyTo"
            animationDuration={1000}
          />
        )}

        {/* User location puck */}
        <LocationPuck
          puckBearing="heading"
          puckBearingEnabled
          pulsing={{ isEnabled: true, color: "#3b82f6", radius: 50 }}
        />

        {/* Route weather layer - colored segments based on risk */}
        {routeSegments.length > 0 && (
          <RouteWeatherLayer
            segments={routeSegments}
            showIcons={showRouteIcons}
            lineWidth={6}
          />
        )}

        {/* Destination marker */}
        {destination && (
          <PointAnnotation
            id="destination-marker"
            coordinate={[destination.longitude, destination.latitude]}
          >
            <View style={styles.destinationMarker}>
              <View style={styles.destinationMarkerInner} />
            </View>
          </PointAnnotation>
        )}

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
  destinationMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#ef4444",
    borderColor: "#ffffff",
    borderWidth: 3,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  destinationMarkerInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ffffff",
  },
});

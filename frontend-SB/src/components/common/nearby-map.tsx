import { useCallback, useState } from "react";
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF } from "@react-google-maps/api";
import { Loader2, MapPin, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Restaurant } from "@/types";

const MAPS_LIBRARIES: ("places" | "geometry" | "drawing")[] = ["places"];

const mapContainerStyle = {
  width: "100%",
  height: "400px",
  borderRadius: "16px",
};

const defaultCenter = { lat: 28.6139, lng: 77.209 };

function getScoreColor(score: number | string): string {
  const num = Number(score) || 0;
  if (num >= 80 || num >= 8) return "#16A34A";
  if (num >= 60 || num >= 6) return "#22C55E";
  if (num >= 40 || num >= 4) return "#EAB308";
  return "#EF4444";
}

interface NearbyMapProps {
  restaurants: Restaurant[];
  userLat?: number;
  userLng?: number;
  className?: string;
}

export default function NearbyMap({
  restaurants,
  userLat,
  userLng,
  className = "",
}: NearbyMapProps) {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string | number | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
    libraries: MAPS_LIBRARIES,
  });

  const center =
    userLat && userLng
      ? { lat: userLat, lng: userLng }
      : restaurants.length > 0
        ? { lat: restaurants[0].latitude, lng: restaurants[0].longitude }
        : defaultCenter;

  const handleMarkerClick = useCallback((id: string | number) => {
    setSelectedId(id);
  }, []);

  const handleInfoWindowClose = useCallback(() => {
    setSelectedId(null);
  }, []);

  if (!isLoaded) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-2xl border border-slate-200 bg-slate-50">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
          <p className="text-xs text-slate-400">Loading map...</p>
        </div>
      </div>
    );
  }

  if (!import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-2xl border border-slate-200 bg-slate-50">
        <div className="flex flex-col items-center gap-2 text-center px-4">
          <MapPin className="h-8 w-8 text-slate-300" />
          <p className="text-sm text-slate-500 font-medium">Google Maps not available</p>
          <p className="text-xs text-slate-400">Configure VITE_GOOGLE_MAPS_API_KEY</p>
        </div>
      </div>
    );
  }

  const selectedRestaurant = restaurants.find((r) => String(r.id) === String(selectedId));

  return (
    <div className={className}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={restaurants.length > 0 ? 13 : 11}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
        }}
      >
        {restaurants.map((restaurant) => (
          <MarkerF
            key={restaurant.id}
            position={{ lat: restaurant.latitude, lng: restaurant.longitude }}
            onClick={() => handleMarkerClick(restaurant.id)}
            label={{
              text: (Number(restaurant.safety_score) || 0).toFixed(0),
              color: "#ffffff",
              fontSize: "10px",
              fontWeight: "bold",
            }}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 14,
              fillColor: getScoreColor(restaurant.safety_score),
              fillOpacity: 0.9,
              strokeColor: "#ffffff",
              strokeWeight: 2,
            }}
          />
        ))}

        {selectedRestaurant && (
          <InfoWindowF
            position={{
              lat: selectedRestaurant.latitude,
              lng: selectedRestaurant.longitude,
            }}
            onCloseClick={handleInfoWindowClose}
          >
            <div className="p-1 min-w-[180px]">
              <p className="font-semibold text-sm text-slate-800 truncate">
                {selectedRestaurant.name}
              </p>
              <p className="text-xs text-slate-500 truncate mt-0.5">
                {selectedRestaurant.address}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <div
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-white"
                  style={{ backgroundColor: getScoreColor(selectedRestaurant.safety_score) }}
                >
                  <ShieldCheck size={10} />
                  {(Number(selectedRestaurant.safety_score) || 0).toFixed(1)}
                </div>
                {selectedRestaurant.is_high_risk && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                    High Risk
                  </span>
                )}
              </div>
              <button
                onClick={() =>
                  navigate(`/restaurant/${selectedRestaurant.id}`)
                }
                className="mt-2 text-xs text-emerald-600 hover:text-emerald-700 font-medium"
              >
                View Details →
              </button>
            </div>
          </InfoWindowF>
        )}
      </GoogleMap>
    </div>
  );
}

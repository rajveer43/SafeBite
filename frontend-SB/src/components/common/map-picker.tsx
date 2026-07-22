import { useCallback, useState } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  MarkerF,
  Autocomplete,
} from "@react-google-maps/api";
import { MapPin, Loader2 } from "lucide-react";
import Input from "@/components/ui/input";

const MAPS_LIBRARIES: ("places" | "geometry" | "drawing")[] = ["places"];

const defaultCenter = { lat: 28.6139, lng: 77.209 };

const mapContainerStyle = {
  width: "100%",
  height: "300px",
  borderRadius: "16px",
};

interface MapPickerProps {
  latitude?: number;
  longitude?: number;
  onChange: (lat: number, lng: number, address?: string) => void;
  className?: string;
}

export default function MapPicker({
  latitude,
  longitude,
  onChange,
  className = "",
}: MapPickerProps) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
    libraries: MAPS_LIBRARIES,
  });

  const [position, setPosition] = useState<google.maps.LatLngLiteral>(
    latitude && longitude ? { lat: latitude, lng: longitude } : defaultCenter
  );
  const [searchValue, setSearchValue] = useState("");

  const handleMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        setPosition({ lat, lng });
        onChange(lat, lng);
      }
    },
    [onChange]
  );

  const handleMarkerDragEnd = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        setPosition({ lat, lng });
        onChange(lat, lng);
      }
    },
    [onChange]
  );

  const handlePlaceChanged = useCallback(
    (place: google.maps.places.PlaceResult | null) => {
      if (place?.geometry?.location) {
        const loc = place.geometry.location;
        const lat = loc.lat();
        const lng = loc.lng();
        setPosition({ lat, lng });
        onChange(lat, lng, place.formatted_address || undefined);
        setSearchValue(place.name || "");
      }
    },
    [onChange]
  );

  if (!isLoaded) {
    return (
      <div className="flex h-[300px] items-center justify-center rounded-2xl border border-slate-200 bg-slate-50">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
          <p className="text-xs text-slate-400">Loading map...</p>
        </div>
      </div>
    );
  }

  if (!import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
    return (
      <div className="flex h-[300px] items-center justify-center rounded-2xl border border-slate-200 bg-slate-50">
        <div className="flex flex-col items-center gap-2 text-center px-4">
          <MapPin className="h-8 w-8 text-slate-300" />
          <p className="text-sm text-slate-500 font-medium">Google Maps API key not configured</p>
          <p className="text-xs text-slate-400">Set VITE_GOOGLE_MAPS_API_KEY in your .env file</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <Autocomplete
        onLoad={(autocomplete) => {
          autocomplete.addListener("place_changed", () => {
            handlePlaceChanged(autocomplete.getPlace());
          });
        }}
      >
        <Input
          icon={<MapPin size={16} />}
          placeholder="Search for a location..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
      </Autocomplete>

      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={position}
        zoom={14}
        onClick={handleMapClick}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        }}
      >
        <MarkerF
          position={position}
          draggable
          onDragEnd={handleMarkerDragEnd}
        />
      </GoogleMap>

      <div className="flex items-center gap-2 text-xs text-slate-400">
        <MapPin size={12} />
        <span>
          {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
        </span>
        <span className="text-slate-300">|</span>
        <span>Click map or drag marker to adjust</span>
      </div>
    </div>
  );
}

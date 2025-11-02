import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Phone, ExternalLink, Loader2, Navigation, Target } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useHospitals } from "@/hooks/useHospitals";
import { useToast } from "@/hooks/use-toast";
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom icons
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const hospitalIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to update map view
function ChangeMapView({ center, zoom }: { center: [number, number], zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export default function HospitalNavigator() {
  const [search, setSearch] = useState("");
  const [near, setNear] = useState<{ lat?: number; lng?: number }>({});
  const [locating, setLocating] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([26.8467, 80.9462]); // Lucknow default
  const [mapZoom, setMapZoom] = useState(12);
  const { data, isLoading, refetch, error } = useHospitals({ 
    search, 
    lat: near.lat, 
    lng: near.lng, 
    radiusKm: near.lat && near.lng ? 50 : undefined, 
    limit: 100 
  });
  const { toast } = useToast();
  const watchIdRef = useRef<number | null>(null);

  // Get user location on mount
  useEffect(() => {
    findNearMe();
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // Debug logging
  useEffect(() => {
    console.log('🏥 Hospital Navigator Debug:', {
      dataLength: data?.length || 0,
      isLoading,
      hasLocation: !!(near.lat && near.lng),
      location: near,
      error: error ? String(error) : null
    });
    if (data && data.length > 0) {
      console.log('Sample hospital:', data[0]);
    }
  }, [data, isLoading, near, error]);

  function findNearMe() {
    if (!navigator.geolocation) {
      toast({
        title: "Location Not Supported",
        description: "Your browser doesn't support geolocation.",
        variant: "destructive",
      });
      return;
    }

    setLocating(true);
    toast({
      title: "Getting your location...",
      description: "Please allow location access when prompted.",
    });

    // Clear any existing watch
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    // Use watchPosition for continuous location updates
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const newLat = pos.coords.latitude;
        const newLng = pos.coords.longitude;
        
        setNear({ lat: newLat, lng: newLng });
        setMapCenter([newLat, newLng]);
        setMapZoom(13);
        setLocating(false);
        
        toast({
          title: "Location Found! 📍",
          description: `Latitude: ${newLat.toFixed(4)}, Longitude: ${newLng.toFixed(4)}`,
          className: "bg-green-600 text-white border-green-700",
        });
        
        setTimeout(() => refetch(), 100);
      },
      (error) => {
        setLocating(false);
        let errorMessage = "Unable to get your location.";
        
        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = "Location permission denied. Please enable location access in your browser settings.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMessage = "Location information unavailable. Using default location.";
        } else if (error.code === error.TIMEOUT) {
          errorMessage = "Location request timed out. Please try again.";
        }

        toast({
          title: "Location Error",
          description: errorMessage,
          variant: "destructive",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 0,
      }
    );
  }

  function getDirections(hospital: any) {
    if (!near.lat || !near.lng) {
      toast({
        title: "Location Required",
        description: "Please enable location to get directions.",
        variant: "destructive",
      });
      return;
    }

    const destination = hospital.lat && hospital.lng 
      ? `${hospital.lat},${hospital.lng}` 
      : encodeURIComponent(hospital.address || hospital.name);
    
    const origin = `${near.lat},${near.lng}`;
    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
    
    window.open(url, '_blank');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Hospital Navigator</h1>
        <p className="text-muted-foreground">Find healthcare facilities near you with interactive map</p>
      </div>

      {/* Interactive Map Section */}
      <Card className="p-4 shadow-card">
        <div className="mb-4 flex gap-2">
          <Input
            placeholder="Search hospitals, clinics, specialists..."
            className="flex-1"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && refetch()}
          />
          <Button onClick={() => refetch()}>
            <Search className="w-4 h-4" />
          </Button>
          <Button variant="secondary" onClick={findNearMe} disabled={locating}>
            {locating ? (
              <>
                <Loader2 className="w-4 h-4 mr-1 animate-spin" /> Locating...
              </>
            ) : (
              <>
                <Target className="w-4 h-4 mr-1" /> Current Location
              </>
            )}
          </Button>
        </div>

        {/* Map Container */}
        <div className="h-[500px] rounded-lg overflow-hidden border-2 border-border">
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
          >
            <ChangeMapView center={mapCenter} zoom={mapZoom} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* User Location Marker */}
            {near.lat && near.lng && (
              <Marker position={[near.lat, near.lng]} icon={userIcon}>
                <Popup>
                  <div className="text-center font-semibold">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Your Current Location
                  </div>
                </Popup>
              </Marker>
            )}
            
            {/* Hospital Markers */}
            {data?.map((hospital) => {
              if (hospital.lat && hospital.lng) {
                return (
                  <Marker 
                    key={hospital.id} 
                    position={[hospital.lat, hospital.lng]}
                    icon={hospitalIcon}
                  >
                    <Popup>
                      <div className="min-w-[200px]">
                        <h3 className="font-bold text-base mb-2">{hospital.name}</h3>
                        <p className="text-sm text-gray-600 mb-1">{hospital.address || hospital.city}</p>
                        {hospital.type && (
                          <Badge variant="secondary" className="mb-2">{hospital.type}</Badge>
                        )}
                        {hospital.beds && (
                          <p className="text-sm mb-1">🏥 Beds: {hospital.beds}</p>
                        )}
                        {hospital.contact && (
                          <p className="text-sm mb-2">📞 {hospital.contact}</p>
                        )}
                        {hospital.distanceKm && (
                          <p className="text-sm font-semibold text-blue-600 mb-2">
                            📍 {hospital.distanceKm.toFixed(1)} km away
                          </p>
                        )}
                        <div className="flex gap-2 mt-2">
                          {hospital.contact && (
                            <Button size="sm" variant="outline" asChild>
                              <a href={`tel:${hospital.contact}`}>
                                <Phone className="w-3 h-3 mr-1" /> Call
                              </a>
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            onClick={() => getDirections(hospital)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Navigation className="w-3 h-3 mr-1" /> Navigate
                          </Button>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              }
              return null;
            })}
          </MapContainer>
        </div>

        {near.lat && near.lng && (
          <div className="mt-2 text-sm text-muted-foreground text-center">
            Current Location: {near.lat.toFixed(4)}, {near.lng.toFixed(4)}
          </div>
        )}
      </Card>

      {/* Hospital List */}
      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-4 animate-pulse h-24" />
          ))}
        </div>
      )}

      {!isLoading && (!data || data.length === 0) && (
        <div className="text-center py-12 text-muted-foreground">
          <MapPin className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">No hospitals found.</p>
          <p className="text-sm mt-2">
            {error ? `Error: ${String(error)}` : 'Try enabling location or check if database has hospital data.'}
          </p>
          <Button 
            onClick={() => refetch()} 
            variant="outline" 
            className="mt-4"
          >
            Retry
          </Button>
        </div>
      )}

      <div className="grid gap-3">
        {data?.map((h) => (
          <Card key={h.id} className="p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="font-semibold text-lg">{h.name}</div>
                <div className="text-sm text-muted-foreground">{h.address || h.city}</div>
                <div className="flex items-center gap-3 mt-2 text-sm flex-wrap">
                  {h.type && <Badge variant="secondary">{h.type}</Badge>}
                  {typeof h.beds === 'number' && <span>🏥 {h.beds} beds</span>}
                  {typeof h.distanceKm === 'number' && (
                    <span className="font-semibold text-blue-600">📍 {h.distanceKm.toFixed(1)} km</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                {h.contact && (
                  <Button size="sm" variant="outline" asChild>
                    <a href={`tel:${h.contact}`} aria-label={`Call ${h.name}`} title={`Call ${h.name}`}>
                      <Phone className="w-4 h-4" />
                    </a>
                  </Button>
                )}
                <Button 
                  size="sm"
                  onClick={() => getDirections(h)}
                  className="bg-blue-600 hover:bg-blue-700"
                  title={`Get directions to ${h.name}`}
                >
                  <Navigation className="w-4 h-4 mr-1" /> Navigate
                </Button>
                {(h.mapLink || (h.lat != null && h.lng != null)) && (
                  <Button size="sm" variant="outline" asChild>
                    <a 
                      target="_blank" 
                      rel="noreferrer" 
                      href={h.mapLink || `https://www.google.com/maps?q=${h.lat},${h.lng}`} 
                      aria-label={`Open ${h.name} in Google Maps`} 
                      title={`Open ${h.name} in Google Maps`}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

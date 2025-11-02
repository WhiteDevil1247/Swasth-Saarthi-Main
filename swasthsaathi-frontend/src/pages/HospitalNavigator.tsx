import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Phone, ExternalLink } from "lucide-react";
import { useState } from "react";
import { useHospitals } from "@/hooks/useHospitals";

export default function HospitalNavigator() {
  const [search, setSearch] = useState("");
  const [near, setNear] = useState<{ lat?: number; lng?: number }>({});
  const { data, isLoading, refetch } = useHospitals({ search, lat: near.lat, lng: near.lng, radiusKm: near.lat && near.lng ? 10 : undefined, limit: 50 });

  function findNearMe() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      setNear({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      refetch();
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Hospital Navigator</h1>
        <p className="text-muted-foreground">Find healthcare facilities near you</p>
      </div>

      <Card className="p-4 shadow-card">
        <div className="flex gap-2">
          <Input
            placeholder="Search hospitals, clinics, specialists..."
            className="flex-1"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button onClick={() => refetch()}>
            <Search className="w-4 h-4" />
          </Button>
          <Button variant="secondary" onClick={findNearMe}>
            <MapPin className="w-4 h-4 mr-1" /> Near me
          </Button>
        </div>
      </Card>

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
          <p className="text-lg">No results. Try a different search.</p>
        </div>
      )}

      <div className="grid gap-3">
        {data?.map((h) => (
          <Card key={h.id} className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-semibold text-lg">{h.name}</div>
                <div className="text-sm text-muted-foreground">{h.address || h.city}</div>
                <div className="flex items-center gap-3 mt-1 text-sm">
                  {h.type && <Badge variant="secondary">{h.type}</Badge>}
                  {typeof h.beds === 'number' && <span>{h.beds} beds</span>}
                  {typeof h.distanceKm === 'number' && <span>{h.distanceKm.toFixed(1)} km</span>}
                </div>
              </div>
              <div className="flex gap-2">
                {h.contact && (
                  <Button size="sm" variant="outline" asChild>
                    <a href={`tel:${h.contact}`} aria-label={`Call ${h.name}`} title={`Call ${h.name}`}>
                      <Phone className="w-4 h-4" />
                    </a>
                  </Button>
                )}
                {(h.mapLink || (h.lat != null && h.lng != null)) && (
                  <Button size="sm" asChild>
                    <a 
                      target="_blank" 
                      rel="noreferrer" 
                      href={h.mapLink || `https://www.google.com/maps?q=${h.lat},${h.lng}`} 
                      aria-label={`Open ${h.name} in Google Maps`} 
                      title={`Open ${h.name} in Google Maps`}
                    >
                      Open <ExternalLink className="w-4 h-4 ml-1" />
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

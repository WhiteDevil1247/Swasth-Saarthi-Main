import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export type Hospital = {
  id: number;
  name: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  contact?: string | null;
  website?: string | null;
  type?: string | null;
  beds?: number | null;
  lat?: number | null;
  lng?: number | null;
  distanceKm?: number;
};

export type HospitalQuery = {
  search?: string;
  city?: string;
  type?: string;
  limit?: number;
  lat?: number;
  lng?: number;
  radiusKm?: number;
};

export function useHospitals(query?: HospitalQuery) {
  const params = new URLSearchParams();
  if (query) {
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") params.set(k, String(v));
    });
  }
  return useQuery<Hospital[]>({
    queryKey: ["hospitals", query],
    queryFn: async () => api(`/hospitals${params.toString() ? `?${params.toString()}` : ""}`, { method: "GET" }),
  });
}

export function useHospitalDetail(id?: number) {
  return useQuery<Hospital>({
    enabled: !!id,
    queryKey: ["hospitals", id],
    queryFn: async () => api(`/hospitals/${id}`, { method: "GET" }),
  });
}

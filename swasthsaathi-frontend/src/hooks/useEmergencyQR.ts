import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export type EmergencyQRResponse = {
  qrDataUrl: string;
};

export function useEmergencyQR() {
  return useQuery<EmergencyQRResponse>({
    queryKey: ["emergency-qr"],
    queryFn: async () => api("/qr/emergency", { method: "GET" }),
  });
}

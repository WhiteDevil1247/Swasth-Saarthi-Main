import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export type Hospital = { id: number; name: string; address?: string|null; city?: string|null; type?: string|null; contact?: string|null; beds?: number|null; lat?: number|null; lng?: number|null; distanceKm?: number };

export function useHospitals(params?: Record<string, string|number|undefined>) {
  const qs = new URLSearchParams();
  if (params) Object.entries(params).forEach(([k,v])=>{ if(v!==undefined && v!=='' && v!==null) qs.set(k, String(v)); });
  return useQuery<Hospital[]>({
    queryKey: ['hospitals', params],
    queryFn: async ()=> api(`/hospitals${qs.toString()?`?${qs.toString()}`:''}`),
  });
}

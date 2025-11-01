import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
export function useEmergencyQR(){ return useQuery({ queryKey:['emergency-qr'], queryFn: async()=> api('/qr/emergency') }); }

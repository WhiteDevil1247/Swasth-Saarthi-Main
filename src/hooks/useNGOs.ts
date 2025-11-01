import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export type NGO = { id:number; name:string; description?:string|null; contact?:string|null; website?:string|null; city?:string|null; tags?:string|null };

export function useNGOs(){
  const qc = useQueryClient();
  const list = useQuery<NGO[]>({ queryKey:['ngos'], queryFn: async()=> api('/ngos') });
  const create = useMutation({ mutationFn: (payload: Partial<NGO>&{name:string})=> api('/ngos',{method:'POST', body: payload}), onSuccess: ()=> qc.invalidateQueries({queryKey:['ngos']}) });
  const get = (id:number)=> api<NGO>(`/ngos/${id}`);
  return { list, create, get };
}

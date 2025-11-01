import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export type NGO = {
  id: number;
  name: string;
  description?: string | null;
  contact?: string | null;
  website?: string | null;
  city?: string | null;
  tags?: string | null;
  created_at?: string;
};

export function useNGOs() {
  const qc = useQueryClient();

  const list = useQuery<NGO[]>({
    queryKey: ["ngos"],
    queryFn: async () => api("/ngos", { method: "GET" }),
  });

  const get = async (id: number) => api(`/ngos/${id}`, { method: "GET" });

  const create = useMutation({
    mutationFn: async (payload: Partial<NGO> & { name: string }) => api("/ngos", { method: "POST", body: payload }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ngos"] }),
  });

  return { list, get, create };
}

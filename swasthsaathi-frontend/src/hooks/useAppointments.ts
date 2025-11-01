import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export type Appointment = {
  id: number;
  user_id: string;
  provider: string | null;
  reason: string | null;
  start_time: string | null; // ISO string
  end_time: string | null;   // ISO string
  status: "scheduled" | "completed" | "cancelled" | null;
  created_at?: string;
  updated_at?: string;
};

export type CreateAppointmentInput = {
  provider: string;
  reason?: string;
  start_time?: string; // ISO
  end_time?: string;   // ISO
  status?: "scheduled" | "completed" | "cancelled";
};

export type UpdateAppointmentInput = Partial<CreateAppointmentInput>;

export function useAppointments() {
  const qc = useQueryClient();

  const list = useQuery<Appointment[]>({
    queryKey: ["appointments"],
    queryFn: async () => api("/appointments", { method: "GET" }),
  });

  const create = useMutation({
    mutationFn: async (payload: CreateAppointmentInput) =>
      api("/appointments", { method: "POST", body: payload }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["appointments"] });
    },
  });

  const update = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateAppointmentInput }) =>
      api(`/appointments/${id}`, { method: "PATCH", body: data }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["appointments"] });
    },
  });

  const remove = useMutation({
    mutationFn: async (id: number) => api(`/appointments/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["appointments"] });
    },
  });

  return { list, create, update, remove };
}

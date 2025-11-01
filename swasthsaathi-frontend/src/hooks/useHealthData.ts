import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

export const useHealthRecords = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: records, isLoading } = useQuery({
    queryKey: ["health-records"],
    queryFn: async () => {
      const res = await api("/files", { method: "GET" });
      return res.files as Array<{ id: string }>;
    },
  });

  const uploadRecord = useMutation({
    mutationFn: async ({ file }: { file: File; metadata?: any }) => {
      const token = localStorage.getItem("auth_token");
      if (!token) throw new Error("Not authenticated");

      const form = new FormData();
      form.append("file", file);

      const res = await fetch(`/api/upload`, {
        method: "POST",
        body: form,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Upload failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["health-records"] });
      toast({
        title: "Success",
        description: "Health record uploaded successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return { records, isLoading, uploadRecord };
};

export const useHealthMetrics = () => {
  const { data: metrics } = useQuery({
    queryKey: ["health-metrics"],
    queryFn: async () => {
      const data = await api("/metrics", { method: "GET" });
      return data;
    },
  });

  return { metrics };
};

export const useProfile = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const data = await api("/profile", { method: "GET" });
      return data;
    },
  });

  const updateProfile = useMutation({
    mutationFn: async (updates: any) => {
      await api("/profile", { method: "PUT", body: updates });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    },
  });

  return { profile, updateProfile };
};

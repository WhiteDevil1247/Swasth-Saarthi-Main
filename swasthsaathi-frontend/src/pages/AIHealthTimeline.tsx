import { Card } from "@/components/ui/card";
import { useAITimeline } from "@/hooks/useAITimeline";
import { useMemo } from "react";

export default function AIHealthTimeline() {
  const { data, isLoading, error } = useAITimeline();

  const rows = useMemo(() => {
    if (data?.metrics && data.metrics.length > 0) return data.metrics;
    // Fallback demo rows
    const now = new Date();
    return [
      { type: 'bp', value: 120, recorded_at: now.toISOString() },
      { type: 'hr', value: 72, recorded_at: now.toISOString() },
      { type: 'glucose', value: 95, recorded_at: now.toISOString() },
    ];
  }, [data]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">AI Health Timeline</h1>
        <p className="text-muted-foreground">Recent metrics and smart summary</p>
      </div>

      {isLoading && (
        <div className="space-y-3">
          <Card className="p-8 animate-pulse h-24" />
          <Card className="p-8 animate-pulse h-24" />
        </div>
      )}

      {error && <div className="text-sm text-red-600">Failed to load timeline</div>}

      {!isLoading && (
        <>
          <Card className="p-4">
            <div className="font-semibold mb-2">Summary</div>
            <p className="text-sm text-muted-foreground">{data?.summary || 'No recent health metrics recorded.'}</p>
          </Card>

          <Card className="p-4">
            <div className="font-semibold mb-2">Latest Metrics</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {['bp','hr','glucose'].map((t) => {
                const m = rows.find(r => r.type === t);
                return (
                  <div key={t} className="rounded-md border p-4">
                    <div className="text-sm text-muted-foreground uppercase">{t}</div>
                    <div className="text-2xl font-bold">{m ? m.value : '--'}</div>
                    <div className="text-xs text-muted-foreground">{m ? new Date(m.recorded_at).toLocaleString() : 'No data'}</div>
                  </div>
                );
              })}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

import { useAITimeline } from '../hooks/useAITimeline';
export default function AIHealthTimeline(){
  const { data, isLoading } = useAITimeline();
  const rows = data?.metrics?.length ? data.metrics : [
    { type:'bp', value: 120, recorded_at: new Date().toISOString() },
    { type:'hr', value: 72, recorded_at: new Date().toISOString() },
    { type:'glucose', value: 95, recorded_at: new Date().toISOString() },
  ];
  return (
    <div className="space-y-4 fade-in">
      <h1 className="text-2xl font-semibold">AI Health Timeline</h1>
      {isLoading && <div className="h-24 skeleton" />}
      <div className="p-4 rounded-md border border-neutral-800 bg-neutral-900">
        <div className="font-medium mb-2">Summary</div>
        <p className="text-sm text-neutral-300">{data?.summary || 'No recent health metrics recorded.'}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {['bp','hr','glucose'].map(t=> {
          const m = rows.find(r=> r.type===t);
          return (
            <div key={t} className="p-4 rounded-md border border-neutral-800 bg-neutral-900">
              <div className="text-xs uppercase text-neutral-400">{t}</div>
              <div className="text-2xl font-bold">{m? m.value : '--'}</div>
              <div className="text-xs text-neutral-400">{m? new Date(m.recorded_at).toLocaleString(): 'No data'}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

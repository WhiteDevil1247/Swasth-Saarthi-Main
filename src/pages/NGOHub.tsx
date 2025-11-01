import { useState } from 'react';
import { useNGOs } from '../hooks/useNGOs';
export default function NGOHub(){
  const [q, setQ] = useState('');
  const { list } = useNGOs();
  const data = (list.data||[]).filter(n=> q ? (n.name?.toLowerCase().includes(q.toLowerCase()) || n.city?.toLowerCase().includes(q.toLowerCase())): true);
  return (
    <div className="space-y-4 fade-in">
      <h1 className="text-2xl font-semibold">NGO Hub</h1>
      <input className="px-3 py-2 rounded-md bg-neutral-800 border border-neutral-700 w-full" placeholder="Search NGOs by name or city" value={q} onChange={(e)=> setQ(e.target.value)} />
      {list.isLoading && <div className="h-20 skeleton" />}
      <div className="grid gap-3">
        {data.map(n=> (
          <div key={n.id} className="p-4 rounded-md border border-neutral-800 bg-neutral-900/60 hover:bg-neutral-900 transition">
            <div className="font-medium">{n.name}</div>
            <div className="text-sm text-neutral-400">{n.city || ''}</div>
            <p className="text-sm mt-1">{n.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

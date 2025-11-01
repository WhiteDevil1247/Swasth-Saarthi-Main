import { useState } from 'react';
import { useHospitals } from '../hooks/useHospitals';

export default function HospitalNavigator(){
  const [search, setSearch] = useState('');
  const [near, setNear] = useState<{lat?:number; lng?:number}>({});
  const { data, isLoading, refetch } = useHospitals({ search, lat: near.lat, lng: near.lng, radiusKm: near.lat && near.lng ? 10 : undefined, limit: 30 });
  function findNear(){
    if(!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos)=>{ setNear({ lat: pos.coords.latitude, lng: pos.coords.longitude}); refetch(); });
  }
  return (
    <div className="space-y-4 fade-in">
      <h1 className="text-2xl font-semibold">Hospital Navigator</h1>
      <div className="flex gap-2">
        <input className="px-3 py-2 rounded-md bg-neutral-800 border border-neutral-700 flex-1" placeholder="Search hospitals..." value={search} onChange={(e)=> setSearch(e.target.value)} />
        <button className="px-3 py-2 rounded-md bg-neutral-700" onClick={()=> refetch()}>Search</button>
        <button className="px-3 py-2 rounded-md bg-neutral-700" onClick={findNear}>Near me</button>
      </div>
      {isLoading && <div className="h-20 skeleton" />}
      <div className="grid gap-3">
        {data?.map(h=> (
          <div key={h.id} className="p-4 rounded-md border border-neutral-800 bg-neutral-900/60 hover:bg-neutral-900 transition float">
            <div className="font-medium">{h.name}</div>
            <div className="text-sm text-neutral-400">{h.address || h.city}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { useEmergencyQR } from '../hooks/useEmergencyQR';
export default function EmergencyQR(){
  const { data, isLoading, error } = useEmergencyQR();
  return (
    <div className="space-y-4 fade-in">
      <h1 className="text-2xl font-semibold">Emergency QR</h1>
      {isLoading && <div className="h-64 skeleton" />}
      {error && <div className="text-red-400 text-sm">Failed to load QR</div>}
      {data?.qrDataUrl && (
        <div className="p-4 rounded-md border border-neutral-800 inline-block bg-neutral-900">
          <img src={data.qrDataUrl} alt="Emergency QR" className="w-64 h-64" />
        </div>
      )}
    </div>
  );
}

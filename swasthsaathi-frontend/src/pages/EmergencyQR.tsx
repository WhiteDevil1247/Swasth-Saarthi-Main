import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEmergencyQR } from "@/hooks/useEmergencyQR";
import { Download } from "lucide-react";

export default function EmergencyQR() {
  const { data, isLoading, error } = useEmergencyQR();

  function download() {
    if (!data?.qrDataUrl) return;
    const a = document.createElement("a");
    a.href = data.qrDataUrl;
    a.download = "swasthsaathi-emergency-qr.png";
    a.click();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Emergency QR</h1>
        <p className="text-muted-foreground">Share your emergency info quickly</p>
      </div>

      {isLoading && (
        <div className="space-y-3">
          <Card className="p-8 animate-pulse h-64" />
        </div>
      )}

      {error && <div className="text-sm text-red-600">Failed to load QR</div>}

      {data?.qrDataUrl && (
        <Card className="p-6 flex flex-col items-center gap-4">
          <img src={data.qrDataUrl} alt="Emergency QR" className="w-64 h-64" />
          <Button onClick={download}><Download className="w-4 h-4 mr-2" /> Download</Button>
        </Card>
      )}
    </div>
  );
}

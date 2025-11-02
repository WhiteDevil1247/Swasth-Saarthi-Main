import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { QrCode, Download, Share2, Eye, RefreshCw } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { api } from '../lib/api';

interface HealthRecordQRProps {
  recordId: string;
  title?: string;
  qrCode?: string;
  onQRGenerated?: (qrCode: string) => void;
}

export function HealthRecordQR({ recordId, title, qrCode: initialQR, onQRGenerated }: HealthRecordQRProps) {
  const [qrCode, setQRCode] = useState(initialQR || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const { toast } = useToast();

  const generateQR = async () => {
    setIsGenerating(true);
    try {
      const res = await api(`/api/records/${recordId}/qr`, { method: 'POST' });
      if (res.qrDataUrl) {
        setQRCode(res.qrDataUrl);
        onQRGenerated?.(res.qrDataUrl);
        toast({
          title: '✅ QR Code Generated',
          description: 'Your health record QR code is ready!',
        });
      }
    } catch (error) {
      console.error('QR generation failed:', error);
      toast({
        title: '❌ Generation Failed',
        description: 'Could not generate QR code',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQR = () => {
    if (!qrCode) return;
    const link = document.createElement('a');
    link.href = qrCode;
    link.download = `health-record-${recordId}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({
      title: '💾 Downloaded',
      description: 'QR code saved to your downloads',
    });
  };

  const shareQR = async () => {
    if (!qrCode) return;
    try {
      const blob = await (await fetch(qrCode)).blob();
      const file = new File([blob], `health-record-qr.png`, { type: 'image/png' });
      
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: title || 'Health Record QR',
          text: 'Scan this QR code to view my health record',
          files: [file],
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.write([
          new ClipboardItem({
            'image/png': blob,
          }),
        ]);
        toast({
          title: '📋 Copied',
          description: 'QR code copied to clipboard',
        });
      }
    } catch (error) {
      console.error('Share failed:', error);
      toast({
        title: '⚠️ Share Failed',
        description: 'Could not share QR code',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex gap-2">
      {qrCode ? (
        <>
          <Dialog open={showQR} onOpenChange={setShowQR}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                View QR
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{title || 'Health Record QR Code'}</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="bg-white p-4 rounded-lg shadow-lg">
                  <img 
                    src={qrCode} 
                    alt="Health Record QR Code" 
                    className="w-64 h-64"
                  />
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Scan this QR code to view health record summary
                </p>
                <div className="flex gap-2">
                  <Button onClick={downloadQR} variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button onClick={shareQR} variant="outline" size="sm">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  <Button onClick={generateQR} variant="outline" size="sm" disabled={isGenerating}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
                    Regenerate
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button onClick={downloadQR} variant="ghost" size="sm">
            <Download className="w-4 h-4" />
          </Button>

          <Button onClick={shareQR} variant="ghost" size="sm">
            <Share2 className="w-4 h-4" />
          </Button>
        </>
      ) : (
        <Button 
          onClick={generateQR} 
          variant="outline" 
          size="sm"
          disabled={isGenerating}
        >
          <QrCode className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
          {isGenerating ? 'Generating...' : 'Generate QR'}
        </Button>
      )}
    </div>
  );
}

// QR Scanner Component
interface QRScannerProps {
  onScan: (data: any) => void;
}

export function QRScanner({ onScan }: QRScannerProps) {
  const [scanning, setScanning] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanning(true);
    try {
      // For now, we'll implement manual QR data input
      // In production, use a library like `jsQR` or `html5-qrcode`
      toast({
        title: 'ℹ️ QR Scanning',
        description: 'Please use a QR scanner app on your phone',
      });
    } catch (error) {
      toast({
        title: '❌ Scan Failed',
        description: 'Could not read QR code',
        variant: 'destructive',
      });
    } finally {
      setScanning(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex flex-col items-center gap-4">
        <QrCode className="w-16 h-16 text-muted-foreground" />
        <h3 className="text-lg font-semibold">Scan QR Code</h3>
        <p className="text-sm text-muted-foreground text-center">
          Upload a QR code image or use your phone's camera
        </p>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
          id="qr-upload"
        />
        <label htmlFor="qr-upload">
          <Button variant="outline" disabled={scanning} asChild>
            <span>
              {scanning ? 'Scanning...' : 'Upload QR Image'}
            </span>
          </Button>
        </label>
      </div>
    </Card>
  );
}

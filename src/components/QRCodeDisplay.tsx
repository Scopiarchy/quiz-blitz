import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Copy, RefreshCw, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";

interface QRCodeDisplayProps {
  pin: string;
  onRegeneratePin?: () => void;
  showRegenerateButton?: boolean;
}

export function QRCodeDisplay({ pin, onRegeneratePin, showRegenerateButton = false }: QRCodeDisplayProps) {
  const baseUrl = window.location.origin;
  const joinUrl = `${baseUrl}/join?pin=${pin}`;

  const copyLink = () => {
    navigator.clipboard.writeText(joinUrl);
    toast.success("Join link copied to clipboard!");
  };

  const copyPin = () => {
    navigator.clipboard.writeText(pin);
    toast.success("PIN copied to clipboard!");
  };

  return (
    <Card className="p-6 text-center space-y-4 bg-gradient-to-br from-card to-card/80 border-border/50">
      {/* Game PIN - compact single line above QR */}
      <div className="flex items-center justify-center gap-2">
        <span className="text-muted-foreground text-sm">Game PIN:</span>
        <button
          onClick={copyPin}
          className="text-2xl font-bold tracking-widest text-secondary hover:text-secondary/80 transition-colors cursor-pointer"
          title="Click to copy PIN"
        >
          {pin}
        </button>
      </div>

      {/* QR Code */}
      <div className="flex justify-center">
        <div className="p-3 bg-white rounded-xl shadow-lg shadow-black/20 hover:shadow-xl transition-shadow">
          <QRCodeSVG
            value={joinUrl}
            size={160}
            level="H"
            includeMargin={false}
            bgColor="#ffffff"
            fgColor="#1a1a2e"
          />
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">
          Scan to join or go to
        </p>
        <p className="font-mono text-primary text-sm break-all">
          {baseUrl}/join
        </p>
      </div>

      <Button 
        variant="outline" 
        size="sm" 
        onClick={copyLink}
        className="border-primary/30 hover:border-primary hover:bg-primary/10"
      >
        <Copy className="w-4 h-4 mr-2" />
        Copy Join Link
      </Button>
      
      {showRegenerateButton && onRegeneratePin && (
        <Button variant="ghost" size="sm" onClick={onRegeneratePin}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Regenerate PIN
        </Button>
      )}
    </Card>
  );
}

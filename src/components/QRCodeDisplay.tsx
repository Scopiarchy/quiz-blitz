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
    <Card className="p-6 text-center space-y-6">
      <div>
        <p className="text-muted-foreground text-sm mb-2">Game PIN</p>
        <button
          onClick={copyPin}
          className="pin-display hover:scale-105 transition-transform cursor-pointer"
          title="Click to copy PIN"
        >
          {pin}
        </button>
      </div>

      <div className="flex justify-center">
        <div className="p-4 bg-white rounded-2xl shadow-lg">
          <QRCodeSVG
            value={joinUrl}
            size={180}
            level="H"
            includeMargin
            bgColor="#ffffff"
            fgColor="#1a1a2e"
          />
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Scan to join or go to <span className="font-mono text-primary">{baseUrl}/join</span>
      </p>

      <div className="flex flex-wrap justify-center gap-3">
        <Button variant="outline" size="sm" onClick={copyLink}>
          <Copy className="w-4 h-4 mr-2" />
          Copy Join Link
        </Button>
        {showRegenerateButton && onRegeneratePin && (
          <Button variant="outline" size="sm" onClick={onRegeneratePin}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Regenerate PIN
          </Button>
        )}
      </div>
    </Card>
  );
}

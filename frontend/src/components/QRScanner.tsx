import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import "./QRScanner.css";

interface QRScannerProps {
  onScan: (decodedText: string) => void;
  onError?: (error: string) => void;
}

export const QRScanner = ({ onScan, onError }: QRScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const elementId = "qr-reader";

  useEffect(() => {
    return () => {
      // Cleanup on unmount - properly release camera and DOM resources
      const scanner = scannerRef.current;
      if (scanner) {
        if (scanner.isScanning) {
          scanner
            .stop()
            .then(() => {
              try {
                scanner.clear();
              } catch (e) {
                console.error("Error clearing scanner:", e);
              }
            })
            .catch(console.error);
        } else {
          try {
            scanner.clear();
          } catch (e) {
            console.error("Error clearing scanner:", e);
          }
        }
        scannerRef.current = null;
      }
    };
  }, []);

  const startScanning = async () => {
    try {
      setError(null);
      const scanner = new Html5Qrcode(elementId);
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" }, // Use back camera
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          onScan(decodedText);
        },
        () => {
          // Ignore error messages during normal scanning
          // These are just "no QR code found" messages
        },
      );

      setIsScanning(true);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to start camera";
      setError(errorMsg);
      if (onError) {
        onError(errorMsg);
      }
    }
  };

  const stopScanning = async () => {
    const scanner = scannerRef.current;
    if (scanner?.isScanning) {
      try {
        await scanner.stop();
        try {
          scanner.clear();
        } catch (e) {
          console.error("Error clearing scanner:", e);
        }
        scannerRef.current = null;
        setIsScanning(false);
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
    }
  };

  return (
    <div className="qr-scanner">
      <div id={elementId} className="qr-reader-container"></div>

      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
          <p>Please make sure you have granted camera permissions.</p>
        </div>
      )}

      <div className="scanner-controls">
        {!isScanning ? (
          <button onClick={startScanning} className="btn-primary">
            Start Camera
          </button>
        ) : (
          <button onClick={stopScanning} className="btn-cancel">
            Stop Camera
          </button>
        )}
      </div>
    </div>
  );
};

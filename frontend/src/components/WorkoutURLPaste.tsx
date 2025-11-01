import { useState } from "react";
import "./WorkoutURLPaste.css";

type WorkoutURLPasteProps = {
  onSubmit: (url: string) => void;
};

export const WorkoutURLPaste = ({ onSubmit }: WorkoutURLPasteProps) => {
  const [url, setUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isReading, setIsReading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!url.trim()) {
      return;
    }

    setIsProcessing(true);
    try {
      await onSubmit(url.trim());
      // Clear the input on success
      setUrl("");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaste = async () => {
    setIsReading(true);
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
    } catch (err) {
      console.error("Failed to read clipboard:", err);
      alert(
        "Could not read clipboard. Please paste manually using Ctrl+V or Cmd+V"
      );
    } finally {
      setIsReading(false);
    }
  };

  return (
    <div className="workout-url-paste">
      <form onSubmit={handleSubmit}>
        <label htmlFor="workout-url">Workout QR Code URL</label>
        <div className="url-input-group">
          <textarea
            id="workout-url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste the URL from the QR code here..."
            rows={4}
            disabled={isProcessing}
          />
          <button
            type="button"
            onClick={handlePaste}
            className="btn-paste"
            disabled={isProcessing || isReading}
          >
            {isReading ? "Reading..." : "Paste from Clipboard"}
          </button>
        </div>
        <small className="help-text">
          The URL should look like: https://example.com?r=...
        </small>

        <div className="form-actions">
          <button
            type="submit"
            disabled={!url.trim() || isProcessing}
          >
            {isProcessing ? "Processing..." : "Add Workout"}
          </button>
        </div>
      </form>
    </div>
  );
};

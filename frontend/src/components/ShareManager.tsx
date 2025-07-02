import { useState, useEffect } from "react";
import {
  createShareLink,
  getUserShareLinks,
  deleteShareLink,
  generateShareUrl,
  type ShareLink,
} from "../lib/shareUtils";

type ShareManagerProps = {
  onClose: () => void;
};

export function ShareManager({ onClose }: ShareManagerProps) {
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  useEffect(() => {
    loadShareLinks();
  }, []);

  const loadShareLinks = async () => {
    try {
      setLoading(true);
      const links = await getUserShareLinks();
      setShareLinks(links);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLink = async () => {
    try {
      setCreating(true);
      setError(null);
      const newLink = await createShareLink(7); // 7 day expiry
      setShareLinks((prev) => [newLink, ...prev]);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteLink = async (linkId: string) => {
    try {
      await deleteShareLink(linkId);
      setShareLinks((prev) => prev.filter((link) => link.id !== linkId));
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleCopyLink = async (token: string) => {
    const url = generateShareUrl(token);
    try {
      await navigator.clipboard.writeText(url);
      setCopiedToken(token);
      setTimeout(() => setCopiedToken(null), 2000);
    } catch {
      // Fallback for browsers without clipboard API
      const textArea = document.createElement("textarea");
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopiedToken(token);
      setTimeout(() => setCopiedToken(null), 2000);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isExpired = (dateString: string) => {
    return new Date(dateString) < new Date();
  };

  if (loading) {
    return (
      <main>
        <section>
          <h2>Manage Share Links</h2>
          <div className="loading">Loading share links...</div>
        </section>
      </main>
    );
  }

  return (
    <main>
      <section>
        <h2>Manage Share Links</h2>

        <div className="form-group">
          <button onClick={handleCreateLink} disabled={creating}>
            {creating ? "Creating..." : "Create New Share Link"}
          </button>
          <p
            style={{
              marginTop: "var(--spacing-sm)",
              color: "var(--color-text-light)",
              fontSize: "0.875rem",
            }}
          >
            Share links allow others to view your sleep dashboard without
            signing in. Links expire after 7 days.
          </p>
        </div>

        {error && (
          <div className="form-error">
            <strong>Error:</strong> {error}
          </div>
        )}

        <fieldset>
          <legend>Your Share Links</legend>
          {shareLinks.length === 0 ? (
            <p
              style={{
                textAlign: "center",
                color: "var(--color-text-light)",
                fontStyle: "italic",
              }}
            >
              No share links created yet.
            </p>
          ) : (
            <div>
              {shareLinks.map((link) => (
                <div
                  key={link.id}
                  className={`share-link-item ${isExpired(link.expires_at) ? "expired" : ""}`}
                >
                  <div className="link-info">
                    <div className="link-dates">
                      <span className="created">
                        Created: {formatDate(link.created_at)}
                      </span>
                      <span
                        className={`expires ${isExpired(link.expires_at) ? "expired" : ""}`}
                      >
                        {isExpired(link.expires_at) ? "Expired" : "Expires"}:{" "}
                        {formatDate(link.expires_at)}
                      </span>
                    </div>
                    <div className="link-url">
                      <code>{generateShareUrl(link.share_token)}</code>
                    </div>
                  </div>
                  <div className="link-actions">
                    {!isExpired(link.expires_at) && (
                      <button onClick={() => handleCopyLink(link.share_token)}>
                        {copiedToken === link.share_token
                          ? "Copied!"
                          : "Copy Link"}
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteLink(link.id)}
                      className="btn-danger"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </fieldset>

        <div className="form-actions">
          <button onClick={onClose} className="btn-cancel">
            Back to Dashboard
          </button>
        </div>
      </section>
    </main>
  );
}

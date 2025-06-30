import React, { useState, useEffect } from 'react';
import { 
  createShareLink, 
  getUserShareLinks, 
  deleteShareLink, 
  generateShareUrl,
  type ShareLink 
} from '../lib/shareUtils';

interface ShareManagerProps {
  onClose: () => void;
}

export const ShareManager: React.FC<ShareManagerProps> = ({ onClose }) => {
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
      setShareLinks(prev => [newLink, ...prev]);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteLink = async (linkId: string) => {
    try {
      await deleteShareLink(linkId);
      setShareLinks(prev => prev.filter(link => link.id !== linkId));
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
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedToken(token);
      setTimeout(() => setCopiedToken(null), 2000);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isExpired = (dateString: string) => {
    return new Date(dateString) < new Date();
  };

  if (loading) {
    return (
      <div className="share-manager">
        <div className="share-manager-header">
          <h2>Manage Share Links</h2>
          <button onClick={onClose} className="close-button">×</button>
        </div>
        <div className="loading">Loading share links...</div>
      </div>
    );
  }

  return (
    <div className="share-manager">
      <div className="share-manager-header">
        <h2>Manage Share Links</h2>
        <button onClick={onClose} className="close-button">×</button>
      </div>

      <div className="share-manager-content">
        <div className="share-manager-actions">
          <button 
            onClick={handleCreateLink} 
            disabled={creating}
            className="create-link-button"
          >
            {creating ? 'Creating...' : 'Create New Share Link'}
          </button>
          <p className="share-info">
            Share links allow others to view your sleep dashboard without signing in. 
            Links expire after 7 days.
          </p>
        </div>

        {error && (
          <div className="error-message">
            <strong>Error:</strong> {error}
          </div>
        )}

        <div className="share-links-list">
          <h3>Your Share Links</h3>
          {shareLinks.length === 0 ? (
            <p className="no-links">No share links created yet.</p>
          ) : (
            <div className="share-links">
              {shareLinks.map(link => (
                <div 
                  key={link.id} 
                  className={`share-link-item ${isExpired(link.expires_at) ? 'expired' : ''}`}
                >
                  <div className="link-info">
                    <div className="link-dates">
                      <span className="created">
                        Created: {formatDate(link.created_at)}
                      </span>
                      <span className={`expires ${isExpired(link.expires_at) ? 'expired' : ''}`}>
                        {isExpired(link.expires_at) ? 'Expired' : 'Expires'}: {formatDate(link.expires_at)}
                      </span>
                    </div>
                    <div className="link-url">
                      <code>{generateShareUrl(link.share_token)}</code>
                    </div>
                  </div>
                  <div className="link-actions">
                    {!isExpired(link.expires_at) && (
                      <button 
                        onClick={() => handleCopyLink(link.share_token)}
                        className="copy-button"
                      >
                        {copiedToken === link.share_token ? 'Copied!' : 'Copy Link'}
                      </button>
                    )}
                    <button 
                      onClick={() => handleDeleteLink(link.id)}
                      className="delete-button"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

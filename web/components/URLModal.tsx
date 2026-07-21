"use client";

import React, { useState } from 'react';
import { X } from 'lucide-react';

interface URLModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVideoReceived: (url: string) => void;
}

export function URLModal({ isOpen, onClose, onVideoReceived }: URLModalProps) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleImport = async () => {
    if (!url) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to download video');
      }

      onVideoReceived(data.videoUrl);
      setUrl('');
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button onClick={onClose} className="modal-close-btn">
          <X size={24} />
        </button>
        
        <h2 className="modal-title">Import via URL</h2>
        <p className="modal-subtitle">
          Paste a link from Instagram, TikTok, or YouTube to import the video.
        </p>

        <div className="upload-form" style={{ width: '100%' }}>
          <input 
            type="text" 
            placeholder="https://..." 
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="file-input"
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #2a2e37', background: '#0f1115', color: '#fff', width: '100%' }}
          />
          {error && <p style={{ color: '#ef4444', fontSize: '0.875rem' }}>{error}</p>}
          <button 
            onClick={handleImport}
            disabled={!url || loading}
            className="btn btn-primary btn-upload"
          >
            {loading ? 'Downloading...' : 'Import Video'}
          </button>
        </div>
      </div>
    </div>
  );
}

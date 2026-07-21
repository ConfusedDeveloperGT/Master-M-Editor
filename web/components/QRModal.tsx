"use client";

import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from '@/lib/supabase';
import { X } from 'lucide-react';

interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVideoReceived: (url: string) => void;
}

export function QRModal({ isOpen, onClose, onVideoReceived }: QRModalProps) {
  const [sessionId, setSessionId] = useState<string>('');
  const [uploadUrl, setUploadUrl] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      // Generate a unique session ID
      const newSessionId = crypto.randomUUID();
      setSessionId(newSessionId);
      
      // The URL that the mobile device will scan
      const host = window.location.origin;
      setUploadUrl(`${host}/upload?session=${newSessionId}`);

      // Create session in Supabase
      const createSession = async () => {
        await supabase.from('qr_sessions').insert([{ session_id: newSessionId }]);
      };
      
      createSession();

      // Subscribe to Realtime updates for this session
      const channel = supabase
        .channel(`session_${newSessionId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'qr_sessions',
            filter: `session_id=eq.${newSessionId}`,
          },
          (payload) => {
            if (payload.new.status === 'completed' && payload.new.video_url) {
              onVideoReceived(payload.new.video_url);
              onClose();
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isOpen, onVideoReceived, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button 
          onClick={onClose}
          className="modal-close-btn"
        >
          <X size={24} />
        </button>
        
        <h2 className="modal-title">Scan & Import</h2>
        <p className="modal-subtitle">
          Scan this QR code with your phone to instantly send videos to the editor.
        </p>

        <div className="qr-container">
          <QRCodeSVG value={uploadUrl} size={200} />
        </div>

        <p className="modal-status">
          <span className="status-dot"></span>
          Waiting for upload...
        </p>
      </div>
    </div>
  );
}

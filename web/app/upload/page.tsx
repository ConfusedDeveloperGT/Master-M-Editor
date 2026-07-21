"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useSearchParams } from 'next/navigation';

export default function MobileUploadPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session');
  
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>('idle');

  useEffect(() => {
    if (!sessionId) {
      setStatus('error');
    }
  }, [sessionId]);

  const handleUpload = async () => {
    if (!file || !sessionId) return;

    setStatus('uploading');
    const fileExt = file.name.split('.').pop();
    const fileName = `${sessionId}-${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('editor-uploads')
      .upload(filePath, file);

    if (uploadError) {
      console.error(uploadError);
      setStatus('error');
      return;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('editor-uploads')
      .getPublicUrl(filePath);

    // Update the session in Database
    const { error: dbError } = await supabase
      .from('qr_sessions')
      .update({ video_url: publicUrl, status: 'completed' })
      .eq('session_id', sessionId);

    if (dbError) {
      console.error(dbError);
      setStatus('error');
    } else {
      setStatus('success');
    }
  };

  if (status === 'error' && !sessionId) {
    return <div className="upload-container error-state">Invalid Session. Scan the QR code again.</div>;
  }

  return (
    <div className="upload-container">
      <h1 className="upload-title">Master M - Upload</h1>
      
      {status === 'success' ? (
        <div className="upload-success">
          <p className="success-title">Upload Complete!</p>
          <p className="success-desc">The video should now appear on your editor.</p>
        </div>
      ) : (
        <div className="upload-form">
          <input 
            type="file" 
            accept="video/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="file-input"
          />
          <button 
            onClick={handleUpload}
            disabled={!file || status === 'uploading'}
            className="btn btn-primary btn-upload"
          >
            {status === 'uploading' ? 'Uploading...' : 'Send to Editor'}
          </button>
        </div>
      )}
    </div>
  );
}

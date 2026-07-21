"use client";

import React, { useState } from 'react';
import { QRModal } from '@/components/QRModal';
import { URLModal } from '@/components/URLModal';
import { Timeline } from '@/components/Timeline';
import { PreviewPlayer } from '@/components/PreviewPlayer';
import { useEditorStore } from '@/store/editorStore';
import { exportTimelineToVideo, exportTimelineToWAV } from '@/lib/ffmpeg';

export default function Home() {
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isURLModalOpen, setIsURLModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  const { importedMedia, addImportedMedia, timelineClips } = useEditorStore();

  const handleDragStart = (e: React.DragEvent<HTMLVideoElement>, url: string) => {
    e.dataTransfer.setData('text/plain', url);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleExportVideo = async () => {
    if (timelineClips.length === 0) return alert("Timeline is empty");
    setIsExporting(true);
    try {
      const url = await exportTimelineToVideo(timelineClips);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'exported_video.mp4';
      a.click();
    } catch (e) {
      console.error(e);
      alert("Error exporting video");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportWAV = async () => {
    if (timelineClips.length === 0) return alert("Timeline is empty");
    setIsExporting(true);
    try {
      const url = await exportTimelineToWAV(timelineClips);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'exported_audio.wav';
      a.click();
    } catch (e) {
      console.error(e);
      alert("Error exporting audio");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <main className="editor-container">
      <header className="editor-header">
        <h1>Master M - Editor</h1>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={handleExportWAV} disabled={isExporting}>
            {isExporting ? 'Exporting...' : 'Export to WAV'}
          </button>
          <button className="btn btn-primary" onClick={handleExportVideo} disabled={isExporting}>
            {isExporting ? 'Exporting...' : 'Export Video'}
          </button>
        </div>
      </header>

      <div className="editor-workspace">
        <aside className="editor-sidebar">
          <h2>Media Bin</h2>
          <div className="media-actions">
            <button className="btn btn-action">Import Local</button>
            <button className="btn btn-action" onClick={() => setIsQRModalOpen(true)}>Scan & Import</button>
            <button className="btn btn-action" onClick={() => setIsURLModalOpen(true)}>URL Import</button>
          </div>
          <div className="media-grid" style={{ display: importedMedia.length > 0 ? 'grid' : 'flex', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', padding: '8px', alignItems: 'start', overflowY: 'auto' }}>
            {importedMedia.length === 0 ? (
              <p className="empty-text">No media imported yet.</p>
            ) : (
              importedMedia.map((url, i) => (
                <video 
                  key={i} 
                  src={url} 
                  className="w-full rounded-md border border-[#2a2e37]" 
                  style={{ width: '100%', borderRadius: '8px', cursor: 'grab' }} 
                  draggable
                  onDragStart={(e) => handleDragStart(e, url)}
                  controls={false}
                />
              ))
            )}
          </div>
        </aside>

        <PreviewPlayer />
      </div>

      <Timeline />

      <QRModal 
        isOpen={isQRModalOpen} 
        onClose={() => setIsQRModalOpen(false)} 
        onVideoReceived={addImportedMedia} 
      />
      <URLModal 
        isOpen={isURLModalOpen} 
        onClose={() => setIsURLModalOpen(false)} 
        onVideoReceived={addImportedMedia} 
      />
    </main>
  );
}

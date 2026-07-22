"use client";

import React, { useState } from 'react';
import { QRModal } from '@/components/QRModal';
import { URLModal } from '@/components/URLModal';
import { Timeline } from '@/components/Timeline';
import { PreviewPlayer } from '@/components/PreviewPlayer';
import { useEditorStore } from '@/store/editorStore';
import { exportTimelineToVideo, exportTimelineToWAV } from '@/lib/ffmpeg';
import { Video, Music, Type, Captions, Settings, Download, Upload, Link, QrCode, Trash2, FileAudio, FileVideo, Undo2, Redo2 } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('video');
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isURLModalOpen, setIsURLModalOpen] = useState(false);
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [projectName, setProjectName] = useState('Untitled Project');
  const [isEditingName, setIsEditingName] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const videoFileRef = React.useRef<HTMLInputElement>(null);
  const audioFileRef = React.useRef<HTMLInputElement>(null);
  
  const { importedMedia, addImportedMedia, timelineClips } = useEditorStore();

  const handleVideoImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      const type = file.type.startsWith('audio/') ? 'audio' : 'video';
      addImportedMedia({ url, type });
    }
  };

  const handleAudioImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      addImportedMedia({ url, type: 'audio' });
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLElement>, media: { url: string, type: 'video' | 'audio' }) => {
    e.dataTransfer.setData('text/plain', JSON.stringify(media));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleExportVideo = async () => {
    if (timelineClips.length === 0) return alert("Timeline is empty!");
    setIsExporting(true);
    setShowExportMenu(false);
    try {
      const url = await exportTimelineToVideo(timelineClips);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectName}.mp4`;
      a.click();
    } catch (e) {
      console.error(e);
      alert("Error exporting video");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportWAV = async () => {
    if (timelineClips.length === 0) return alert("Timeline is empty!");
    setIsExporting(true);
    setShowExportMenu(false);
    try {
      const url = await exportTimelineToWAV(timelineClips);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${projectName}.wav`;
      a.click();
    } catch (e) {
      console.error(e);
      alert("Error exporting audio");
    } finally {
      setIsExporting(false);
    }
  };

  const videoMedia = importedMedia.filter(m => m.type === 'video');
  const audioMedia = importedMedia.filter(m => m.type === 'audio');

  const renderPanelContent = () => {
    switch (activeTab) {
      case 'video':
        return (
          <>
            <div className="action-grid">
              <button className="btn btn-outline" onClick={() => videoFileRef.current?.click()}>
                <Upload size={16} /> Upload
              </button>
              <button className="btn btn-outline" onClick={() => setIsURLModalOpen(true)}>
                <Link size={16} /> URL
              </button>
              <input type="file" ref={videoFileRef} onChange={handleVideoImport} accept="video/*" style={{ display: 'none' }} />
            </div>
            
            <div className="action-grid" style={{ gridTemplateColumns: '1fr' }}>
              <button className="btn btn-outline" onClick={() => setIsQRModalOpen(true)}>
                <QrCode size={16} /> Import via QR Code
              </button>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Project Videos ({videoMedia.length})</span>
              </div>
              
              <div className="veed-media-grid">
                {videoMedia.length === 0 ? (
                  <p style={{ fontSize: '0.75rem', color: '#9ca3af', gridColumn: '1 / -1', textAlign: 'center', padding: '24px 0' }}>
                    No videos imported yet.
                    <br />
                    <span style={{ fontSize: '0.65rem' }}>Upload or drag video files to start editing.</span>
                  </p>
                ) : (
                  videoMedia.map((media, i) => (
                    <div 
                      key={`v-${i}`} 
                      className="veed-media-item"
                      draggable
                      onDragStart={(e) => handleDragStart(e, media)}
                    >
                      <video src={media.url} />
                      <div className="media-item-badge"><FileVideo size={12} /> Video</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        );
      
      case 'audio':
        return (
          <>
            <div className="action-grid">
              <button className="btn btn-outline" onClick={() => audioFileRef.current?.click()}>
                <Upload size={16} /> Upload Audio
              </button>
              <button className="btn btn-outline" onClick={() => setIsURLModalOpen(true)}>
                <Link size={16} /> URL
              </button>
              <input type="file" ref={audioFileRef} onChange={handleAudioImport} accept="audio/*" style={{ display: 'none' }} />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Project Audio ({audioMedia.length})</span>
              </div>
              
              <div className="veed-media-grid">
                {audioMedia.length === 0 ? (
                  <p style={{ fontSize: '0.75rem', color: '#9ca3af', gridColumn: '1 / -1', textAlign: 'center', padding: '24px 0' }}>
                    No audio files imported yet.
                    <br />
                    <span style={{ fontSize: '0.65rem' }}>Upload .mp3, .wav, or .ogg files.</span>
                  </p>
                ) : (
                  audioMedia.map((media, i) => (
                    <div 
                      key={`a-${i}`} 
                      className="veed-media-item"
                      draggable
                      onDragStart={(e) => handleDragStart(e, media)}
                    >
                      <FileAudio size={28} color="#6b7280" />
                      <div className="media-item-badge"><Music size={12} /> Audio</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        );

      case 'subtitles':
        return (
          <>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', lineHeight: 1.6 }}>
              Auto-generate subtitles from your video or add them manually.
            </p>
            <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'center', padding: '16px', gap: '10px' }} disabled>
              <Captions size={18} /> Auto-Generate Subtitles
            </button>
            <p style={{ fontSize: '0.7rem', color: '#9ca3af', textAlign: 'center' }}>Coming soon — AI subtitle generation</p>
          </>
        );

      case 'text':
        return (
          <>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', lineHeight: 1.6 }}>
              Add text overlays to your video.
            </p>
            <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'center', padding: '16px', gap: '10px' }} disabled>
              <Type size={18} /> Add Title Text
            </button>
            <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'center', padding: '16px', gap: '10px' }} disabled>
              <Type size={14} /> Add Caption Text
            </button>
            <p style={{ fontSize: '0.7rem', color: '#9ca3af', textAlign: 'center' }}>Coming soon — Text overlay support</p>
          </>
        );

      case 'settings':
        return (
          <>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '16px' }}>
              Export & project settings.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'center', padding: '14px', gap: '10px' }} onClick={handleExportVideo} disabled={isExporting || timelineClips.length === 0}>
                <FileVideo size={16} /> {isExporting ? 'Exporting...' : 'Export as MP4'}
              </button>
              <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'center', padding: '14px', gap: '10px' }} onClick={handleExportWAV} disabled={isExporting || timelineClips.length === 0}>
                <FileAudio size={16} /> {isExporting ? 'Exporting...' : 'Export as WAV'}
              </button>
            </div>
            <div style={{ marginTop: '16px', padding: '12px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#374151' }}>Project Info</span>
              <p style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '4px' }}>
                Clips on timeline: {timelineClips.length}
                <br />
                Videos imported: {videoMedia.length}
                <br />
                Audio imported: {audioMedia.length}
              </p>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  const tabLabel = () => {
    switch(activeTab) {
      case 'video': return 'Video';
      case 'audio': return 'Audio';
      case 'subtitles': return 'Subtitles';
      case 'text': return 'Text';
      case 'settings': return 'Settings';
      default: return '';
    }
  };

  const handleTabClick = (tab: string) => {
    if (activeTab === tab) {
      setIsMobilePanelOpen(!isMobilePanelOpen);
    } else {
      setActiveTab(tab);
      setIsMobilePanelOpen(true);
    }
  };

  return (
    <div className="veed-layout">
      {/* 1. Left Vertical Toolbar */}
      <nav className="veed-sidebar-nav">
        <div className="veed-logo">M</div>
        
        <button className={`nav-item ${activeTab === 'video' ? 'active' : ''}`} onClick={() => handleTabClick('video')}>
          <Video size={22} />
          <span>Video</span>
        </button>
        <button className={`nav-item ${activeTab === 'audio' ? 'active' : ''}`} onClick={() => handleTabClick('audio')}>
          <Music size={22} />
          <span>Audio</span>
        </button>
        <button className={`nav-item ${activeTab === 'subtitles' ? 'active' : ''}`} onClick={() => handleTabClick('subtitles')}>
          <Captions size={22} />
          <span>Subtitles</span>
        </button>
        <button className={`nav-item ${activeTab === 'text' ? 'active' : ''}`} onClick={() => handleTabClick('text')}>
          <Type size={22} />
          <span>Text</span>
        </button>
        
        <div style={{ flex: 1 }} />
        <button className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => handleTabClick('settings')}>
          <Settings size={22} />
        </button>
      </nav>

      {/* 2. Contextual Panel */}
      <aside className={`veed-context-panel ${isMobilePanelOpen ? 'mobile-open' : ''}`}>
        <div className="panel-header">
          {tabLabel()}
        </div>
        
        <div className="panel-content">
          {renderPanelContent()}
        </div>
      </aside>

      {/* 3. Main Area */}
      <main className="veed-main-area">
        {/* Top Nav */}
        <header className="veed-top-nav">
          <div className="top-nav-left">
            <Undo2 size={18} color="#9ca3af" style={{ cursor: 'pointer' }} />
            <Redo2 size={18} color="#9ca3af" style={{ cursor: 'pointer' }} />
            <div style={{ width: '1px', height: '20px', background: '#e5e7eb' }} />
            {isEditingName ? (
              <input
                autoFocus
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                onBlur={() => setIsEditingName(false)}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
                style={{ 
                  fontSize: '0.9rem', fontWeight: 600, border: '1px solid #3b82f6', 
                  borderRadius: '6px', padding: '4px 8px', outline: 'none', width: '200px',
                  color: '#111827', background: '#fff'
                }}
              />
            ) : (
              <span 
                style={{ fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', color: '#374151' }}
                onClick={() => setIsEditingName(true)}
                title="Click to rename"
              >
                {projectName}
              </span>
            )}
          </div>
          
          <div className="top-nav-right" style={{ position: 'relative' }}>
            <button 
              className="btn btn-green" 
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={isExporting}
            >
              <Download size={16} /> {isExporting ? 'Exporting...' : 'Export'}
            </button>

            {showExportMenu && (
              <div className="export-dropdown">
                <button className="export-option" onClick={handleExportVideo}>
                  <FileVideo size={16} /> Export as MP4
                </button>
                <button className="export-option" onClick={handleExportWAV}>
                  <FileAudio size={16} /> Export as WAV
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Canvas */}
        <div className="veed-canvas-area">
          <PreviewPlayer />
        </div>

        {/* Timeline */}
        <Timeline />
      </main>

      <QRModal 
        isOpen={isQRModalOpen} 
        onClose={() => setIsQRModalOpen(false)} 
        onVideoReceived={(url) => addImportedMedia({ url, type: 'video' })} 
      />
      <URLModal 
        isOpen={isURLModalOpen} 
        onClose={() => setIsURLModalOpen(false)} 
        onVideoReceived={(url) => addImportedMedia({ url, type: 'video' })} 
      />
    </div>
  );
}

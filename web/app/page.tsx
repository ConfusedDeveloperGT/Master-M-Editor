"use client";

import React, { useState } from 'react';
import { QRModal } from '@/components/QRModal';
import { URLModal } from '@/components/URLModal';
import { Timeline } from '@/components/Timeline';
import { PreviewPlayer } from '@/components/PreviewPlayer';
import { useEditorStore } from '@/store/editorStore';
import { exportTimelineToVideo, exportTimelineToWAV } from '@/lib/ffmpeg';
import { Video, Music, Type, Captions, Settings, Download, Upload, Link, QrCode, Trash2, FileAudio, FileVideo, Undo2, Redo2, Volume2, Maximize, RotateCw, PlaySquare, Layers, Image as ImageIcon, LayoutGrid } from 'lucide-react';

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
  
  const { importedMedia, addImportedMedia, timelineClips, selectedClipId } = useEditorStore();

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

  const selectedClip = timelineClips.find(c => c.id === selectedClipId);

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
                <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Project Media</span>
              </div>
              
              <div className="veed-media-grid">
                {videoMedia.length === 0 ? (
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', gridColumn: '1 / -1', textAlign: 'center', padding: '24px 0' }}>
                    No videos imported yet.
                    <br />
                    <span style={{ fontSize: '0.65rem' }}>Upload or drag video files here.</span>
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
                <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Audio Files</span>
              </div>
              
              <div className="veed-media-grid">
                {audioMedia.length === 0 ? (
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', gridColumn: '1 / -1', textAlign: 'center', padding: '24px 0' }}>
                    No audio imported yet.
                    <br />
                    <span style={{ fontSize: '0.65rem' }}>Upload .mp3 or .wav</span>
                  </p>
                ) : (
                  audioMedia.map((media, i) => (
                    <div 
                      key={`a-${i}`} 
                      className="veed-media-item"
                      draggable
                      onDragStart={(e) => handleDragStart(e, media)}
                    >
                      <FileAudio size={28} color="var(--text-muted)" />
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
            <div style={{ padding: '16px', background: 'var(--bg-main)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '0.9rem', marginBottom: '8px' }}>Auto-Generate Subtitles</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                Automatically transcribe your video's audio using our AI model.
              </p>
              <button className="btn btn-green" style={{ width: '100%', justifyContent: 'center' }} disabled>
                <Captions size={16} /> Generate Subtitles
              </button>
            </div>
            
            <div style={{ marginTop: '16px' }}>
              <div className="action-grid">
                <button className="btn btn-outline" disabled>Manual Subtitles</button>
                <button className="btn btn-outline" disabled>Upload .SRT</button>
              </div>
            </div>
          </>
        );

      case 'text':
        return (
          <>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Add text overlays to your video. Drag to the timeline.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
              <div className="veed-media-item" style={{ height: '60px', aspectRatio: 'auto', background: 'var(--bg-main)' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>Add a Heading</span>
              </div>
              <div className="veed-media-item" style={{ height: '50px', aspectRatio: 'auto', background: 'var(--bg-main)' }}>
                <span style={{ fontSize: '1rem', fontWeight: 600 }}>Add a Subheading</span>
              </div>
              <div className="veed-media-item" style={{ height: '40px', aspectRatio: 'auto', background: 'var(--bg-main)' }}>
                <span style={{ fontSize: '0.8rem' }}>Add a body text</span>
              </div>
            </div>
          </>
        );
        
      case 'elements':
        return (
          <>
             <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Add shapes, stickers, and progress bars.
            </p>
            <div className="veed-media-grid" style={{ marginTop: '16px' }}>
              <div className="veed-media-item" style={{ background: 'var(--bg-main)' }}>
                <div style={{ width: '40px', height: '40px', background: '#3b82f6', borderRadius: '4px' }} />
              </div>
              <div className="veed-media-item" style={{ background: 'var(--bg-main)' }}>
                <div style={{ width: '40px', height: '40px', background: '#ef4444', borderRadius: '50%' }} />
              </div>
            </div>
          </>
        );

      case 'settings':
        return (
          <>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Project Information.
            </p>
            <div style={{ padding: '12px', background: 'var(--bg-main)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-main)' }}>Stats</span>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '8px', lineHeight: 1.8 }}>
                Total Clips: {timelineClips.length}
                <br />
                Imported Media: {importedMedia.length}
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
      case 'video': return 'Media';
      case 'audio': return 'Audio';
      case 'subtitles': return 'Subtitles';
      case 'text': return 'Text';
      case 'elements': return 'Elements';
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
          <LayoutGrid size={22} />
          <span>Media</span>
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
        <button className={`nav-item ${activeTab === 'elements' ? 'active' : ''}`} onClick={() => handleTabClick('elements')}>
          <Layers size={22} />
          <span>Elements</span>
        </button>
        
        <div style={{ flex: 1 }} />
        <button className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => handleTabClick('settings')}>
          <Settings size={22} />
        </button>
      </nav>

      {/* 2. Contextual Panel (Left) */}
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
            <Undo2 size={18} color="var(--text-muted)" style={{ cursor: 'pointer' }} />
            <Redo2 size={18} color="var(--text-muted)" style={{ cursor: 'pointer' }} />
            <div style={{ width: '1px', height: '20px', background: 'var(--border-color)' }} />
            {isEditingName ? (
              <input
                autoFocus
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                onBlur={() => setIsEditingName(false)}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
                style={{ 
                  fontSize: '0.9rem', fontWeight: 600, border: '1px solid var(--accent-blue)', 
                  borderRadius: '6px', padding: '4px 8px', outline: 'none', width: '200px',
                  color: 'var(--text-main)', background: 'var(--bg-main)'
                }}
              />
            ) : (
              <span 
                style={{ fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', color: 'var(--text-main)' }}
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

      {/* 4. Properties Panel (Right) */}
      {selectedClip && (
        <aside className="veed-properties-panel">
          <div className="panel-header" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {selectedClip.type === 'video' ? <Video size={18} /> : <Music size={18} />}
            <span style={{ fontSize: '1rem' }}>Clip Properties</span>
          </div>
          
          <div className="prop-section">
            <div className="prop-title">Transform</div>
            <div className="prop-row">
              <span className="prop-label"><Maximize size={14} style={{ marginRight: '8px', verticalAlign: 'middle' }}/>Scale</span>
              <input type="range" min="0" max="200" defaultValue="100" className="prop-slider" />
            </div>
            <div className="prop-row">
              <span className="prop-label"><RotateCw size={14} style={{ marginRight: '8px', verticalAlign: 'middle' }}/>Rotation</span>
              <input type="range" min="0" max="360" defaultValue="0" className="prop-slider" />
            </div>
          </div>

          <div className="prop-section">
            <div className="prop-title">Audio</div>
            <div className="prop-row">
              <span className="prop-label"><Volume2 size={14} style={{ marginRight: '8px', verticalAlign: 'middle' }}/>Volume</span>
              <input type="range" min="0" max="100" defaultValue="100" className="prop-slider" />
            </div>
          </div>

          <div className="prop-section">
            <div className="prop-title">AI Tools</div>
            <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'flex-start', marginBottom: '8px' }}>
               ✨ Magic Cut
            </button>
            <button className="btn btn-outline" style={{ width: '100%', justifyContent: 'flex-start' }}>
               👤 Remove Background
            </button>
          </div>
        </aside>
      )}

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

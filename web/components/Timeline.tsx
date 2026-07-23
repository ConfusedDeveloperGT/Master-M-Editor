"use client";

import React, { DragEvent, useState, useEffect, useRef } from 'react';
import { useEditorStore, TimelineClip } from '@/store/editorStore';
import { Scissors, Play, Pause, FastForward, ZoomOut, ZoomIn, Maximize, Type, Captions, Video, Music } from 'lucide-react';

export function Timeline() {
  const { 
    timelineClips, addTimelineClip, removeTimelineClip, currentTime, 
    setCurrentTime, moveTimelineClip, isPlaying, setIsPlaying,
    selectedClipId, setSelectedClipId, splitTimelineClip, updateTimelineClip
  } = useEditorStore();

  const containerRef = useRef<HTMLDivElement>(null);
  
  // Trimming State
  const [trimState, setTrimState] = useState<{
    id: string;
    type: 'left' | 'right';
    startX: number;
    initialOffset: number;
    initialDuration: number;
  } | null>(null);

  useEffect(() => {
    if (!trimState) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const deltaX = e.clientX - trimState.startX;
      const deltaPercentage = deltaX / rect.width;
      const deltaTime = deltaPercentage * maxTime;

      if (trimState.type === 'left') {
        let newOffset = trimState.initialOffset + deltaTime;
        let newDuration = trimState.initialDuration - deltaTime;
        
        if (newDuration < 0.5) {
          newOffset = trimState.initialOffset + (trimState.initialDuration - 0.5);
          newDuration = 0.5;
        }
        if (newOffset < 0) {
          newDuration = trimState.initialDuration + trimState.initialOffset;
          newOffset = 0;
        }
        
        updateTimelineClip(trimState.id, { offset: newOffset, duration: newDuration });
      } else {
        let newDuration = trimState.initialDuration + deltaTime;
        if (newDuration < 0.5) newDuration = 0.5;
        updateTimelineClip(trimState.id, { duration: newDuration });
      }
    };

    const handleMouseUp = () => {
      setTrimState(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [trimState]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Backspace' || e.key === 'Delete') && selectedClipId) {
        removeTimelineClip(selectedClipId);
        setSelectedClipId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedClipId, removeTimelineClip, setSelectedClipId]);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, trackType: 'video' | 'audio' | 'text' | 'subtitle') => {
    e.preventDefault();
    const dataStr = e.dataTransfer.getData('text/plain');
    if (!dataStr) return;

    let data;
    try {
      data = JSON.parse(dataStr);
    } catch {
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    // Offset by track label width (80px)
    const x = Math.max(0, e.clientX - rect.left - 80);
    const percentage = x / (rect.width - 80);
    const dropTime = percentage * maxTime;

    const sameTypeClips = useEditorStore.getState().timelineClips.filter(c => c.type === trackType);
    let targetIndex = sameTypeClips.length;
    for (let i = 0; i < sameTypeClips.length; i++) {
      if (dropTime < sameTypeClips[i].end) {
        targetIndex = dropTime < (sameTypeClips[i].start + sameTypeClips[i].end) / 2 ? i : i + 1;
        break;
      }
    }

    if (data.type === 'timeline-clip') {
      if (data.trackType !== trackType) return;
      moveTimelineClip(data.id, targetIndex);
      return;
    }

    // Only allow media matching the track type for now
    if (data.type !== trackType && trackType !== 'text' && trackType !== 'subtitle') return;

    if (trackType === 'text' || trackType === 'subtitle') {
       // Mock insertion for text/subtitles
       const id = crypto.randomUUID();
       addTimelineClip({ id, sourceUrl: '', type: trackType, start: 0, end: 5, duration: 5, offset: 0 });
       useEditorStore.getState().moveTimelineClip(id, targetIndex);
       return;
    }

    const mediaElement = trackType === 'audio' ? document.createElement('audio') : document.createElement('video');
    mediaElement.src = data.url;
    mediaElement.onloadedmetadata = () => {
      const id = crypto.randomUUID();
      addTimelineClip({ id, sourceUrl: data.url, type: trackType, start: 0, end: mediaElement.duration, duration: mediaElement.duration, offset: 0 });
      useEditorStore.getState().moveTimelineClip(id, targetIndex);
    };
  };

  const maxTime = Math.max(60, timelineClips.length > 0 ? Math.max(...timelineClips.map(c => c.end)) + 10 : 60);

  const handleClipDragStart = (e: React.DragEvent<HTMLDivElement>, clip: TimelineClip) => {
    if (trimState) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'timeline-clip', id: clip.id, trackType: clip.type }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('.veed-clip') || (e.target as HTMLElement).closest('.veed-track-label')) return;
    
    setSelectedClipId(null);
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, e.clientX - rect.left - 80);
    const percentage = x / (rect.width - 80);
    setCurrentTime(percentage * maxTime);
  };

  const togglePlay = () => setIsPlaying(!isPlaying);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toFixed(1).padStart(4, '0')}`;
  };

  const renderClip = (clip: TimelineClip) => {
    const isSelected = selectedClipId === clip.id;
    return (
      <div 
        key={clip.id} 
        className={`veed-clip veed-clip-${clip.type}`}
        draggable={!trimState}
        onDragStart={(e) => handleClipDragStart(e, clip)}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedClipId(clip.id);
        }}
        style={{
          left: `${(clip.start / maxTime) * 100}%`,
          width: `${(clip.duration / maxTime) * 100}%`,
          boxShadow: isSelected ? '0 0 0 2px var(--text-main)' : 'var(--shadow-sm)',
          zIndex: isSelected ? 10 : 1
        }}
      >
        <div 
          className="trim-handle trim-handle-left"
          onMouseDown={(e) => {
            e.stopPropagation();
            setTrimState({ id: clip.id, type: 'left', startX: e.clientX, initialOffset: clip.offset, initialDuration: clip.duration });
          }}
        />
        
        <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', pointerEvents: 'none' }}>
          {clip.type === 'video' ? 'Video.mp4' : clip.type === 'audio' ? 'Audio.wav' : clip.type === 'subtitle' ? 'Subtitles' : 'Text Layer'}
        </span>
        
        <div 
          className="trim-handle trim-handle-right"
          onMouseDown={(e) => {
            e.stopPropagation();
            setTrimState({ id: clip.id, type: 'right', startX: e.clientX, initialOffset: clip.offset, initialDuration: clip.duration });
          }}
        />
      </div>
    );
  };

  return (
    <footer className="veed-timeline-area">
      <div className="timeline-toolbar">
        <div className="timeline-controls">
          <button 
            className="btn btn-outline" 
            style={{ padding: '6px 12px', opacity: selectedClipId ? 1 : 0.5, border: 'none' }}
            onClick={() => selectedClipId && splitTimelineClip(selectedClipId, currentTime)}
            disabled={!selectedClipId}
          >
            <Scissors size={16} /> Split
          </button>
        </div>
        
        <div className="playback-controls">
          <button className="btn-icon"><FastForward size={16} style={{ transform: 'rotate(180deg)' }} /></button>
          <button className="btn-icon" onClick={togglePlay} style={{ color: 'var(--bg-main)', background: 'var(--text-main)' }}>
            {isPlaying ? <Pause size={20} /> : <Play size={20} style={{ marginLeft: '2px' }}/>}
          </button>
          <button className="btn-icon"><FastForward size={16} /></button>
          <span className="timecode">
            {formatTime(currentTime)} / {formatTime(timelineClips.length > 0 ? Math.max(...timelineClips.map(c => c.end)) : 0)}
          </span>
        </div>
        
        <div className="timeline-controls">
          <button className="btn-icon"><ZoomOut size={16} /></button>
          <button className="btn-icon"><ZoomIn size={16} /></button>
          <button className="btn btn-outline" style={{ display: 'flex', gap: '4px', fontSize: '0.75rem', alignItems: 'center', border: 'none', padding: '4px 8px' }}>
            <Maximize size={14} /> Fit
          </button>
        </div>
      </div>

      <div className="timeline-tracks" onClick={handleTimelineClick} ref={containerRef}>
        
        {/* Playhead */}
        <div 
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: `calc(80px + ${(currentTime / maxTime) * 100}%)`,
            width: '2px',
            backgroundColor: 'var(--accent-blue)',
            zIndex: 20,
            pointerEvents: 'none'
          }}
        >
          <div style={{
            position: 'absolute',
            top: '0',
            left: '-5px',
            width: '12px',
            height: '12px',
            backgroundColor: 'var(--accent-blue)',
            borderRadius: '2px 2px 50% 50%',
          }} />
        </div>

        {/* Text Track */}
        <div className="veed-track-container" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, 'text')}>
          <div className="veed-track-label"><Type size={14} style={{ marginRight: '6px' }}/> Text</div>
          <div className="veed-track veed-track-content">
            {timelineClips.filter(c => c.type === 'text').map(renderClip)}
          </div>
        </div>

        {/* Subtitles Track */}
        <div className="veed-track-container" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, 'subtitle')}>
          <div className="veed-track-label"><Captions size={14} style={{ marginRight: '6px' }}/> Subs</div>
          <div className="veed-track veed-track-content">
            {timelineClips.filter(c => c.type === 'subtitle').map(renderClip)}
          </div>
        </div>

        {/* Video Track */}
        <div className="veed-track-container" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, 'video')}>
          <div className="veed-track-label"><Video size={14} style={{ marginRight: '6px' }}/> Video</div>
          <div className="veed-track veed-track-content">
            {timelineClips.filter(c => c.type === 'video').length === 0 ? (
              <div style={{ position: 'absolute', width: '100%', top: '24px', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Drag video media here
              </div>
            ) : (
              timelineClips.filter(c => c.type === 'video').map(renderClip)
            )}
          </div>
        </div>

        {/* Audio Track */}
        <div className="veed-track-container" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, 'audio')}>
          <div className="veed-track-label"><Music size={14} style={{ marginRight: '6px' }}/> Audio</div>
          <div className="veed-track veed-track-content">
            {timelineClips.filter(c => c.type === 'audio').map(renderClip)}
          </div>
        </div>

      </div>
    </footer>
  );
}

"use client";

import React, { DragEvent } from 'react';
import { useEditorStore } from '@/store/editorStore';

export function Timeline() {
  const { timelineClips, addTimelineClip, removeTimelineClip, currentTime, setCurrentTime } = useEditorStore();

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const url = e.dataTransfer.getData('text/plain');
    if (!url) return;

    // By default, assuming clip is 5 seconds. In reality, we need to load it to get duration.
    // For now, we append it to the end of the timeline.
    const lastClip = timelineClips[timelineClips.length - 1];
    const startTime = lastClip ? lastClip.end : 0;
    const duration = 5; // Default stub duration

    addTimelineClip({
      sourceUrl: url,
      type: 'video',
      start: startTime,
      end: startTime + duration,
      duration: duration,
      offset: 0
    });
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    
    // Assuming max timeline length is 60 seconds for now
    const newTime = percentage * 60; 
    setCurrentTime(newTime);
  };

  return (
    <footer className="editor-timeline">
      <div 
        className="timeline-tracks"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="track track-video" style={{ position: 'relative' }}>
          <span className="track-label">Video 1</span>
          <div className="track-content" onClick={handleTimelineClick}>
            {timelineClips.length === 0 ? (
              <span>Drop media here</span>
            ) : (
              timelineClips.map((clip) => (
                <div 
                  key={clip.id} 
                  style={{
                    position: 'absolute',
                    left: `${(clip.start / 60) * 100}%`,
                    width: `${(clip.duration / 60) * 100}%`,
                    height: '80%',
                    top: '10%',
                    backgroundColor: 'rgba(99, 102, 241, 0.5)',
                    border: '1px solid #6366f1',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 4px',
                    overflow: 'hidden'
                  }}
                >
                  <span style={{ fontSize: '10px', color: '#fff', whiteSpace: 'nowrap' }}>Clip</span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); removeTimelineClip(clip.id); }}
                    style={{ position: 'absolute', right: '4px', background: 'transparent', border: 'none', color: '#ff4d4f', cursor: 'pointer' }}
                  >
                    ×
                  </button>
                </div>
              ))
            )}
            
            {/* Playhead */}
            <div 
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: `${(currentTime / 60) * 100}%`,
                width: '2px',
                backgroundColor: '#ec4899',
                zIndex: 10,
                pointerEvents: 'none'
              }}
            />
          </div>
        </div>
      </div>
    </footer>
  );
}

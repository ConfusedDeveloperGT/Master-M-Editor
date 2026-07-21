"use client";

import React, { useEffect, useRef } from 'react';
import { useEditorStore } from '@/store/editorStore';

export function PreviewPlayer() {
  const { timelineClips, currentTime, isPlaying, setCurrentTime, setIsPlaying } = useEditorStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const requestRef = useRef<number>();

  // Find the active clip for the current time
  const activeClip = timelineClips.find(
    (clip) => currentTime >= clip.start && currentTime < clip.end
  );

  useEffect(() => {
    if (!videoRef.current) return;
    
    if (activeClip) {
      const videoTime = (currentTime - activeClip.start) + activeClip.offset;
      // Only seek if the difference is large enough to avoid stuttering
      if (Math.abs(videoRef.current.currentTime - videoTime) > 0.1) {
        videoRef.current.currentTime = videoTime;
      }
    }
  }, [currentTime, activeClip]);

  useEffect(() => {
    if (isPlaying && activeClip && videoRef.current) {
      videoRef.current.play().catch(() => {
        // Handle autoplay restrictions or play errors
      });
    } else if (videoRef.current) {
      videoRef.current.pause();
    }
  }, [isPlaying, activeClip]);

  // Handle Playback loop
  useEffect(() => {
    let lastTime = performance.now();

    const updateTime = (time: number) => {
      if (isPlaying) {
        const delta = (time - lastTime) / 1000;
        setCurrentTime(currentTime + delta);
      }
      lastTime = time;
      if (isPlaying) {
        requestRef.current = requestAnimationFrame(updateTime);
      }
    };

    if (isPlaying) {
      requestRef.current = requestAnimationFrame(updateTime);
    }

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isPlaying, currentTime, setCurrentTime]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <section className="editor-preview">
      <div className="video-player">
        {activeClip ? (
          <video 
            ref={videoRef}
            src={activeClip.sourceUrl}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            muted // Muted for auto-play without restrictions during dev
          />
        ) : (
          <p style={{ color: '#94a3b8' }}>No media at this time</p>
        )}
      </div>
      <div className="player-controls">
        <span style={{ color: '#e2e8f0', marginRight: '16px', fontFamily: 'monospace' }}>
          {currentTime.toFixed(2)}s
        </span>
        <button className="control-btn" onClick={togglePlay}>
          {isPlaying ? '⏸ Pause' : '▶ Play'}
        </button>
      </div>
    </section>
  );
}

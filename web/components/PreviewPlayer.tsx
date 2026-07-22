"use client";

import React, { useEffect, useRef } from 'react';
import { useEditorStore } from '@/store/editorStore';
import { Settings, MonitorPlay } from 'lucide-react';

export function PreviewPlayer() {
  const { timelineClips, currentTime, isPlaying, setCurrentTime, setIsPlaying } = useEditorStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const requestRef = useRef<number>();

  const activeVideoClip = timelineClips.find(
    (clip) => clip.type === 'video' && currentTime >= clip.start && currentTime < clip.end
  );
  
  const activeAudioClip = timelineClips.find(
    (clip) => clip.type === 'audio' && currentTime >= clip.start && currentTime < clip.end
  );

  // Sync Video
  useEffect(() => {
    if (!videoRef.current) return;
    if (activeVideoClip) {
      const videoTime = (currentTime - activeVideoClip.start) + activeVideoClip.offset;
      if (Math.abs(videoRef.current.currentTime - videoTime) > 0.1) {
        videoRef.current.currentTime = videoTime;
      }
    }
  }, [currentTime, activeVideoClip]);

  // Sync Audio
  useEffect(() => {
    if (!audioRef.current) return;
    if (activeAudioClip) {
      const audioTime = (currentTime - activeAudioClip.start) + activeAudioClip.offset;
      if (Math.abs(audioRef.current.currentTime - audioTime) > 0.1) {
        audioRef.current.currentTime = audioTime;
      }
    }
  }, [currentTime, activeAudioClip]);

  // Play/Pause Video
  useEffect(() => {
    if (isPlaying && activeVideoClip && videoRef.current) {
      videoRef.current.play().catch(() => {});
    } else if (videoRef.current) {
      videoRef.current.pause();
    }
  }, [isPlaying, activeVideoClip]);

  // Play/Pause Audio
  useEffect(() => {
    if (isPlaying && activeAudioClip && audioRef.current) {
      audioRef.current.play().catch(() => {});
    } else if (audioRef.current) {
      audioRef.current.pause();
    }
  }, [isPlaying, activeAudioClip]);

  // Calculate the end time of the last clip
  const maxTime = timelineClips.length > 0 ? Math.max(...timelineClips.map(c => c.end)) : 0;

  // Handle Playback loop
  useEffect(() => {
    let lastTime = performance.now();

    const updateTime = (time: number) => {
      if (isPlaying) {
        const delta = (time - lastTime) / 1000;
        let newTime = currentTime + delta;
        
        if (maxTime > 0 && newTime >= maxTime) {
          newTime = maxTime;
          setIsPlaying(false);
        }
        
        setCurrentTime(newTime);
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
  }, [isPlaying, currentTime, setCurrentTime, maxTime, setIsPlaying]);

  return (
    <>
      <div className="veed-player-wrapper">
        {activeVideoClip ? (
          <video 
            ref={videoRef}
            src={activeVideoClip.sourceUrl}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            muted
          />
        ) : (
          <p style={{ color: '#4b5563' }}>No video at this time</p>
        )}
        {activeAudioClip && (
          <audio ref={audioRef} src={activeAudioClip.sourceUrl} />
        )}
      </div>
      
      <div className="veed-canvas-settings">
        <div className="setting-item">
          <MonitorPlay size={16} />
          <span>Wide Landscape (16:9)</span>
        </div>
        <div style={{ width: '1px', height: '16px', background: 'var(--border-color)', margin: '0 8px' }} />
        <div className="setting-item">
          <div className="color-circle" style={{ background: '#000' }} />
          <span>Background</span>
        </div>
        <div style={{ width: '1px', height: '16px', background: 'var(--border-color)', margin: '0 8px' }} />
        <div className="setting-item">
          <Settings size={16} />
          <span>Settings</span>
        </div>
      </div>
    </>
  );
}

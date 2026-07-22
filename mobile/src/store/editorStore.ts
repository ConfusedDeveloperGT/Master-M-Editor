import { create } from 'zustand';

export interface TimelineClip {
  id: string;
  sourceUrl: string;
  type: 'video' | 'audio';
  start: number; // Start time in the timeline (seconds)
  end: number;   // End time in the timeline (seconds)
  duration: number; // Total duration of the clip
  offset: number; // Offset from the start of the source media (for trimming)
}

interface EditorState {
  importedMedia: string[];
  timelineClips: TimelineClip[];
  currentTime: number;
  isPlaying: boolean;
  addImportedMedia: (url: string) => void;
  addTimelineClip: (clip: Omit<TimelineClip, 'id'>) => void;
  updateTimelineClip: (id: string, updates: Partial<TimelineClip>) => void;
  removeTimelineClip: (id: string) => void;
  setCurrentTime: (time: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  importedMedia: [],
  timelineClips: [],
  currentTime: 0,
  isPlaying: false,

  addImportedMedia: (url) => set((state) => ({
    importedMedia: [...state.importedMedia, url]
  })),

  addTimelineClip: (clip) => set((state) => ({
    timelineClips: [
      ...state.timelineClips,
      { ...clip, id: crypto.randomUUID() }
    ]
  })),

  updateTimelineClip: (id, updates) => set((state) => ({
    timelineClips: state.timelineClips.map((clip) => 
      clip.id === id ? { ...clip, ...updates } : clip
    )
  })),

  removeTimelineClip: (id) => set((state) => ({
    timelineClips: state.timelineClips.filter((clip) => clip.id !== id)
  })),

  setCurrentTime: (time) => set({ currentTime: time }),
  
  setIsPlaying: (isPlaying) => set({ isPlaying })
}));

import { create } from 'zustand';

export interface ImportedMedia {
  url: string;
  type: 'video' | 'audio';
}

const recalculateTimes = (clips: TimelineClip[]) => {
  let videoTime = 0;
  let audioTime = 0;
  return clips.map(clip => {
    if (clip.type === 'video') {
      const newClip = { ...clip, start: videoTime, end: videoTime + clip.duration };
      videoTime += clip.duration;
      return newClip;
    } else {
      const newClip = { ...clip, start: audioTime, end: audioTime + clip.duration };
      audioTime += clip.duration;
      return newClip;
    }
  });
};

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
  importedMedia: ImportedMedia[];
  timelineClips: TimelineClip[];
  currentTime: number;
  isPlaying: boolean;
  selectedClipId: string | null;
  setSelectedClipId: (id: string | null) => void;
  addImportedMedia: (media: ImportedMedia) => void;
  addTimelineClip: (clip: Omit<TimelineClip, 'id'>) => void;
  updateTimelineClip: (id: string, updates: Partial<TimelineClip>) => void;
  removeTimelineClip: (id: string) => void;
  moveTimelineClip: (id: string, newTypeIndex: number) => void;
  splitTimelineClip: (id: string, time: number) => void;
  setCurrentTime: (time: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  importedMedia: [],
  timelineClips: [],
  selectedClipId: null,
  currentTime: 0,
  isPlaying: false,

  setSelectedClipId: (id) => set({ selectedClipId: id }),

  addImportedMedia: (media) => set((state) => ({
    importedMedia: [...state.importedMedia, media]
  })),

  addTimelineClip: (clip) => set((state) => ({
    timelineClips: recalculateTimes([
      ...state.timelineClips,
      { ...clip, id: crypto.randomUUID() }
    ])
  })),

  updateTimelineClip: (id, updates) => set((state) => ({
    timelineClips: recalculateTimes(state.timelineClips.map((clip) => 
      clip.id === id ? { ...clip, ...updates } : clip
    ))
  })),

  removeTimelineClip: (id) => set((state) => ({
    timelineClips: recalculateTimes(state.timelineClips.filter((clip) => clip.id !== id))
  })),

  moveTimelineClip: (id, newTypeIndex) => set((state) => {
    const clipToMove = state.timelineClips.find(c => c.id === id);
    if (!clipToMove) return state;

    const type = clipToMove.type;
    const sameTypeClips = state.timelineClips.filter(c => c.type === type);
    const otherTypeClips = state.timelineClips.filter(c => c.type !== type);

    const oldIndex = sameTypeClips.findIndex(c => c.id === id);
    if (oldIndex === -1) return state;

    sameTypeClips.splice(oldIndex, 1);
    sameTypeClips.splice(newTypeIndex, 0, clipToMove);

    return { timelineClips: recalculateTimes([...sameTypeClips, ...otherTypeClips]) };
  }),

  splitTimelineClip: (id, splitTime) => set((state) => {
    const clipIndex = state.timelineClips.findIndex(c => c.id === id);
    if (clipIndex === -1) return state;

    const clip = state.timelineClips[clipIndex];
    if (splitTime <= clip.start || splitTime >= clip.end) return state;

    const splitDuration = splitTime - clip.start;
    
    const firstHalf = { ...clip, duration: splitDuration };
    
    const secondHalf = {
      ...clip,
      id: crypto.randomUUID(),
      offset: clip.offset + splitDuration,
      duration: clip.duration - splitDuration,
    };

    const sameTypeClips = state.timelineClips.filter(c => c.type === clip.type);
    const otherTypeClips = state.timelineClips.filter(c => c.type !== clip.type);

    const oldIndex = sameTypeClips.findIndex(c => c.id === id);
    sameTypeClips.splice(oldIndex, 1, firstHalf, secondHalf);

    return { timelineClips: recalculateTimes([...sameTypeClips, ...otherTypeClips]) };
  }),

  setCurrentTime: (time) => set({ currentTime: time }),
  
  setIsPlaying: (isPlaying) => set({ isPlaying })
}));

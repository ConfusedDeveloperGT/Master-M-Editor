import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { TimelineClip } from '@/store/editorStore';

let ffmpeg: FFmpeg | null = null;

export const loadFFmpeg = async (): Promise<FFmpeg> => {
  if (ffmpeg) return ffmpeg;

  ffmpeg = new FFmpeg();
  
  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
  
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  });
  
  return ffmpeg;
};

export const exportTimelineToVideo = async (clips: TimelineClip[], onProgress?: (p: number) => void): Promise<string> => {
  if (clips.length === 0) throw new Error("Timeline is empty");
  
  const videoClips = clips.filter(c => c.type === 'video');
  const audioClips = clips.filter(c => c.type === 'audio');
  
  if (videoClips.length === 0 && audioClips.length === 0) throw new Error("Timeline is empty");
  
  const ff = await loadFFmpeg();
  
  if (onProgress) {
    ff.on('progress', ({ progress }) => {
      onProgress(progress * 100);
    });
  }

  const inputFiles = [];
  let vList = '';
  let aList = '';
  
  for (let i = 0; i < clips.length; i++) {
    const clip = clips[i];
    const fileName = `input_${i}_${clip.type}.mp4`;
    await ff.writeFile(fileName, await fetchFile(clip.sourceUrl));
    inputFiles.push(fileName);
    if (clip.type === 'video') {
      vList += `file '${fileName}'\ninpoint ${clip.offset}\noutpoint ${clip.offset + clip.duration}\n`;
    } else {
      aList += `file '${fileName}'\ninpoint ${clip.offset}\noutpoint ${clip.offset + clip.duration}\n`;
    }
  }

  const cleanupFiles = [...inputFiles, 'output.mp4'];

  if (videoClips.length > 0) {
    await ff.writeFile('vlist.txt', vList);
    cleanupFiles.push('vlist.txt', 'temp_video.mp4');
    await ff.exec(['-f', 'concat', '-safe', '0', '-i', 'vlist.txt', '-c', 'copy', 'temp_video.mp4']);
  }
  
  if (audioClips.length > 0) {
    await ff.writeFile('alist.txt', aList);
    cleanupFiles.push('alist.txt', 'temp_audio.wav');
    await ff.exec(['-f', 'concat', '-safe', '0', '-i', 'alist.txt', '-vn', 'temp_audio.wav']);
  }

  let execArgs: string[] = [];
  if (videoClips.length > 0 && audioClips.length > 0) {
    // Mux video track and audio track, replacing video's original audio
    execArgs = ['-i', 'temp_video.mp4', '-i', 'temp_audio.wav', '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy', '-c:a', 'aac', 'output.mp4'];
  } else if (videoClips.length > 0) {
    execArgs = ['-i', 'temp_video.mp4', '-c', 'copy', 'output.mp4'];
  } else if (audioClips.length > 0) {
    execArgs = ['-i', 'temp_audio.wav', '-c:a', 'aac', 'output.mp4'];
  }

  await ff.exec(execArgs);

  const data = await ff.readFile('output.mp4');
  
  for (const name of cleanupFiles) {
    try { await ff.deleteFile(name); } catch(e) {}
  }

  const blob = new Blob([data as unknown as BlobPart], { type: 'video/mp4' });
  return URL.createObjectURL(blob);
};

export const exportTimelineToWAV = async (clips: TimelineClip[], onProgress?: (p: number) => void): Promise<string> => {
  if (clips.length === 0) throw new Error("Timeline is empty");
  
  const audioClips = clips.filter(c => c.type === 'audio');
  const targetClips = audioClips.length > 0 ? audioClips : clips.filter(c => c.type === 'video');
  
  if (targetClips.length === 0) throw new Error("Timeline is empty");

  const ff = await loadFFmpeg();
  
  if (onProgress) {
    ff.on('progress', ({ progress }) => {
      onProgress(progress * 100);
    });
  }

  const inputFiles = [];
  let fileList = '';
  
  for (let i = 0; i < targetClips.length; i++) {
    const clip = targetClips[i];
    const fileName = `input_${i}.mp4`;
    await ff.writeFile(fileName, await fetchFile(clip.sourceUrl));
    inputFiles.push(fileName);
    fileList += `file '${fileName}'\ninpoint ${clip.offset}\noutpoint ${clip.offset + clip.duration}\n`;
  }
  
  await ff.writeFile('list.txt', fileList);
  await ff.exec(['-f', 'concat', '-safe', '0', '-i', 'list.txt', '-vn', '-acodec', 'pcm_s16le', '-ar', '44100', '-ac', '2', 'output.wav']);

  const data = await ff.readFile('output.wav');
  
  // Clean up
  try { await ff.deleteFile('list.txt'); } catch(e) {}
  try { await ff.deleteFile('output.wav'); } catch(e) {}
  for (const name of inputFiles) {
    try { await ff.deleteFile(name); } catch(e) {}
  }

  const blob = new Blob([data as unknown as BlobPart], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
};

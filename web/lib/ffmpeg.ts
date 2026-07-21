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
  
  const ff = await loadFFmpeg();
  
  if (onProgress) {
    ff.on('progress', ({ progress }) => {
      onProgress(progress * 100);
    });
  }

  const inputFiles = [];
  let fileList = '';
  
  for (let i = 0; i < clips.length; i++) {
    const clip = clips[i];
    const fileName = `input_${i}.mp4`;
    await ff.writeFile(fileName, await fetchFile(clip.sourceUrl));
    inputFiles.push(fileName);
    fileList += `file '${fileName}'\n`;
  }

  await ff.writeFile('list.txt', fileList);
  await ff.exec(['-f', 'concat', '-safe', '0', '-i', 'list.txt', '-c', 'copy', 'output.mp4']);

  const data = await ff.readFile('output.mp4');
  
  // Clean up
  await ff.deleteFile('list.txt');
  await ff.deleteFile('output.mp4');
  for (const name of inputFiles) {
    await ff.deleteFile(name);
  }

  const blob = new Blob([(data as Uint8Array).buffer], { type: 'video/mp4' });
  return URL.createObjectURL(blob);
};

export const exportTimelineToWAV = async (clips: TimelineClip[], onProgress?: (p: number) => void): Promise<string> => {
  if (clips.length === 0) throw new Error("Timeline is empty");
  
  const ff = await loadFFmpeg();
  
  if (onProgress) {
    ff.on('progress', ({ progress }) => {
      onProgress(progress * 100);
    });
  }

  const inputFiles = [];
  let fileList = '';
  
  for (let i = 0; i < clips.length; i++) {
    const clip = clips[i];
    const fileName = `input_${i}.mp4`;
    await ff.writeFile(fileName, await fetchFile(clip.sourceUrl));
    inputFiles.push(fileName);
    fileList += `file '${fileName}'\n`;
  }
  
  await ff.writeFile('list.txt', fileList);
  await ff.exec(['-f', 'concat', '-safe', '0', '-i', 'list.txt', '-vn', '-acodec', 'pcm_s16le', '-ar', '44100', '-ac', '2', 'output.wav']);

  const data = await ff.readFile('output.wav');
  
  // Clean up
  await ff.deleteFile('list.txt');
  await ff.deleteFile('output.wav');
  for (const name of inputFiles) {
    await ff.deleteFile(name);
  }

  const blob = new Blob([(data as Uint8Array).buffer], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
};

import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { writeFile } from 'node:fs/promises';

const root = fileURLToPath(new URL('../', import.meta.url));
const executable = process.env.FFMPEG || fileURLToPath(new URL('../.cache/video-tools/node_modules/ffmpeg-static/ffmpeg.exe', import.meta.url));
const output = 'evidence/OutsideCue-demo.mp4';
const result = spawnSync(executable, ['-y', '-ignore_loop', '1', '-i', 'evidence/demo-tour.gif',
  '-vf', "drawbox=x=0:y=0:w=iw:h=48:color=white:t=fill,drawtext=text='Outside Cue - actual browser capture tour (not real-time)':fontcolor=black:fontsize=22:x=20:y=12,format=yuv420p",
  '-r', '24', '-c:v', 'libx264', '-crf', '20', '-movflags', '+faststart', output], { cwd: root, encoding: 'utf8', timeout: 60000, windowsHide: true });
if (result.error || result.status !== 0) throw result.error || new Error(result.stderr);
const verify = spawnSync(executable, ['-i', output, '-f', 'null', '-'], { cwd: root, encoding: 'utf8', timeout: 60000, windowsHide: true });
if (verify.error || verify.status !== 0) throw verify.error || new Error(verify.stderr);
const frame = spawnSync(executable, ['-y', '-ss', '6', '-i', output, '-frames:v', '1', 'evidence/video-check.jpg'], { cwd: root, encoding: 'utf8', timeout: 60000, windowsHide: true });
if (frame.error || frame.status !== 0) throw frame.error || new Error(frame.stderr);
await writeFile(new URL('../evidence/video-verification.txt', import.meta.url), verify.stderr);
console.log('Encoded and fully decoded MP4 capture tour; extracted 6-second frame for visual verification.');

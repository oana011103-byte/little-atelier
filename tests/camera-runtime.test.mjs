import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const source=await readFile(new URL('../camera-runtime.js',import.meta.url),'utf8');
const {waitForVideo,cameraMessage}=await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
class Video extends EventTarget{readyState=0;videoWidth=0;videoHeight=0;play(){return Promise.resolve()}ready(){this.readyState=2;this.videoWidth=640;this.videoHeight=480;this.dispatchEvent(new Event('loadeddata'))}}
test('waits for actual frame dimensions',async()=>{const v=new Video();let ready=false;const p=waitForVideo(v,{timeout:100}).then(()=>ready=true);await Promise.resolve();assert.equal(ready,false);v.ready();await p;assert.equal(ready,true)});
test('play rejection is surfaced rather than ignored',async()=>{const v=new Video();v.play=()=>Promise.reject(Object.assign(new Error(),{name:'NotAllowedError'}));await assert.rejects(waitForVideo(v),{name:'NotAllowedError'})});
test('permission without frames times out with actionable feedback',async()=>{const v=new Video();await assert.rejects(waitForVideo(v,{timeout:10}),{name:'CameraTimeout'});assert.match(cameraMessage({name:'CameraTimeout'}),/no camera picture/)});
test('already playing video is ready immediately',async()=>{const v=new Video();v.ready();await waitForVideo(v,{timeout:100})});
test('device busy and blocked permissions have distinct messages',()=>{assert.match(cameraMessage({name:'NotReadableError'}),/other apps/);assert.match(cameraMessage({name:'NotAllowedError'}),/system settings/)});

export function cameraMessage(error){
 switch(error?.name){
 case 'NotAllowedError':case 'SecurityError':return 'Camera access was blocked. Check camera permission for this website and for your browser in system settings. If this is an in-app browser, open the site in Safari or Chrome.';
 case 'NotReadableError':case 'AbortError':return 'The camera could not start. Close other apps or tabs using it, then try again.';
 case 'NotFoundError':case 'DevicesNotFoundError':return 'No camera was found. Connect or enable a camera, then retry.';
 case 'OverconstrainedError':return 'The camera does not support these settings. Please retry.';
 case 'CameraTimeout':return 'Permission was granted, but no camera picture arrived. Retry, or open this site directly in Safari or Chrome.';
 case 'CameraUnsupported':return 'Camera access is unavailable in this browser. Open this HTTPS site directly in Safari or Chrome.';
 default:return 'Camera playback failed. Retry, or open this site directly in Safari or Chrome.';
 }
}
export function waitForVideo(video,{timeout=12000}={}){
 return new Promise((resolve,reject)=>{
  let done=false;
  const events=['loadeddata','canplay','playing','resize'];
  const finish=error=>{if(done)return;done=true;clearTimeout(timer);events.forEach(e=>video.removeEventListener(e,check));video.removeEventListener('error',failed);error?reject(error):resolve()};
  const check=()=>{if(video.readyState>=2&&video.videoWidth>0&&video.videoHeight>0)finish()};
  const failed=()=>finish(Object.assign(new Error('Camera playback failed'),{name:'CameraPlaybackError'}));
  const timer=setTimeout(()=>finish(Object.assign(new Error('Camera did not produce a frame'),{name:'CameraTimeout'})),timeout);
  events.forEach(e=>video.addEventListener(e,check));video.addEventListener('error',failed);
  try{Promise.resolve(video.play()).then(check,error=>finish(error));check()}catch(error){finish(error)}
 });
}

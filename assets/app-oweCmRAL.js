import{I as i}from"./index-CzAWk2Jy.js";function I(h,w={}){const{windowManager:d,vfs:q,filePicker:T}=h,u=w.path||"",t=document.createElement("div");t.style.cssText=`
    height: 100%;
    display: flex;
    flex-direction: column;
    background: #000;
    color: #fff;
    font-family: var(--font-main);
    position: relative;
    overflow: hidden;
  `,t.innerHTML=`
    <!-- Top toolbar -->
    <div style="background: linear-gradient(to bottom, rgba(0,0,0,0.8), transparent); padding: 12px 20px; position: absolute; top: 0; left: 0; right: 0; z-index: 10; display: flex; justify-content: space-between; align-items: center; opacity: 0; transition: opacity 0.3s;" id="vp-top">
      <div style="display: flex; align-items: center; gap: 12px; flex: 1; min-width: 0;">
        <button id="vp-open" class="btn-secondary btn-sm" style="background: rgba(255,255,255,0.15); border: none; color: white; display:flex; align-items:center; gap:6px;">${i.getIcon("folder",{size:14})} Open</button>
        <span id="vp-title" style="font-size: 13px; font-weight: 600; text-overflow: ellipsis; overflow: hidden; white-space: nowrap; max-width: 80%;">No video loaded</span>
      </div>
    </div>

    <!-- Video Area -->
    <div style="flex: 1; display: flex; align-items: center; justify-content: center; overflow: hidden; position: relative;" id="vp-container">
      <video id="vp-video" style="max-width: 100%; max-height: 100%; object-fit: contain; cursor: pointer;" autoplay></video>
    </div>

    <!-- Custom Controls -->
    <div style="background: linear-gradient(to top, rgba(0,0,0,0.8), transparent); padding: 16px 20px; display: flex; flex-direction: column; gap: 10px; opacity: 0; transition: opacity 0.3s; position: absolute; bottom: 0; left: 0; right: 0; z-index: 10;" id="vp-bottom">
      
      <div style="display: flex; flex-direction: column; gap: 4px;">
        <input type="range" id="vp-progress" value="0" min="0" max="100" style="width: 100%; height: 4px; cursor: pointer;">
        <div style="display: flex; justify-content: space-between; font-size: 11px; color: #ccc; font-family: var(--font-mono);">
          <span id="vp-current-time">0:00</span>
          <span id="vp-duration">0:00</span>
        </div>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; align-items: center; gap: 16px;">
          <button id="vp-play" style="background: none; border: none; font-size: 18px; cursor: pointer; color: white; padding: 4px; display:flex; align-items:center; justify-content:center;">${i.getIcon("pause",{size:18})}</button>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 12px;">${i.getIcon("volume",{size:14})}</span>
            <input type="range" id="vp-volume" value="80" min="0" max="100" style="width: 80px; height: 4px; cursor: pointer;">
            <span style="font-size: 12px;">${i.getIcon("volume",{size:14})}</span>
          </div>
        </div>
        <button id="vp-fullscreen" style="background: rgba(255,255,255,0.1); border: none; border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer; color: white; padding: 4px 10px; display:flex; align-items:center; gap:6px;">${i.getIcon("scale",{size:14})} Fullscreen</button>
      </div>
    </div>

    <style>
      #vp-progress, #vp-volume { accent-color: var(--accent); }
    </style>
  `;const k=d.createWindow({id:`video-player-${Date.now()}`,title:"Video Player",icon:"video",width:800,height:500,content:t}),e=t.querySelector("#vp-video"),n=t.querySelector("#vp-play"),s=t.querySelector("#vp-progress"),y=t.querySelector("#vp-volume"),z=t.querySelector("#vp-current-time"),v=t.querySelector("#vp-duration"),S=t.querySelector("#vp-fullscreen"),a=t.querySelector("#vp-top"),p=t.querySelector("#vp-bottom"),f=t.querySelector("#vp-container"),$=t.querySelector("#vp-title");let r=!0;const m=o=>{if(!o)return;e.src=q.getFsPath(o);const l=o.split("/").pop();$.textContent=l,d.setTitle(k.id,`Video - ${l}`)},c=o=>{if(isNaN(o))return"0:00";const l=Math.floor(o/60),b=Math.floor(o%60);return`${l}:${b<10?"0":""}${b}`};let g;const x=()=>{a.style.opacity="1",p.style.opacity="1",clearTimeout(g),g=setTimeout(()=>{r&&(a.style.opacity="0",p.style.opacity="0")},2500)};t.onmousemove=x,t.onmouseleave=()=>{a.style.opacity="0",p.style.opacity="0"},n.onclick=()=>{r?(e.pause(),n.innerHTML=i.getIcon("play",{size:18}),r=!1):(e.play().catch(o=>console.error(o)),n.innerHTML=i.getIcon("pause",{size:18}),r=!0)},e.onclick=()=>n.onclick(),e.addEventListener("timeupdate",()=>{e.duration&&(s.value=e.currentTime/e.duration*100,z.textContent=c(e.currentTime),v.textContent=c(e.duration))}),e.addEventListener("loadedmetadata",()=>{v.textContent=c(e.duration),x()}),s.oninput=()=>{e.duration&&(e.currentTime=s.value/100*e.duration)},y.oninput=()=>{e.volume=y.value/100},S.onclick=()=>{e.requestFullscreen?e.requestFullscreen():f.requestFullscreen&&f.requestFullscreen()},t.querySelector("#vp-open").onclick=async()=>{const o=await T.pickFile({title:"Open Video File",filter:[".mp4",".webm",".mov",".mkv"]});o&&(m(o),r||n.onclick())},u&&m(u)}export{I as launch};

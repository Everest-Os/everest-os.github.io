import{I as n}from"./index-CzAWk2Jy.js";function T(x,v={}){const{windowManager:d,vfs:g,filePicker:h}=x,p=v.path||"",t=document.createElement("div");t.style.cssText=`
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    background: var(--bg-surface);
    color: var(--text-primary);
    font-family: var(--font-main);
    padding: 24px;
  `,t.innerHTML=`
    <div style="width: 100%; display: flex; justify-content: flex-end;">
      <button id="mp-open" class="btn-secondary btn-sm" style="display:flex; align-items:center; gap:6px;">${n.getIcon("folder,📁",{size:14})} Open File</button>
    </div>

    <div style="text-align: center; margin-top: 8px;">
      <div id="mp-title" style="font-size: 15px; font-weight: 700; margin-bottom: 4px; max-width: 260px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">No song loaded</div>
      <div id="mp-artist" style="font-size: 11px; color: var(--text-secondary); opacity: 0.7;">Unknown Artist</div>
    </div>

    <!-- Vinyl record animation -->
    <div style="width: 160px; height: 160px; border-radius: 50%; background: #111; border: 8px solid #282828; display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-lg); position: relative; margin: 20px 0;" id="mp-disc">
      <div style="width: 44px; height: 44px; border-radius: 50%; background: var(--accent); display: flex; align-items: center; justify-content: center;">
        <div style="width: 10px; height: 10px; border-radius: 50%; background: #1a1a1a;"></div>
      </div>
      <div style="position: absolute; inset: 0; border-radius: 50%; background: repeating-radial-gradient(circle, transparent 0, transparent 2px, rgba(255,255,255,0.03) 3px, transparent 4px);"></div>
    </div>

    <div style="width: 100%; display: flex; flex-direction: column; gap: 16px;">
      <audio id="mp-audio" style="display: none;"></audio>
      
      <div style="display: flex; flex-direction: column; gap: 6px; padding: 0 4px;">
        <input type="range" id="mp-progress" value="0" min="0" max="100" style="width: 100%; cursor: pointer;">
        <div style="display: flex; justify-content: space-between; font-size: 10px; color: var(--text-tertiary); font-family: var(--font-mono);">
          <span id="mp-current-time">0:00</span>
          <span id="mp-duration">0:00</span>
        </div>
      </div>

      <div style="display: flex; justify-content: center; align-items: center; gap: 24px;">
        <button id="mp-play" style="width: 52px; height: 52px; border-radius: 50%; border: none; background: var(--accent); color: white; font-size: 20px; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-glow); transition: transform 0.2s;">${n.getIcon("play,▶️",{size:24})}</button>
      </div>

      <div style="display: flex; align-items: center; justify-content: center; gap: 12px; opacity: 0.8;">
        <span style="font-size: 12px;">${n.getIcon("volume,🔊",{size:16})}</span>
        <input type="range" id="mp-volume" value="80" min="0" max="100" style="flex: 1; cursor: pointer;">
        <span style="font-size: 12px;">${n.getIcon("volume,🔊",{size:16})}</span>
      </div>
    </div>

    <style>
      @keyframes spin { 100% { transform: rotate(360deg); } }
      #mp-progress, #mp-volume { accent-color: var(--accent); }
    </style>
  `;const w=d.createWindow({id:`music-player-${Date.now()}`,title:"Music Player",icon:"music,🎵",width:320,height:480,content:t}),e=t.querySelector("#mp-audio"),o=t.querySelector("#mp-play"),s=t.querySelector("#mp-progress"),c=t.querySelector("#mp-volume"),b=t.querySelector("#mp-current-time"),u=t.querySelector("#mp-duration"),m=t.querySelector("#mp-disc"),k=t.querySelector("#mp-title");let r=!1;const y=i=>{if(!i)return;e.src=g.getFsPath(i),e.load();const a=i.split("/").pop();k.textContent=a,d.setTitle(w.id,`Music - ${a}`)},l=i=>{if(isNaN(i))return"0:00";const a=Math.floor(i/60),f=Math.floor(i%60);return`${a}:${f<10?"0":""}${f}`};o.onclick=()=>{e.src&&(r?(e.pause(),o.innerHTML=n.getIcon("play,▶️",{size:24}),m.style.animation="none",r=!1):(e.play().catch(i=>console.error(i)),o.innerHTML=n.getIcon("pause,⏸️",{size:24}),m.style.animation="spin 3s linear infinite",r=!0))},e.addEventListener("timeupdate",()=>{e.duration&&(s.value=e.currentTime/e.duration*100,b.textContent=l(e.currentTime),u.textContent=l(e.duration))}),e.addEventListener("loadedmetadata",()=>{u.textContent=l(e.duration)}),s.oninput=()=>{e.duration&&(e.currentTime=s.value/100*e.duration)},c.oninput=()=>{e.volume=c.value/100},t.querySelector("#mp-open").onclick=async()=>{const i=await h.pickFile({title:"Open Audio File",filter:[".mp3",".ogg",".wav",".m4a",".aac"]});i&&(y(i),r||o.onclick())},p&&y(p)}export{T as launch};

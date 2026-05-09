import"./index-CDx2cV7o.js";async function y(s,l={}){const{windowManager:d,vfs:o,appLoader:p}=s,i=typeof l=="string"?l:l.path;if(!i){p.launchApp("files","~/Pictures");return}const t=document.createElement("div");t.style.cssText=`
    height: 100%;
    background: #000;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    color: white;
  `;const r=i.split("/").pop(),c=r.split(".").pop().toLowerCase(),m=["png","jpg","jpeg","gif","svg","webp"],u=["mp3","ogg","wav"],h=["mp4","webm","ogv","yt"];d.createWindow({id:`media-viewer-${Date.now()}`,title:r||"Media Viewer",icon:"video",width:640,height:480,content:t});try{let a=i;if((i.startsWith("~")||i.startsWith("/"))&&(a=o.getFsPath(i)),m.includes(c)){const e=document.createElement("img");e.src=a,e.style.maxWidth="100%",e.style.maxHeight="100%",e.style.objectFit="contain",t.appendChild(e)}else if(u.includes(c)){const e=document.createElement("audio");e.controls=!0,e.autoplay=!0,e.src=a,e.style.width="80%",t.appendChild(e)}else if(h.includes(c))if(c==="yt"){const e=await o.readFile(i),n=document.createElement("iframe");n.src=e.replace("watch?v=","embed/"),n.style.width="100%",n.style.height="100%",n.style.border="none",n.allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",n.allowFullscreen=!0,t.appendChild(n)}else{const e=document.createElement("video");e.controls=!0,e.autoplay=!0,e.src=a,e.style.maxWidth="100%",e.style.maxHeight="100%",t.appendChild(e)}else t.innerHTML=`<div style="padding:20px; text-align:center;">Unsupported media type: .${c}</div>`}catch(a){t.innerHTML=`<div style="padding:20px; text-align:center;">Error loading file: ${a.message}</div>`}}export{y as launch};

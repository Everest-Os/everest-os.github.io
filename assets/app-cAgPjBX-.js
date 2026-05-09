async function w(x,k={}){const{windowManager:b}=x;let t="0",n=null,o=null,i=!1;const s=document.createElement("div");s.className="calculator-container",s.style.cssText=`
    height: 100%;
    background: var(--bg-surface);
    display: flex;
    flex-direction: column;
    color: var(--text-primary);
    font-family: var(--font-main);
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
    overflow: hidden;
  `;const r=document.createElement("div");r.style.cssText=`
    padding: 30px 20px;
    background: var(--bg-input);
    text-align: right;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    gap: 4px;
    min-height: 120px;
  `;const u=document.createElement("div");u.style.cssText=`
    font-size: 14px;
    color: var(--text-tertiary);
    height: 20px;
  `;const p=document.createElement("div");p.style.cssText=`
    font-size: 36px;
    font-weight: 700;
    overflow: hidden;
    text-overflow: ellipsis;
  `,p.textContent="0",r.appendChild(u),r.appendChild(p),s.appendChild(r);const f=document.createElement("div");f.style.cssText=`
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: repeat(5, 1fr);
    gap: 1px;
    background: var(--border);
    flex: 1;
  `,s.appendChild(f);const h=[{label:"C",action:"reset",type:"special"},{label:"+/-",action:"negate",type:"special"},{label:"%",action:"percent",type:"special"},{label:"÷",action:"op",value:"÷",type:"op"},{label:"7",action:"num",value:"7"},{label:"8",action:"num",value:"8"},{label:"9",action:"num",value:"9"},{label:"×",action:"op",value:"×",type:"op"},{label:"4",action:"num",value:"4"},{label:"5",action:"num",value:"5"},{label:"6",action:"num",value:"6"},{label:"-",action:"op",value:"-",type:"op"},{label:"1",action:"num",value:"1"},{label:"2",action:"num",value:"2"},{label:"3",action:"num",value:"3"},{label:"+",action:"op",value:"+",type:"op"},{label:"0",action:"num",value:"0",span:2},{label:".",action:"num",value:"."},{label:"=",action:"calc",type:"op"}],v=()=>{p.textContent=t||(n!==null?n.toString():"0"),o?u.textContent=`${n} ${o} `:u.textContent=""},m=(e=!1)=>{if(n!==null&&t!==null){const a=n,d=parseFloat(t);let c=0;switch(o){case"×":c=a*d;break;case"÷":c=a/d;break;case"+":c=a+d;break;case"-":c=a-d;break}t=c.toString(),n=c,i=!0}v()},l=e=>{if(e.action==="num")if(i)t=e.value==="."?"0.":e.value,i=!1;else if(t==="0"&&e.value!==".")t=e.value;else{if(e.value==="."&&t.includes("."))return;t+=e.value}else e.action==="op"?(o&&!i&&m(!0),n=parseFloat(t),o=e.value,t="0",i=!1):e.action==="calc"?(m(),o=null):e.action==="reset"?(t="0",n=null,o=null,i=!1):e.action==="negate"?t=(parseFloat(t)*-1).toString():e.action==="percent"&&(t=(parseFloat(t)/100).toString());v()};h.forEach(e=>{const a=document.createElement("button");a.textContent=e.label,a.style.cssText=`
      border: none;
      background: ${e.type==="op"?"var(--accent)":e.type==="special"?"var(--bg-surface-active)":"var(--bg-surface)"};
      color: ${e.type==="op"?"white":"var(--text-primary)"};
      font-size: 18px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.1s;
      grid-column: span ${e.span||1};
    `,a.onmouseover=()=>{a.style.filter="brightness(1.2)"},a.onmouseout=()=>{a.style.filter="none"},a.onclick=()=>l(e),f.appendChild(a)});const y=b.createWindow({id:"calculator",title:"Calculator",icon:"calculator,🧮",width:320,height:480,content:s}),g=e=>{y.isActive&&(e.key>="0"&&e.key<="9"&&l({action:"num",value:e.key}),e.key==="."&&l({action:"num",value:"."}),(e.key==="Enter"||e.key==="=")&&l({action:"calc"}),e.key==="+"&&l({action:"op",value:"+"}),e.key==="-"&&l({action:"op",value:"-"}),e.key==="*"&&l({action:"op",value:"×"}),e.key==="/"&&l({action:"op",value:"÷"}),e.key==="Escape"&&l({action:"reset"}),e.key==="Backspace"&&(t=t.length>1?t.slice(0,-1):"0",v()))};document.addEventListener("keydown",g),y.options.onClose=()=>document.removeEventListener("keydown",g)}export{w as launch};

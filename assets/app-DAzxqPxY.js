const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index-CDx2cV7o.js","assets/index-BKJI6B33.css"])))=>i.map(i=>d[i]);
import{_ as k}from"./index-CDx2cV7o.js";class T{constructor(f){this.ctx=f,this.cwd="/home/user",this.env={USER:"user",HOME:"/home/user",PATH:"/bin:/usr/bin",SHELL:"psh"},this.history=[],this.commands=new Map}register(f,t){this.commands.set(f,t)}resolve(f){return f?f.startsWith("/")?this.ctx.vfs.resolvePath(f):f.startsWith("~")?this.ctx.vfs.resolvePath(f):this.ctx.vfs.resolvePath(`${this.cwd}/${f}`):this.cwd}async execute(f,t){const e=f.trim().split(/\s+/);if(e.length===0||e[0]==="")return;const n=e[0],r=e.slice(1);this.history.push(f);const i=this.commands.get(n);if(i)try{await i(r,{shell:this,stdout:t,vfs:this.ctx.vfs,ctx:this.ctx})}catch(s){t.write(`\r
\x1B[31mError: ${s.message}\x1B[0m\r
`)}else t.write(`\r
psh: command not found: ${n}\r
`)}}const S=["Do not be afraid of competition.","An exciting opportunity lies ahead of you.","You love peace.","Get your mind set... confidence will lead you on.","You will always be surrounded by true friends.","Sell your ideas — they have exceptional merit.","You should be able to undertake and complete anything.","A routine task will turn into an enchanting adventure.","Be true to your work, your word, and your friend.","A journey of a thousand miles begins with a single step.","Forget injuries; never forget kindnesses.","Respect yourself and others will respect you.","Attitude is a little thing that makes a big difference.","Experience is the best teacher.","Expect the unexpected.","Once you make a decision the universe conspires to make it happen.","Nothing great was ever achieved without enthusiasm.","Dance as if no one is watching.","Live this day as if it were your last.","Bloom where you are planted.","Borrow money from a pessimist. They don't expect it back.","Help! I'm being held prisoner in a fortune cookie factory."],F=`        \\\\   ^__^
         \\\\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||`;function C(l){const t=l.split(" "),e=[];let n="";for(const o of t)(n+o).length<=40?n+=(n?" ":"")+o:(n&&e.push(n),n=o);n&&e.push(n);const r=Math.max(...e.map(o=>o.length)),i=" "+"_".repeat(r+2),s=" "+"-".repeat(r+2),m=e.map((o,h)=>{const c=o.padEnd(r);return e.length===1?`< ${c} >`:h===0?`/ ${c} \\`:h===e.length-1?`\\ ${c} /`:`| ${c} |`});return[i,...m,s,F].join(`
`)}async function O(l){const{vfs:f}=l.ctx;l.register("help",async(t,{stdout:e})=>{const n=Array.from(l.commands.keys()).sort();e.write(`\x1B[1m\x1B[33mAvailable commands:\x1B[0m

`);const r=5;for(let i=0;i<n.length;i+=r){const s=n.slice(i,i+r).map(m=>`  \x1B[36m${m.padEnd(14)}\x1B[0m`).join("");e.write(s+`
`)}e.write(`
\x1B[2mUse "man <command>" for more information.\x1B[0m
`)}),l.register("clear",async(t,{stdout:e})=>{e.clear()}),l.register("echo",async(t,{stdout:e})=>{e.write(t.join(" ")+`
`)}),l.register("ls",async(t,{shell:e,stdout:n})=>{const r=t.includes("-a")||t.includes("-la")||t.includes("-al"),i=t.includes("-l")||t.includes("-la")||t.includes("-al"),s=t.find(o=>!o.startsWith("-")),m=e.resolve(s);try{const o=await f.readdir(m);let h=r?o:o.filter(c=>!c.name.startsWith("."));if(i)for(const c of h){const d=c.type==="dir"?"d":"-",p="rwxr-xr-x",x=c.size!=null?String(c.size).padStart(8):"       0",w=c.type==="dir"?`\x1B[1m\x1B[34m${c.name}/\x1B[0m`:c.name;n.write(`\x1B[2m${d}${p}\x1B[0m  ${x}  ${w}
`)}else{const c=h.map(d=>d.type==="dir"?`\x1B[1m\x1B[34m${d.name}/\x1B[0m`:d.name.endsWith(".js")||d.name.endsWith(".json")?`\x1B[32m${d.name}\x1B[0m`:d.name);n.write(c.join("  ")+`
`)}}catch(o){throw new Error(`ls: cannot access '${s||"."}': ${o.message}`)}}),l.register("cd",async(t,{shell:e})=>{if(!t[0]||t[0]==="~"){e.cwd="/home/user";return}if(t[0]==="-"){const r=e._prevCwd||e.cwd;e._prevCwd=e.cwd,e.cwd=r;return}const n=e.resolve(t[0]);try{const r=await f.stat(n);if(r&&r.type==="dir")e._prevCwd=e.cwd,e.cwd=n;else throw new Error("Not a directory")}catch{throw new Error(`cd: ${t[0]}: No such file or directory`)}}),l.register("cat",async(t,{shell:e,stdout:n})=>{if(t.length===0)throw new Error("cat: missing operand");for(const r of t){const i=e.resolve(r);try{const s=await f.readFile(i);n.write(s+`
`)}catch{n.write(`\x1B[31mcat: ${r}: No such file or directory\x1B[0m
`)}}}),l.register("head",async(t,{shell:e,stdout:n})=>{let r=10;const i=t.indexOf("-n");if(i!==-1&&t[i+1]&&(r=parseInt(t[i+1],10),t.splice(i,2)),t.length===0)throw new Error("head: missing operand");const s=e.resolve(t[0]),o=(await f.readFile(s)).split(`
`).slice(0,r);n.write(o.join(`
`)+`
`)}),l.register("tail",async(t,{shell:e,stdout:n})=>{let r=10;const i=t.indexOf("-n");if(i!==-1&&t[i+1]&&(r=parseInt(t[i+1],10),t.splice(i,2)),t.length===0)throw new Error("tail: missing operand");const s=e.resolve(t[0]),o=(await f.readFile(s)).split(`
`).slice(-r);n.write(o.join(`
`)+`
`)}),l.register("wc",async(t,{shell:e,stdout:n})=>{if(t.length===0)throw new Error("wc: missing operand");for(const r of t){const i=e.resolve(r);try{const s=await f.readFile(i),m=s.split(`
`).length,o=s.split(/\s+/).filter(Boolean).length,h=s.length;n.write(`  ${m}  ${o}  ${h} ${r}
`)}catch{n.write(`\x1B[31mwc: ${r}: No such file or directory\x1B[0m
`)}}}),l.register("mkdir",async(t,{shell:e})=>{if(t.length===0)throw new Error("mkdir: missing operand");for(const n of t){const r=e.resolve(n);await f.mkdir(r)}}),l.register("rm",async(t,{shell:e,stdout:n})=>{if(t.length===0)throw new Error("rm: missing operand");const r=t.filter(i=>!i.startsWith("-"));for(const i of r){const s=e.resolve(i);try{await f.rm(s)}catch(m){n.write(`\x1B[31mrm: cannot remove '${i}': ${m.message}\x1B[0m
`)}}}),l.register("rmdir",async(t,{shell:e})=>{if(t.length===0)throw new Error("rmdir: missing operand");const n=e.resolve(t[0]);if((await f.readdir(n)).length>0)throw new Error(`rmdir: failed to remove '${t[0]}': Directory not empty`);await f.rm(n)}),l.register("touch",async(t,{shell:e})=>{if(t.length===0)throw new Error("touch: missing operand");for(const n of t){const r=e.resolve(n);try{await f.readFile(r)}catch{await f.writeFile(r,"")}}}),l.register("cp",async(t,{shell:e})=>{if(t.length<2)throw new Error("cp: missing operand");const n=e.resolve(t[0]),r=e.resolve(t[1]),i=await f.readFile(n);await f.writeFile(r,i)}),l.register("mv",async(t,{shell:e})=>{if(t.length<2)throw new Error("mv: missing operand");const n=e.resolve(t[0]),r=e.resolve(t[1]),i=await f.readFile(n);await f.writeFile(r,i),await f.rm(n)}),l.register("pwd",async(t,{shell:e,stdout:n})=>{n.write(e.cwd+`
`)}),l.register("whoami",async(t,{shell:e,stdout:n})=>{n.write(e.env.USER+`
`)}),l.register("hostname",async(t,{stdout:e})=>{e.write(`everest-os
`)}),l.register("uname",async(t,{stdout:e})=>{t.includes("-a")?e.write(`EverestOS 1.0.0 everest-os x86_64 JavaScript/VFS
`):e.write(`EverestOS
`)}),l.register("date",async(t,{stdout:e})=>{e.write(new Date().toString()+`
`)}),l.register("uptime",async(t,{shell:e,stdout:n})=>{const r=Math.floor((Date.now()-(e._startTime||Date.now()))/1e3),i=Math.floor(r/3600),s=Math.floor(r%3600/60),m=r%60,o=new Date().toLocaleTimeString();n.write(` \x1B[1m${o}\x1B[0m up ${i}:${String(s).padStart(2,"0")}:${String(m).padStart(2,"0")}, 1 user
`)}),l.register("history",async(t,{shell:e,stdout:n})=>{if(e.history.length===0){n.write(`\x1B[2mNo history yet.\x1B[0m
`);return}e.history.forEach((r,i)=>{n.write(`  \x1B[2m${String(i+1).padStart(4)}\x1B[0m  ${r}
`)})}),l.register("env",async(t,{shell:e,stdout:n})=>{for(const[r,i]of Object.entries(e.env))n.write(`\x1B[36m${r}\x1B[0m=${i}
`)}),l.register("printenv",async(t,e)=>{await l.commands.get("env")(t,e)}),l.register("export",async(t,{shell:e,stdout:n})=>{if(t.length===0){for(const[r,i]of Object.entries(e.env))n.write(`declare -x ${r}="${i}"
`);return}for(const r of t){const i=r.indexOf("=");if(i===-1)n.write(`\x1B[31mexport: '${r}': not a valid identifier\x1B[0m
`);else{const s=r.slice(0,i),m=r.slice(i+1);e.env[s]=m}}}),l.register("grep",async(t,{shell:e,stdout:n})=>{const r=t.includes("-i"),i=t.includes("-n"),s=t.filter(p=>!p.startsWith("-"));if(s.length<2)throw new Error("grep: usage: grep [-i] [-n] PATTERN FILE");const m=s[0],o=e.resolve(s[1]),c=(await f.readFile(o)).split(`
`),d=new RegExp(m,r?"gi":"g");for(let p=0;p<c.length;p++)if(d.test(c[p])){const x=c[p].replace(d,B=>`\x1B[1m\x1B[31m${B}\x1B[0m`),w=i?`\x1B[32m${p+1}\x1B[0m:`:"";n.write(`${w}${x}
`),d.lastIndex=0}}),l.register("rev",async(t,{stdout:e})=>{if(t.length===0)throw new Error("rev: missing string argument");e.write(t.join(" ").split("").reverse().join("")+`
`)}),l.register("fortune",async(t,{stdout:e})=>{const n=S[Math.floor(Math.random()*S.length)];e.write(`\x1B[33m${n}\x1B[0m
`)}),l.register("cowsay",async(t,{stdout:e})=>{const n=t.length>0?t.join(" "):"Moo!";e.write(C(n)+`
`)}),l.register("curl",async(t,{shell:e,stdout:n})=>{const r=t.includes("-I")||t.includes("--head"),i=t.includes("-s")||t.includes("--silent"),s=t.includes("-O");let m=null;const o=t.indexOf("-o");o!==-1&&t[o+1]&&(m=t[o+1],t.splice(o,2));const h=t.find(d=>!d.startsWith("-"));if(!h)throw new Error(`curl: no URL specified
Usage: curl [OPTIONS] URL
  -o FILE   Write output to FILE
  -O        Write output using remote filename
  -I        Show headers only
  -s        Silent mode`);let c=h;if(!c.startsWith("http://")&&!c.startsWith("https://")&&(c="https://"+c),s&&!m)try{const p=new URL(c).pathname.split("/").filter(Boolean);m=p.length>0?p[p.length-1]:"index.html"}catch{m="download"}i||(n.write(`\x1B[2m  % Total    % Received  Time     Speed\x1B[0m
`),n.write(`\x1B[2m                         -------  -----\x1B[0m
`));try{const d=performance.now(),p=await fetch(c),x=((performance.now()-d)/1e3).toFixed(3);if(r){n.write(`\x1B[36mHTTP/${p.status>=200?"1.1":"2"} ${p.status}\x1B[0m
`);for(const[w,B]of p.headers.entries())n.write(`\x1B[32m${w}\x1B[0m: ${B}
`);n.write(`
`)}else{const w=await p.text(),B=new Blob([w]).size;if(i||n.write(`\x1B[2m  ${B}    100       ${x}s    ${Math.round(B/parseFloat(x))} B/s\x1B[0m

`),m){const a=e.resolve(m);await f.writeFile(a,w),n.write(`\x1B[32m✓ Saved ${B} bytes to ${m}\x1B[0m
`)}else w.length>5e3?(n.write(w.substring(0,5e3)),n.write(`
\x1B[33m... (truncated, ${w.length} bytes total)\x1B[0m
`)):n.write(w+`
`)}}catch(d){n.write(`\x1B[31mcurl: (6) Could not resolve host: ${h}\x1B[0m
`),n.write(`\x1B[31m${d.message}\x1B[0m
`)}}),l.register("ping",async(t,{stdout:e})=>{let n=4;const r=t.indexOf("-c");r!==-1&&t[r+1]&&(n=parseInt(t[r+1],10),t.splice(r,2));const i=t.find(x=>!x.startsWith("-"));if(!i)throw new Error(`ping: missing host operand
Usage: ping [-c count] host`);let s=i;!s.startsWith("http://")&&!s.startsWith("https://")&&(s="https://"+s),e.write(`\x1B[1mPING\x1B[0m ${i}: ${n} packets
`);let m=0,o=0,h=0,c=1/0,d=0;for(let x=0;x<n;x++){m++;try{const w=performance.now();await fetch(s,{method:"HEAD",mode:"no-cors"});const B=(performance.now()-w).toFixed(1),a=parseFloat(B);o++,h+=a,a<c&&(c=a),a>d&&(d=a),e.write(`\x1B[32m64 bytes from ${i}: icmp_seq=${x+1} time=${B} ms\x1B[0m
`)}catch{e.write(`\x1B[31mRequest timeout for icmp_seq ${x+1}\x1B[0m
`)}x<n-1&&await new Promise(w=>setTimeout(w,500))}e.write(`
\x1B[1m--- ${i} ping statistics ---\x1B[0m
`);const p=((m-o)/m*100).toFixed(1);if(e.write(`${m} packets transmitted, ${o} received, \x1B[${p==="0.0"?"32":"31"}m${p}% packet loss\x1B[0m
`),o>0){const x=(h/o).toFixed(1);e.write(`rtt min/avg/max = ${c.toFixed(1)}/${x}/${d.toFixed(1)} ms
`)}}),l.register("exit",async(t,{ctx:e})=>{var r;const n=(r=e.windowManager)==null?void 0:r.activeWindow;n&&e.windowManager.closeWindow(n)}),l.register("reboot",async()=>{window.location.reload()}),l.register("reload",async()=>{window.location.reload()}),l.register("man",async(t,{stdout:e})=>{const n={ls:`ls [OPTIONS] [PATH]
  List directory contents.
  Options: -a (show hidden), -l (long format)`,cd:`cd [PATH]
  Change directory. Use ~ for home, - for previous directory.`,cat:`cat FILE...
  Concatenate and display file contents.`,head:`head [-n NUM] FILE
  Display first NUM lines of a file (default 10).`,tail:`tail [-n NUM] FILE
  Display last NUM lines of a file (default 10).`,wc:`wc FILE...
  Print line, word, and byte counts.`,grep:`grep [-i] [-n] PATTERN FILE
  Search for PATTERN in FILE.
  Options: -i (case insensitive), -n (line numbers)`,mkdir:`mkdir DIR...
  Create directories.`,rm:`rm FILE...
  Remove files or directories.`,rmdir:`rmdir DIR
  Remove empty directories.`,touch:`touch FILE...
  Create empty files or update timestamps.`,cp:`cp SOURCE DEST
  Copy a file.`,mv:`mv SOURCE DEST
  Move or rename a file.`,echo:`echo [TEXT...]
  Display a line of text.`,clear:`clear
  Clear the terminal screen.`,history:`history
  Display command history.`,export:`export [NAME=VALUE...]
  Set environment variables.`,env:`env
  Print all environment variables.`,rev:`rev TEXT
  Reverse a string.`,cowsay:`cowsay [TEXT]
  Display a cow saying something.`,fortune:`fortune
  Display a random fortune.`,neofetch:`neofetch
  Display system information.`,uname:`uname [-a]
  Print system information.`,uptime:`uptime
  Print how long the system has been running.`,date:`date
  Print the current date and time.`,curl:`curl [OPTIONS] URL
  Transfer data from a URL.
  Options: -o FILE (save to file), -O (use remote name), -I (headers only), -s (silent)`,ping:`ping [-c COUNT] HOST
  Send ICMP-like requests to a host.
  Options: -c N (number of pings, default 4)`,backup:`backup [FILE]
  Export entire VFS as a JSON backup.
  Without args: downloads to your computer.
  With FILE: saves backup inside VFS.
  Works across storage modes (Server FS / IndexedDB).`,restore:`restore [FILE]
  Restore VFS from a JSON backup.
  Without args: opens file picker to select a backup.
  With FILE: restores from a VFS path.
  Cross-mode: backup from IndexedDB can restore to Server FS and vice versa.`};if(t.length===0){e.write(`\x1B[33mWhat manual page do you want?
Usage: man <command>\x1B[0m
`);return}const r=n[t[0]];r?e.write(`\x1B[1m\x1B[36m${t[0].toUpperCase()}\x1B[0m

${r}
`):e.write(`\x1B[31mNo manual entry for ${t[0]}\x1B[0m
`)}),l.register("version",async(t,{stdout:e})=>{e.write(`\x1B[1m\x1B[32mEverest OS\x1B[0m v1.0.0
`),e.write(`\x1B[36mpsh\x1B[0m (Playground Shell) v2.0.0
`),e.write(`\x1B[2mPowered by VFS + JavaScript\x1B[0m
`)}),l.register("cmatrix",async(t,{stdout:e})=>{e.clear();const n="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()",r=80,i=24,s=new Array(r).fill(0),m=setInterval(()=>{let o="";for(let h=0;h<r;h++)Math.random()>.95||s[h]>0?(o+=`\x1B[32m${n[Math.floor(Math.random()*n.length)]}\x1B[0m`,s[h]=(s[h]+1)%i):o+=" ";e.write(o+`
`)},100);setTimeout(()=>{clearInterval(m),e.write(`
\x1B[2m(cmatrix ended after 10s)\x1B[0m
`)},1e4)}),l.register("neofetch",async(t,{stdout:e})=>{var o,h;const n=((o=l.ctx.vfs)==null?void 0:o.USER)||"user",r=((h=l.ctx.themeManager)==null?void 0:h.currentTheme)||"Everest-Dark",i=l.ctx.vfs,s=window.location.pathname.includes("/EverestOS")?"/EverestOS/":"/";try{if((await fetch(s+"api/fs/info")).ok)storageMode="Server FS (Persistent)";else throw 0}catch{i!=null&&i.db?storageMode="IndexedDB (Browser — survives reload)":i!=null&&i.useLocalStorage&&(storageMode="LocalStorage (Volatile)")}const m=`
\x1B[36m        /\\          \x1B[0m \x1B[1m${n}\x1B[0m@\x1B[1meverest-os\x1B[0m
\x1B[36m       /  \\         \x1B[0m \x1B[2m──────────────────\x1B[0m
\x1B[36m      /    \\        \x1B[0m \x1B[36mOS:\x1B[0m Everest OS v1.0.0
\x1B[36m     /      \\       \x1B[0m \x1B[36mHost:\x1B[0m Browser Sandbox
\x1B[36m    /   /\\   \\      \x1B[0m \x1B[36mKernel:\x1B[0m VFS Hybrid Engine
\x1B[36m   /   /  \\   \\     \x1B[0m \x1B[36mShell:\x1B[0m psh 2.0.0
\x1B[36m  /   /    \\   \\    \x1B[0m \x1B[36mResolution:\x1B[0m ${window.innerWidth}x${window.innerHeight}
\x1B[36m /   /  /\\  \\   \\   \x1B[0m \x1B[36mTheme:\x1B[0m ${r}
\x1B[36m/___/  /  \\  \\___\\  \x1B[0m \x1B[36mTerminal:\x1B[0m psh (EverestOS)
\x1B[36m       \\  /         \x1B[0m \x1B[36mCPU:\x1B[0m ${navigator.userAgent.includes("Chrome")?"V8":navigator.userAgent.includes("Firefox")?"SpiderMonkey":"JS"} Engine
\x1B[36m        \\/          \x1B[0m \x1B[36mMemory:\x1B[0m ${navigator.deviceMemory?navigator.deviceMemory+" GB":"Browser Allocated"}
\x1B[36m                    \x1B[0m \x1B[36mStorage:\x1B[0m ${storageMode}
\x1B[36m                    \x1B[0m
\x1B[36m                    \x1B[0m \x1B[40m   \x1B[41m   \x1B[42m   \x1B[43m   \x1B[44m   \x1B[45m   \x1B[46m   \x1B[47m   \x1B[0m
`;e.write(m+`
`)}),l.register("backup",async(t,{shell:e,stdout:n})=>{const r=t[0];n.write(`\x1B[36m⏳ Collecting files...\x1B[0m
`);const i=[],s=async c=>{try{const d=await f.readdir(c);for(const p of d)if(p.type==="dir")i.push({path:p.path,type:"dir"}),await s(p.path);else try{const x=await f.readFile(p.path);i.push({path:p.path,type:"file",content:x,size:x.length})}catch{}}catch{}};await s("/");const m={version:"1.0",os:"EverestOS",timestamp:new Date().toISOString(),fileCount:i.length,files:i},o=JSON.stringify(m,null,2),h=(new Blob([o]).size/1024).toFixed(1);if(r){const c=e.resolve(r);await f.writeFile(c,o),n.write(`\x1B[32m✓ Backup saved to ${r} (${h} KB, ${i.length} files)\x1B[0m
`)}else{const c=new Blob([o],{type:"application/json"}),d=URL.createObjectURL(c),p=document.createElement("a");p.href=d,p.download=`everest-backup-${new Date().toISOString().slice(0,10)}.json`,document.body.appendChild(p),p.click(),p.remove(),URL.revokeObjectURL(d),n.write(`\x1B[32m✓ Backup downloaded (${h} KB, ${i.length} files)\x1B[0m
`)}}),l.register("restore",async(t,{shell:e,stdout:n})=>{const r=t[0];let i;if(r){const c=e.resolve(r);try{const d=await f.readFile(c);i=JSON.parse(d)}catch(d){throw new Error(`restore: cannot read '${r}': ${d.message}`)}}else n.write(`\x1B[36m📂 Select a backup file...\x1B[0m
`),i=await new Promise((c,d)=>{const p=document.createElement("input");p.type="file",p.accept=".json",p.onchange=async()=>{const x=p.files[0];if(!x){d(new Error("No file selected"));return}try{const w=await x.text();c(JSON.parse(w))}catch(w){d(new Error(`Invalid backup file: ${w.message}`))}},p.oncancel=()=>d(new Error("Cancelled")),p.click()});if(!i||!i.files)throw new Error("restore: invalid backup format (missing files array)");n.write(`\x1B[36m⏳ Restoring ${i.files.length} items from ${i.timestamp||"unknown date"}...\x1B[0m
`);let s=0,m=0;const o=i.files.filter(c=>c.type==="dir"),h=i.files.filter(c=>c.type==="file");for(const c of o)try{await f.mkdir(c.path),s++}catch{m++}for(const c of h)try{const d=c.path.substring(0,c.path.lastIndexOf("/"));if(d)try{await f.mkdir(d)}catch{}await f.writeFile(c.path,c.content||""),s++}catch{m++}n.write(`\x1B[32m✓ Restore complete: ${s} items restored\x1B[0m`),m>0&&n.write(`, \x1B[31m${m} errors\x1B[0m`),n.write(`
`),i.os&&n.write(`\x1B[2m  Backup from: ${i.os} (${i.timestamp})\x1B[0m
`)})}function I(l){const f=["#1e1e2e","#f38ba8","#a6e3a1","#f9e2af","#89b4fa","#cba6f7","#94e2d5","#cdd6f4"],t=["#585b70","#f38ba8","#a6e3a1","#f9e2af","#89b4fa","#cba6f7","#94e2d5","#ffffff"],e=["#1e1e2e","#f38ba8","#a6e3a1","#f9e2af","#89b4fa","#cba6f7","#94e2d5","#cdd6f4"],n=["#585b70","#f38ba8","#a6e3a1","#f9e2af","#89b4fa","#cba6f7","#94e2d5","#ffffff"],r=/\x1b\[([0-9;]*)m/g,i=[];let s=0,m=null,o=null,h=!1,c=!1,d=!1,p=!1,x=!1,w;for(;(w=r.exec(l))!==null;){w.index>s&&i.push({text:l.slice(s,w.index),fg:m,bg:o,bold:h,dim:c,italic:d,underline:p,strike:x});const B=w[1].split(";").map(Number);for(const a of B)a===0?(m=null,o=null,h=!1,c=!1,d=!1,p=!1,x=!1):a===1?h=!0:a===2?c=!0:a===3?d=!0:a===4?p=!0:a===9?x=!0:a>=30&&a<=37?m=f[a-30]:a>=40&&a<=47?o=e[a-40]:a>=90&&a<=97?m=t[a-90]:a>=100&&a<=107?o=n[a-100]:a===39?m=null:a===49&&(o=null);s=r.lastIndex}return s<l.length&&i.push({text:l.slice(s),fg:m,bg:o,bold:h,dim:c,italic:d,underline:p,strike:x}),i}function L(l){const f=document.createDocumentFragment(),t=I(l);for(const e of t){const n=document.createElement("span");n.textContent=e.text;const r=[];e.fg&&r.push(`color:${e.fg}`),e.bg&&r.push(`background:${e.bg}`),e.bold&&r.push("font-weight:bold"),e.dim&&r.push("opacity:0.5"),e.italic&&r.push("font-style:italic"),e.underline&&r.push("text-decoration:underline"),e.strike&&r.push("text-decoration:line-through"),r.length&&(n.style.cssText=r.join(";")),f.appendChild(n)}return f}async function P(l,f={}){const{windowManager:t}=l,e=Date.now(),n=new T(l);n._startTime=e,await O(n);const r=document.createElement("div");r.className="terminal-container",r.style.cssText=`
    height: 100%;
    background: #0d0d14;
    color: #cdd6f4;
    font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
    font-size: 13px;
    line-height: 1.45;
    padding: 12px 14px;
    overflow-y: auto;
    overflow-x: hidden;
    cursor: text;
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
    scroll-behavior: smooth;
  `;const i=document.createElement("div");i.className="terminal-scrollback",i.style.cssText="white-space:pre-wrap; word-break:break-all;",r.appendChild(i);const s=document.createElement("div");s.className="terminal-prompt-line",s.style.cssText="display:flex; align-items:center; gap:0; white-space:pre;";const m=document.createElement("span");m.className="terminal-prompt";const o=document.createElement("input");o.type="text",o.className="terminal-input",o.spellcheck=!1,o.autocomplete="off",o.style.cssText=`
    flex: 1;
    background: transparent;
    border: none;
    color: #cdd6f4;
    font: inherit;
    outline: none;
    padding: 0;
    margin: 0;
    caret-color: #a6e3a1;
  `;const h=()=>{const a=n.cwd==="/home/user"?"~":n.cwd.replace("/home/user","~");m.innerHTML="";const g=document.createElement("span");g.style.color="#a6e3a1",g.style.fontWeight="bold",g.textContent=`${n.env.USER}@everest`;const y=document.createElement("span");y.style.color="#6c7086",y.textContent=":";const u=document.createElement("span");u.style.color="#89b4fa",u.style.fontWeight="bold",u.textContent=a;const b=document.createElement("span");b.style.color="#cdd6f4",b.textContent="$ ",m.appendChild(g),m.appendChild(y),m.appendChild(u),m.appendChild(b)};h(),s.appendChild(m),s.appendChild(o),r.appendChild(s);const c=()=>{requestAnimationFrame(()=>{r.scrollTop=r.scrollHeight})},d=a=>{const g=a.split(`
`);for(let y=0;y<g.length;y++){const u=g[y];u.length>0&&i.appendChild(L(u)),y<g.length-1&&i.appendChild(document.createElement("br"))}c()},p={write:a=>d(a),clear:()=>{i.innerHTML=""},_output:i},x=a=>{const g=document.createElement("div");g.style.cssText="display:flex; align-items:center; gap:0; white-space:pre;";const y=m.cloneNode(!0);g.appendChild(y);const u=document.createElement("span");u.textContent=a,g.appendChild(u),i.appendChild(g)};t.createWindow({id:`terminal-${Date.now()}`,title:"Terminal",icon:"terminal,💻",width:700,height:480,content:r});let w=-1,B="";r.addEventListener("mouseup",a=>{setTimeout(()=>{var g;((g=window.getSelection())==null?void 0:g.toString())===""&&o.focus()},10)}),setTimeout(()=>o.focus(),100),r.addEventListener("contextmenu",async a=>{var b;a.preventDefault(),a.stopPropagation();const g=((b=window.getSelection())==null?void 0:b.toString())||"";let y="";try{y=await navigator.clipboard.readText()}catch{}const u=[];if(g&&u.push({icon:"📋",label:"Copy",action:()=>{var v;navigator.clipboard.writeText(g).catch(()=>{}),(v=window.getSelection())==null||v.removeAllRanges()}}),y&&u.push({icon:"📌",label:"Paste",action:()=>{const v=o.selectionStart??o.value.length,$=o.selectionEnd??o.value.length;o.value=o.value.substring(0,v)+y+o.value.substring($);const E=v+y.length;o.focus(),o.setSelectionRange(E,E)}}),i.textContent.trim()&&u.push({icon:"🗑️",label:"Clear Terminal",action:()=>{i.innerHTML=""}}),u.length>0){const{showContextMenu:v}=await k(async()=>{const{showContextMenu:$}=await import("./index-CDx2cV7o.js").then(E=>E.c);return{showContextMenu:$}},__vite__mapDeps([0,1]));v(u,a.clientX,a.clientY)}}),o.addEventListener("keydown",async a=>{var g,y;if(a.key==="Enter"){const u=o.value;o.value="",w=-1,B="",x(u),u.trim()&&await n.execute(u,p),h(),c()}else if(a.key==="ArrowUp"){if(a.preventDefault(),n.history.length===0)return;w===-1&&(B=o.value),w<n.history.length-1&&(w++,o.value=n.history[n.history.length-1-w])}else if(a.key==="ArrowDown")a.preventDefault(),w<=0?(w=-1,o.value=B):(w--,o.value=n.history[n.history.length-1-w]);else if(a.key==="l"&&a.ctrlKey)a.preventDefault(),i.innerHTML="";else if(a.key==="c"&&a.ctrlKey){const u=(g=window.getSelection())==null?void 0:g.toString();u?(navigator.clipboard.writeText(u).catch(()=>{}),(y=window.getSelection())==null||y.removeAllRanges()):(a.preventDefault(),x(o.value+"^C"),o.value="",h(),c())}}),r.addEventListener("keydown",a=>{var g,y;if(a.key==="c"&&a.ctrlKey&&a.target!==o){const u=(g=window.getSelection())==null?void 0:g.toString();u&&(navigator.clipboard.writeText(u).catch(()=>{}),(y=window.getSelection())==null||y.removeAllRanges(),a.preventDefault())}a.key==="v"&&a.ctrlKey&&a.target!==o&&(a.preventDefault(),navigator.clipboard.readText().then(u=>{u&&(o.value+=u,o.focus())}).catch(()=>{}))}),r.tabIndex=-1,d(`\x1B[1m\x1B[32mEverest OS\x1B[0m \x1B[2mv1.0.0\x1B[0m — \x1B[36mpsh\x1B[0m (Playground Shell)
`),d(`Type \x1B[33mhelp\x1B[0m for a list of available commands.

`)}export{P as launch};

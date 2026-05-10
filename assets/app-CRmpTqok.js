const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index-DY9sEeDM.js","assets/index-BKJI6B33.css"])))=>i.map(i=>d[i]);
import{_ as k}from"./index-DY9sEeDM.js";class T{constructor(f){this.ctx=f,this.cwd="/home/user",this.env={USER:"user",HOME:"/home/user",PATH:"/bin:/usr/bin",SHELL:"psh"},this.history=[],this.commands=new Map}register(f,t){this.commands.set(f,t)}resolve(f){return f?f.startsWith("/")?this.ctx.vfs.resolvePath(f):f.startsWith("~")?this.ctx.vfs.resolvePath(f):this.ctx.vfs.resolvePath(`${this.cwd}/${f}`):this.cwd}async execute(f,t){const e=f.trim().split(/\s+/);if(e.length===0||e[0]==="")return;const n=e[0],r=e.slice(1);this.history.push(f);const i=this.commands.get(n);if(i)try{await i(r,{shell:this,stdout:t,vfs:this.ctx.vfs,ctx:this.ctx})}catch(s){t.write(`\r
\x1B[31mError: ${s.message}\x1B[0m\r
`)}else t.write(`\r
psh: command not found: ${n}\r
`)}}const S=["Do not be afraid of competition.","An exciting opportunity lies ahead of you.","You love peace.","Get your mind set... confidence will lead you on.","You will always be surrounded by true friends.","Sell your ideas — they have exceptional merit.","You should be able to undertake and complete anything.","A routine task will turn into an enchanting adventure.","Be true to your work, your word, and your friend.","A journey of a thousand miles begins with a single step.","Forget injuries; never forget kindnesses.","Respect yourself and others will respect you.","Attitude is a little thing that makes a big difference.","Experience is the best teacher.","Expect the unexpected.","Once you make a decision the universe conspires to make it happen.","Nothing great was ever achieved without enthusiasm.","Dance as if no one is watching.","Live this day as if it were your last.","Bloom where you are planted.","Borrow money from a pessimist. They don't expect it back.","Help! I'm being held prisoner in a fortune cookie factory."],F=`        \\\\   ^__^
         \\\\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||`;function C(m){const t=m.split(" "),e=[];let n="";for(const o of t)(n+o).length<=40?n+=(n?" ":"")+o:(n&&e.push(n),n=o);n&&e.push(n);const r=Math.max(...e.map(o=>o.length)),i=" "+"_".repeat(r+2),s=" "+"-".repeat(r+2),l=e.map((o,h)=>{const a=o.padEnd(r);return e.length===1?`< ${a} >`:h===0?`/ ${a} \\`:h===e.length-1?`\\ ${a} /`:`| ${a} |`});return[i,...l,s,F].join(`
`)}async function O(m){const{vfs:f}=m.ctx;m.register("help",async(t,{stdout:e})=>{const n=Array.from(m.commands.keys()).sort();e.write(`\x1B[1m\x1B[33mAvailable commands:\x1B[0m

`);const r=5;for(let i=0;i<n.length;i+=r){const s=n.slice(i,i+r).map(l=>`  \x1B[36m${l.padEnd(14)}\x1B[0m`).join("");e.write(s+`
`)}e.write(`
\x1B[2mUse "man <command>" for more information.\x1B[0m
`)}),m.register("clear",async(t,{stdout:e})=>{e.clear()}),m.register("echo",async(t,{stdout:e})=>{e.write(t.join(" ")+`
`)}),m.register("ls",async(t,{shell:e,stdout:n})=>{const r=t.includes("-a")||t.includes("-la")||t.includes("-al"),i=t.includes("-l")||t.includes("-la")||t.includes("-al"),s=t.find(o=>!o.startsWith("-")),l=e.resolve(s);try{const o=await f.readdir(l);let h=r?o:o.filter(a=>!a.name.startsWith("."));if(i)for(const a of h){const d=a.type==="dir"?"d":"-",p="rwxr-xr-x",x=a.size!=null?String(a.size).padStart(8):"       0",w=a.type==="dir"?`\x1B[1m\x1B[34m${a.name}/\x1B[0m`:a.name;n.write(`\x1B[2m${d}${p}\x1B[0m  ${x}  ${w}
`)}else{const a=h.map(d=>d.type==="dir"?`\x1B[1m\x1B[34m${d.name}/\x1B[0m`:d.name.endsWith(".js")||d.name.endsWith(".json")?`\x1B[32m${d.name}\x1B[0m`:d.name);n.write(a.join("  ")+`
`)}}catch(o){throw new Error(`ls: cannot access '${s||"."}': ${o.message}`)}}),m.register("cd",async(t,{shell:e})=>{if(!t[0]||t[0]==="~"){e.cwd="/home/user";return}if(t[0]==="-"){const r=e._prevCwd||e.cwd;e._prevCwd=e.cwd,e.cwd=r;return}const n=e.resolve(t[0]);try{const r=await f.stat(n);if(r&&r.type==="dir")e._prevCwd=e.cwd,e.cwd=n;else throw new Error("Not a directory")}catch{throw new Error(`cd: ${t[0]}: No such file or directory`)}}),m.register("cat",async(t,{shell:e,stdout:n})=>{if(t.length===0)throw new Error("cat: missing operand");for(const r of t){const i=e.resolve(r);try{const s=await f.readFile(i);n.write(s+`
`)}catch{n.write(`\x1B[31mcat: ${r}: No such file or directory\x1B[0m
`)}}}),m.register("head",async(t,{shell:e,stdout:n})=>{let r=10;const i=t.indexOf("-n");if(i!==-1&&t[i+1]&&(r=parseInt(t[i+1],10),t.splice(i,2)),t.length===0)throw new Error("head: missing operand");const s=e.resolve(t[0]),o=(await f.readFile(s)).split(`
`).slice(0,r);n.write(o.join(`
`)+`
`)}),m.register("tail",async(t,{shell:e,stdout:n})=>{let r=10;const i=t.indexOf("-n");if(i!==-1&&t[i+1]&&(r=parseInt(t[i+1],10),t.splice(i,2)),t.length===0)throw new Error("tail: missing operand");const s=e.resolve(t[0]),o=(await f.readFile(s)).split(`
`).slice(-r);n.write(o.join(`
`)+`
`)}),m.register("wc",async(t,{shell:e,stdout:n})=>{if(t.length===0)throw new Error("wc: missing operand");for(const r of t){const i=e.resolve(r);try{const s=await f.readFile(i),l=s.split(`
`).length,o=s.split(/\s+/).filter(Boolean).length,h=s.length;n.write(`  ${l}  ${o}  ${h} ${r}
`)}catch{n.write(`\x1B[31mwc: ${r}: No such file or directory\x1B[0m
`)}}}),m.register("mkdir",async(t,{shell:e})=>{if(t.length===0)throw new Error("mkdir: missing operand");for(const n of t){const r=e.resolve(n);await f.mkdir(r)}}),m.register("rm",async(t,{shell:e,stdout:n})=>{if(t.length===0)throw new Error("rm: missing operand");const r=t.filter(i=>!i.startsWith("-"));for(const i of r){const s=e.resolve(i);try{await f.rm(s)}catch(l){n.write(`\x1B[31mrm: cannot remove '${i}': ${l.message}\x1B[0m
`)}}}),m.register("rmdir",async(t,{shell:e})=>{if(t.length===0)throw new Error("rmdir: missing operand");const n=e.resolve(t[0]);if((await f.readdir(n)).length>0)throw new Error(`rmdir: failed to remove '${t[0]}': Directory not empty`);await f.rm(n)}),m.register("touch",async(t,{shell:e})=>{if(t.length===0)throw new Error("touch: missing operand");for(const n of t){const r=e.resolve(n);try{await f.readFile(r)}catch{await f.writeFile(r,"")}}}),m.register("cp",async(t,{shell:e})=>{if(t.length<2)throw new Error("cp: missing operand");const n=e.resolve(t[0]),r=e.resolve(t[1]),i=await f.readFile(n);await f.writeFile(r,i)}),m.register("mv",async(t,{shell:e})=>{if(t.length<2)throw new Error("mv: missing operand");const n=e.resolve(t[0]),r=e.resolve(t[1]),i=await f.readFile(n);await f.writeFile(r,i),await f.rm(n)}),m.register("pwd",async(t,{shell:e,stdout:n})=>{n.write(e.cwd+`
`)}),m.register("whoami",async(t,{shell:e,stdout:n})=>{n.write(e.env.USER+`
`)}),m.register("hostname",async(t,{stdout:e})=>{e.write(`everest-os
`)}),m.register("uname",async(t,{stdout:e})=>{t.includes("-a")?e.write(`EverestOS 1.0.0 everest-os x86_64 JavaScript/VFS
`):e.write(`EverestOS
`)}),m.register("date",async(t,{stdout:e})=>{e.write(new Date().toString()+`
`)}),m.register("uptime",async(t,{shell:e,stdout:n})=>{const r=Math.floor((Date.now()-(e._startTime||Date.now()))/1e3),i=Math.floor(r/3600),s=Math.floor(r%3600/60),l=r%60,o=new Date().toLocaleTimeString();n.write(` \x1B[1m${o}\x1B[0m up ${i}:${String(s).padStart(2,"0")}:${String(l).padStart(2,"0")}, 1 user
`)}),m.register("history",async(t,{shell:e,stdout:n})=>{if(e.history.length===0){n.write(`\x1B[2mNo history yet.\x1B[0m
`);return}e.history.forEach((r,i)=>{n.write(`  \x1B[2m${String(i+1).padStart(4)}\x1B[0m  ${r}
`)})}),m.register("env",async(t,{shell:e,stdout:n})=>{for(const[r,i]of Object.entries(e.env))n.write(`\x1B[36m${r}\x1B[0m=${i}
`)}),m.register("printenv",async(t,e)=>{await m.commands.get("env")(t,e)}),m.register("export",async(t,{shell:e,stdout:n})=>{if(t.length===0){for(const[r,i]of Object.entries(e.env))n.write(`declare -x ${r}="${i}"
`);return}for(const r of t){const i=r.indexOf("=");if(i===-1)n.write(`\x1B[31mexport: '${r}': not a valid identifier\x1B[0m
`);else{const s=r.slice(0,i),l=r.slice(i+1);e.env[s]=l}}}),m.register("grep",async(t,{shell:e,stdout:n})=>{const r=t.includes("-i"),i=t.includes("-n"),s=t.filter(p=>!p.startsWith("-"));if(s.length<2)throw new Error("grep: usage: grep [-i] [-n] PATTERN FILE");const l=s[0],o=e.resolve(s[1]),a=(await f.readFile(o)).split(`
`),d=new RegExp(l,r?"gi":"g");for(let p=0;p<a.length;p++)if(d.test(a[p])){const x=a[p].replace(d,B=>`\x1B[1m\x1B[31m${B}\x1B[0m`),w=i?`\x1B[32m${p+1}\x1B[0m:`:"";n.write(`${w}${x}
`),d.lastIndex=0}}),m.register("rev",async(t,{stdout:e})=>{if(t.length===0)throw new Error("rev: missing string argument");e.write(t.join(" ").split("").reverse().join("")+`
`)}),m.register("fortune",async(t,{stdout:e})=>{const n=S[Math.floor(Math.random()*S.length)];e.write(`\x1B[33m${n}\x1B[0m
`)}),m.register("cowsay",async(t,{stdout:e})=>{const n=t.length>0?t.join(" "):"Moo!";e.write(C(n)+`
`)}),m.register("curl",async(t,{shell:e,stdout:n})=>{const r=t.includes("-I")||t.includes("--head"),i=t.includes("-s")||t.includes("--silent"),s=t.includes("-O");let l=null;const o=t.indexOf("-o");o!==-1&&t[o+1]&&(l=t[o+1],t.splice(o,2));const h=t.find(d=>!d.startsWith("-"));if(!h)throw new Error(`curl: no URL specified
Usage: curl [OPTIONS] URL
  -o FILE   Write output to FILE
  -O        Write output using remote filename
  -I        Show headers only
  -s        Silent mode`);let a=h;if(!a.startsWith("http://")&&!a.startsWith("https://")&&(a="https://"+a),s&&!l)try{const p=new URL(a).pathname.split("/").filter(Boolean);l=p.length>0?p[p.length-1]:"index.html"}catch{l="download"}i||(n.write(`\x1B[2m  % Total    % Received  Time     Speed\x1B[0m
`),n.write(`\x1B[2m                         -------  -----\x1B[0m
`));try{const d=performance.now(),p=await fetch(a),x=((performance.now()-d)/1e3).toFixed(3);if(r){n.write(`\x1B[36mHTTP/${p.status>=200?"1.1":"2"} ${p.status}\x1B[0m
`);for(const[w,B]of p.headers.entries())n.write(`\x1B[32m${w}\x1B[0m: ${B}
`);n.write(`
`)}else{const w=await p.text(),B=new Blob([w]).size;if(i||n.write(`\x1B[2m  ${B}    100       ${x}s    ${Math.round(B/parseFloat(x))} B/s\x1B[0m

`),l){const c=e.resolve(l);await f.writeFile(c,w),n.write(`\x1B[32m✓ Saved ${B} bytes to ${l}\x1B[0m
`)}else w.length>5e3?(n.write(w.substring(0,5e3)),n.write(`
\x1B[33m... (truncated, ${w.length} bytes total)\x1B[0m
`)):n.write(w+`
`)}}catch(d){n.write(`\x1B[31mcurl: (6) Could not resolve host: ${h}\x1B[0m
`),n.write(`\x1B[31m${d.message}\x1B[0m
`)}}),m.register("ping",async(t,{stdout:e})=>{let n=4;const r=t.indexOf("-c");r!==-1&&t[r+1]&&(n=parseInt(t[r+1],10),t.splice(r,2));const i=t.find(x=>!x.startsWith("-"));if(!i)throw new Error(`ping: missing host operand
Usage: ping [-c count] host`);let s=i;!s.startsWith("http://")&&!s.startsWith("https://")&&(s="https://"+s),e.write(`\x1B[1mPING\x1B[0m ${i}: ${n} packets
`);let l=0,o=0,h=0,a=1/0,d=0;for(let x=0;x<n;x++){l++;try{const w=performance.now();await fetch(s,{method:"HEAD",mode:"no-cors"});const B=(performance.now()-w).toFixed(1),c=parseFloat(B);o++,h+=c,c<a&&(a=c),c>d&&(d=c),e.write(`\x1B[32m64 bytes from ${i}: icmp_seq=${x+1} time=${B} ms\x1B[0m
`)}catch{e.write(`\x1B[31mRequest timeout for icmp_seq ${x+1}\x1B[0m
`)}x<n-1&&await new Promise(w=>setTimeout(w,500))}e.write(`
\x1B[1m--- ${i} ping statistics ---\x1B[0m
`);const p=((l-o)/l*100).toFixed(1);if(e.write(`${l} packets transmitted, ${o} received, \x1B[${p==="0.0"?"32":"31"}m${p}% packet loss\x1B[0m
`),o>0){const x=(h/o).toFixed(1);e.write(`rtt min/avg/max = ${a.toFixed(1)}/${x}/${d.toFixed(1)} ms
`)}}),m.register("exit",async(t,{ctx:e})=>{var r;const n=(r=e.windowManager)==null?void 0:r.activeWindow;n&&e.windowManager.closeWindow(n)}),m.register("reboot",async()=>{window.location.reload()}),m.register("reload",async()=>{window.location.reload()}),m.register("man",async(t,{stdout:e})=>{const n={ls:`ls [OPTIONS] [PATH]
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
`)}),m.register("version",async(t,{stdout:e})=>{e.write(`\x1B[1m\x1B[32mEverest OS\x1B[0m v1.0.0
`),e.write(`\x1B[36mpsh\x1B[0m (Playground Shell) v2.0.0
`),e.write(`\x1B[2mPowered by VFS + JavaScript\x1B[0m
`)}),m.register("cmatrix",async(t,{stdout:e})=>{e.clear();const n="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()",r=80,i=24,s=new Array(r).fill(0),l=setInterval(()=>{let o="";for(let h=0;h<r;h++)Math.random()>.95||s[h]>0?(o+=`\x1B[32m${n[Math.floor(Math.random()*n.length)]}\x1B[0m`,s[h]=(s[h]+1)%i):o+=" ";e.write(o+`
`)},100);setTimeout(()=>{clearInterval(l),e.write(`
\x1B[2m(cmatrix ended after 10s)\x1B[0m
`)},1e4)}),m.register("neofetch",async(t,{stdout:e})=>{var h,a;const n=((h=m.ctx.vfs)==null?void 0:h.USER)||"user",r=((a=m.ctx.themeManager)==null?void 0:a.currentTheme)||"Everest-Dark",i=m.ctx.vfs,s=window.location.pathname.includes("/EverestOS")?"/EverestOS/":"/";let l="Unknown";if(i!=null&&i.staticMode)l="Static (GitHub Pages — IndexedDB Persistent)";else try{if((await fetch(s+"api/fs/info")).ok)l="Server FS (Persistent)";else throw 0}catch{i!=null&&i.db?l="IndexedDB (Browser — Persistent)":i!=null&&i.useLocalStorage&&(l="LocalStorage (Volatile)")}const o=`
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
\x1B[36m                    \x1B[0m \x1B[36mStorage:\x1B[0m ${l}
\x1B[36m                    \x1B[0m
\x1B[36m                    \x1B[0m \x1B[40m   \x1B[41m   \x1B[42m   \x1B[43m   \x1B[44m   \x1B[45m   \x1B[46m   \x1B[47m   \x1B[0m
`;e.write(o+`
`)}),m.register("backup",async(t,{shell:e,stdout:n})=>{const r=t[0];n.write(`\x1B[36m⏳ Collecting files...\x1B[0m
`);const i=[],s=async a=>{try{const d=await f.readdir(a);for(const p of d)if(p.type==="dir")i.push({path:p.path,type:"dir"}),await s(p.path);else try{const x=await f.readFile(p.path);i.push({path:p.path,type:"file",content:x,size:x.length})}catch{}}catch{}};await s("/");const l={version:"1.0",os:"EverestOS",timestamp:new Date().toISOString(),fileCount:i.length,files:i},o=JSON.stringify(l,null,2),h=(new Blob([o]).size/1024).toFixed(1);if(r){const a=e.resolve(r);await f.writeFile(a,o),n.write(`\x1B[32m✓ Backup saved to ${r} (${h} KB, ${i.length} files)\x1B[0m
`)}else{const a=new Blob([o],{type:"application/json"}),d=URL.createObjectURL(a),p=document.createElement("a");p.href=d,p.download=`everest-backup-${new Date().toISOString().slice(0,10)}.json`,document.body.appendChild(p),p.click(),p.remove(),URL.revokeObjectURL(d),n.write(`\x1B[32m✓ Backup downloaded (${h} KB, ${i.length} files)\x1B[0m
`)}}),m.register("restore",async(t,{shell:e,stdout:n})=>{const r=t[0];let i;if(r){const a=e.resolve(r);try{const d=await f.readFile(a);i=JSON.parse(d)}catch(d){throw new Error(`restore: cannot read '${r}': ${d.message}`)}}else n.write(`\x1B[36m📂 Select a backup file...\x1B[0m
`),i=await new Promise((a,d)=>{const p=document.createElement("input");p.type="file",p.accept=".json",p.onchange=async()=>{const x=p.files[0];if(!x){d(new Error("No file selected"));return}try{const w=await x.text();a(JSON.parse(w))}catch(w){d(new Error(`Invalid backup file: ${w.message}`))}},p.oncancel=()=>d(new Error("Cancelled")),p.click()});if(!i||!i.files)throw new Error("restore: invalid backup format (missing files array)");n.write(`\x1B[36m⏳ Restoring ${i.files.length} items from ${i.timestamp||"unknown date"}...\x1B[0m
`);let s=0,l=0;const o=i.files.filter(a=>a.type==="dir"),h=i.files.filter(a=>a.type==="file");for(const a of o)try{await f.mkdir(a.path),s++}catch{l++}for(const a of h)try{const d=a.path.substring(0,a.path.lastIndexOf("/"));if(d)try{await f.mkdir(d)}catch{}await f.writeFile(a.path,a.content||""),s++}catch{l++}n.write(`\x1B[32m✓ Restore complete: ${s} items restored\x1B[0m`),l>0&&n.write(`, \x1B[31m${l} errors\x1B[0m`),n.write(`
`),i.os&&n.write(`\x1B[2m  Backup from: ${i.os} (${i.timestamp})\x1B[0m
`)})}function I(m){const f=["#1e1e2e","#f38ba8","#a6e3a1","#f9e2af","#89b4fa","#cba6f7","#94e2d5","#cdd6f4"],t=["#585b70","#f38ba8","#a6e3a1","#f9e2af","#89b4fa","#cba6f7","#94e2d5","#ffffff"],e=["#1e1e2e","#f38ba8","#a6e3a1","#f9e2af","#89b4fa","#cba6f7","#94e2d5","#cdd6f4"],n=["#585b70","#f38ba8","#a6e3a1","#f9e2af","#89b4fa","#cba6f7","#94e2d5","#ffffff"],r=/\x1b\[([0-9;]*)m/g,i=[];let s=0,l=null,o=null,h=!1,a=!1,d=!1,p=!1,x=!1,w;for(;(w=r.exec(m))!==null;){w.index>s&&i.push({text:m.slice(s,w.index),fg:l,bg:o,bold:h,dim:a,italic:d,underline:p,strike:x});const B=w[1].split(";").map(Number);for(const c of B)c===0?(l=null,o=null,h=!1,a=!1,d=!1,p=!1,x=!1):c===1?h=!0:c===2?a=!0:c===3?d=!0:c===4?p=!0:c===9?x=!0:c>=30&&c<=37?l=f[c-30]:c>=40&&c<=47?o=e[c-40]:c>=90&&c<=97?l=t[c-90]:c>=100&&c<=107?o=n[c-100]:c===39?l=null:c===49&&(o=null);s=r.lastIndex}return s<m.length&&i.push({text:m.slice(s),fg:l,bg:o,bold:h,dim:a,italic:d,underline:p,strike:x}),i}function L(m){const f=document.createDocumentFragment(),t=I(m);for(const e of t){const n=document.createElement("span");n.textContent=e.text;const r=[];e.fg&&r.push(`color:${e.fg}`),e.bg&&r.push(`background:${e.bg}`),e.bold&&r.push("font-weight:bold"),e.dim&&r.push("opacity:0.5"),e.italic&&r.push("font-style:italic"),e.underline&&r.push("text-decoration:underline"),e.strike&&r.push("text-decoration:line-through"),r.length&&(n.style.cssText=r.join(";")),f.appendChild(n)}return f}async function R(m,f={}){const{windowManager:t}=m,e=Date.now(),n=new T(m);n._startTime=e,await O(n);const r=document.createElement("div");r.className="terminal-container",r.style.cssText=`
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
  `;const i=document.createElement("div");i.className="terminal-scrollback",i.style.cssText="white-space:pre-wrap; word-break:break-all;",r.appendChild(i);const s=document.createElement("div");s.className="terminal-prompt-line",s.style.cssText="display:flex; align-items:center; gap:0; white-space:pre;";const l=document.createElement("span");l.className="terminal-prompt";const o=document.createElement("input");o.type="text",o.className="terminal-input",o.spellcheck=!1,o.autocomplete="off",o.style.cssText=`
    flex: 1;
    background: transparent;
    border: none;
    color: #cdd6f4;
    font: inherit;
    outline: none;
    padding: 0;
    margin: 0;
    caret-color: #a6e3a1;
  `;const h=()=>{const c=n.cwd==="/home/user"?"~":n.cwd.replace("/home/user","~");l.innerHTML="";const g=document.createElement("span");g.style.color="#a6e3a1",g.style.fontWeight="bold",g.textContent=`${n.env.USER}@everest`;const y=document.createElement("span");y.style.color="#6c7086",y.textContent=":";const u=document.createElement("span");u.style.color="#89b4fa",u.style.fontWeight="bold",u.textContent=c;const b=document.createElement("span");b.style.color="#cdd6f4",b.textContent="$ ",l.appendChild(g),l.appendChild(y),l.appendChild(u),l.appendChild(b)};h(),s.appendChild(l),s.appendChild(o),r.appendChild(s);const a=()=>{requestAnimationFrame(()=>{r.scrollTop=r.scrollHeight})},d=c=>{const g=c.split(`
`);for(let y=0;y<g.length;y++){const u=g[y];u.length>0&&i.appendChild(L(u)),y<g.length-1&&i.appendChild(document.createElement("br"))}a()},p={write:c=>d(c),clear:()=>{i.innerHTML=""},_output:i},x=c=>{const g=document.createElement("div");g.style.cssText="display:flex; align-items:center; gap:0; white-space:pre;";const y=l.cloneNode(!0);g.appendChild(y);const u=document.createElement("span");u.textContent=c,g.appendChild(u),i.appendChild(g)};t.createWindow({id:`terminal-${Date.now()}`,title:"Terminal",icon:"terminal,💻",width:700,height:480,content:r});let w=-1,B="";r.addEventListener("mouseup",c=>{setTimeout(()=>{var g;((g=window.getSelection())==null?void 0:g.toString())===""&&o.focus()},10)}),setTimeout(()=>o.focus(),100),r.addEventListener("contextmenu",async c=>{var b;c.preventDefault(),c.stopPropagation();const g=((b=window.getSelection())==null?void 0:b.toString())||"";let y="";try{y=await navigator.clipboard.readText()}catch{}const u=[];if(g&&u.push({icon:"📋",label:"Copy",action:()=>{var v;navigator.clipboard.writeText(g).catch(()=>{}),(v=window.getSelection())==null||v.removeAllRanges()}}),y&&u.push({icon:"📌",label:"Paste",action:()=>{const v=o.selectionStart??o.value.length,$=o.selectionEnd??o.value.length;o.value=o.value.substring(0,v)+y+o.value.substring($);const E=v+y.length;o.focus(),o.setSelectionRange(E,E)}}),i.textContent.trim()&&u.push({icon:"🗑️",label:"Clear Terminal",action:()=>{i.innerHTML=""}}),u.length>0){const{showContextMenu:v}=await k(async()=>{const{showContextMenu:$}=await import("./index-DY9sEeDM.js").then(E=>E.c);return{showContextMenu:$}},__vite__mapDeps([0,1]));v(u,c.clientX,c.clientY)}}),o.addEventListener("keydown",async c=>{var g,y;if(c.key==="Enter"){const u=o.value;o.value="",w=-1,B="",x(u),u.trim()&&await n.execute(u,p),h(),a()}else if(c.key==="ArrowUp"){if(c.preventDefault(),n.history.length===0)return;w===-1&&(B=o.value),w<n.history.length-1&&(w++,o.value=n.history[n.history.length-1-w])}else if(c.key==="ArrowDown")c.preventDefault(),w<=0?(w=-1,o.value=B):(w--,o.value=n.history[n.history.length-1-w]);else if(c.key==="l"&&c.ctrlKey)c.preventDefault(),i.innerHTML="";else if(c.key==="c"&&c.ctrlKey){const u=(g=window.getSelection())==null?void 0:g.toString();u?(navigator.clipboard.writeText(u).catch(()=>{}),(y=window.getSelection())==null||y.removeAllRanges()):(c.preventDefault(),x(o.value+"^C"),o.value="",h(),a())}}),r.addEventListener("keydown",c=>{var g,y;if(c.key==="c"&&c.ctrlKey&&c.target!==o){const u=(g=window.getSelection())==null?void 0:g.toString();u&&(navigator.clipboard.writeText(u).catch(()=>{}),(y=window.getSelection())==null||y.removeAllRanges(),c.preventDefault())}c.key==="v"&&c.ctrlKey&&c.target!==o&&(c.preventDefault(),navigator.clipboard.readText().then(u=>{u&&(o.value+=u,o.focus())}).catch(()=>{}))}),r.tabIndex=-1,d(`\x1B[1m\x1B[32mEverest OS\x1B[0m \x1B[2mv1.0.0\x1B[0m — \x1B[36mpsh\x1B[0m (Playground Shell)
`),d(`Type \x1B[33mhelp\x1B[0m for a list of available commands.

`)}export{R as launch};

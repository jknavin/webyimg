const $ = s => document.querySelector(s);
const dropZone = $("#dropZone"), fileInput = $("#fileInput"), chooseBtn = $("#chooseBtn");
const controls = $("#controls"), results = $("#results"), resultList = $("#resultList");
const format = $("#format"), quality = $("#quality"), qualityValue = $("#qualityValue");
const maxWidth = $("#maxWidth"), maxHeight = $("#maxHeight"), keepRatio = $("#keepRatio");
const processBtn = $("#processBtn"), clearBtn = $("#clearBtn"), downloadAllBtn = $("#downloadAllBtn");

let files = [], outputs = [];

chooseBtn.onclick = () => fileInput.click();
fileInput.onchange = () => addFiles([...fileInput.files]);
["dragenter","dragover"].forEach(e => dropZone.addEventListener(e, ev => {ev.preventDefault();dropZone.classList.add("drag")}));
["dragleave","drop"].forEach(e => dropZone.addEventListener(e, ev => {ev.preventDefault();dropZone.classList.remove("drag")}));
dropZone.addEventListener("drop", e => addFiles([...e.dataTransfer.files]));
quality.oninput = () => qualityValue.textContent = quality.value + "%";

function addFiles(list){
  const imgs = list.filter(f => f.type.startsWith("image/") || /\.(jpe?g|png|webp|gif|bmp|svg|avif)$/i.test(f.name));
  files = files.concat(imgs);
  if(files.length){ controls.classList.remove("hidden"); results.classList.add("hidden"); }
  dropZone.querySelector("h2").textContent = `${files.length} image${files.length===1?"":"s"} selected`;
  dropZone.querySelector("p").textContent = "Add more or configure conversion below";
}

function extFor(mime){
  return mime==="image/jpeg"?"jpg":mime==="image/png"?"png":mime==="image/avif"?"avif":"webp";
}
function baseName(name){ return name.replace(/\.[^.]+$/,""); }
function formatBytes(n){
  if(n<1024)return n+" B"; const u=["KB","MB","GB"]; let i=-1; do{n/=1024;i++}while(n>=1024&&i<u.length-1); return n.toFixed(n>=100?0:n>=10?1:2)+" "+u[i];
}
function targetSize(w,h){
  let mw=parseInt(maxWidth.value)||w, mh=parseInt(maxHeight.value)||h;
  if(!keepRatio.checked) return [mw,mh];
  const scale=Math.min(mw/w,mh/h,1);
  return [Math.max(1,Math.round(w*scale)),Math.max(1,Math.round(h*scale))];
}
async function decode(file){
  if("createImageBitmap" in window) return await createImageBitmap(file);
  return await new Promise((res,rej)=>{const img=new Image();img.onload=()=>res(img);img.onerror=rej;img.src=URL.createObjectURL(file)});
}
async function processFile(file){
  const bmp=await decode(file);
  const [w,h]=targetSize(bmp.width,bmp.height);
  const canvas=document.createElement("canvas"); canvas.width=w; canvas.height=h;
  const ctx=canvas.getContext("2d",{alpha:true});
  ctx.imageSmoothingEnabled=true; ctx.imageSmoothingQuality="high";
  ctx.drawImage(bmp,0,0,w,h);
  if(bmp.close) bmp.close();
  let mime=format.value;
  let blob=await new Promise(resolve=>canvas.toBlob(resolve,mime,Number(quality.value)/100));
  if(!blob && mime==="image/avif"){
    mime="image/webp";
    blob=await new Promise(resolve=>canvas.toBlob(resolve,mime,Number(quality.value)/100));
  }
  if(!blob) throw new Error("This browser cannot encode the selected format.");
  const name=baseName(file.name)+"."+extFor(mime);
  return {name,blob,width:w,height:h,original:file.size,mime};
}
processBtn.onclick=async()=>{
  if(!files.length)return;
  processBtn.disabled=true; processBtn.textContent="Processing…";
  outputs=[]; resultList.innerHTML="";
  results.classList.remove("hidden");
  for(const file of files){
    try{
      const out=await processFile(file); outputs.push(out);
      renderResult(out);
    }catch(err){renderError(file,err.message)}
  }
  processBtn.disabled=false; processBtn.textContent="Convert & Compress";
};
function renderResult(o){
  const url=URL.createObjectURL(o.blob);
  const saved=Math.max(0,1-o.blob.size/o.original)*100;
  const el=document.createElement("div"); el.className="result";
  el.innerHTML=`<img class="thumb" src="${url}"><div><div class="name">${escapeHtml(o.name)}</div><div class="meta">${o.width} × ${o.height} · ${formatBytes(o.original)} → ${formatBytes(o.blob.size)} · <span class="saved">${saved.toFixed(1)}% smaller</span></div></div><button class="secondary">Download</button>`;
  el.querySelector("button").onclick=()=>downloadBlob(o.blob,o.name);
  resultList.appendChild(el);
}
function renderError(file,msg){
  const el=document.createElement("div"); el.className="result";
  el.innerHTML=`<div></div><div><div class="name">${escapeHtml(file.name)}</div><div class="meta">Error: ${escapeHtml(msg)}</div></div>`;
  resultList.appendChild(el);
}
function escapeHtml(s){return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function downloadBlob(blob,name){const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
downloadAllBtn.onclick=async()=>{
  if(!outputs.length)return;
  const zip=await makeZipAsync(outputs.map(o=>({name:o.name,data:o.blob})));
  downloadBlob(new Blob([zip],{type:"application/zip"}),"converted-images.zip");
};
clearBtn.onclick=()=>{
  files=[];outputs=[];resultList.innerHTML="";controls.classList.add("hidden");results.classList.add("hidden");fileInput.value="";
  dropZone.querySelector("h2").textContent="Drop images here";dropZone.querySelector("p").textContent="or choose files from your computer";
};
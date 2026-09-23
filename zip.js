// Tiny dependency-free ZIP writer using the ZIP "store" method.
// It keeps this extension completely offline and requires no third-party library.
function crc32(buf){
  let c=0^(-1);
  for(let i=0;i<buf.length;i++){c=(c>>>8)^CRC[(c^buf[i])&255]}
  return (c^(-1))>>>0;
}
const CRC=(()=>{const t=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=(c&1)?(0xedb88320^(c>>>1)):(c>>>1);t[n]=c>>>0}return t})();
function u16(n){return new Uint8Array([n&255,(n>>>8)&255])}
function u32(n){return new Uint8Array([n&255,(n>>>8)&255,(n>>>16)&255,(n>>>24)&255])}
function concatBytes(arrays){let len=arrays.reduce((s,a)=>s+a.length,0),out=new Uint8Array(len),p=0;for(const a of arrays){out.set(a,p);p+=a.length}return out}
function dosDateTime(d=new Date()){
  return {date:((d.getFullYear()-1980)<<9)|((d.getMonth()+1)<<5)|d.getDate(),
          time:(d.getHours()<<11)|(d.getMinutes()<<5)|Math.floor(d.getSeconds()/2)}
}
function makeZip(items){
  const enc=new TextEncoder(), chunks=[], central=[]; let offset=0; const dt=dosDateTime();
  for(const item of items){
    const name=enc.encode(item.name), data=new Uint8Array(awaitBlob(item.data));
    const crc=crc32(data), head=concatBytes([new Uint8Array([80,75,3,4]),u16(20),u16(0),u16(0),u16(dt.time),u16(dt.date),u32(crc),u32(data.length),u32(data.length),u16(name.length),u16(0),name]);
    chunks.push(head,data); central.push({name,crc,size:data.length,offset}); offset+=head.length+data.length;
  }
  const centralStart=offset, cparts=[];
  for(const c of central){
    const h=concatBytes([new Uint8Array([80,75,1,2]),u16(20),u16(20),u16(0),u16(0),u16(dt.time),u16(dt.date),u32(c.crc),u32(c.size),u32(c.size),u16(c.name.length),u16(0),u16(0),u16(0),u16(0),u32(0),u32(c.offset),c.name]);
    cparts.push(h); offset+=h.length;
  }
  const centralSize=offset-centralStart;
  const end=concatBytes([new Uint8Array([80,75,5,6]),u16(0),u16(0),u16(central.length),u16(central.length),u32(centralSize),u32(centralStart),u16(0)]);
  return concatBytes([...chunks,...cparts,end]);
}
// Converts Blob data to Uint8Array synchronously is not possible; makeZip is replaced below.
const _makeZip=makeZip;
makeZip=function(items){
  throw new Error("ZIP generation is async; use makeZipAsync.");
};
async function makeZipAsync(items){
  const enc=new TextEncoder(), chunks=[], central=[]; let offset=0; const dt=dosDateTime();
  for(const item of items){
    const name=enc.encode(item.name), data=new Uint8Array(await item.data.arrayBuffer());
    const crc=crc32(data);
    const head=concatBytes([new Uint8Array([80,75,3,4]),u16(20),u16(0),u16(0),u16(dt.time),u16(dt.date),u32(crc),u32(data.length),u32(data.length),u16(name.length),u16(0),name]);
    chunks.push(head,data); central.push({name,crc,size:data.length,offset}); offset+=head.length+data.length;
  }
  const centralStart=offset, cparts=[];
  for(const c of central){
    const h=concatBytes([new Uint8Array([80,75,1,2]),u16(20),u16(20),u16(0),u16(0),u16(dt.time),u16(dt.date),u32(c.crc),u32(c.size),u32(c.size),u16(c.name.length),u16(0),u16(0),u16(0),u16(0),u32(0),u32(c.offset),c.name]);
    cparts.push(h); offset+=h.length;
  }
  const centralSize=offset-centralStart;
  const end=concatBytes([new Uint8Array([80,75,5,6]),u16(0),u16(0),u16(central.length),u16(central.length),u32(centralSize),u32(centralStart),u16(0)]);
  return concatBytes([...chunks,...cparts,end]);
}
import{readFileSync,mkdirSync,writeFileSync}from'node:fs';
const I=process.env.MAKEFUN_INPUT_DIR??'/input',O=process.env.MAKEFUN_OUTPUT_DIR??'/output';
const T="#4d')-.2        ,,,,,,,(,,,(,,, ,,,             CGGC#           (+              ''$'";
const F=[(x,y)=>(x+y)|0,(x,y)=>(x-y)|0,Math.imul,(x,y)=>x===-2147483648&&y===-1?x:(x/y)|0,(x,y)=>y===-1?0:x%y|0,(x,y)=>Math.floor((x>>>0)/(y>>>0))|0,(x,y)=>(x>>>0)%(y>>>0)|0,0,(x,y)=>x&y,(x,y)=>x|y,(x,y)=>x^y,0,(x,y)=>x<<(y&31),(x,y)=>x>>(y&31),(x,y)=>(x>>>(y&31))|0,0,(x,y)=>x===y?1:0,(x,y)=>x<y?1:0,(x,y)=>(x>>>0)<(y>>>0)?1:0];
for(let i=1;i<=40;i++){
 const d='i'+String(i).padStart(3,'0'),p=readFileSync(I+'/'+d+'/program.bin');
 let q;try{q=readFileSync(I+'/'+d+'/input.bin')}catch{q=new Uint8Array(0)}
 const S=new Int32Array(256),C=new Int32Array(64),M=new Int32Array(256),o=new Uint8Array(65536);
 let sp=0,cp=0,ol=0,ip=0,pc=0,st=0,e=0;
 for(;;){
  if(st===1e6){e=10;break}
  if(pc<0||pc>=p.length){e=9;break}
  const b=p[pc],v=T.charCodeAt(b)-35;
  if(!(v>=0)){e=5;break}
  const m=v>>4,n=(v>>2)&3,w=v&3;
  if(pc+m>=p.length){e=9;break}
  st++;const nx=pc+1+m;
  if(sp<n){e=2;break}
  if(sp-n+w>256){e=3;break}
  pc=nx;
  if(b===0)break;
  else if(b===1)S[sp++]=(p[nx-1]<<24)>>24;
  else if(b===2)S[sp++]=p[nx-4]|p[nx-3]<<8|p[nx-2]<<16|p[nx-1]<<24;
  else if(b===3)sp--;
  else if(b===4){S[sp]=S[sp-1];sp++}
  else if(b===5){const t=S[sp-1];S[sp-1]=S[sp-2];S[sp-2]=t}
  else if(b===6){S[sp]=S[sp-2];sp++}
  else if(b===7){const a=S[sp-3];S[sp-3]=S[sp-2];S[sp-2]=S[sp-1];S[sp-1]=a}
  else if(b===23)S[sp-1]=-S[sp-1]|0;
  else if(b===27)S[sp-1]=~S[sp-1];
  else if(b>=16&&b<=34&&b!==23&&b!==27){
   const y=S[sp-1],x=S[sp-2];
   if(b>18&&b<23&&!y){e=4;break}
   sp-=2;S[sp++]=F[b-16](x,y);
  }
  else if(b>=48&&b<=50){
   const r=((p[nx-2]|p[nx-1]<<8)<<16)>>16;
   let t=1;
   if(b!==48){const v2=S[--sp];t=b===49?v2===0:v2!==0}
   if(t)pc=nx+r;
  }
  else if(b===51){if(cp===64){e=7;break}C[cp++]=nx;pc=p[nx-2]|p[nx-1]<<8}
  else if(b===52){if(!cp){e=8;break}pc=C[--cp]}
  else if(b===64){const a=S[sp-1];if(a<0||a>255){e=6;break}S[sp-1]=M[a]}
  else if(b===65){const a=S[sp-1],v2=S[sp-2];if(a<0||a>255){e=6;break}sp-=2;M[a]=v2}
  else if(b===80){const s=String(S[sp-1]);if(ol+s.length>65536){e=11;break}sp--;for(let k=0;k<s.length;k++)o[ol++]=s.charCodeAt(k)}
  else if(b===81){if(ol+1>65536){e=11;break}o[ol++]=S[--sp]&255}
  else if(b===82)S[sp++]=ip<q.length?q[ip++]:-1;
  else{e=S[--sp]&255;break}
 }
 mkdirSync(O+'/'+d,{recursive:true});
 writeFileSync(O+'/'+d+'/stdout.bin',o.slice(0,ol));
 writeFileSync(O+'/'+d+'/exit.txt',String(e));
}

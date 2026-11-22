import{mkdirSync as k,readdirSync as d,readFileSync as f,writeFileSync as w}from'node:fs';
import{join as j}from'node:path';
// Opcode table: one byte per opcode, packed as imm | (pops << 3) | (pushes << 5).
// imm is 0, 1, 2 or 4; pops and pushes are 0..3. Opcodes the ISA does not name
// stay 0, so the dispatch below traps them as unknown (exit 5).
const T=new Uint8Array(84),S=(o,i,a,b)=>{T[o]=i|a<<3|b<<5};
S(1,1,0,1);S(2,4,0,1);S(3,0,1,0);S(4,0,1,2);S(5,0,2,2);S(6,0,2,3);S(7,0,3,3);
for(let o=16;o<=34;o++)if(o!=23&&o!=27&&o!=31)S(o,0,2,1);
S(23,0,1,1);S(27,0,1,1);S(48,2,0,0);S(49,2,1,0);S(50,2,1,0);S(51,2,0,0);S(64,0,1,1);S(65,0,2,0);S(80,0,1,0);S(81,0,1,0);S(82,0,0,1);S(83,0,1,0);
// Run one program on its input bytes. Returns { out, code }: the bytes it wrote
// and its exit code (0 on HALT, the trap's code on a trap, v & 255 on EXIT).
function run(p,q){
const n=p.length,D=new Int32Array(256);let s=0;const C=new Int32Array(64);let c=0;const M=new Int32Array(256),O=new Uint8Array(65536);let l=0,g=0,h=0,t=0;
const e=x=>({out:O.slice(0,l),code:x});
for(;;){
if(t==1e6)return e(10); // step limit, checked before anything else
if(h<0||h>=n)return e(9); // pc outside the program
const o=p[h],v=T[o],m=v&7;
if(h+m>=n)return e(9); // immediate cut off by the program's end
t++;
const y=h+1+m,a=(v>>3)&3,b=(v>>5)&3;
if(s<a)return e(2); // stack underflow
if(s-a+b>256)return e(3); // stack overflow
h=y;
switch(o){
case 0:return e(0); // HALT
case 1:D[s++]=(p[y-1]<<24)>>24;break; // PUSH8, sign-extended
case 2:D[s++]=p[y-4]|p[y-3]<<8|p[y-2]<<16|p[y-1]<<24;break; // PUSH32
case 3:s--;break; // POP
case 4:D[s]=D[s-1];s++;break; // DUP
case 5:{const z=D[s-1];D[s-1]=D[s-2];D[s-2]=z;break} // SWAP
case 6:D[s]=D[s-2];s++;break; // OVER
case 7:{const z=D[s-3];D[s-3]=D[s-2];D[s-2]=D[s-1];D[s-1]=z;break} // ROT
case 23:D[s-1]=-D[s-1]|0;break; // NEG, wraps
case 27:D[s-1]=~D[s-1];break; // NOT
case 16:case 17:case 18:case 19:case 20:case 21:case 22:case 24:case 25:case 26:case 28:case 29:case 30:case 32:case 33:case 34:{
const B=D[s-1],A=D[s-2];let r;
if(o==16)r=A+B|0; // ADD, wraps
else if(o==17)r=A-B|0; // SUB, wraps
else if(o==18)r=Math.imul(A,B); // MUL, low 32 bits exactly
else if(o==19){if(!B)return e(4);r=A==-2147483648&&B==-1?A:A/B|0} // DIV
else if(o==20){if(!B)return e(4);r=B==-1?0:A%B|0} // MOD, sign of a
else if(o==21){if(!B)return e(4);r=Math.floor((A>>>0)/(B>>>0))|0} // DIVU
else if(o==22){if(!B)return e(4);r=(A>>>0)%(B>>>0)|0} // MODU
else if(o==24)r=A&B; // AND
else if(o==25)r=A|B; // OR
else if(o==26)r=A^B; // XOR
else if(o==28)r=A<<(B&31); // SHL, low 5 bits of the count
else if(o==29)r=A>>(B&31); // SHR, arithmetic
else if(o==30)r=(A>>>(B&31))|0; // SHRU, logical
else if(o==32)r=A==B?1:0; // EQ
else if(o==33)r=A<B?1:0; // LT, signed
else r=(A>>>0)<(B>>>0)?1:0; // LTU, unsigned
s-=2;D[s++]=r;break}
case 48:case 49:case 50:{ // JMP, JZ, JNZ: signed 16-bit offset past the instruction
const z=(p[y-2]|p[y-1]<<8)<<16>>16;let k=1;
if(o!=48){const x=D[--s];k=o==49?x==0:x!=0}
if(k)h=y+z;break}
case 51: // CALL: unsigned 16-bit target
if(c==64)return e(7);
C[c++]=y;h=p[y-2]|p[y-1]<<8;break;
case 52: // RET
if(!c)return e(8);
h=C[--c];break;
case 64:{ // LOAD
const A=D[s-1];
if(A<0||A>255)return e(6);
D[s-1]=M[A];break}
case 65:{ // STORE: ( v addr -- ), addr is the top
const A=D[s-1],x=D[s-2];
if(A<0||A>255)return e(6);
s-=2;M[A]=x;break}
case 80:{ // PRINT: decimal ASCII, no newline; the whole write or none of it
const z=String(D[s-1]);
if(l+z.length>65536)return e(11);
s--;
for(let i=0;i<z.length;i++)O[l++]=z.charCodeAt(i);
break}
case 81: // PUTC: one byte, v & 255
if(l+1>65536)return e(11);
O[l++]=D[--s]&255;break;
case 82: // IN: next input byte, -1 once the input is used up
D[s++]=g<q.length?q[g++]:-1;break;
case 83: // EXIT: low byte of v
return e(D[--s]&255);
default:return e(5); // unknown opcode
}}}
const I=process.env.MAKEFUN_INPUT_DIR??'/input',O=process.env.MAKEFUN_OUTPUT_DIR??'/output';
for(const id of d(I).sort()){
const r=run(new Uint8Array(f(j(I,id,'program.bin'))),new Uint8Array(f(j(I,id,'input.bin'))));
k(j(O,id),{recursive:true});w(j(O,id,'stdout.bin'),r.out);w(j(O,id,'exit.txt'),r.code+'\n');
}

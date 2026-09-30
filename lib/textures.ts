"use client";

import * as THREE from "three";

/** Deterministic PRNG so the city is identical on every load. */
export function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Night façade: a grid of windows, some lit (warm, blue, a few lime). */
export function makeFacadeTexture(seed = 1, cols = 6, rows = 14, litRatio = 0.34) {
  const rnd = mulberry32(seed);
  const w = 256;
  const h = 512;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#0a0c22";
  ctx.fillRect(0, 0, w, h);
  const cw = w / cols;
  const ch = h / rows;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const lit = rnd() < litRatio;
      const px = x * cw + cw * 0.22;
      const py = y * ch + ch * 0.2;
      const pw = cw * 0.56;
      const ph = ch * 0.55;
      if (lit) {
        const r = rnd();
        ctx.fillStyle = r < 0.08 ? "#c1ff28" : r < 0.4 ? "#8fa4ff" : "#ffd9a0";
        ctx.globalAlpha = 0.65 + rnd() * 0.35;
      } else {
        ctx.fillStyle = "#151a3f";
        ctx.globalAlpha = 1;
      }
      ctx.fillRect(px, py, pw, ph);
    }
  }
  ctx.globalAlpha = 1;
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 4;
  return tex;
}

/** The CRM pipeline as drawn pixels: used as the emissive laptop screen. */
export function makeCrmScreenTexture() {
  const w = 1024;
  const h = 640;
  const c = document.createElement("canvas");
  c.width = w * 2;
  c.height = h * 2;
  const ctx = c.getContext("2d")!;
  ctx.scale(2, 2);
  const navy = "#111435";
  const deep = "#0b0d24";
  const lime = "#c1ff28";
  const blue = "#3449ff";
  const ink = "#f2f3ff";
  const muted = "#a2a6c8";

  ctx.fillStyle = navy;
  ctx.fillRect(0, 0, w, h);

  // top bar
  ctx.fillStyle = deep;
  ctx.fillRect(0, 0, w, 44);
  ctx.fillStyle = muted;
  ctx.font = "500 14px ui-monospace, Menlo, monospace";
  ctx.fillText("app.tuempresa.com / pipeline", 24, 28);

  // sidebar
  ctx.fillStyle = "#0e1130";
  ctx.fillRect(0, 44, 200, h - 44);
  const nav = ["Pipeline", "Cuentas", "Visitas de hoy", "Mapa de zonas", "Informes", "Automatizaciones"];
  nav.forEach((label, i) => {
    const y = 84 + i * 40;
    if (i === 0) {
      ctx.fillStyle = "rgba(52,73,255,.35)";
      roundRect(ctx, 14, y - 22, 172, 34, 8);
      ctx.fill();
    }
    ctx.fillStyle = i === 0 ? ink : muted;
    ctx.font = `${i === 0 ? 600 : 500} 15px system-ui, sans-serif`;
    ctx.fillText(label, 28, y);
  });

  // title
  ctx.fillStyle = ink;
  ctx.font = "500 26px system-ui, sans-serif";
  ctx.fillText("Pipeline · Zona Norte", 228, 92);
  ctx.fillStyle = lime;
  roundRect(ctx, 880, 66, 116, 32, 16);
  ctx.fill();
  ctx.fillStyle = deep;
  ctx.font = "600 13px system-ui, sans-serif";
  ctx.fillText("+ Nueva oportunidad", 892, 87);

  // columns
  const cols = [
    { t: "CONTACTO", n: 4, cards: [["Talleres Mendoza", "Llamada mañana 10:00"], ["Panadería Souto", "Visita a puerta · hoy"], ["Clínica Ría", "Formulario web"]] },
    { t: "VISITA HECHA", n: 3, cards: [["Hostal Marola", "Pide 2ª visita técnica"], ["Frutas Lago", "Decide el jueves"]] },
    { t: "PRESUPUESTO", n: 5, hot: true, cards: [["Grupo Vilar", "Recordatorio automático"], ["Ferretería Ares", "Negociando plazo"], ["Óptica Coruña", "Pendiente firma"]] },
    { t: "FIRMADO", n: 2, cards: [["Autos Bergantiños", "Alta en facturación ✓"], ["Náutica Sada", "Instalación programada"]] },
  ];
  const cx0 = 228;
  const cwid = 186;
  const gap = 14;
  cols.forEach((col, i) => {
    const x = cx0 + i * (cwid + gap);
    ctx.strokeStyle = col.hot ? "rgba(193,255,40,.5)" : "rgba(255,255,255,.12)";
    ctx.fillStyle = "rgba(255,255,255,.03)";
    roundRect(ctx, x, 120, cwid, 420, 14);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = col.hot ? lime : muted;
    ctx.font = "500 11px ui-monospace, Menlo, monospace";
    ctx.fillText(col.t, x + 14, 146);
    ctx.textAlign = "right";
    ctx.fillStyle = ink;
    ctx.fillText(String(col.n), x + cwid - 14, 146);
    ctx.textAlign = "left";
    col.cards.forEach((card, j) => {
      const y = 166 + j * 78;
      ctx.fillStyle = i === 3 ? "rgba(52,73,255,.35)" : "#1d2252";
      roundRect(ctx, x + 10, y, cwid - 20, 66, 10);
      ctx.fill();
      ctx.fillStyle = ink;
      ctx.font = "600 13px system-ui, sans-serif";
      ctx.fillText(card[0], x + 22, y + 24);
      ctx.fillStyle = muted;
      ctx.font = "400 11px system-ui, sans-serif";
      ctx.fillText(card[1], x + 22, y + 44);
      if (col.hot && j === 0) {
        ctx.fillStyle = "rgba(193,255,40,.18)";
        roundRect(ctx, x + 22, y + 50, 96, 12, 6);
        ctx.fill();
      }
    });
  });

  // KPI strip
  const kpis = [["Visitas esta semana", "38"], ["Presupuestos abiertos", "12"], ["Tiempo medio de respuesta", "14 min"]];
  kpis.forEach((k, i) => {
    const x = 228 + i * 262;
    ctx.fillStyle = "#1d2252";
    roundRect(ctx, x, 556, 248, 68, 12);
    ctx.fill();
    ctx.fillStyle = muted;
    ctx.font = "400 11px system-ui, sans-serif";
    ctx.fillText(k[0], x + 16, 580);
    ctx.fillStyle = i === 2 ? lime : ink;
    ctx.font = "500 24px system-ui, sans-serif";
    ctx.fillText(k[1], x + 16, 610);
  });

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Blue → lime aurora used behind the hero (fragment shader). */
export const auroraFragment = /* glsl */ `
  uniform float uTime;
  uniform vec2 uRes;
  uniform vec2 uMouse;
  varying vec2 vUv;

  vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
  vec2 mod289(vec2 x){return x-floor(x*(1.0/289.0))*289.0;}
  vec3 permute(vec3 x){return mod289(((x*34.0)+1.0)*x);}
  float snoise(vec2 v){
    const vec4 C=vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);
    vec2 i=floor(v+dot(v,C.yy));vec2 x0=v-i+dot(i,C.xx);
    vec2 i1=(x0.x>x0.y)?vec2(1.0,0.0):vec2(0.0,1.0);
    vec4 x12=x0.xyxy+C.xxzz;x12.xy-=i1;i=mod289(i);
    vec3 p=permute(permute(i.y+vec3(0.0,i1.y,1.0))+i.x+vec3(0.0,i1.x,1.0));
    vec3 m=max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.0);m=m*m;m=m*m;
    vec3 x=2.0*fract(p*C.www)-1.0;vec3 h=abs(x)-0.5;vec3 ox=floor(x+0.5);vec3 a0=x-ox;
    m*=1.79284291400159-0.85373472095314*(a0*a0+h*h);
    vec3 g;g.x=a0.x*x0.x+h.x*x0.y;g.yz=a0.yz*x12.xz+h.yz*x12.yw;return 130.0*dot(m,g);
  }
  float fbm(vec2 p){float v=0.0;float a=0.5;for(int i=0;i<5;i++){v+=a*snoise(p);p=p*2.05+vec2(1.7,9.2);a*=0.5;}return v;}

  void main(){
    vec2 uv=vUv;
    vec2 p=uv*vec2(uRes.x/uRes.y,1.0);
    float t=uTime*0.06;
    vec2 m=(uMouse-0.5)*0.35;
    float n1=fbm(p*1.6+vec2(t,-t*0.7)+m);
    float n2=fbm(p*3.2-vec2(t*0.8,t*0.4)+n1*0.8);
    float ribbon=smoothstep(0.15,0.85,n1*0.5+0.5);
    float veins=smoothstep(0.55,0.95,n2*0.5+0.5);
    vec3 navy=vec3(0.066,0.078,0.208);
    vec3 blue=vec3(0.204,0.286,1.0);
    vec3 lime=vec3(0.757,1.0,0.157);
    vec3 col=navy;
    col=mix(col,blue*0.9,ribbon*0.55*(1.0-uv.y*0.6));
    col+=lime*veins*0.35*smoothstep(0.2,0.9,uv.x);
    float vig=smoothstep(1.3,0.3,length((uv-0.5)*vec2(1.4,1.0)));
    col*=0.55+0.45*vig;
    float grain=fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453)*0.05;
    gl_FragColor=vec4(col+grain,1.0);
  }
`;

export const basicVertex = /* glsl */ `
  varying vec2 vUv;
  void main(){ vUv=uv; gl_Position=vec4(position.xy,0.0,1.0); }
`;

import { useRef, useEffect } from 'react';

/* ── Vertex shader (full-screen quad) ─────────────────────────── */
const VERT = `
  attribute vec2 pos;
  void main() { gl_Position = vec4(pos, 0.0, 1.0); }
`;

/* ── Fragment shader — FBM aurora ─────────────────────────────── */
const FRAG = `
  precision highp float;
  uniform float uT;
  uniform vec2  uR;

  /* ---- value noise ------------------------------------------- */
  float hash(vec2 p) {
    p = fract(p * vec2(127.1, 311.7));
    p += dot(p, p + 43.21);
    return fract(p.x * p.y);
  }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1,0)), f.x),
      mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x),
      f.y
    );
  }

  /* ---- fractal brownian motion ------------------------------- */
  float fbm(vec2 p) {
    float v = 0.0, a = 0.52;
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
    for (int i = 0; i < 6; i++) {
      v += a * noise(p);
      p  = rot * p * 2.03;
      a *= 0.49;
    }
    return v;
  }

  /* ---- Hero palette: #07080d → #0f1e3a → #c4855a ------------ */
  vec3 auroraColor(float t) {
    t = clamp(t, 0.0, 1.0);
    vec3 c0 = vec3(0.027, 0.031, 0.051); /* #07080d near-black  */
    vec3 c1 = vec3(0.059, 0.118, 0.227); /* #0f1e3a deep navy   */
    vec3 c2 = vec3(0.10,  0.22,  0.42);  /* brighter navy       */
    vec3 c3 = vec3(0.36,  0.28,  0.20);  /* warm crossover      */
    vec3 c4 = vec3(0.62,  0.40,  0.22);  /* amber build-up      */
    vec3 c5 = vec3(0.769, 0.522, 0.353); /* #c4855a warm amber  */

    if (t < 0.2) return mix(c0, c1, t * 5.0);
    if (t < 0.4) return mix(c1, c2, (t - 0.2) * 5.0);
    if (t < 0.6) return mix(c2, c3, (t - 0.4) * 5.0);
    if (t < 0.8) return mix(c3, c4, (t - 0.6) * 5.0);
                 return mix(c4, c5, (t - 0.8) * 5.0);
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / uR;
    /* aspect-correct, slight horizontal stretch for aurora ribbon feel */
    uv.x *= (uR.x / uR.y) * 0.85;

    float t = uT * 0.06;

    /* single warp layer — keeps aurora ribbon look (not liquid) */
    vec2 q = vec2(
      fbm(uv + vec2(0.0, 0.0) + t * 0.28),
      fbm(uv + vec2(4.1, 1.7) + t * 0.22)
    );

    /* final sample — light warp multiplier avoids swirling */
    float f = fbm(uv + 2.2 * q + t * 0.18);

    /* gentle power remap — mid-tones push navy/amber band */
    f = pow(f, 0.78);

    vec3 col = auroraColor(f);

    /* amber bloom in lower-left — matches hero Grainient accent */
    float warm = smoothstep(0.60, 0.0, length(uv - vec2(0.0, 0.1))) * 0.40;
    col = mix(col, vec3(0.769, 0.522, 0.353), warm * fbm(uv * 1.5 + t * 0.4));

    /* soft vignette */
    vec2 vc = gl_FragCoord.xy / uR - 0.5;
    col *= 1.0 - dot(vc, vc) * 1.5;
    col  = max(col, vec3(0.0));

    /* gamma */
    col = pow(col, vec3(0.84));

    gl_FragColor = vec4(col, 1.0);
  }
`;

function compileShader(gl: WebGLRenderingContext, type: number, src: string): WebGLShader {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  return s;
}

export default function VaporTrailBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', { antialias: false, depth: false });
    if (!gl) return;

    const vert = compileShader(gl, gl.VERTEX_SHADER,   VERT);
    const frag = compileShader(gl, gl.FRAGMENT_SHADER, FRAG);
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vert);
    gl.attachShader(prog, frag);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    /* full-screen quad */
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER,
      new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]),
      gl.STATIC_DRAW);
    const posLoc = gl.getAttribLocation(prog, 'pos');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const uT = gl.getUniformLocation(prog, 'uT');
    const uR = gl.getUniformLocation(prog, 'uR');

    let raf = 0;
    const t0 = performance.now();

    const resize = () => {
      /* render at half-res for perf, CSS scales it up */
      canvas.width  = Math.floor(canvas.offsetWidth  * 0.6);
      canvas.height = Math.floor(canvas.offsetHeight * 0.6);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const frame = () => {
      raf = requestAnimationFrame(frame);
      gl.uniform1f(uT, (performance.now() - t0) / 1000);
      gl.uniform2f(uR, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };
    frame();

    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        display: 'block',
        borderRadius: 'inherit',
        imageRendering: 'auto',
      }}
    />
  );
}

const vertexSource = `
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const fragmentSource = `
precision mediump float;
uniform sampler2D u_image;
uniform float u_progress;
uniform float u_aspect;
varying vec2 v_uv;

void main() {
  vec2 centered = v_uv - 0.5;
  vec2 scaled = vec2(centered.x * u_aspect, centered.y);
  float cornerDistance = length(vec2(0.5 * u_aspect, 0.5));
  float radial = length(scaled) / cornerDistance;
  float opening = smoothstep(0.0, 1.0, u_progress);

  float bulge = (1.0 - opening) * 1.15;
  float distorted = pow(max(radial, 0.0001), 1.0 + bulge);
  vec2 source = centered * (distorted / max(radial, 0.0001)) + 0.5;
  vec4 color = texture2D(u_image, source);

  float aperture = mix(0.4, 1.02, opening);
  float softness = 0.006;
  float inside = 1.0 - smoothstep(aperture - softness, aperture, radial);
  float falloff = mix(1.0, 1.0 - smoothstep(aperture * 0.45, aperture, radial) * 0.45, 1.0 - opening);

  gl_FragColor = vec4(color.rgb * falloff, 1.0) * inside;
}
`;

export type Lens = {
  draw: (progress: number) => void;
  destroy: () => void;
};

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export function canFocus(image: HTMLImageElement | null | undefined): image is HTMLImageElement {
  return Boolean(image && image.complete && image.naturalWidth > 0);
}

export function createLens(canvas: HTMLCanvasElement, image: HTMLImageElement): Lens | null {
  const gl = canvas.getContext("webgl", { premultipliedAlpha: true, antialias: true });
  if (!gl) return null;

  const vertex = compile(gl, gl.VERTEX_SHADER, vertexSource);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);
  const program = gl.createProgram();
  if (!vertex || !fragment || !program) return null;

  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  gl.useProgram(program);

  const quad = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, "a_position");
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  try {
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  } catch {
    return null;
  }

  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const bounds = canvas.getBoundingClientRect();
  canvas.width = Math.max(1, Math.round(bounds.width * ratio));
  canvas.height = Math.max(1, Math.round(bounds.height * ratio));
  gl.viewport(0, 0, canvas.width, canvas.height);

  const progressLocation = gl.getUniformLocation(program, "u_progress");
  gl.uniform1f(gl.getUniformLocation(program, "u_aspect"), bounds.width / Math.max(bounds.height, 1));

  return {
    draw(progress) {
      gl.uniform1f(progressLocation, progress);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    },
    destroy() {
      gl.deleteTexture(texture);
      gl.deleteBuffer(quad);
      gl.deleteProgram(program);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
}

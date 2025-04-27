import { useEffect, useRef } from "react";

const Background: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl");
    if (!gl) {
      console.error("WebGL not supported");
      return;
    }

    // Set canvas size to window size
    const resizeCanvas = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    // Vertex shader
    const vertexShaderSource = `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    // Fragment shader - create a nice abstract background fitting for a card game
    const fragmentShaderSource = `
      precision mediump float;
      uniform float time;
      uniform vec2 resolution;

      // Noise function
      float hash(float n) {
        return fract(sin(n) * 43758.5453);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        float n = i.x + i.y * 57.0;
        return mix(
          mix(hash(n), hash(n + 1.0), f.x),
          mix(hash(n + 57.0), hash(n + 58.0), f.x),
          f.y
        );
      }

      // Simplex-like noise
      float fbm(vec2 p) {
        float f = 0.0;
        f += 0.5000 * noise(p); p *= 2.02;
        f += 0.2500 * noise(p); p *= 2.03;
        f += 0.1250 * noise(p); p *= 2.01;
        f += 0.0625 * noise(p);
        return f / 0.9375;
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / resolution.xy;
        
        // Subtle movement
        vec2 p = uv;
        p.x += time * 0.02;
        p.y += time * 0.01;
        
        // Balatro-like colors - dark purplish blue to green/teal
        vec3 baseColor1 = vec3(0.1, 0.12, 0.25); 
        vec3 baseColor2 = vec3(0.15, 0.3, 0.4);
        
        // Generate noise pattern
        float noise1 = fbm(p * 3.0);
        float noise2 = fbm(p * 6.0 + vec2(time * 0.01, time * 0.015));
        
        // Combine noises for interesting patterns
        float combinedNoise = noise1 * 0.7 + noise2 * 0.3;
        
        // Create gradient with the noise
        vec3 color = mix(baseColor1, baseColor2, combinedNoise);
        
        // Add some variations
        color += vec3(0.05, 0.1, 0.2) * fbm(p * 10.0 + time * 0.05);
        
        // Vignette effect
        float vignette = 1.0 - length(uv - 0.5) * 0.7;
        color *= vignette;
        
        gl_FragColor = vec4(color, 1.0);
      }
    `;

    // Create shaders
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    if (!vertexShader) return;
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    if (!fragmentShader) return;
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);

    // Create program
    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    // Vertices for a fullscreen quad
    const vertices = new Float32Array([
      -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0,
    ]);

    // Create buffer
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    // Set up position attribute
    const position = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    // Uniforms
    const timeUniform = gl.getUniformLocation(program, "time");
    const resolutionUniform = gl.getUniformLocation(program, "resolution");

    // Animation
    let animationFrameId: number | null = null;
    const startTime = Date.now();

    const render = () => {
      if (!canvas) return;

      const currentTime = (Date.now() - startTime) / 1000;
      if (timeUniform) gl.uniform1f(timeUniform, currentTime);
      if (resolutionUniform)
        gl.uniform2f(resolutionUniform, canvas.width, canvas.height);

      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // Cleanup
    return () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
      window.removeEventListener("resize", resizeCanvas);
      if (program) gl.deleteProgram(program);
      if (vertexShader) gl.deleteShader(vertexShader);
      if (fragmentShader) gl.deleteShader(fragmentShader);
      if (buffer) gl.deleteBuffer(buffer);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full -z-10"
    />
  );
};

export default Background;

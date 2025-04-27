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

    // Fragment shader
    const fragmentShaderSource = `
      precision mediump float;
      #define SPIN_EASE 0.8
      #define spin_time 5.0
      #define spin_amount 0.3
      #define contrast 3.0
      #define PIXEL_SIZE 2.0  // Adjust this value to change pixelation amount

      #define colour_1 vec4(1.0, 0.3725490196, 0.3333333333, 1.0)
      #define colour_2 vec4(0.0, 0.6156862745, 1.0, 1.0)
      #define colour_3 vec4(0.2156862745, 0.2588235294, 0.2666666667, 1.0)

      uniform vec2 resolution;
      uniform float time;

      void main() {
        // Pixelation
        vec2 pixels = vec2(PIXEL_SIZE);
        vec2 uv = floor(gl_FragCoord.xy/pixels)*pixels;
        
        // Center UV coordinates - removed the offset that was causing the shift
        uv = (uv - 0.5*resolution.xy)/length(resolution.xy);

        float uv_len = length(uv);

        float speed = (spin_time*SPIN_EASE*0.2) + 302.2;
        float new_pixel_angle = (atan(uv.y, uv.x)) + speed - SPIN_EASE*20.0*(1.0*spin_amount*uv_len + (1.0 - 1.0*spin_amount));

        vec2 mid = vec2(0.5, 0.5);
        uv = (vec2((uv_len * cos(new_pixel_angle) + mid.x), (uv_len * sin(new_pixel_angle) + mid.y)) - mid);

        uv *= 30.0;
        speed = time*(2.0);
        vec2 uv2 = vec2(uv.x+uv.y);

        for(int i=0; i < 5; i++) {
          uv2 += sin(max(uv.x, uv.y)) + uv;
          uv  += 0.5*vec2(cos(5.1123314 + 0.353*uv2.y + speed*0.131121),sin(uv2.x - 0.113*speed));
          uv  -= 1.0*cos(uv.x + uv.y) - 1.0*sin(uv.x*0.711 - uv.y);
        }

        float contrast_mod = (0.25*contrast + 0.5*spin_amount + 1.2);
        float paint_res = min(2.0, max(0.0,length(uv)*(0.035)*contrast_mod));
        float c1p = max(0.0,1.0 - contrast_mod*abs(1.0-paint_res));
        float c2p = max(0.0,1.0 - contrast_mod*abs(paint_res));
        float c3p = 1.0 - min(1.0, c1p + c2p);

        gl_FragColor = (0.3/contrast)*colour_1 + (1.0 - 0.3/contrast)*(colour_1*c1p + colour_2*c2p + vec4(c3p*colour_3.rgb, c3p*colour_1.a));
      }
    `;

    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    if (!vertexShader) return;
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);

    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
      console.error(
        "Vertex shader compilation failed:",
        gl.getShaderInfoLog(vertexShader)
      );
      return;
    }

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    if (!fragmentShader) return;
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);

    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
      console.error(
        "Fragment shader compilation failed:",
        gl.getShaderInfoLog(fragmentShader)
      );
      return;
    }

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program linking failed:", gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

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
      style={{ display: "block" }}
    />
  );
};

export default Background;

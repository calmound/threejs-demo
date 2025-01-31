varying float vXPos;
uniform float uTime;

void main() {
  float t = (vXPos + 1.0) * 0.5 + sin(uTime) * 0.25;
    vec3 color = mix(vec3(0.0, 0.0, 1.0), vec3(1.0, 0.0, 0.0), t);
    gl_FragColor = vec4(color, 1.0);
}
varying float vXPos;
uniform float uTime;

  void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    vXPos = position.x;
  }
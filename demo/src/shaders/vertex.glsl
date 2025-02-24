varying vec2 vUv;
uniform float uTime;

void main(){
    vUv=uv;
    vec3 pos=position;
    pos.z+=sin(uv.x*10.+uTime)*.1;
    pos.z+=sin(uv.y*10.+uTime)*.1;
    gl_Position=projectionMatrix*modelViewMatrix*vec4(pos,1.);
}

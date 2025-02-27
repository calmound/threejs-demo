varying vec3 vNormal;

void main(){
  float intensity=pow(.7-dot(vNormal,vec3(0.,0.,.5)),4.);
  gl_FragColor=vec4(.89,.82,.69,1.)*intensity;// 使用蓝色调光晕
}

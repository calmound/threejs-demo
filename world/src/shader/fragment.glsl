varying float vIntensity;
varying vec2 vUv;

uniform sampler2D uNoiseTexture;
uniform vec3 uColor;
uniform float uTime;

void main(){
    vec4 noiseColor=texture2D(uNoiseTexture,vUv);
    
    gl_FragColor=vec4(noiseColor.rgb*vIntensity*uColor,1.);// Set the fragment color to red
}
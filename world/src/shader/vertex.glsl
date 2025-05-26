varying float vIntensity;
varying vec2 vUv;

void main(){
    vec4 worldPosition=modelMatrix*vec4(position,1.);
    vec3 normal=normalize(vec3(modelMatrix*vec4(normal,0.)));
    
    vec3 dirToCamera=normalize(cameraPosition-worldPosition.xyz);
    // vIntensity=10.-dot(normal,dirToCamera);
    vIntensity=1.8;
    
    gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);
    
    vUv=uv;
}
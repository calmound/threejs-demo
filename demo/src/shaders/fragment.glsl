struct vec5 {
    float x;
    float y;
    float z;
    float w;
    float v;
};

float sum(float a, float b) {
    return a + b;
}

void main() {
    // vec3 color
    float greenValue = 1.0;
    vec5 myVector = vec5(1.0, greenValue, 0.0, 1.0, 0.0);
    myVector.x = 0.0;
    
    vec4 color = vec4(1.0, 0.0, 0.0, 1.0);

    color
    
    gl_FragColor = vec4(1.0, sum(0.5, 0.5), 0.0, 1.0);
}
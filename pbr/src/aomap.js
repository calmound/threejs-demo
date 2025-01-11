const fs = require('fs');
const { createCanvas } = require('canvas');

// Create a canvas
const width = 256;
const height = 256;
const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');

// Create a radial gradient for AO effect
const gradient = ctx.createRadialGradient(
  width / 2, height / 2, 20, 
  width / 2, height / 2, width / 2
);
gradient.addColorStop(0, 'rgba(0,0,0,0.1)');
gradient.addColorStop(1, 'rgba(0,0,0,0.8)');

// Fill with gradient
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, width, height);

// Save the image
const buffer = canvas.toBuffer('image/jpeg');
fs.writeFileSync('/Users/sanmu/Documents/code/project/threejs-demo/pbr/src/aomap.jpg', buffer);

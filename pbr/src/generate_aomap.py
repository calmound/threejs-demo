from PIL import Image, ImageDraw, ImageFilter

# Create a new image with a white background
width, height = 256, 256
image = Image.new('RGB', (width, height), color='white')
draw = ImageDraw.Draw(image)

# Create a radial gradient for AO effect
for r in range(width//2, 0, -1):
    # Create a gradient from light to dark
    opacity = 1 - (r / (width//2))
    color = (int(255 * (1 - opacity)), int(255 * (1 - opacity)), int(255 * (1 - opacity)))
    draw.ellipse([width//2 - r, height//2 - r, width//2 + r, height//2 + r], 
                 fill=color)

# Apply a slight blur to soften the gradient
image = image.filter(ImageFilter.GaussianBlur(radius=10))

# Save the image
image.save('/Users/sanmu/Documents/code/project/threejs-demo/pbr/src/aomap.jpg', quality=95)

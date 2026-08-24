from PIL import Image
import sys

def remove_white_bg(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    data = img.getdata()
    new_data = []
    
    for item in data:
        r, g, b, a = item
        # If pixel is near-white, make it transparent
        if r > 230 and g > 230 and b > 230:
            new_data.append((255, 255, 255, 0))
        # Smooth the edges - semi-transparent for near-white pixels
        elif r > 200 and g > 200 and b > 200:
            alpha = int(255 * (1 - (min(r, g, b) - 200) / 55.0))
            new_data.append((r, g, b, alpha))
        else:
            new_data.append(item)
    
    img.putdata(new_data)
    img.save(output_path, "PNG")
    print(f"Saved transparent PNG: {output_path}")

remove_white_bg("public/images/survey_icon.jpg", "public/images/survey_icon_transparent.png")
remove_white_bg("public/images/coaching_icon.jpg", "public/images/coaching_icon_transparent.png")
print("Done!")

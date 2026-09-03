from PIL import Image
import sys

def remove_white_bg(img_path, out_path, tolerance=230):
    img = Image.open(img_path).convert("RGBA")
    data = img.getdata()
    
    new_data = []
    for item in data:
        # Check if pixel is close to white
        if item[0] > tolerance and item[1] > tolerance and item[2] > tolerance:
            new_data.append((255, 255, 255, 0)) # fully transparent
        else:
            new_data.append(item)
            
    img.putdata(new_data)
    img.save(out_path, "PNG")
    print("Saved transparent PNG.")

remove_white_bg("d:/EduConnect/frontend/src/assets/parent_illustration_isolated.jpg", "d:/EduConnect/frontend/src/assets/parent_illustration_transparent.png")
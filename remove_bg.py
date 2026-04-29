from PIL import Image

def make_transparent_and_crop(image_path, output_path):
    img = Image.open(image_path).convert("RGBA")
    datas = img.getdata()

    new_data = []
    # Replace white-ish background with transparent
    for item in datas:
        # Check if the pixel is close to white
        if item[0] > 240 and item[1] > 240 and item[2] > 240:
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append(item)

    img.putdata(new_data)
    
    # Get bounding box of non-transparent pixels to crop out the empty frame area
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)

    img.save(output_path, "PNG")

make_transparent_and_crop("/Users/ezawashion/laravel-app/frontend/public/favicon.png", "/Users/ezawashion/laravel-app/frontend/public/favicon_transparent.png")

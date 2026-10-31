import sys
from PIL import Image
import collections

img_path = r"C:\Users\piyus\.gemini\antigravity\brain\7719f31a-2c31-4a9c-b6bb-ba11ebcca1c2\.user_uploaded\media_1793377632997_54ee48a3.png"
img = Image.open(img_path).convert("RGB")
pixels = list(img.getdata())
# filter out almost black / transparent background if any, and pure white crown
filtered = [p for p in pixels if not (p[0] < 50 and p[1] < 50 and p[2] < 50) and not (p[0] > 230 and p[1] > 230 and p[2] > 230)]
counter = collections.Counter(filtered)
for color, count in counter.most_common(5):
    hex_color = f"#{color[0]:02x}{color[1]:02x}{color[2]:02x}"
    print(f"Color: {hex_color}, count: {count}, rgb: {color}")


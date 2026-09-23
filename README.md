# Image Converter & Compressor

Manifest V3 Chrome/Edge extension. All image processing happens locally in the browser.

## Features
- JPG/JPEG, PNG, WebP, GIF, BMP, SVG and other browser-readable inputs
- Convert to JPG, PNG, WebP, and AVIF when the browser supports AVIF encoding
- Quality control
- Max width/height resize
- Aspect-ratio preservation
- Batch processing
- Individual downloads
- Download all as a ZIP
- No network requests and no uploaded images

## Install in Microsoft Edge
1. Extract the ZIP.
2. Open `edge://extensions`.
3. Enable Developer mode.
4. Choose **Load unpacked**.
5. Select the extracted `image-converter-compressor` folder.
6. Click the extension icon. It opens the offline image tool in a new tab.

## Notes
AVIF encoding depends on browser support. If unavailable, the app automatically falls back to WebP.
The ZIP writer intentionally uses the ZIP "store" method so the extension has no third-party runtime dependency. Images themselves are already encoded/compressed by the selected image format.

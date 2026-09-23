# Image Converter & Compressor

 All image processing happens locally in the browser.

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



## Notes
AVIF encoding depends on browser support. If unavailable, the app automatically falls back to WebP.
The ZIP writer intentionally uses the ZIP "store" method so the extension has no third-party runtime dependency. Images themselves are already encoded/compressed by the selected image format.

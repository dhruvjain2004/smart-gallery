# Smart Image Gallery

## Overview

Smart Image Gallery is a web application that optimizes image viewing experiences based on users' network conditions. It addresses the real-world problem of image-heavy websites performing poorly on slow or unstable connections, which can lead to high data usage, slow page loads, and poor user experience.

## Problem Solved

This application solves several real-world problems:

1. **Data Usage Optimization**: Automatically adjusts image quality based on network conditions to reduce data consumption on slow connections.

2. **Performance Improvement**: Uses lazy loading to only load images when they're about to be viewed, improving page load times and reducing unnecessary data usage.

3. **Resource Management**: Schedules non-critical tasks during browser idle time to ensure smooth scrolling and UI responsiveness.

4. **Image Enhancement**: Provides real-time image processing capabilities to improve visibility of images that may be difficult to see under certain conditions.

## Web APIs Used

### 1. Network Information API

The application uses the Network Information API to detect the user's connection type and speed. This information is used to:

- Automatically adjust image quality (high, medium, low) based on connection speed
- Display connection information to the user
- Adapt loading strategies when connection changes

### 2. Intersection Observer API

The Intersection Observer API is used to implement efficient lazy loading of images:

- Images are only loaded when they enter (or are about to enter) the viewport
- Reduces initial page load time and saves data by not loading off-screen images
- Improves scrolling performance by distributing the loading of resources

### 3. Background Tasks API

The Background Tasks API (via `requestIdleCallback`) is used to schedule non-critical tasks during browser idle time:

- Image processing is scheduled during idle periods
- Prevents UI jank by ensuring heavy tasks don't block the main thread
- Improves overall responsiveness of the application

### 4. Canvas API

The Canvas API is used for image processing and manipulation:

- Renders images with adjustable effects (brightness, contrast, saturation, blur)
- Allows for real-time image adjustments without reloading
- Provides a platform for applying custom filters and effects to images

## Features

- **Adaptive Image Loading**: Automatically adjusts image quality based on network conditions
- **Connection Status Display**: Shows current connection type and speed
- **Lazy Loading**: Only loads images when they're about to be viewed
- **Image Effects**: Apply real-time adjustments to images using sliders
- **Responsive Design**: Works on various screen sizes and devices

## How to Use

1. Open the `index.html` file in a modern web browser
2. The application will automatically detect your connection type and speed
3. Scroll down to see images load as they enter the viewport
4. Click "Show Image Effects" to access image adjustment controls
5. Use the sliders to adjust brightness, contrast, saturation, and blur
6. Click "Reload All Images" to refresh the gallery

## Technical Implementation

- **Connection Detection**: Uses the Network Information API to monitor connection changes
- **Lazy Loading**: Implements Intersection Observer to detect when images enter the viewport
- **Background Processing**: Uses requestIdleCallback to schedule image processing during idle periods
- **Canvas Rendering**: Processes and displays images using the Canvas API

## Browser Compatibility

- The application works best in modern browsers that support all the APIs used
- Fallbacks are provided for browsers that don't support certain APIs
- Network Information API has limited support in some browsers

## Future Enhancements

- Add support for user-uploaded images
- Implement more advanced image filters and effects
- Add image caching for offline viewing
- Implement progressive image loading
- Add support for video content with adaptive quality

## Deployment to Vercel

### Important Deployment Notes

To ensure proper deployment on Vercel, follow these steps carefully:

1. **Build Process**: The project includes a custom `build.js` script that prepares files for Vercel deployment by copying all necessary files to the `public` directory.

2. **Vercel Configuration**: The `vercel.json` file is configured to serve static files from the `public` directory:
   ```json
   {
     "version": 2,
     "public": true,
     "outputDirectory": "public",
     "routes": [
       { "handle": "filesystem" },
       { "src": "/(.*)", "dest": "/index.html" }
     ]
   }
   ```

3. **Local Images**: The application uses local images as fallbacks when remote images fail to load. These are stored in the `images` directory and are copied to `public/images` during the build process.

### Deployment Steps

1. Install Vercel CLI (if not already installed):
   ```
   npm install -g vercel
   ```

2. Login to Vercel:
   ```
   vercel login
   ```

3. Run Build Script (important step!):
   ```
   npm run build
   ```
   This creates the `public` directory with all necessary files.

4. Deploy from the project directory:
   ```
   vercel
   ```

5. To deploy to production:
   ```
   vercel --prod
   ```

Alternatively, you can deploy directly from the Vercel dashboard:

1. Go to [vercel.com](https://vercel.com)
2. Create a new project
3. Import your repository or upload the files
4. Make sure to set the following in Project Settings:
   - Build Command: `npm run build`
   - Output Directory: `public`
   - Framework Preset: "Other" or "Static Site"

### Troubleshooting Deployment Issues

If you encounter issues with your Vercel deployment:

1. **Check Build Logs**: Verify that the build process completed successfully and all files were copied to the `public` directory.

2. **Verify File Structure**: Ensure that your project has the correct file structure:
   ```
   project/
   ├── app.js
   ├── build.js
   ├── images/
   │   └── placeholder.svg
   ├── index.html
   ├── package.json
   ├── public/  (created during build)
   │   ├── app.js
   │   ├── images/
   │   │   └── placeholder.svg
   │   └── index.html
   └── vercel.json
   ```

3. **Check Vercel Settings**: In your Vercel project settings, ensure that:
   - The build command is set to `npm run build`
   - The output directory is set to `public`
   - The framework preset is set to "Other" or "Static Site"

4. **Redeploy**: If you've made changes to fix issues, run `vercel --prod` to redeploy your application.
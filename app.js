// Global variables for application state
let connectionType = 'unknown';
let effectiveConnectionType = 'unknown';
let imageQuality = 'high'; // high, medium, low
let imageLoadingStrategy = 'eager'; // eager, lazy
let effectSettings = {
    brightness: 0,
    contrast: 0,
    saturation: 0,
    blur: 0
};

// Image sources for the gallery - using reliable placeholder images
const imageSources = [
    'https://picsum.photos/800/600?random=1',
    'https://picsum.photos/800/600?random=2',
    'https://picsum.photos/800/600?random=3',
    'https://picsum.photos/800/600?random=4',
    'https://picsum.photos/800/600?random=5',
    'https://picsum.photos/800/600?random=6',
    'https://picsum.photos/800/600?random=7',
    'https://picsum.photos/800/600?random=8',
    'https://picsum.photos/800/600?random=9',
    'https://picsum.photos/800/600?random=10',
    'https://picsum.photos/800/600?random=11',
    'https://picsum.photos/800/600?random=12',
];


// DOM elements
const connectionTypeElement = document.getElementById('connectionType');
const connectionSpeedElement = document.getElementById('connectionSpeed');
const imageGalleryElement = document.getElementById('imageGallery');
const toggleEffectsButton = document.getElementById('toggleEffects');
const effectsPanelElement = document.getElementById('effectsPanel');
const reloadImagesButton = document.getElementById('reloadImages');

// Effect sliders
const brightnessSlider = document.getElementById('brightnessSlider');
const contrastSlider = document.getElementById('contrastSlider');
const saturationSlider = document.getElementById('saturationSlider');
const blurSlider = document.getElementById('blurSlider');

/**
 * Initialize the application
 */
function initApp() {
    // Check network information
    checkNetworkInformation();
    
    // Create image gallery
    createImageGallery();
    
    // Set up event listeners
    setupEventListeners();
    
    // Set up intersection observer for lazy loading
    setupIntersectionObserver();
}

/**
 * Check network information using Network Information API
 */
function checkNetworkInformation() {
    // Show loading state while checking
    connectionTypeElement.textContent = 'Checking...';
    connectionSpeedElement.textContent = 'Checking...';
    connectionSpeedElement.className = 'connection-speed speed-medium';
    
    // Update status message
    const statusMessage = document.getElementById('statusMessage');
    if (statusMessage) {
        statusMessage.textContent = 'Checking connection...';
    }
    
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    if (connection) {
        // Network Information API is supported
        console.log('Network Information API is supported');
        connectionType = connection.type || 'unknown';
        effectiveConnectionType = connection.effectiveType || 'unknown';
        
        // Update UI with connection information
        updateConnectionInfo(connectionType, effectiveConnectionType);
        
        // Determine image quality based on connection
        determineImageQuality(effectiveConnectionType);
        
        // Listen for connection changes
        connection.addEventListener('change', () => {
            connectionType = connection.type || 'unknown';
            effectiveConnectionType = connection.effectiveType || 'unknown';
            
            // Update UI with new connection information
            updateConnectionInfo(connectionType, effectiveConnectionType);
            
            // Determine new image quality based on connection
            determineImageQuality(effectiveConnectionType);
        });
    } else {
        // Network Information API not supported - use our fallback method
        console.log('Network Information API not supported, using fallback detection');
        
        // Attempt to estimate connection speed using resource timing
        estimateConnectionSpeed()
            .then(speed => {
                // Set a fallback connection type
                connectionType = 'estimated';
                
                // Map the estimated speed to an effective connection type
                if (speed < 1) {
                    effectiveConnectionType = '2g';
                } else if (speed < 5) {
                    effectiveConnectionType = '3g';
                } else {
                    effectiveConnectionType = '4g';
                }
                
                console.log('Estimated connection type:', effectiveConnectionType);
                
                // Update UI with estimated connection information
                updateConnectionInfo(connectionType, effectiveConnectionType);
                
                // Determine image quality based on estimated connection
                determineImageQuality(effectiveConnectionType);
            })
            .catch(error => {
                console.error('Error estimating connection speed:', error);
                
                // Even if estimation fails, show a user-friendly message
                connectionType = 'estimated';
                effectiveConnectionType = '3g'; // Default to 3g
                
                connectionTypeElement.textContent = 'Estimated';
                connectionSpeedElement.textContent = '3g (default)';
                connectionSpeedElement.className = 'connection-speed speed-medium';
                
                // Default to medium quality
                imageQuality = 'medium';
                imageLoadingStrategy = 'lazy';
                
                if (statusMessage) {
                    statusMessage.textContent = 'Using default image quality';
                }
            });
    }
}

/**
 * Estimate connection speed by loading a small image and measuring time
 * This is a fallback when Network Information API is not available
 */
function estimateConnectionSpeed() {
    return new Promise((resolve, reject) => {
        const startTime = performance.now();
        const img = new Image();
        
        img.onload = function() {
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            // Calculate speed in Mbps (very rough estimate)
            // Assuming the test image is about 50KB
            const fileSizeInBits = 50 * 1024 * 8;
            const speedInMbps = fileSizeInBits / duration / 1000;
            
            console.log('Estimated connection speed:', speedInMbps, 'Mbps');
            resolve(speedInMbps);
        };
        
        img.onerror = function() {
            console.error('Failed to load test image for speed estimation');
            // Even if the test image fails, return a default speed estimate
            // to prevent the API from showing as not supported
            resolve(2); // Default to medium speed (3g)
        };
        
        // Try multiple reliable sources for the test image
        try {
            // Use a small test image with cache busting
            img.src = `https://via.placeholder.com/100x100?text=test&cachebust=${Date.now()}`;
            
            // Set a timeout to handle cases where the image might hang
            setTimeout(() => {
                if (!img.complete) {
                    console.log('Image load timeout, using default speed');
                    resolve(2); // Default to medium speed (3g)
                }
            }, 3000);
        } catch (error) {
            console.error('Error setting image source:', error);
            resolve(2); // Default to medium speed (3g)
        }
    });
}

/**
 * Update the connection information in the UI
 * @param {string} type - The connection type
 * @param {string} effectiveType - The effective connection type
 */
function updateConnectionInfo(type, effectiveType) {
    // Clear any existing content
    connectionTypeElement.innerHTML = '';
    
    // Format the connection type display
    let displayText = '';
    if (type === 'unknown') {
        displayText = effectiveType;
    } else if (type === 'estimated') {
        displayText = 'Connection';
        
        // Add estimated badge
        const badge = document.createElement('span');
        badge.className = 'estimated-badge';
        badge.textContent = 'Estimated';
        connectionTypeElement.appendChild(document.createTextNode(displayText));
        connectionTypeElement.appendChild(badge);
        
        // Return early since we've already set the content
        connectionSpeedElement.textContent = effectiveType;
    } else {
        displayText = type.charAt(0).toUpperCase() + type.slice(1);
        connectionTypeElement.textContent = displayText;
    }
    
    // Format the connection speed display (if not already set)
    if (type !== 'estimated') {
        connectionSpeedElement.textContent = effectiveType;
    }
    
    // Update speed indicator class
    connectionSpeedElement.className = 'connection-speed';
    switch (effectiveType) {
        case 'slow-2g':
        case '2g':
            connectionSpeedElement.classList.add('speed-slow');
            break;
        case '3g':
            connectionSpeedElement.classList.add('speed-medium');
            break;
        case '4g':
            connectionSpeedElement.classList.add('speed-fast');
            break;
        default:
            connectionSpeedElement.classList.add('speed-medium');
    }
    
    // Update the status message
    const statusMessage = document.getElementById('statusMessage');
    if (statusMessage) {
        if (type === 'estimated') {
            statusMessage.textContent = `Images optimized based on estimated connection (${effectiveType})`;
            statusMessage.style.fontStyle = 'italic';
        } else {
            statusMessage.textContent = 'Images optimized for your connection';
            statusMessage.style.fontStyle = 'normal';
        }
    }
}

/**
 * Determine image quality based on connection type
 */
function determineImageQuality(effectiveType) {
    switch (effectiveType) {
        case 'slow-2g':
        case '2g':
            imageQuality = 'low';
            imageLoadingStrategy = 'lazy';
            break;
        case '3g':
            imageQuality = 'medium';
            imageLoadingStrategy = 'lazy';
            break;
        case '4g':
            imageQuality = 'high';
            imageLoadingStrategy = 'eager';
            break;
        default:
            imageQuality = 'medium';
            imageLoadingStrategy = 'lazy';
    }
    
    console.log(`Image quality set to: ${imageQuality}, Loading strategy: ${imageLoadingStrategy}`);
}

/**
 * Create the image gallery with placeholders
 */
function createImageGallery() {
    imageGalleryElement.innerHTML = '';
    
    imageSources.forEach((src, index) => {
        const imageContainer = document.createElement('div');
        imageContainer.className = 'image-container';
        imageContainer.dataset.src = src;
        imageContainer.dataset.index = index;
        
        // Create placeholder with loading spinner
        const placeholder = document.createElement('div');
        placeholder.className = 'image-placeholder';
        
        // Add loading spinner
        const spinner = document.createElement('div');
        spinner.className = 'loading-spinner';
        placeholder.appendChild(spinner);
        
        // Add loading text
        const loadingText = document.createElement('div');
        loadingText.className = 'loading-text';
        loadingText.textContent = 'Loading...';
        placeholder.appendChild(loadingText);
        
        imageContainer.appendChild(placeholder);
        imageGalleryElement.appendChild(imageContainer);
    });
}

/**
 * Set up the Intersection Observer for lazy loading images
 */
function setupIntersectionObserver() {
    const options = {
        root: null, // viewport
        rootMargin: '0px',
        threshold: 0.1 // 10% of the item is visible
    };
    
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const imageContainer = entry.target;
                const src = imageContainer.dataset.src;
                const index = imageContainer.dataset.index;
                
                // Schedule image loading using Background Tasks API
                scheduleImageLoading(imageContainer, src, index);
                
                // Stop observing this element
                observer.unobserve(imageContainer);
            }
        });
    }, options);
    
    // Observe all image containers
    document.querySelectorAll('.image-container').forEach(container => {
        observer.observe(container);
    });
}

/**
 * Schedule image loading using Background Tasks API
 */
function scheduleImageLoading(container, src, index) {
    // If requestIdleCallback is supported, use it to schedule image loading
    if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
            loadAndProcessImage(container, src, index);
        }, { timeout: 2000 }); // 2 second timeout
    } else {
        // Fallback for browsers that don't support requestIdleCallback
        setTimeout(() => {
            loadAndProcessImage(container, src, index);
        }, 0);
    }
}

/**
 * Load and process an image using Canvas API
 */
function loadAndProcessImage(container, src, index) {
    // Create image element
    const img = new Image();
    
    // Create progress indicator
    const placeholder = container.querySelector('.image-placeholder');
    let progressBar = null;
    let progressText = null;
    
    if (placeholder) {
        // Clear placeholder content
        placeholder.innerHTML = '';
        
        // Create progress container
        const progressContainer = document.createElement('div');
        progressContainer.className = 'progress-container';
        
        // Create progress bar
        progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';
        progressContainer.appendChild(progressBar);
        
        // Create progress text
        progressText = document.createElement('div');
        progressText.className = 'progress-text';
        progressText.textContent = '0%';
        
        // Add elements to placeholder
        placeholder.appendChild(progressContainer);
        placeholder.appendChild(progressText);
    }
    
    // Modify source based on image quality
    let modifiedSrc = src;
    if (imageQuality === 'low') {
        // Extract the random parameter
        const randomParam = src.split('random=')[1];
        modifiedSrc = `https://picsum.photos/400/300?random=${randomParam}`;
    } else if (imageQuality === 'medium') {
        // Extract the random parameter
        const randomParam = src.split('random=')[1];
        modifiedSrc = `https://picsum.photos/600/450?random=${randomParam}`;
    }
    
    // Track loading progress if browser supports it
    if (window.fetch && placeholder) {
        fetch(modifiedSrc)
            .then(response => {
                const contentLength = response.headers.get('content-length');
                if (!contentLength) {
                    throw new Error('Content length not available');
                }
                
                const total = parseInt(contentLength, 10);
                let loaded = 0;
                
                // Create reader and read the response
                const reader = response.body.getReader();
                
                return new ReadableStream({
                    start(controller) {
                        function read() {
                            reader.read().then(({ done, value }) => {
                                if (done) {
                                    controller.close();
                                    return;
                                }
                                
                                loaded += value.byteLength;
                                const progress = Math.round((loaded / total) * 100);
                                
                                // Update progress bar and text
                                if (progressBar && progressText) {
                                    progressBar.style.width = `${progress}%`;
                                    progressText.textContent = `${progress}%`;
                                }
                                
                                controller.enqueue(value);
                                read();
                            }).catch(error => {
                                console.error('Error during fetch:', error);
                                controller.error(error);
                            });
                        }
                        read();
                    }
                });
            })
            .catch(error => {
                console.error('Fetch error:', error);
                // Fall back to regular image loading
                if (progressText) {
                    progressText.textContent = 'Loading...';
                }
            });
    }
    
    img.onload = function() {
        // Remove placeholder
        const placeholder = container.querySelector('.image-placeholder');
        if (placeholder) {
            container.removeChild(placeholder);
        }
        
        // Create canvas for image processing
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas dimensions
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw image on canvas
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Apply effects if any are active
        applyCanvasEffects(ctx, canvas.width, canvas.height);
        
        // Add canvas to container
        container.appendChild(canvas);
    };
    
    img.onerror = function() {
        // Handle error
        console.error(`Failed to load image: ${modifiedSrc}`);
        
        // Try with a static fallback image
        const fallbackImg = new Image();
        fallbackImg.onload = function() {
            // Remove placeholder
            const placeholder = container.querySelector('.image-placeholder');
            if (placeholder) {
                container.removeChild(placeholder);
            }
            
            // Create canvas for image processing
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Set canvas dimensions
            canvas.width = fallbackImg.width;
            canvas.height = fallbackImg.height;
            
            // Draw image on canvas
            ctx.drawImage(fallbackImg, 0, 0, canvas.width, canvas.height);
            
            // Apply effects if any are active
            applyCanvasEffects(ctx, canvas.width, canvas.height);
            
            // Add canvas to container
            container.appendChild(canvas);
        };
        
        fallbackImg.onerror = function() {
            // If even fallback fails, show error message with retry button
            const placeholder = container.querySelector('.image-placeholder');
            if (placeholder) {
                placeholder.innerHTML = '';
                
                const errorMsg = document.createElement('div');
                errorMsg.className = 'error-message';
                errorMsg.textContent = 'Failed to load image';
                placeholder.appendChild(errorMsg);
                
                const retryButton = document.createElement('button');
                retryButton.className = 'retry-button';
                retryButton.textContent = 'Retry';
                retryButton.addEventListener('click', function() {
                    // Replace error with loading indicator
                    placeholder.innerHTML = '';
                    
                    // Add loading spinner
                    const spinner = document.createElement('div');
                    spinner.className = 'loading-spinner';
                    placeholder.appendChild(spinner);
                    
                    // Add loading text
                    const loadingText = document.createElement('div');
                    loadingText.className = 'loading-text';
                    loadingText.textContent = 'Loading...';
                    placeholder.appendChild(loadingText);
                    
                    // Try loading the image again
                    setTimeout(() => {
                        loadImage(container, src, index);
                    }, 500);
                });
                placeholder.appendChild(retryButton);
            }
        };
        
        // Use a local placeholder or a very reliable CDN
        fallbackImg.src = `https://via.placeholder.com/800x600?text=Image+${index+1}`;
    };
    
    // Start loading the image
    img.src = modifiedSrc;
}

/**
 * Apply canvas effects to the image
 */
function applyCanvasEffects(ctx, width, height) {
    // Skip if no effects are applied
    if (effectSettings.brightness === 0 && 
        effectSettings.contrast === 0 && 
        effectSettings.saturation === 0 && 
        effectSettings.blur === 0) {
        return;
    }
    
    // Get image data
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    // Apply brightness and contrast
    const brightness = effectSettings.brightness / 100;
    const contrast = effectSettings.contrast / 100;
    const saturation = effectSettings.saturation / 100;
    
    for (let i = 0; i < data.length; i += 4) {
        // Apply brightness
        if (brightness !== 0) {
            data[i] += 255 * brightness;
            data[i + 1] += 255 * brightness;
            data[i + 2] += 255 * brightness;
        }
        
        // Apply contrast
        if (contrast !== 0) {
            const factor = (259 * (contrast + 1)) / (255 * (1 - contrast));
            data[i] = factor * (data[i] - 128) + 128;
            data[i + 1] = factor * (data[i + 1] - 128) + 128;
            data[i + 2] = factor * (data[i + 2] - 128) + 128;
        }
        
        // Apply saturation
        if (saturation !== 0) {
            const gray = 0.2989 * data[i] + 0.5870 * data[i + 1] + 0.1140 * data[i + 2];
            data[i] = gray * (1 - saturation) + data[i] * saturation;
            data[i + 1] = gray * (1 - saturation) + data[i + 1] * saturation;
            data[i + 2] = gray * (1 - saturation) + data[i + 2] * saturation;
        }
    }
    
    // Put the modified image data back
    ctx.putImageData(imageData, 0, 0);
    
    // Apply blur (if any)
    if (effectSettings.blur > 0) {
        ctx.filter = `blur(${effectSettings.blur}px)`;
        ctx.drawImage(ctx.canvas, 0, 0);
        ctx.filter = 'none';
    }
}

/**
 * Set up event listeners for UI controls
 */
function setupEventListeners() {
    // Toggle effects panel
    toggleEffectsButton.addEventListener('click', () => {
        effectsPanelElement.classList.toggle('hidden');
        toggleEffectsButton.textContent = effectsPanelElement.classList.contains('hidden') 
            ? 'Show Image Effects' 
            : 'Hide Image Effects';
    });
    
    // Reload images button
    reloadImagesButton.addEventListener('click', () => {
        createImageGallery();
        setupIntersectionObserver();
    });
    
    // Effect sliders
    brightnessSlider.addEventListener('input', updateEffects);
    contrastSlider.addEventListener('input', updateEffects);
    saturationSlider.addEventListener('input', updateEffects);
    blurSlider.addEventListener('input', updateEffects);
}

/**
 * Update effect settings based on slider values
 */
function updateEffects() {
    effectSettings.brightness = parseInt(brightnessSlider.value);
    effectSettings.contrast = parseInt(contrastSlider.value);
    effectSettings.saturation = parseInt(saturationSlider.value);
    effectSettings.blur = parseFloat(blurSlider.value);
    
    console.log('Effect settings updated:', effectSettings);
}

/**
 * Create a simple polyfill for Network Information API if it's not available
 */
function setupNetworkInfoPolyfill() {
    if (!navigator.connection && !navigator.mozConnection && !navigator.webkitConnection) {
        console.log('Creating Network Information API polyfill');
        
        // Create a simple polyfill object
        navigator.connection = {
            // Default values
            type: 'estimated',
            effectiveType: '3g',
            downlink: 2,
            rtt: 100,
            saveData: false,
            
            // Event handling
            _listeners: [],
            addEventListener: function(type, listener) {
                if (type === 'change') {
                    this._listeners.push(listener);
                }
            },
            removeEventListener: function(type, listener) {
                if (type === 'change') {
                    const index = this._listeners.indexOf(listener);
                    if (index !== -1) {
                        this._listeners.splice(index, 1);
                    }
                }
            },
            dispatchEvent: function(event) {
                if (event.type === 'change') {
                    this._listeners.forEach(listener => listener(event));
                }
            }
        };
        
        // Periodically check connection using our estimation method
        setInterval(() => {
            estimateConnectionSpeed()
                .then(speed => {
                    let newEffectiveType;
                    if (speed < 1) {
                        newEffectiveType = '2g';
                    } else if (speed < 5) {
                        newEffectiveType = '3g';
                    } else {
                        newEffectiveType = '4g';
                    }
                    
                    // Only update if changed
                    if (newEffectiveType !== navigator.connection.effectiveType) {
                        navigator.connection.effectiveType = newEffectiveType;
                        navigator.connection.downlink = speed;
                        
                        // Dispatch change event
                        const event = new Event('change');
                        navigator.connection.dispatchEvent(event);
                    }
                })
                .catch(error => {
                    console.error('Error in polyfill connection check:', error);
                });
        }, 30000); // Check every 30 seconds
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Setup polyfill if needed
    setupNetworkInfoPolyfill();
    
    // Initialize the app
    initApp();
});
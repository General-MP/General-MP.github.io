// Function to create stacking rectangles after main animation
// Function to create stacking rectangles after main animation
function createStackingRectangles() {
    // Create container for rectangles
    const container = document.createElement('div');
    container.className = 'stacking-container';
    document.body.appendChild(container);
    
    // Calculate screen height
    const viewportHeight = window.innerHeight;
    
    // Determine base rectangle height based on screen size
    let numberOfDivisions;
    if (window.innerWidth <= 480) {
        numberOfDivisions = 8;
    } else if (window.innerWidth <= 768) {
        numberOfDivisions = 5;
    } else {
        numberOfDivisions = 3;
    }
    
    // Use exact division to cover the screen with no gaps
    const rectHeight = viewportHeight / numberOfDivisions;
    const numberOfRectangles = numberOfDivisions; // removed the extra stripe
    
    // Create rectangles
    const rectangles = [];
    for (let i = 0; i < numberOfRectangles; i++) {
        const rect = document.createElement('div');
        rect.className = 'stacking-rectangle';
        
        // Add 1px extra height for the second and third stripes
        const height = (i === 1 || i === 2) ? rectHeight + 1 : rectHeight;
        rect.style.height = height + 'px';
        
        rect.style.transform = 'translateY(-100%)';
        container.appendChild(rect);
        rectangles.push(rect);
    }
    
    // Show the container
    container.style.display = 'block';
    
    // Animate stripes sequentially (top-to-bottom) with a recursive function
    function animateStripe(i) {
        if (i >= rectangles.length) {
            // All stripes have been animated, set up zoom interactions after a delay
            setTimeout(setupZoomInteractions, 3000, container, rectangles);
            return;
        }
        setTimeout(() => {
            // Adjust offsets for all stripes to remove gaps
            let offset = i * rectHeight;
            if (i === 1) offset += 1; // Small adjustment for second stripe
            if (i === 2) offset += 4; // Increased adjustment for third stripe to close the gap
            rectangles[i].style.transform = `translateY(${offset}px)`;
            
            setTimeout(() => {
                addScrollingText(rectangles[i], i, 0);
                animateStripe(i + 1);
            }, 1200);
        }, i === 0 ? 300 : 400);
    }

    // Function to add scrolling text to each rectangle
    function addScrollingText(rectangle, index, additionalDelay) {
        // Determine which text to display based on pattern
        const textPattern = index % 3;
        let text = '';
        
        switch(textPattern) {
            case 0: text = 'สุขสันต์'; break;
            case 1: text = 'วันเกิด'; break;
            case 2: text = 'คับผม'; break;
        }
        
        // Create a single container with different structure
        const textContainer = document.createElement('div');
        textContainer.className = 'text-scroller';
        
        // Set direction based on index (alternating)
        const isRTL = index % 2 === 0;
        textContainer.classList.add(isRTL ? 'rtl' : 'ltr');
        
        // Calculate font size based on rectangle height
        const fontSize = Math.floor(rectangle.offsetHeight * 0.75);
        
        // Create the text track that will move
        const track = document.createElement('div');
        track.className = 'text-track';
        
        // Word specific adjustments
        let gapMultiplier = 0.75; // Default spacing (reduced to 25% of original 5)
        let fontSizeAdjust = 1.0;
        
        
        if (text === 'BIRTHDAY') {
            gapMultiplier = 0.6; // Reduced to 25% of original 6
            fontSizeAdjust = 0.9; // Keep the same size adjustment
        } else if (text === 'DAD') {
            gapMultiplier = 0.6; // Reduced to 25% of original 4
        }
        
        // Create content - multiple copies of the text with proper spacing
        const viewportWidth = window.innerWidth;
        const approxCharWidth = fontSize * 0.6;
        const textWidth = text.length * approxCharWidth * fontSizeAdjust;
        const repeatsNeeded = Math.ceil(viewportWidth / (textWidth + (approxCharWidth * gapMultiplier))) * 3;
        
        // Create content with proper spacing
        for (let i = 0; i < repeatsNeeded; i++) {
            const textSpan = document.createElement('span');
            textSpan.className = 'scroll-text';
            textSpan.textContent = text;
            textSpan.style.fontSize = `${fontSize * fontSizeAdjust}px`;
            textSpan.style.marginRight = `${approxCharWidth * gapMultiplier}px`;
            track.appendChild(textSpan);
        }
        
        // These two lines were missing - add the elements to the DOM
        textContainer.appendChild(track);
        rectangle.appendChild(textContainer);
    }
    
    // Start the animation sequence by calling animateStripe with the first index
    animateStripe(0);
}

// Function to set up zoom interaction based on device type
function setupZoomInteractions(container, rectangles) {
    // Create a hint element to show users they can interact
    const interactionHint = document.createElement('div');
    interactionHint.className = 'interaction-hint';
    interactionHint.textContent = isMobileDevice() ? 'Tap to zoom' : 'Scroll to zoom';
    document.body.appendChild(interactionHint);
    
    // Fade in the hint
    setTimeout(() => {
        interactionHint.style.opacity = '1';
    }, 500);
    
    // Prepare container for zoom effect
    container.classList.add('zoom-ready');
    
    // Variables for zoom control
    let zoomLevel = 0;
    const maxZoomLevel = 100;
    let isZooming = false;
    let zoomTimeout;
    
    // Detect if this is a mobile device
    function isMobileDevice() {
        return (typeof window.orientation !== 'undefined') || 
               (navigator.userAgent.indexOf('IEMobile') !== -1) ||
               (navigator.userAgent.indexOf('Android') !== -1) ||
               (navigator.userAgent.indexOf('iPhone') !== -1) ||
               (navigator.userAgent.indexOf('iPad') !== -1);
    }
    
    // Apply zoom effect based on current zoom level
    function applyZoom() {
        // Remove the hint once zooming starts
        if (zoomLevel > 0 && interactionHint.parentNode) {
            interactionHint.style.opacity = '0';
            setTimeout(() => {
                if (interactionHint.parentNode) {
                    interactionHint.parentNode.removeChild(interactionHint);
                }
            }, 500);
        }
        
        // Pause text animations during zoom
        if (zoomLevel > 0) {
            rectangles.forEach(rect => {
                const textTracks = rect.querySelectorAll('.text-track');
                textTracks.forEach(track => {
                    track.style.animationPlayState = 'paused';
                });
            });
        }
        
        // Calculate zoom scale and apply transformation
        const zoomScale = 1 + (zoomLevel / 20);
        
        // Apply different transformations to create the illusion of zooming into text
        rectangles.forEach((rect, index) => {
            const textElements = rect.querySelectorAll('.scroll-text');
            textElements.forEach(text => {
                text.style.transform = `scale(${zoomScale})`;
                
                // Adjust letter spacing as we zoom to create the effect of gaps widening
                const letterSpacing = Math.min(0.5, zoomLevel * 0.01) + 'em';
                text.style.letterSpacing = letterSpacing;
            });
        });
        
        // Create zoom blur effect
        const blurAmount = Math.min(10, zoomLevel / 10);
        container.style.filter = `blur(${blurAmount}px)`;
        
        // When reaching max zoom, transition to white
        if (zoomLevel >= maxZoomLevel - 10) {
            const opacity = (zoomLevel - (maxZoomLevel - 10)) / 10;
            const overlay = document.getElementById('zoom-overlay') || createOverlay();
            overlay.style.opacity = opacity;
            
            // At max zoom, show birthday message
            if (zoomLevel >= maxZoomLevel) {
                showBirthdayMessage();
            }
        }
    }
    
    // Create white overlay for final transition
    function createOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'zoom-overlay';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'white';
        overlay.style.zIndex = '1000';
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 0.5s ease';
        document.body.appendChild(overlay);
        return overlay;
    }
    
    // Show final birthday message
    function showBirthdayMessage() {
        // If we already have a message, don't create another one
        if (document.getElementById('birthday-message')) return;
        
        // Create message container
        const messageContainer = document.createElement('div');
        messageContainer.id = 'birthday-message';
        messageContainer.style.position = 'fixed';
        messageContainer.style.top = '50%';
        messageContainer.style.left = '50%';
        messageContainer.style.transform = 'translate(-50%, -50%)';
        messageContainer.style.fontSize = '5vw';
        messageContainer.style.fontWeight = 'bold';
        messageContainer.style.color = '#ff9770';
        messageContainer.style.textAlign = 'center';
        messageContainer.style.fontFamily = "'SaoChingcha', Arial, sans-serif";
        messageContainer.style.opacity = '0';
        messageContainer.style.transition = 'opacity 2s ease';
        messageContainer.style.zIndex = '1001';
        
        // Add message content
        messageContainer.innerHTML = 'สุขสันต์วันเกิดคับผม<br>❤️';
        
        document.body.appendChild(messageContainer);
        
        // Fade in the message
        setTimeout(() => {
            messageContainer.style.opacity = '1';
        }, 500);
    }
    
    // Set up event listeners based on device type
    if (isMobileDevice()) {
        // For mobile: use tap/click to increase zoom level
        document.addEventListener('click', () => {
            if (!isZooming) {
                zoomLevel += 10;
                if (zoomLevel > maxZoomLevel) zoomLevel = maxZoomLevel;
                applyZoom();
                
                // Reset auto-zoom timeout
                clearTimeout(zoomTimeout);
                if (zoomLevel < maxZoomLevel) {
                    zoomTimeout = setTimeout(() => {
                        const autoZoomInterval = setInterval(() => {
                            zoomLevel += 2;
                            if (zoomLevel >= maxZoomLevel) {
                                zoomLevel = maxZoomLevel;
                                clearInterval(autoZoomInterval);
                            }
                            applyZoom();
                        }, 200);
                    }, 5000);
                }
            }
        });
    } else {
        // For desktop: use scroll to control zoom level
        let lastScrollTime = 0;
        
        document.addEventListener('wheel', (e) => {
            e.preventDefault();
            
            // Throttle scroll events
            const now = Date.now();
            if (now - lastScrollTime < 50) return;
            lastScrollTime = now;
            
            // Increase zoom level based on scroll direction
            const delta = Math.sign(e.deltaY) * 2;
            zoomLevel += delta;
            
            // Constrain zoom level
            zoomLevel = Math.max(0, Math.min(maxZoomLevel, zoomLevel));
            
            applyZoom();
            
            // Reset auto-zoom timeout
            clearTimeout(zoomTimeout);
            if (zoomLevel < maxZoomLevel) {
                zoomTimeout = setTimeout(() => {
                    const autoZoomInterval = setInterval(() => {
                        zoomLevel += 1;
                        if (zoomLevel >= maxZoomLevel) {
                            zoomLevel = maxZoomLevel;
                            clearInterval(autoZoomInterval);
                        }
                        applyZoom();
                    }, 200);
                }, 5000);
            }
        }, { passive: false });
    }
    
    // Start auto-zoom after a delay if no interaction
    zoomTimeout = setTimeout(() => {
        const autoZoomInterval = setInterval(() => {
            zoomLevel += 1;
            if (zoomLevel >= maxZoomLevel) {
                zoomLevel = maxZoomLevel;
                clearInterval(autoZoomInterval);
            }
            applyZoom();
        }, 200);
    }, 10000);
}
// Function to create stacking rectangles after main animation
function createStackingRectangles() {
    // Create container for rectangles
    const container = document.createElement('div');
    container.className = 'stacking-container';
    document.body.appendChild(container);
    
    // Initialize audio but don't play yet - moved up for earlier initialization
    const bgMusic = new Audio('sounds/hbdremix.mp3');
    bgMusic.loop = true;
    bgMusic.volume = 0.7; // Set volume to 70%
    
    // Pre-load the audio to reduce delay
    bgMusic.preload = 'auto';
    
    // Immediately try to play audio - this should happen before any animation starts
    const playPromise = bgMusic.play();
    if (playPromise !== undefined) {
        playPromise.catch(error => {
            console.log("Autoplay prevented. User interaction required.");
            // Add a click event listener to the document to play on first click
            const startAudio = () => {
                bgMusic.play();
                document.removeEventListener('click', startAudio);
            };
            document.addEventListener('click', startAudio);
        });
    }
    
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
    const baseRectHeight = viewportHeight / numberOfDivisions;
    const numberOfRectangles = numberOfDivisions;
    
    // Create rectangles with precise heights to ensure exact fit
    const rectangles = [];
    for (let i = 0; i < numberOfRectangles; i++) {
        const rect = document.createElement('div');
        rect.className = 'stacking-rectangle';
        
        // Ensure exact height to prevent rounding issues
        rect.style.height = `${baseRectHeight}px`;
        // Disable any margin/padding that could cause spacing issues
        rect.style.margin = '0';
        rect.style.padding = '0';
        rect.style.boxSizing = 'border-box';
        
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
            setTimeout(setupZoomInteractions, 2000, container, rectangles);
            return;
        }
        
        setTimeout(() => {
            // CRITICAL FIX: Force removal of any interfering transitions first
            rectangles[i].style.transition = 'transform 1.2s cubic-bezier(0.25, 1, 0.5, 1)';
            
            // Calculate exact position for perfect alignment
            const exactPosition = baseRectHeight * i;
            
            // Apply precise position
            rectangles[i].style.transform = `translateY(${exactPosition}px)`;
            
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
        let phraseClass = '';
        
        switch(textPattern) {
            case 0: 
                text = 'สุขสันต์'; 
                phraseClass = 'text-phrase-1';
                break;
            case 1: 
                text = 'วันเกิด'; 
                phraseClass = 'text-phrase-2';
                break;
            case 2: 
                text = 'คับผม!'; 
                phraseClass = 'text-phrase-3';
                break;
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
        
        
        if (text === 'วันเกิด') {
            gapMultiplier = 0.6; // Reduced to 25% of original 6
            fontSizeAdjust = 0.9; // Keep the same size adjustment
        } else if (text === 'คับผม!') {
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
            textSpan.className = 'scroll-text ' + phraseClass; // Add the phrase-specific class
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
    const maxZoomLevel = 1200; // increased max zoom level from 900 to 1200
    let isZooming = false;
    
    // Select the middle stripe for focused zooming
    const middleIndex = Math.floor(rectangles.length / 2);
    const targetStripe = rectangles[middleIndex];
    const targetColor = window.getComputedStyle(targetStripe).backgroundColor;
    
    // Make the target stripe stand out slightly - FIXED TIMING
    setTimeout(() => {
        // IMPORTANT: Only add zoom-target-stripe class once animations are complete
        targetStripe.classList.add('zoom-target-stripe');
        
        // Find a suitable text element in the target stripe to zoom into
        const textTrack = targetStripe.querySelector('.text-track');
        const textElements = textTrack.querySelectorAll('.scroll-text');
        
        // Select an element positioned near the center
        let centerTextElement = null;
        if (textElements.length > 0) {
            // Choose text element near the center of the viewport
            const viewportCenter = window.innerWidth / 2;
            let closestDistance = Infinity;
            
            textElements.forEach(el => {
                const rect = el.getBoundingClientRect();
                const distance = Math.abs(rect.left + (rect.width / 2) - viewportCenter);
                if (distance < closestDistance) {
                    closestDistance = distance;
                    centerTextElement = el;
                }
            });
            
            // Mark this element for zooming
            if (centerTextElement) {
                centerTextElement.classList.add('zoom-target-text');
                
                // SIGNIFICANTLY IMPROVED GAP TARGETING:
                const text = centerTextElement.textContent;
                const rect = centerTextElement.getBoundingClientRect();
                const viewportCenter = window.innerWidth / 2;
                
                // Create a temporary span to measure actual character widths
                const tempSpan = document.createElement('span');
                tempSpan.style.visibility = 'hidden';
                tempSpan.style.position = 'absolute';
                tempSpan.style.font = window.getComputedStyle(centerTextElement).font;
                tempSpan.style.fontSize = window.getComputedStyle(centerTextElement).fontSize;
                document.body.appendChild(tempSpan);
                
                // Calculate the actual position of each character and the gap between characters
                const charPositions = [];
                const gapPositions = [];
                let currentOffset = rect.left;
                
                // Add the initial gap at the start of the text
                gapPositions.push({
                    position: currentOffset,
                    isGap: true,
                    index: 0,
                    width: 0
                });
                
                // Calculate each character's position and width
                for (let i = 0; i < text.length; i++) {
                    tempSpan.textContent = text.charAt(i);
                    const charWidth = tempSpan.getBoundingClientRect().width;
                    
                    charPositions.push({
                        position: currentOffset,
                        isGap: false,
                        char: text.charAt(i),
                        width: charWidth,
                        index: i
                    });
                    
                    // Calculate the position of the gap after this character
                    const gapPosition = currentOffset + charWidth;
                    currentOffset = gapPosition;
                    
                    gapPositions.push({
                        position: gapPosition,
                        isGap: true,
                        index: i + 1,
                        width: 0
                    });
                }
                
                // Clean up the temporary element
                document.body.removeChild(tempSpan);
                
                // Find the gap that's closest to the viewport center
                let closestGap = null;
                let minGapDistance = Infinity;
                
                gapPositions.forEach(gap => {
                    const distance = Math.abs(viewportCenter - gap.position);
                    if (distance < minGapDistance) {
                        minGapDistance = distance;
                        closestGap = gap;
                    }
                });
                
                // Calculate the exact offset needed to position this gap at the viewport center
                const fixedOffsetX = viewportCenter - closestGap.position;
                
                // Store these values as data attributes on the element
                centerTextElement.dataset.fixedOffsetX = fixedOffsetX.toFixed(2);
                centerTextElement.dataset.gapIndex = closestGap.index;
                centerTextElement.dataset.gapPosition = closestGap.position.toFixed(2);
                
                // IMPORTANT: Do not set any transform initially to avoid flickering
                centerTextElement.style.transform = '';
                centerTextElement.style.transition = 'none';
                
                // Store the background color for the final overlay
                centerTextElement.dataset.backgroundColor = window.getComputedStyle(targetStripe).backgroundColor;
            }
        }
    }, 1000);
    
    // Detect if this is a mobile device
    function isMobileDevice() {
        return (typeof window.orientation !== 'undefined') || 
               (navigator.userAgent.indexOf('IEMobile') !== -1) ||
               (navigator.userAgent.indexOf('Android') !== -1) ||
               (navigator.userAgent.indexOf('iPhone') !== -1) ||
               (navigator.userAgent.indexOf('iPad') !== -1);
    }
    
    // Function to apply zoom effect based on current zoom level
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
        
        // Add zooming class to body to prevent scrolling
        document.body.classList.add('zooming');
        
        // Pause text animations during zoom
        rectangles.forEach(rect => {
            const textTracks = rect.querySelectorAll('.text-track');
            textTracks.forEach(track => {
                track.classList.add('paused');
                track.style.animationPlayState = 'paused';
            });
        });
        
        // Store original positions of stripes if not already done
        if (!container.dataset.initialized) {
            // Store original positions and dimensions
            rectangles.forEach((rect, idx) => {
                const transform = window.getComputedStyle(rect).transform;
                const matrix = new DOMMatrix(transform);
                rect.dataset.originalY = matrix.m42;
                rect.dataset.originalHeight = rect.offsetHeight;
                rect.dataset.index = idx;
                
                // Store original text styles to preserve them
                const textElements = rect.querySelectorAll('.scroll-text');
                textElements.forEach((text, textIdx) => {
                    const originalLetterSpacing = window.getComputedStyle(text).letterSpacing;
                    text.dataset.originalLetterSpacing = originalLetterSpacing;
                    
                    // Calculate and store fixed positioning data upfront to avoid jitter
                    if (text.classList.contains('zoom-target-text')) {
                        // Get initial dimensions and positions once
                        const rect = text.getBoundingClientRect();
                        const viewportCenter = window.innerWidth / 2;
                        
                        // Store the character gap positions once
                        const gapData = calculateCharacterGaps(text);
                        
                        // Find the optimal gap position that's closest to viewport center
                        const optimalGapPosition = findOptimalGapPosition(gapData.gaps, viewportCenter);
                        
                        // Calculate the fixed offset needed to center this gap
                        const fixedOffset = viewportCenter - optimalGapPosition;
                        
                        // Store these fixed values to eliminate recalculation
                        container.dataset.targetTextInitialLeft = rect.left.toFixed(2);
                        container.dataset.targetTextInitialWidth = rect.width.toFixed(2);
                        container.dataset.targetTextFixedOffset = fixedOffset.toFixed(2);
                        container.dataset.optimalGapPosition = optimalGapPosition.toFixed(2);
                    }
                });
            });
            
            container.dataset.initialized = 'true';
        }
        
        // Use a smoother non-linear function for zoom acceleration
        const zoomProgress = Math.min(1, zoomLevel / maxZoomLevel);
        
        // Use consistent easing with no sudden changes or conditional breakpoints
        const acceleratedZoom = Math.pow(zoomProgress, 1.25); // Gentle acceleration
        
        // Apply a consistent scale with extreme final zoom
        const sceneScale = 1 + (acceleratedZoom * 45.0);
        
        // Apply the zoom transformation to the container
        container.style.transform = `scale(${sceneScale})`;
        
        // Calculate when the target stripe height reaches screen height - but don't use this for conditional logic
        const stripeScaledHeight = targetStripe.offsetHeight * sceneScale;
        const viewportHeight = window.innerHeight;
        
        // Get the target text element once
        const targetElement = document.querySelector('.zoom-target-text');
        
        // Get the fixed offset directly from the element's data attribute and round it
        // FIXED: Use a more stable rounding approach
        const fixedOffsetX = targetElement ? 
            Math.round(parseFloat(targetElement.dataset.fixedOffsetX || 0)) : 0;
        
        // FIXED: Apply the exact same transform throughout the zoom process until final z movement
        const transformString = `translateX(${fixedOffsetX}px)`;
        
        // FIXED: Only add Z translation at the very end for a smooth transition through text
        let finalTransform = transformString;
        if (zoomProgress > 0.90) { // Increased threshold to delay z-movement until later
            // Use a more dramatic progression for the final push through
            const finalZoomProgress = (zoomProgress - 0.90) / 0.10; // Normalize to 0-1 in final 10% of zoom
            const zTranslation = Math.floor(15000 * Math.pow(finalZoomProgress, 3)); // Use cubic easing for more dramatic effect
            finalTransform = `${transformString} translateZ(${zTranslation}px)`;
        }
        
        rectangles.forEach((rect, index) => {
            const originalY = parseFloat(rect.dataset.originalY || 0);
            rect.style.transform = `translateY(${originalY}px)`;
            
            const textElements = rect.querySelectorAll('.scroll-text');
            
            if (rect.classList.contains('zoom-target-stripe')) {
                // Only hide non-target text when we're in the final zoom phase
                textElements.forEach(text => {
                    if (!text.classList.contains('zoom-target-text')) {
                        // Fade out non-target text with ultra-smooth transition
                        const fadeProgress = Math.min(1, acceleratedZoom * 1.4);
                        text.style.opacity = Math.max(0, 1 - fadeProgress);
                        text.style.display = fadeProgress >= 0.95 ? 'none' : '';
                        text.style.transform = 'none';
                    } else {
                        text.style.display = ''; 
                        text.style.opacity = 1; 
                        
                        // Preserve original text color
                        if (text.classList.contains('text-phrase-1') ||
                            text.classList.contains('text-phrase-2') ||
                            text.classList.contains('text-phrase-3')) {
                            text.style.removeProperty('color');
                        }
                        
                        // IMPORTANT: Use consistent easing with no breakpoints or conditionals
                        
                        // Ultra smooth easing blend with consistent acceleration/deceleration
                        const easeOutQuint = 1 - Math.pow(1 - zoomProgress, 5);
                        const easeInOutCubic = zoomProgress < 0.5 
                            ? 4 * zoomProgress * zoomProgress * zoomProgress
                            : 1 - Math.pow(-2 * zoomProgress + 2, 3) / 2;
                        
                        // Blend easing functions for even smoother transition
                        const blendedEase = (easeOutQuint * 0.7) + (easeInOutCubic * 0.3);
                        
                        // Apply Z-translation with consistent formula throughout zoom process
                        // MUCH deeper z-translation for extreme depth effect
                        const zTranslation = 12000 * Math.pow(zoomProgress, 2.0);
                        
                        // CRITICAL: Disable transitions completely to prevent any jitter
                        text.style.transition = 'none';
                        
                        // Apply the pre-calculated transform string directly
                        // This ensures absolutely consistent transforms on every frame
                        text.style.transform = finalTransform;
                        text.style.transformOrigin = "center center";
                        
                        // Force hardware acceleration
                        text.style.willChange = 'transform';
                        text.style.backfaceVisibility = 'hidden';
                        text.style.perspective = '1000px';
                    }
                });
            } else {
                // Non-target stripes
                textElements.forEach(text => {
                    text.style.display = '';
                    text.style.transform = 'none';
                    text.style.opacity = 1;
                });
            }
            
            // Ensure colors are preserved for all text
            textElements.forEach(text => {
                text.style.removeProperty('color');
            });
        });
        
        // Apply consistent perspective changes without any non-linear adjustments
        const basePerspective = 1500;
        const minPerspective = 80; 
        // Use a perfectly linear perspective change to avoid any jumps
        const perspectiveValue = Math.max(minPerspective, Math.floor(basePerspective - (basePerspective * zoomProgress)));
        container.style.perspective = `${perspectiveValue}px`;
        
        // Simple linear overlay transition with no sudden changes
        // Start overlay transition MUCH later with longer transition for deeper zoom
        if (zoomProgress >= 0.75) { // Start later (from 0.6 to 0.75)
            const overlayProgress = Math.min(1, (zoomProgress - 0.75) / 0.25); // Shorter fade (from 0.4 to 0.25)
            const overlay = document.getElementById('zoom-overlay') || createOverlay(targetColor);
            overlay.style.opacity = overlayProgress;
            
            if (overlayProgress >= 0.8) { // Show message later
                showBirthdayMessage();
            }
        }
    }
    
    // Create colored overlay for final transition
    function createOverlay(color) {
        const overlay = document.createElement('div');
        overlay.id = 'zoom-overlay';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = color;
        overlay.style.zIndex = '1000';
        overlay.style.opacity = '0';
        // Use an even longer, smoother transition for the overlay
        overlay.style.transition = 'opacity 4s cubic-bezier(0.1, 0.7, 0.1, 1)';
        document.body.appendChild(overlay);
        return overlay;
    }
    
    // Show final divided screen with typewriter text
    function showBirthdayMessage() {
        // If we already have the divided screen, don't create another one
        if (document.getElementById('divided-screen')) return;
        
        // Get the target stripe color from the overlay
        const overlay = document.getElementById('zoom-overlay');
        const bgColor = overlay ? overlay.style.backgroundColor : '#000000';
        
        // Determine contrasting text colors with INCREASED CONTRAST
        let firstTextColor, secondTextColor;
        
        // Extract RGB components from background color
        const rgbMatch = bgColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (rgbMatch) {
            const r = parseInt(rgbMatch[1]);
            const g = parseInt(rgbMatch[2]);
            const b = parseInt(rgbMatch[3]);
            
            // Determine which stripe color was used and assign high contrast colors
            if (r > 200 && g > 100 && b < 130) { // Orange background (#ff9770)
                firstTextColor = '#00ffff'; // Cyan (contrasting with orange)
                secondTextColor = '#ffff00'; // Yellow (different contrast)
            } else if (r < 130 && g > 130 && b > 200) { // Blue background (#70a6ff)
                firstTextColor = '#ff00ff'; // Magenta (contrasting with blue)
                secondTextColor = '#ffff00'; // Yellow (different contrast)
            } else if (r > 200 && g > 200 && b < 130) { // Green background (#e9ff70)
                firstTextColor = '#ff00ff'; // Magenta (contrasting with green)
                secondTextColor = '#00ffff'; // Cyan (different contrast)
            } else {
                // Default fallback with high contrast
                firstTextColor = '#ff00ff'; // Magenta
                secondTextColor = '#00ffff'; // Cyan
            }
        } else {
            // Default fallback
            firstTextColor = '#ff00ff'; // Magenta
            secondTextColor = '#00ffff'; // Cyan
        }
        
        // Create container for divided screen
        const dividedScreen = document.createElement('div');
        dividedScreen.id = 'divided-screen';
        dividedScreen.style.position = 'fixed';
        dividedScreen.style.top = '0';
        dividedScreen.style.left = '0';
        dividedScreen.style.width = '100%';
        dividedScreen.style.height = '100%';
        dividedScreen.style.zIndex = '1001';
        dividedScreen.style.display = 'flex';
        dividedScreen.style.flexDirection = 'column';
        dividedScreen.style.backgroundColor = bgColor;
        dividedScreen.style.opacity = '0';
        dividedScreen.style.transition = 'opacity 1s ease';
        
        // Create upper section
        const upperSection = document.createElement('div');
        upperSection.className = 'screen-section upper-section';
        upperSection.style.flex = '1';
        upperSection.style.display = 'flex';
        upperSection.style.justifyContent = 'center';
        upperSection.style.alignItems = 'center';
        upperSection.style.padding = '2rem';
        upperSection.style.backgroundColor = bgColor;
        upperSection.style.position = 'relative';
        upperSection.style.zIndex = '2';
        
        // Create lower section
        const lowerSection = document.createElement('div');
        lowerSection.className = 'screen-section lower-section';
        lowerSection.style.flex = '1';
        lowerSection.style.display = 'flex';
        lowerSection.style.justifyContent = 'center';
        lowerSection.style.alignItems = 'center';
        lowerSection.style.padding = '2rem';
        lowerSection.style.backgroundColor = 'transparent'; // Make transparent to show the rectangle
        lowerSection.style.position = 'relative';
        lowerSection.style.zIndex = '2';
        
        // Create the expanding rectangle (initially with height 0)
        const expandingRect = document.createElement('div');
        expandingRect.className = 'expanding-rectangle';
        expandingRect.style.position = 'absolute';
        expandingRect.style.left = '0';
        expandingRect.style.width = '100%';
        expandingRect.style.height = '0'; // Start with no height
        expandingRect.style.backgroundColor = firstTextColor; // Same as first text color
        expandingRect.style.bottom = '0'; // Positioned at the bottom
        expandingRect.style.zIndex = '1'; // Below the text
        expandingRect.style.transition = 'height 1.2s cubic-bezier(0.25, 1, 0.5, 1)';
        expandingRect.style.transformOrigin = 'bottom center'; // Grow upward from bottom
        
        // Prepare text content
        const text1 = "ขอให้พ่อสุขภาพร่างกายแข็งแรง มีความสุขในทุกวัน เป็นหัวหน้าครอบครัวที่น่ารักและแสนดีแบบนี้ตลอดไปนะคะ\n-- คุณแม่ --";
        const text2 = "ขอให้คุณพ่อมีความสุข มีสุขภาพแข็งแรง อยู่กับพูห์กับคุณแม่ไปนานๆนะคับ (รอเลขนับเกิน 100 อยู่คับ) หมีพูห์ดีใจที่ได้เกิดมาเป็นลูกคุณพ่อคับ\n-- หมีพูห์ --";
        
        // Create fixed size containers with proper contrasting colors
        const upperContent = createTypewriterContainer(text1, firstTextColor);
        const lowerContent = createTypewriterContainer(text2, secondTextColor);
        
        // Initially hide the lower content
        lowerContent.style.opacity = '0';
        
        // Add elements to their containers
        upperSection.appendChild(upperContent);
        lowerSection.appendChild(lowerContent);
        dividedScreen.appendChild(upperSection);
        dividedScreen.appendChild(lowerSection);
        dividedScreen.appendChild(expandingRect); // Add the expanding rectangle
        
        document.body.appendChild(dividedScreen);
        
        // Animation sequence with proper timing
        setTimeout(() => {
            // Fade in the main screen
            dividedScreen.style.opacity = '1';
            
            // Start typing the first paragraph
            startTypewriterAnimation(upperContent, 500, () => {
                // After first paragraph completes, animate the rectangle growing downward
                setTimeout(() => {
                    // Expand the rectangle to 50% of the screen height (bottom half)
                    expandingRect.style.height = '50%';
                    
                    // After rectangle has expanded, show and animate the second paragraph
                    setTimeout(() => {
                        // Fade in the lower content
                        lowerContent.style.opacity = '1';
                        
                        // Start typing the second paragraph
                        startTypewriterAnimation(lowerContent, 0);
                    }, 1200); // Wait for rectangle to finish expanding
                }, 500); // Short pause after first paragraph
            });
        }, 500);
    }
    
    // Helper function to create a typewriter container with pre-rendered text
    function createTypewriterContainer(text, textColor) {
        const container = document.createElement('div');
        container.className = 'typewriter-container';
        container.style.width = '100%';
        container.style.maxWidth = '80%';
        container.style.margin = '0 auto';
        container.style.textAlign = 'center';
        container.style.position = 'relative';
        
        // Create the paragraph
        // Create a container for all paragraphs
const textContainer = document.createElement('div');
textContainer.className = 'typewriter-text-container';
textContainer.style.width = '100%';

// Split text by newlines
const lines = text.split('\n');

// Process each line as a separate paragraph
lines.forEach(line => {
    const paragraph = document.createElement('p');
    paragraph.className = 'typewriter-text';
    paragraph.style.fontFamily = "'SaoChingcha', Arial, sans-serif";
    paragraph.style.fontSize = 'clamp(1rem, 4vw, 2.5rem)';
    paragraph.style.color = textColor;
    paragraph.style.textAlign = 'center';
    paragraph.style.margin = '0.8em 0'; // Add margin between paragraphs
    paragraph.style.padding = '0';
    paragraph.style.lineHeight = '1.5';
    paragraph.style.width = '100%';
    paragraph.style.position = 'relative';
    
    // Process characters in this line
    line.split('').forEach(char => {
        const span = document.createElement('span');
        
        // Special handling for spaces
        if (char === ' ') {
            span.innerHTML = '&nbsp;'; // Use non-breaking space
            span.style.width = '0.5em'; // Set explicit width for spaces
        } else {
            span.textContent = char;
        }
        
        span.style.opacity = '0';
        span.style.display = 'inline-block';
        span.style.position = 'relative';
        paragraph.appendChild(span);
    });
    
    textContainer.appendChild(paragraph);
});

container.appendChild(textContainer);
        return container;
    }
    
    // Helper function to animate the typewriter text with completion callback
    function startTypewriterAnimation(container, delay, completionCallback) {
        const paragraphs = container.querySelectorAll('.typewriter-text');
        const allChars = [];
        
        // Collect all characters across all paragraphs
        paragraphs.forEach(paragraph => {
            const chars = paragraph.querySelectorAll('span');
            chars.forEach(char => allChars.push(char));
        });
        
        setTimeout(() => {
            let index = 0;
            const interval = setInterval(() => {
                if (index < allChars.length) {
                    allChars[index].style.opacity = '1';
                    index++;
                } else {
                    clearInterval(interval);
                    if (typeof completionCallback === 'function') {
                        completionCallback();
                    }
                }
            }, 70); // Speed of typing
        }, delay);
    }
    
    // Set up event listeners based on device type
    if (isMobileDevice()) {
        // For mobile: use tap/click to START auto-zoom sequence
        document.addEventListener('click', () => {
            if (!isZooming) {
                isZooming = true; // Mark that we're now zooming to prevent multiple triggers
                
                // Start auto-zoom immediately at a steady pace
                const autoZoomInterval = setInterval(() => {
                    zoomLevel += 20; // Steady increment for smooth zoom
                    
                    if (zoomLevel >= maxZoomLevel) {
                        zoomLevel = maxZoomLevel;
                        clearInterval(autoZoomInterval);
                    }
                    
                    applyZoom();
                }, 25); // Fast, smooth interval
            }
        });
    } else {
        // For desktop: use a single scroll to START auto-zoom sequence
        document.addEventListener('wheel', (e) => {
            e.preventDefault();
            
            if (!isZooming) {
                isZooming = true; // Mark that we're now zooming to prevent multiple triggers
                
                // Determine initial direction from scroll
                const zoomDirection = Math.sign(e.deltaY);
                
                // Only continue auto-zooming in if initial scroll was down/in
                if (zoomDirection > 0) {
                    // Start auto-zoom immediately at a steady pace
                    const autoZoomInterval = setInterval(() => {
                        zoomLevel += 20; // Steady increment
                        
                        if (zoomLevel >= maxZoomLevel) {
                            zoomLevel = maxZoomLevel;
                            clearInterval(autoZoomInterval);
                        }
                        
                        applyZoom();
                    }, 25); // Fast, smooth interval
                } else {
                    // If user initially scrolled backward, don't auto-zoom
                    isZooming = false;
                }
            }
        }, { passive: false });
    }
}

// Remove these helper functions as they cause recalculations during zoom
// Instead we use fixed values calculated just once at initialization
function findWordCenterGap(textElement) {
    // Simply return the data attributes we stored on the element at initialization
    return {
        centerX: parseFloat(textElement.dataset.centerX || 0),
        gapPosition: parseFloat(textElement.dataset.originalLeft || 0) + parseFloat(textElement.dataset.centerX || 0)
    };
}

function calculateCharacterGaps(textElement) {
    // Stub - we won't use this dynamic calculation during zoom
    return { gaps: [] };
}

function findOptimalGapPosition(gaps, viewportCenter) {
    // Stub - we won't use this dynamic calculation during zoom
    return viewportCenter;
}

function findOptimalZoomTarget(textElement) {
    // Stub - we won't use this dynamic calculation during zoom
    return { offsetX: 0, offsetY: 0, isGap: false };
}
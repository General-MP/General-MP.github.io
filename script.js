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
        numberOfDivisions = 8; // 8 rectangles on mobile
    } else if (window.innerWidth <= 768) {
        numberOfDivisions = 5; // 5 rectangles on tablets
    } else {
        numberOfDivisions = 3; // 3 rectangles on desktop
    }
    
    // Calculate exact rectangle height to ensure perfect fit
    const rectHeight = Math.ceil(viewportHeight / numberOfDivisions);
    
    // Calculate exact number of rectangles needed (adding one extra to ensure coverage)
    const numberOfRectangles = numberOfDivisions + 1;
    
    // Create rectangles
    for (let i = 0; i < numberOfRectangles; i++) {
        const rect = document.createElement('div');
        rect.className = 'stacking-rectangle';
        
        // Set exact height to ensure perfect fit
        rect.style.height = rectHeight + 'px';
        
        // Don't set top position, only use transform
        rect.style.transform = 'translateY(-100%)'; // Start above viewport
        
        // Add to container
        container.appendChild(rect);
    }
    
    // Show the container
    container.style.display = 'block';
    
    // Animate rectangles one after another from top to bottom
    const rectangles = Array.from(document.querySelectorAll('.stacking-rectangle'));
    
    // First rectangle moves to the bottom of the screen
    setTimeout(() => {
        const firstRect = rectangles[0];
        // Position first rectangle exactly at the bottom
        firstRect.style.transform = `translateY(${viewportHeight}px)`;
        
        // Add text to first rectangle after it settles
        setTimeout(() => {
            addScrollingText(firstRect, 0, 0);
        }, 1200); // Wait for rectangle animation to complete
        
        // Then animate the rest in sequence, each connecting perfectly
        for (let i = 1; i < rectangles.length; i++) {
            setTimeout(() => {
                const rect = rectangles[i];
                
                // Position each rectangle to connect perfectly with the one below
                rect.style.transform = `translateY(${viewportHeight - (rectHeight * i)}px)`;
                
                // Add scrolling text after this rectangle settles
                setTimeout(() => {
                    // Start text animations
                    addScrollingText(rect, i, 0);
                }, 1200); // Wait for rectangle animation to complete
            }, 400 * i); // Delay each rectangle by the same amount
        }
    }, 300);
}

// Function to add scrolling text to each rectangle
function addScrollingText(rectangle, index, additionalDelay) {
    // Determine which text to display based on pattern
    const textPattern = index % 3;
    let text = '';
    
    switch(textPattern) {
        case 0: text = 'HAPPY'; break;
        case 1: text = 'BIRTHDAY'; break;
        case 2: text = 'DAD'; break;
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
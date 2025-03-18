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
        if (i >= rectangles.length) return;
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
    
    // Start the animation sequence by calling animateStripe with the first index
    animateStripe(0);
}
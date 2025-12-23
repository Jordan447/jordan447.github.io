// DOM Elements
const wantedTextInput = document.getElementById('wantedText');
const bulletinToggle = document.getElementById('bulletinToggle');
const chargeInput = document.getElementById('charge');
const suspectNameInput = document.getElementById('suspectName');
const descriptionInput = document.getElementById('description');
const contactInput = document.getElementById('contact');
const detectiveInput = document.getElementById('detective');
const dateInput = document.getElementById('date');
const mugshotUrlInput = document.getElementById('mugshotUrl');

// Preview Elements
const bulletinContainer = document.getElementById('bulletinContainer');
const bulletinImage = document.getElementById('bulletinImage');
const pWanted = document.getElementById('pWanted');
const pCharge = document.getElementById('pCharge');
const pName = document.getElementById('pName');
const pDescription = document.getElementById('pDescription');
const pContact = document.getElementById('pContact');
const pDetective = document.getElementById('pDetective');
const pDate = document.getElementById('pDate');
const mugshot = document.getElementById('mugshot');

// Buttons
const generateBtn = document.getElementById('generateBtn');
const resetBtn = document.getElementById('resetBtn');
const downloadBtn = document.getElementById('downloadBtn');
const copyBtn = document.getElementById('copyBtn');

// Character Count Elements
const wantedCount = document.getElementById('wanted-count');
const chargeCount = document.getElementById('charge-count');
const nameCount = document.getElementById('name-count');
const descriptionCount = document.getElementById('description-count');
const contactCount = document.getElementById('contact-count');
const detectiveCount = document.getElementById('detective-count');
const dateCount = document.getElementById('date-count');

// Success Modal
const successMessage = document.getElementById('success-message');
const closeSuccess = document.getElementById('close-success');

// Dark Mode Toggle
const darkModeSwitch = document.getElementById('dark-mode-switch');

// Initialize character counts
function updateCharacterCounts() {
    wantedCount.textContent = wantedTextInput.value.length;
    chargeCount.textContent = chargeInput.value.length;
    nameCount.textContent = suspectNameInput.value.length;
    descriptionCount.textContent = descriptionInput.value.length;
    contactCount.textContent = contactInput.value.length;
    detectiveCount.textContent = detectiveInput.value.length;
    dateCount.textContent = dateInput.value.length;
}

// Update preview function
function updatePreview() {
    pWanted.textContent = wantedTextInput.value.toUpperCase() || 'WANTED';
    pCharge.textContent = chargeInput.value || 'CHARGE NOT SPECIFIED';
    pName.textContent = suspectNameInput.value.toUpperCase() || 'UNKNOWN SUSPECT';
    pDescription.textContent = descriptionInput.value || 'No description provided.';
    pContact.textContent = contactInput.value || 'CONTACT INFORMATION NOT PROVIDED';
    pDetective.textContent = detectiveInput.value || 'Detective Name Not Specified';
    pDate.textContent = dateInput.value || 'Date Not Specified';
    
    // Update bulletin image visibility
    if (bulletinToggle.checked) {
        bulletinContainer.classList.remove('hidden');
    } else {
        bulletinContainer.classList.add('hidden');
    }
    
    updateCharacterCounts();
}

// Handle mugshot URL input
function handleMugshotInput() {
    const url = mugshotUrlInput.value.trim();
    
    if (!url) {
        mugshot.style.display = 'none';
        mugshot.src = '';
        return;
    }
    
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = function() {
        mugshot.src = url;
        mugshot.style.display = 'block';
    };
    
    img.onerror = function() {
        // Try without CORS
        const img2 = new Image();
        img2.onload = function() {
            mugshot.src = url;
            mugshot.style.display = 'block';
        };
        img2.onerror = function() {
            mugshot.style.display = 'none';
        };
        img2.src = url;
    };
    
    img.src = url;
}

// Set up event listeners for real-time preview
function setupEventListeners() {
    wantedTextInput.addEventListener('input', updatePreview);
    bulletinToggle.addEventListener('change', updatePreview);
    chargeInput.addEventListener('input', updatePreview);
    suspectNameInput.addEventListener('input', updatePreview);
    descriptionInput.addEventListener('input', updatePreview);
    contactInput.addEventListener('input', updatePreview);
    detectiveInput.addEventListener('input', updatePreview);
    dateInput.addEventListener('input', updatePreview);
    
    // Handle mugshot URL input with debounce
    let mugshotTimeout;
    mugshotUrlInput.addEventListener('input', function() {
        clearTimeout(mugshotTimeout);
        mugshotTimeout = setTimeout(handleMugshotInput, 800);
    });
    
    mugshotUrlInput.addEventListener('blur', handleMugshotInput);
}

// Create poster using Canvas API directly
async function createPosterWithCanvas() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions (600px width, calculate height)
    canvas.width = 600 * 2; // Double for high DPI
    canvas.height = 800 * 2;
    
    // Fill with background color
    ctx.fillStyle = '#eaeaea';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    let yPosition = 0;
    
    // Load and draw bulletin image if enabled
    if (bulletinToggle.checked) {
        try {
            const bulletinImg = await loadImage('Bulletin.png');
            const bulletinHeight = (200 * 2); // Fixed height for bulletin
            ctx.drawImage(bulletinImg, 0, yPosition, canvas.width, bulletinHeight);
            yPosition += bulletinHeight;
            
            // Draw black border
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.strokeRect(0, yPosition - 2, canvas.width, 2);
        } catch (error) {
            console.log('Bulletin image not available');
        }
    }
    
    // Draw WANTED header
    ctx.fillStyle = '#ffd800';
    ctx.fillRect(0, yPosition, canvas.width, 60 * 2);
    ctx.fillStyle = '#000';
    ctx.font = 'bold 44px Anton, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(pWanted.textContent, canvas.width / 2, yPosition + (60 * 2) / 2);
    yPosition += 60 * 2;
    
    // Draw charge bar
    ctx.fillStyle = '#5c5c5c';
    ctx.fillRect(0, yPosition, canvas.width, 50 * 2);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 22px Oswald, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(pCharge.textContent, canvas.width / 2, yPosition + (50 * 2) / 2);
    yPosition += 50 * 2;
    
    // Draw body content
    const bodyStartY = yPosition;
    const bodyHeight = 400 * 2;
    
    // Draw mugshot if available
    if (mugshot.style.display !== 'none' && mugshot.src) {
        try {
            const mugshotImg = await loadImage(mugshot.src);
            const mugshotX = (canvas.width / 2) - (100 * 2);
            const mugshotY = bodyStartY + (30 * 2);
            ctx.drawImage(mugshotImg, mugshotX, mugshotY, 200 * 2, 200 * 2);
            
            // Draw border around mugshot
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2 * 2;
            ctx.strokeRect(mugshotX, mugshotY, 200 * 2, 200 * 2);
            
            // Draw suspect name
            ctx.fillStyle = '#000';
            ctx.font = 'bold 22px Oswald, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(pName.textContent, canvas.width / 2, mugshotY + (220 * 2));
            
            yPosition = mugshotY + (270 * 2);
        } catch (error) {
            console.log('Mugshot not available for download');
            // Draw suspect name without mugshot
            ctx.fillStyle = '#000';
            ctx.font = 'bold 22px Oswald, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(pName.textContent, canvas.width / 2, bodyStartY + (30 * 2));
            yPosition = bodyStartY + (60 * 2);
        }
    } else {
        // Draw suspect name without mugshot
        ctx.fillStyle = '#000';
        ctx.font = 'bold 22px Oswald, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(pName.textContent, canvas.width / 2, bodyStartY + (30 * 2));
        yPosition = bodyStartY + (60 * 2);
    }
    
    // Draw description
    ctx.fillStyle = '#000';
    ctx.font = '14px Courier Prime, monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    const description = pDescription.textContent;
    const lineHeight = 20 * 2;
    const maxWidth = canvas.width - (50 * 2);
    const startX = 25 * 2;
    
    // Wrap text manually
    const words = description.split(' ');
    let line = '';
    let lineY = yPosition;
    
    for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        
        if (testWidth > maxWidth && i > 0) {
            ctx.fillText(line, startX, lineY);
            line = words[i] + ' ';
            lineY += lineHeight;
        } else {
            line = testLine;
        }
    }
    
    if (line) {
        ctx.fillText(line, startX, lineY);
    }
    
    yPosition = lineY + (40 * 2);
    
    // Draw contact bar
    ctx.fillStyle = '#4f5f3a';
    ctx.fillRect(0, yPosition, canvas.width, 80 * 2);
    ctx.fillStyle = '#ffd800';
    ctx.font = '14px Oswald, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Any information, please contact:', canvas.width / 2, yPosition + (20 * 2));
    
    ctx.font = 'bold 14px Oswald, sans-serif';
    ctx.fillText(pContact.textContent, canvas.width / 2, yPosition + (40 * 2));
    
    ctx.font = 'bold 16px Oswald, sans-serif';
    ctx.fillText(`ATTENTION: ${pDetective.textContent}`, canvas.width / 2, yPosition + (60 * 2));
    
    yPosition += 80 * 2;
    
    // Draw footer
    ctx.fillStyle = '#000';
    ctx.fillRect(0, yPosition, canvas.width, 40 * 2);
    ctx.fillStyle = '#fff';
    ctx.font = '12px Share Tech Mono, monospace';
    ctx.textAlign = 'left';
    
    // Left: Date
    ctx.fillText(pDate.textContent, 25 * 2, yPosition + (20 * 2));
    
    // Center: APB
    ctx.textAlign = 'center';
    ctx.fillText('APB', canvas.width / 2, yPosition + (20 * 2));
    
    // Right: Created by SIB
    ctx.textAlign = 'right';
    ctx.fillText('Created by SIB', canvas.width - (25 * 2), yPosition + (20 * 2));
    
    return canvas;
}

// Helper function to load images
function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}

// Main function to generate APB Poster
async function generateAPBPoster() {
    // Show loading state
    const originalText = generateBtn.innerHTML;
    generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
    generateBtn.disabled = true;
    
    try {
        // Create the poster using Canvas
        const canvas = await createPosterWithCanvas();
        
        // Convert to blob and download
        canvas.toBlob((blob) => {
            const link = document.createElement('a');
            const fileName = `apb-poster-${new Date().getTime()}.png`;
            link.download = fileName;
            link.href = URL.createObjectURL(blob);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
            
            // Show success message
            successMessage.classList.add('visible');
        }, 'image/png');
        
    } catch (error) {
        console.error('Error generating poster:', error);
        
        // Try html2canvas as fallback
        try {
            alert('Using html2canvas fallback...');
            
            // Get the preview container
            const previewContainer = document.getElementById('apbPreview');
            
            const canvas = await html2canvas(previewContainer.querySelector('.apb-form'), {
                scale: 2,
                backgroundColor: '#eaeaea',
                logging: false,
                useCORS: true
            });
            
            const link = document.createElement('a');
            const fileName = `apb-poster-fallback-${new Date().getTime()}.png`;
            link.download = fileName;
            link.href = canvas.toDataURL('image/png');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            successMessage.classList.add('visible');
            
        } catch (fallbackError) {
            console.error('Fallback also failed:', fallbackError);
            alert('Error generating poster. Please try:\n\n1. Using Chrome browser\n2. Making sure Bulletin.png is in the same folder\n3. Trying without external mugshot images\n4. Checking browser console (F12) for errors');
        }
    } finally {
        // Reset button state
        generateBtn.innerHTML = originalText;
        generateBtn.disabled = false;
    }
}

// Download as PNG
downloadBtn.addEventListener('click', generateAPBPoster);
generateBtn.addEventListener('click', generateAPBPoster);

// Copy APB text
copyBtn.addEventListener('click', function() {
    const apbText = `${pWanted.textContent}\n${pCharge.textContent}\n\nSUSPECT: ${pName.textContent}\n\n${pDescription.textContent}\n\nAny information, please contact:\n${pContact.textContent}\nATTENTION: ${pDetective.textContent}\n\n${pDate.textContent} | APB | Created by SIB`;
    
    navigator.clipboard.writeText(apbText).then(() => {
        // Show temporary success indicator
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        copyBtn.style.backgroundColor = '#28a745';
        
        setTimeout(() => {
            copyBtn.innerHTML = originalText;
            copyBtn.style.backgroundColor = '';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
        alert('Failed to copy text to clipboard. Please try again.');
    });
});

// Reset form
resetBtn.addEventListener('click', function() {
    if (confirm('Are you sure you want to reset the form? All data will be lost.')) {
        wantedTextInput.value = 'WANTED';
        bulletinToggle.checked = true;
        chargeInput.value = 'FA 201. CAPITAL MURDER';
        suspectNameInput.value = 'CODY HASKINS';
        descriptionInput.value = 'Los Santos County Sheriff\'s Department\'s Homicide Bureau is seeking assistance in locating and apprehending Cody Haskins.\n\nCody Haskins is an individual wanted for two counts of capital murder, one which occurred on December 4, 2025 and the other on December 5, 2025 in early hours. Cody Haskins is believed to be ARMED AND DANGEROUS with a handgun which he used in both murders.\n\nHe was last seen wearing black sunglasses, blue surgical mask, grey hoodie, black gloves, black jacket, blue jeans and black shoes, riding a black bicycle in the area of Vespucci and Del Perro.\n\nIf spotted, do not approach alone. Notify the Homicide Bureau.';
        contactInput.value = 'HOMICIDE BUREAU • PH: 26771317';
        detectiveInput.value = 'Detective Stanley Strange';
        dateInput.value = 'Friday, December 5, 2025';
        mugshotUrlInput.value = '';
        mugshot.src = '';
        mugshot.style.display = 'none';
        
        updatePreview();
    }
});

// Close success modal
closeSuccess.addEventListener('click', function() {
    successMessage.classList.remove('visible');
});

// Dark mode toggle
function toggleDarkMode() {
    if (darkModeSwitch.checked) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
    }
}

// Check for saved theme preference
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    darkModeSwitch.checked = true;
    document.documentElement.setAttribute('data-theme', 'dark');
} else {
    document.documentElement.setAttribute('data-theme', 'light');
}

darkModeSwitch.addEventListener('change', toggleDarkMode);

// Initialize everything on page load
document.addEventListener('DOMContentLoaded', function() {
    // Setup event listeners first
    setupEventListeners();
    
    // Initialize preview
    updatePreview();
    
    // Set initial mugshot display
    mugshot.style.display = 'none';
    
    // Load bulletin image
    bulletinImage.src = 'Bulletin.png';
    bulletinImage.onerror = function() {
        console.warn('Bulletin.png not found');
    };
    
    console.log('APB Generator initialized successfully');
});
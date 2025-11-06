// Modal functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    // Find the video card that has the matching modal ID set in its onclick attribute
    let cardElement = document.querySelector(`.video-card[onclick*="${modalId}"]`);

    // If the card wasn't found (e.g., if the button was clicked), try finding the card via the button's parent
    if (!cardElement) {
        const button = document.querySelector(`button[onclick*="${modalId}"]`);
        if (button) {
            cardElement = button.closest('.video-card');
        }
    }

    const videoId = cardElement ? cardElement.getAttribute('data-video-id') : null;

    if (videoId) {
        // Inject the YouTube iframe with autoplay into the modal's video container
        const videoContainer = modal.querySelector(`#${modalId}-video`);
        if (videoContainer) {
            videoContainer.innerHTML = `
                <iframe
                    width="100%"
                    height="100%"
                    src="https://www.youtube.com/embed/${videoId}?autoplay=1"
                    title="Video Example"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen>
                </iframe>
            `;
        }
    }

    // Display the modal
    modal.style.display = 'block';
    modal.setAttribute('aria-hidden', 'false');

    // Focus trap: focus the close button
    const closeButton = modal.querySelector('.close');
    if (closeButton) {
        closeButton.focus();
    }

    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    // Stop video playback by clearing the container content
    const videoContainer = modal.querySelector(`#${modalId}-video`);
    if (videoContainer) {
        videoContainer.innerHTML = ''; // This unloads the iframe and stops the video
    }

    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');

    // Restore body scroll
    document.body.style.overflow = '';

    // Return focus to the element that opened the modal
    const triggerElement = document.querySelector(`.video-card[onclick*="${modalId}"]`);
    if (triggerElement) {
        triggerElement.focus();
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            closeModal(modal.id);
        }
    });
}

// Close modal on ESC key for accessibility
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' || event.key === 'Esc') {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (modal.style.display === 'block') {
                closeModal(modal.id);
            }
        });
    }
});

// Smooth scrolling for anchor links
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Add loading animation to buttons
    document.querySelectorAll('.product-button.live').forEach(button => {
        button.addEventListener('click', function() {
            // Only animate if it's an external link (not a modal trigger)
            if (this.tagName === 'A') {
                const originalText = this.innerHTML;
                this.innerHTML = '⏳ Opening Store...';
                setTimeout(() => {
                    this.innerHTML = originalText;
                }, 2000);
            }
        });
    });

    // Make video cards keyboard accessible
    document.querySelectorAll('.video-card').forEach(card => {
        // Make cards focusable
        card.setAttribute('tabindex', '0');

        // Add keyboard support
        card.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                // Extract modal ID from onclick attribute
                const onclickAttr = this.getAttribute('onclick');
                if (onclickAttr) {
                    const match = onclickAttr.match(/openModal\('([^']+)'\)/);
                    if (match && match[1]) {
                        openModal(match[1]);
                    }
                }
            }
        });
    });

    // Initialize Lead Magnet Popup
    initLeadMagnetPopup();
});

// ============================================
// LEAD MAGNET POPUP FUNCTIONS
// ============================================

// Cookie helper functions
function setCookie(name, value, days) {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = name + '=' + value + ';expires=' + expires.toUTCString() + ';path=/';
}

function getCookie(name) {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

// Open lead popup
function openLeadPopup() {
    const popup = document.getElementById('leadMagnetPopup');
    if (popup) {
        popup.classList.add('active');
        popup.style.display = 'block';
        popup.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        // Set cookie to prevent showing again for 7 days
        setCookie('leadPopupShown', 'true', 7);
    }
}

// Close lead popup
function closeLeadPopup() {
    const popup = document.getElementById('leadMagnetPopup');
    if (popup) {
        popup.classList.remove('active');
        popup.style.display = 'none';
        popup.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }
}

// Initialize popup triggers
function initLeadMagnetPopup() {
    // Check if popup was already shown
    if (getCookie('leadPopupShown') || getCookie('leadPopupSubmitted')) {
        return; // Don't show popup if already shown or submitted
    }

    let popupTriggered = false;

    // Trigger 1: Exit Intent (when mouse moves toward top of browser)
    document.addEventListener('mouseleave', function(e) {
        if (!popupTriggered && e.clientY < 10) {
            openLeadPopup();
            popupTriggered = true;
        }
    });

    // Trigger 2: Time delay (15 seconds after page load)
    setTimeout(function() {
        if (!popupTriggered && !getCookie('leadPopupShown')) {
            openLeadPopup();
            popupTriggered = true;
        }
    }, 15000); // 15 seconds

    // Trigger 3: Scroll depth (70% down the page)
    let scrollTriggered = false;
    window.addEventListener('scroll', function() {
        if (!popupTriggered && !scrollTriggered) {
            const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
            if (scrollPercent > 70) {
                openLeadPopup();
                popupTriggered = true;
                scrollTriggered = true;
            }
        }
    });

    // Close popup when clicking overlay
    const overlay = document.querySelector('.lead-popup-overlay');
    if (overlay) {
        overlay.addEventListener('click', closeLeadPopup);
    }

    // Close popup on ESC key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' || e.key === 'Esc') {
            const popup = document.getElementById('leadMagnetPopup');
            if (popup && popup.classList.contains('active')) {
                closeLeadPopup();
            }
        }
    });
}

// Handle form submission - INTEGRATE WITH CONSTANT CONTACT
function handleLeadSubmit(event) {
    event.preventDefault();

    const name = document.getElementById('leadName').value;
    const email = document.getElementById('leadEmail').value;

    // ============================================
    // CONSTANT CONTACT INTEGRATION
    // ============================================
    // Replace this URL with your Constant Contact form action URL
    const constantContactFormURL = 'YOUR_CONSTANT_CONTACT_FORM_URL_HERE';

    // Option 1: Direct form submission to Constant Contact
    // Uncomment and configure once you have your Constant Contact form URL:
    /*
    const formData = new FormData();
    formData.append('email', email);
    formData.append('first_name', name);

    fetch(constantContactFormURL, {
        method: 'POST',
        body: formData,
        mode: 'no-cors'
    }).then(() => {
        handleSuccessfulSubmission();
    }).catch((error) => {
        console.error('Error:', error);
        alert('There was an error. Please try again.');
    });
    */

    // Option 2: For now, show success message (replace with actual integration)
    handleSuccessfulSubmission();

    return false;
}

function handleSuccessfulSubmission() {
    // Set cookie to never show popup again after submission
    setCookie('leadPopupSubmitted', 'true', 365);

    // Show success message
    const popupContent = document.querySelector('.lead-popup-content');
    if (popupContent) {
        popupContent.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <div style="font-size: 5rem; margin-bottom: 1rem;">🎉</div>
                <h2 style="color: #4ecdc4; font-size: 2rem; margin-bottom: 1rem;">Success!</h2>
                <p style="font-size: 1.2rem; color: #e0e0e0; margin-bottom: 2rem;">
                    Check your email for your <strong>50 FREE AI Video Prompts!</strong>
                </p>
                <p style="color: #999; font-size: 0.9rem;">
                    (Don't forget to check your spam folder)
                </p>
                <button onclick="closeLeadPopup()" class="lead-popup-button" style="margin-top: 2rem;">
                    CLOSE
                </button>
            </div>
        `;
    }

    // Close popup after 5 seconds
    setTimeout(closeLeadPopup, 5000);
}

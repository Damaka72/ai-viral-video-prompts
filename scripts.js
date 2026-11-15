// ============================================
// INLINE VIDEO PLAYERS (click thumbnail to play in place)
// ============================================
const thumbnailOriginals = new WeakMap();

function resetInlinePlayer(thumb) {
    const original = thumbnailOriginals.get(thumb);
    if (original !== undefined) {
        thumb.innerHTML = original;
        thumb.classList.remove('playing');
        thumb.setAttribute('role', 'button');
        thumb.setAttribute('tabindex', '0');
        thumbnailOriginals.delete(thumb);
    }
}

function resetAllInlinePlayers(except) {
    document.querySelectorAll('.video-thumbnail.playing').forEach(t => {
        if (t !== except) resetInlinePlayer(t);
    });
}

function playInline(thumb) {
    if (thumb.classList.contains('playing')) return;
    const card = thumb.closest('.video-card');
    const videoId = card && card.getAttribute('data-video-id');
    if (!videoId) return;

    // Only one video plays at a time
    resetAllInlinePlayers(thumb);

    thumbnailOriginals.set(thumb, thumb.innerHTML);
    thumb.classList.add('playing');
    thumb.removeAttribute('role');
    thumb.removeAttribute('tabindex');

    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube.com/embed/${encodeURIComponent(videoId)}?autoplay=1&rel=0`;
    iframe.title = thumb.getAttribute('aria-label') || 'Video example';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    iframe.setAttribute('frameborder', '0');
    thumb.innerHTML = '';
    thumb.appendChild(iframe);
}

// Modal functions (the modal now shows the exact prompt; video plays in the card)
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    // Stop any inline video so audio doesn't play behind the modal
    resetAllInlinePlayers();

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

    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');

    // Restore body scroll
    document.body.style.overflow = '';

    // Return focus to the button that opened the modal
    const triggerElement = document.querySelector(`.prompt-button[onclick*="${modalId}"]`);
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

    // Inline video players: click or Enter/Space on a thumbnail plays it in place
    document.querySelectorAll('.video-thumbnail').forEach(thumb => {
        thumb.addEventListener('click', () => playInline(thumb));
        thumb.addEventListener('keydown', e => {
            if (e.target === thumb && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                playInline(thumb);
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
        console.log('Lead popup already shown - skipping');
        return; // Don't show popup if already shown or submitted
    }

    console.log('Lead popup initialized - will show in 15 seconds or on scroll/exit');
    let popupTriggered = false;

    // Trigger 1: Exit Intent (when mouse moves toward top of browser)
    document.addEventListener('mouseleave', function(e) {
        if (!popupTriggered && e.clientY < 10) {
            console.log('Exit intent detected - showing popup');
            openLeadPopup();
            popupTriggered = true;
        }
    });

    // Trigger 2: Time delay (15 seconds after page load)
    setTimeout(function() {
        if (!popupTriggered && !getCookie('leadPopupShown')) {
            console.log('Time trigger - showing popup after 15 seconds');
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
                console.log('Scroll depth 70% reached - showing popup');
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

// Handle form submission - BEEHIIV INTEGRATION
function handleLeadSubmit(event) {
    event.preventDefault();

    const email = document.getElementById('leadEmail').value;
    const firstName = document.getElementById('leadFirstName').value;
    const lastName = document.getElementById('leadLastName').value;

    if (!email || !firstName || !lastName) {
        alert('Please fill in all fields.');
        return false;
    }

    const submitButton = document.querySelector('.lead-popup-button');
    const originalButtonText = submitButton.innerHTML;
    submitButton.innerHTML = '⏳ SUBMITTING...';
    submitButton.disabled = true;

    fetch('https://mvttihozhozigtrwqsyy.supabase.co/functions/v1/beehiiv-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, first_name: firstName, last_name: lastName }),
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
        if (data.data && data.data.id) {
            handleSuccessfulSubmission();
        } else {
            throw new Error(data.message || data.error || 'Subscription failed.');
        }
    })
    .catch(function() {
        alert('Something went wrong. Please try again.');
        submitButton.innerHTML = originalButtonText;
        submitButton.disabled = false;
    });

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

// ============================================
// TESTING FUNCTIONS (for manual testing)
// ============================================

// Clear popup cookies to test again
window.testResetPopup = function() {
    document.cookie = 'leadPopupShown=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'leadPopupSubmitted=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    console.log('✅ Popup cookies cleared! Reload the page to test again.');
};

// Manually trigger the popup (ignores cookies)
window.testShowPopup = function() {
    console.log('🎯 Manually triggering popup...');
    openLeadPopup();
};

// Check popup status
window.testPopupStatus = function() {
    const shown = getCookie('leadPopupShown');
    const submitted = getCookie('leadPopupSubmitted');
    console.log('📊 Popup Status:');
    console.log('- Already shown:', shown ? 'YES' : 'NO');
    console.log('- Already submitted:', submitted ? 'YES' : 'NO');
    console.log('\nTo reset and test again, run: testResetPopup()');
    console.log('To show popup immediately, run: testShowPopup()');
};

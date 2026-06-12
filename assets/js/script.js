/* 
    Maulik Vora Portfolio - Core Interactivity
    Focus: Smooth Animations, Performance, and Premium UX
*/

document.addEventListener('DOMContentLoaded', () => {
    "use strict";

    // 1. Enhanced Custom Cursor with Performance Optimization
    const cursor = document.querySelector('.cursor');
    const follower = document.querySelector('.cursor-follower');
    
    if (cursor && follower) {
        let mouseX = 0, mouseY = 0;
        let posX = 0, posY = 0;
        let followerX = 0, followerY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            // Immediate response for the main cursor dot
            cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
        });

        const animateFollower = () => {
            // Smooth interpolation (lerp)
            followerX += (mouseX - followerX) / 10;
            followerY += (mouseY - followerY) / 10;

            follower.style.transform = `translate3d(${followerX - 20}px, ${followerY - 20}px, 0)`;
            requestAnimationFrame(animateFollower);
        };
        animateFollower();

        // Cursor Interaction States
        const interactiveSelectors = 'a, button, .project-card, .skill-tag, .menu-btn, .resume-btn';
        const addHoverClass = () => follower.classList.add('hovering');
        const removeHoverClass = () => follower.classList.remove('hovering');

        const updateInteractions = () => {
            document.querySelectorAll(interactiveSelectors).forEach(el => {
                el.removeEventListener('mouseenter', addHoverClass);
                el.removeEventListener('mouseleave', removeHoverClass);
                el.addEventListener('mouseenter', addHoverClass);
                el.addEventListener('mouseleave', removeHoverClass);
            });
        };
        updateInteractions();
        
        // Re-run if content changes dynamically
        const observer = new MutationObserver(updateInteractions);
        observer.observe(document.body, { childList: true, subtree: true });
    }

    // 2. Optimized Intersection Observer for Scroll Reveals
    const revealOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -100px 0px"
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // stop observing once revealed for performance
                revealObserver.unobserve(entry.target);
            }
        });
    }, revealOptions);

    document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
        revealObserver.observe(el);
    });

    // 3. Header Dynamics
    const navbar = document.getElementById('navbar');
    const handleScroll = () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // 4. Navigation Logic & Smooth Scrolling
    const navLinks = document.querySelectorAll('.nav-links a');
    const sections = document.querySelectorAll('section[id]');

    const spyScroll = () => {
        const scrollY = window.pageYOffset;

        sections.forEach(current => {
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop - 150;
            const sectionId = current.getAttribute('id');

            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                document.querySelector(`.nav-links a[href*=${sectionId}]`)?.classList.add('active');
            } else {
                document.querySelector(`.nav-links a[href*=${sectionId}]`)?.classList.remove('active');
            }
        });
    };
    window.addEventListener('scroll', spyScroll, { passive: true });

    // 5. Mobile Menu Interaction
    const menuBtn = document.getElementById('mobile-menu');
    const navLinksContainer = document.querySelector('.nav-links');

    if (menuBtn && navLinksContainer) {
        const toggleMenu = () => {
            menuBtn.classList.toggle('open');
            navLinksContainer.classList.toggle('open');
            document.body.style.overflow = navLinksContainer.classList.contains('open') ? 'hidden' : '';
        };

        menuBtn.addEventListener('click', toggleMenu);

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                menuBtn.classList.remove('open');
                navLinksContainer.classList.remove('open');
                document.body.style.overflow = '';
            });
        });
    }

    // 6. Project Card Parallax (Subtle)
    document.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0) rotateY(0) translateY(0)`;
        });
    });

    // 7.1 Toast Notification Function
    const showToast = (message) => {
        let toastContainer = document.querySelector('.toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container';
            document.body.appendChild(toastContainer);
        }

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<i class="fas fa-check-circle"></i> <span>${message}</span>`;
        
        toastContainer.appendChild(toast);

        // Slide in
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);

        // Dismiss sequence
        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => {
                toast.remove();
            }, 400);
        }, 4000);
    };

    // 7. Contact Form Integration
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = contactForm.querySelector('button');
            const originalHTML = submitBtn.innerHTML;

            const nameInput = contactForm.querySelector('input[type="text"]');
            const emailInput = contactForm.querySelector('input[type="email"]');
            const messageInput = contactForm.querySelector('textarea');

            if (!nameInput || !emailInput || !messageInput) return;

            const payload = {
                name: nameInput.value.trim(),
                email: emailInput.value.trim(),
                message: messageInput.value.trim()
            };

            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Negotiating with server... <i class="fas fa-spinner fa-spin"></i>';

            try {
                const hostname = window.location.hostname;
                const apiUrl = (hostname === 'localhost' || hostname === '127.0.0.1')
                    ? 'http://localhost:3000/api/contact'
                    : '/api/contact';

                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    submitBtn.style.background = 'var(--accent-color)';
                    submitBtn.innerHTML = 'Connection Established! <i class="fas fa-check"></i>';
                    contactForm.reset();
                    showToast('Message sent successfully! 🚀'); // Show green toast
                } else {
                    submitBtn.style.background = '#e74c3c'; // Elegant red for error state
                    submitBtn.innerHTML = `${data.error || 'Submission Failed!'} <i class="fas fa-exclamation-triangle"></i>`;
                }
            } catch (err) {
                console.error('Submission error:', err);
                submitBtn.style.background = '#e74c3c';
                submitBtn.innerHTML = 'Connection Failed! <i class="fas fa-wifi"></i>';
            }

            setTimeout(() => {
                submitBtn.style.background = '';
                submitBtn.innerHTML = originalHTML;
                submitBtn.disabled = false;
            }, 4000);
        });
    }
    // 8. Typing Animation for Hero Section
    const typingText = document.getElementById("typing-text");
    if (typingText) {
        const words = ["Digital", "Creative", "Frontend", "High-End"];
        let wordIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        
        const typeEffect = () => {
            const currentWord = words[wordIndex];
            
            if (isDeleting) {
                typingText.textContent = currentWord.substring(0, charIndex - 1);
                charIndex--;
            } else {
                typingText.textContent = currentWord.substring(0, charIndex + 1);
                charIndex++;
            }
            
            let typeSpeed = isDeleting ? 50 : 100;
            
            if (!isDeleting && charIndex === currentWord.length) {
                typeSpeed = 1500; // Pause at the end
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                wordIndex = (wordIndex + 1) % words.length;
                typeSpeed = 500; // Pause before starting new word
            }
            
            setTimeout(typeEffect, typeSpeed);
        };
        
        setTimeout(typeEffect, 1000); // Initial delay
    }
});

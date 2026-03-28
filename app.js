// ============================================================
// MIPLACE MAGAZINE — app.js
// Entrada principal: dados, inicialização e efeitos visuais
// Módulos: modules/ui.js, modules/catalog.js, modules/modal.js
// ============================================================

var productsData = [];
var brands = ['Todos', 'Realme', 'Honor', 'Motorola', 'Redmi', 'Poco', 'iPhone'];

async function loadPrecosFromJSON() {
    try {
        const response = await fetch('produtos.json?v=' + Date.now());
        if (!response.ok) throw new Error('Falha ao carregar produtos.json');
        productsData = await response.json();
    } catch (err) {
        console.error('[Miplace] Erro ao carregar produtos.json:', err.message);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    if (typeof injectSchemaOrg === 'function') injectSchemaOrg();
    await loadPrecosFromJSON();
    renderFilters();
    renderProducts();
    if (typeof startGridCarousel === 'function') startGridCarousel();
    renderContactDropdown('contato-dropdown-content');
    renderStoreCards('stores-grid');
    document.querySelectorAll('#stores-grid .reveal').forEach(el => el.classList.add('active'));
    initScrollReveal();
    initSearch();
    initModal();

    // Click outside dropdown
    document.addEventListener('click', (e) => {
        const container = document.querySelector('.dropdown-container');
        if (container && !container.contains(e.target)) {
            const menu = document.getElementById('contato-menu');
            const icon = document.getElementById('contato-icon');
            if (menu && !menu.classList.contains('opacity-0')) {
                menu.classList.add('opacity-0', 'invisible');
                menu.classList.remove('opacity-100', 'visible');
                if (icon) icon.style.transform = 'scale(1)';
            }
        }
    });

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('[PWA] Service Worker registrado:', reg.scope))
            .catch(err => console.warn('[PWA] Falha:', err));
    }

    const backToTop = document.getElementById('back-to-top');
    let scrollTicking = false;
    window.addEventListener('scroll', () => {
        if (!scrollTicking) {
            requestAnimationFrame(() => {
                const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
                const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
                const scrolled = (winScroll / height) * 100;
                const progressBar = document.getElementById('scroll-progress');
                if (progressBar) progressBar.style.width = scrolled + '%';
                if (backToTop) {
                    backToTop.style.opacity = winScroll > 400 ? '1' : '0';
                    backToTop.style.pointerEvents = winScroll > 400 ? 'auto' : 'none';
                }
                scrollTicking = false;
            });
            scrollTicking = true;
        }
    }, { passive: true });

    const bgMusic = document.getElementById('bg-music');
    const audioControl = document.getElementById('audio-control');
    const audioIcon = document.getElementById('audio-icon');
    let isMusicPlaying = false;

    function toggleMusic() {
        const pulse = document.getElementById('audio-pulse');
        if (isMusicPlaying) {
            bgMusic.pause();
            audioIcon.classList.remove('fa-compact-disc', 'animate-spin-slow');
            audioIcon.classList.add('fa-music');
            if (pulse) pulse.classList.remove('hidden');
            isMusicPlaying = false;
        } else {
            bgMusic.volume = 0.05;
            bgMusic.play().then(() => {
                audioIcon.classList.remove('fa-music');
                audioIcon.classList.add('fa-compact-disc', 'animate-spin-slow');
                if (pulse) pulse.classList.add('hidden');
                isMusicPlaying = true;
            }).catch(err => console.log('Autoplay bloqueado pelo navegador:', err));
        }
    }

    audioControl.addEventListener('click', (e) => { e.stopPropagation(); toggleMusic(); });
    document.body.addEventListener('click', function firstInteraction(e) {
        if (audioControl.contains(e.target)) return;
        if (!isMusicPlaying) toggleMusic();
    }, { once: true });

    // ============================================================
    // EFEITOS VISUAIS
    // ============================================================

    // Split text no título h1
    const h1 = document.querySelector('h1.font-serif');
    if (h1) {
        const text = h1.textContent.trim();
        h1.innerHTML = text.split('').map((ch, i) =>
            ch === ' '
                ? ' '
                : `<span class="split-letter" style="animation-delay:${i * 0.06}s">${ch}</span>`
        ).join('');
    }

    // Parallax no hero ao mover o mouse
    const heroParallax = document.getElementById('hero-parallax');
    if (heroParallax) {
        document.addEventListener('mousemove', e => {
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
            const rect = heroParallax.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top  + rect.height / 2;
            const dx = (e.clientX - cx) / window.innerWidth;
            const dy = (e.clientY - cy) / window.innerHeight;
            heroParallax.style.transform = `translate(${dx * 12}px, ${dy * 8}px)`;
        }, { passive: true });
    }

    // Magnetic hover nos links de navegação desktop
    document.querySelectorAll('nav .hidden.md\\:flex a').forEach(link => {
        link.classList.add('magnetic-link');
        link.addEventListener('mousemove', e => {
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
            const rect = link.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width  / 2;
            const y = e.clientY - rect.top  - rect.height / 2;
            link.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
        });
        link.addEventListener('mouseleave', () => {
            link.style.transform = 'translate(0,0)';
        });
    });

    // Ripple ao clicar nos cards de produto
    document.getElementById('products-grid').addEventListener('click', e => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const card = e.target.closest('.img-zoom-container');
        if (!card) return;
        const rect = card.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const ripple = document.createElement('span');
        ripple.className = 'ripple-effect';
        ripple.style.cssText = `
            width: ${size}px; height: ${size}px;
            left: ${e.clientX - rect.left - size/2}px;
            top:  ${e.clientY - rect.top  - size/2}px;
        `;
        card.appendChild(ripple);
        ripple.addEventListener('animationend', () => ripple.remove());
    });

    // Shimmer nos cards ao renderizar
    function addShimmerToCards() {
        document.querySelectorAll('#products-grid .img-zoom-container').forEach(el => {
            el.classList.add('card-shimmer');
        });
    }
    const gridObserver = new MutationObserver(addShimmerToCards);
    gridObserver.observe(document.getElementById('products-grid'), { childList: true });
    addShimmerToCards();

    // Contador animado (count-up)
    function animateCountUp(el) {
        const target   = parseInt(el.getAttribute('data-target'));
        const suffix   = el.getAttribute('data-suffix') || '';
        const duration = 1800;
        const start    = performance.now();
        function step(now) {
            const progress = Math.min((now - start) / duration, 1);
            const eased    = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.floor(eased * target) + suffix;
            if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }
    const countObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCountUp(entry.target);
                countObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    document.querySelectorAll('.count-up').forEach(el => countObserver.observe(el));

    // Fallback para erros de imagem
    document.addEventListener('error', function(e) {
        if (e.target.tagName && e.target.tagName.toLowerCase() === 'img') {
            const img = e.target;
            if (img.src.startsWith('data:') || !img.getAttribute('src')) return;
            if (!img.dataset.originalSrc) img.dataset.originalSrc = img.getAttribute('src');
            const originalSrc = img.dataset.originalSrc;
            if (!img.dataset.fallback) { img.dataset.fallback = 'lower'; img.src = originalSrc.toLowerCase(); }
            else if (img.dataset.fallback === 'lower') { img.dataset.fallback = 'jpg'; img.src = originalSrc.toLowerCase().replace('.png', '.jpg'); }
            else if (img.dataset.fallback === 'jpg') { img.dataset.fallback = 'upper'; img.src = originalSrc.replace('.png', '.PNG').replace('.jpg', '.JPG'); }
        }
    }, true);
});

// ============================================================
// MIPLACE MAGAZINE — catalog.js
// Catálogo: filtros, busca, renderização de produtos, carrossel
// ============================================================

var currentFilter = 'Todos';
var currentSearch = '';
var gridCarouselInterval;
var kbToggle = false;

function renderFilters() {
    const container = document.getElementById('category-filters');
    container.innerHTML = brands.map(brand => `
        <button onclick="setFilter('${brand}')" class="relative pb-1 transition-colors" style="color:${currentFilter === brand ? '#1c1917' : '#44403c'}; ${currentFilter === brand ? 'border-bottom: 2px solid #1c1917;' : ''}">
            ${brand}
        </button>
    `).join('');
}

function initSearch() {
    const input = document.getElementById('search-input');
    const clearBtn = document.getElementById('search-clear');
    const searchIcon = document.getElementById('search-icon');
    if (!input) return;

    const debouncedSearch = debounce(() => {
        currentSearch = input.value.trim().toLowerCase();
        if (currentSearch.length > 0) {
            clearBtn.classList.remove('hidden');
            searchIcon.classList.add('hidden');
        } else {
            clearBtn.classList.add('hidden');
            searchIcon.classList.remove('hidden');
        }
        renderProducts();
        if (typeof startGridCarousel === 'function') startGridCarousel();
    }, 200);

    input.addEventListener('input', debouncedSearch);
}

window.clearSearch = () => {
    const input = document.getElementById('search-input');
    const clearBtn = document.getElementById('search-clear');
    const searchIcon = document.getElementById('search-icon');
    if (input) input.value = '';
    currentSearch = '';
    clearBtn.classList.add('hidden');
    searchIcon.classList.remove('hidden');
    renderProducts();
    if (typeof startGridCarousel === 'function') startGridCarousel();
};

function renderProducts() {
    const container = document.getElementById('products-grid');
    const searchCount = document.getElementById('search-count');
    let filtered = currentFilter === 'Todos' ? productsData : productsData.filter(p => p.brand === currentFilter);
    if (currentSearch.length > 0) {
        filtered = filtered.filter(p => {
            const searchableText = [p.name, p.brand, p.description || '', ...(p.specs || []).map(s => s.value), p.price || ''].join(' ').toLowerCase();
            return searchableText.includes(currentSearch);
        });
    }
    if (searchCount) {
        searchCount.textContent = currentSearch.length > 0 ? `${filtered.length} resultado${filtered.length !== 1 ? 's' : ''} encontrado${filtered.length !== 1 ? 's' : ''}` : '';
    }
    if (filtered.length === 0) { container.innerHTML = renderEmptyState(currentSearch.length > 0 ? `"${currentSearch}"` : currentFilter); return; }
    container.innerHTML = filtered.map((p, index) => {
        const isFeatured = index === 0;
        const gridClass = isFeatured ? "md:col-span-2 lg:col-span-2 pb-8 md:pb-0 md:pr-8" : "pb-8";
        const titleSize = isFeatured ? "text-4xl md:text-5xl" : "text-2xl";
        const imageContent = p.gallery && p.gallery.length > 1
            ? `<img src="${p.image}" alt="${p.name}" loading="lazy" class="w-full h-full object-cover img-zoom transition-opacity duration-500 grid-gallery-img" data-product-id="${p.id}" data-current-idx="0">`
            : (p.image ? `<img src="${p.image}" alt="${p.name}" loading="lazy" class="w-full h-full object-cover img-zoom">` : `<i class="fa-solid fa-mobile-screen text-5xl img-zoom" style="color:rgba(28,25,23,0.2);"></i>`);
        const microSpecs = p.specs && p.specs.length > 0 ? p.specs.slice(0, 2).map(s => s.value.split(' ')[0] + ' ' + (s.value.split(' ')[1] || '')).join(' • ') : '';
        return `
        <div class="${gridClass} group flex flex-col justify-between h-full stagger-item" style="border-bottom:1px solid rgba(28,25,23,0.2); animation-delay: ${index * 0.05}s;">
            <div>
                <div class="w-full aspect-video flex items-center justify-center mb-6 img-zoom-container relative cursor-pointer" style="background-color:#eaeaeb;" onclick="openModal(${p.id})">
                    ${p.highlight ? '<span class="absolute top-4 left-4 text-[10px] uppercase tracking-widest px-3 py-1.5 z-10" style="background-color:#1c1917;color:#f4f4f0;">Destaque</span>' : ''}
                    <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500 z-20 flex items-center justify-center" style="background-color:rgba(28,25,23,0.3); backdrop-filter:blur(2px);">
                        <span class="font-sans uppercase tracking-[0.2em] text-xs font-bold px-6 py-3 transform translate-y-4 group-hover:translate-y-0 duration-500" style="color:#f4f4f0; border:1px solid #f4f4f0;">Ver Detalhes</span>
                    </div>
                    ${imageContent}
                </div>
                <div class="flex justify-between items-end mb-3 pb-2" style="border-bottom:1px solid rgba(28,25,23,0.1);">
                    <span class="font-sans text-[10px] font-bold uppercase tracking-[0.2em]" style="color:#44403c;">${p.brand}</span>
                    <span class="font-sans text-[9px] uppercase tracking-widest" style="color:#57534e;">Ref. ${String(p.id).padStart(3, '0')}</span>
                </div>
                <h4 class="font-serif ${titleSize} leading-none tracking-tight mb-2" style="color:#1c1917;">${p.name}</h4>
                ${microSpecs ? `<p class="font-sans text-[10px] uppercase tracking-[0.15em] truncate" style="color:#57534e;">${microSpecs}</p>` : ''}
            </div>
            <div class="mt-6 flex items-end justify-between pt-4" style="border-top:1px solid rgba(28,25,23,0.1);">
                <div class="font-sans text-sm">
                    ${p.specialPrice
                        ? `<span class="font-bold" style="color:#1c1917;">${p.specialPrice}</span>`
                        : p.price
                            ? `<span class="block text-[10px] uppercase tracking-widest mb-1" style="color:#44403c;">A partir de</span><span class="font-bold text-base leading-tight block" style="color:#1c1917;">${p.price.replace('A partir de ', '')}</span>`
                            : `<span class="block text-[10px] uppercase tracking-widest mb-1" style="color:#44403c;">Entre em Contato</span><span class="font-bold text-xs leading-tight block" style="color:#1c1917;">Confirmar disponibilidade</span>`
                    }
                </div>
                <button onclick="openModal(${p.id})" aria-label="Ver detalhes de ${p.name}" class="w-8 h-8 flex items-center justify-center rounded-full transition-all duration-300" style="border:1px solid rgba(28,25,23,0.3); color:#1c1917;" title="Ver detalhes">
                    <i class="fa-solid fa-arrow-right text-[10px]"></i>
                </button>
            </div>
        </div>`;
    }).join('');
}

function renderEmptyState(term) {
    return `<div class="col-span-full flex flex-col items-center justify-center py-24 text-center">
        <i class="fa-solid fa-magnifying-glass text-4xl mb-6" style="color:rgba(28,25,23,0.2);"></i>
        <h3 class="font-serif text-3xl mb-3" style="color:#1c1917;">Nenhum produto encontrado</h3>
        <p class="font-sans text-sm mb-8" style="color:#44403c;">Não há produtos para <strong>${term}</strong> no momento.</p>
        <button onclick="setFilter('Todos');clearSearch();" class="font-sans uppercase tracking-widest text-xs font-bold px-8 py-3 btn-hover-ink-border">
            Ver todos os produtos
        </button>
    </div>`;
}

window.setFilter = (brand) => {
    currentFilter = brand;
    trackEvent('filter_brand', { brand_name: brand });
    renderFilters();
    const grid = document.getElementById('products-grid');
    grid.innerHTML = Array.from({ length: 6 }).map(() => `
        <div class="pb-8 flex flex-col gap-4" style="border-bottom:1px solid rgba(28,25,23,0.2);">
            <div class="w-full aspect-video rounded animate-pulse" style="background-color:#eaeaeb;"></div>
            <div class="h-3 rounded w-1/3 animate-pulse" style="background-color:#eaeaeb;"></div>
            <div class="h-6 rounded w-3/4 animate-pulse" style="background-color:#eaeaeb;"></div>
            <div class="h-3 rounded w-1/2 animate-pulse" style="background-color:#eaeaeb;"></div>
        </div>`).join('');
    setTimeout(() => { renderProducts(); if (typeof startGridCarousel === 'function') startGridCarousel(); }, 350);
};

function transitionCard(img, delay) {
    const productId = parseInt(img.getAttribute('data-product-id'));
    const product = productsData.find(p => p.id === productId);
    if (!product || !product.gallery || product.gallery.length <= 1) return;
    if (img.closest('.group') && img.closest('.group').matches(':hover')) return;
    const currentIdx = parseInt(img.getAttribute('data-current-idx') || '0');
    let randomIdx;
    do { randomIdx = Math.floor(Math.random() * product.gallery.length); }
    while (randomIdx === currentIdx && product.gallery.length > 1);
    setTimeout(() => {
        img.style.opacity = '0';
        img.style.transform = 'scale(1.0) translate(0,0)';
        img.style.transition = 'opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), transform 0.8s ease';
        setTimeout(() => {
            delete img.dataset.fallback; delete img.dataset.originalSrc;
            img.src = product.gallery[randomIdx];
            img.setAttribute('data-current-idx', randomIdx);
            img.style.transition = 'opacity 0.9s cubic-bezier(0.4, 0, 0.2, 1), transform 8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            img.style.opacity = '1';
            const kbClass = kbToggle ? 'kb-active' : 'kb-alt';
            img.classList.remove('kb-active', 'kb-alt');
            void img.offsetWidth;
            img.classList.add(kbClass);
        }, 850);
    }, delay);
}

window.startGridCarousel = () => {
    if (gridCarouselInterval) clearInterval(gridCarouselInterval);
    document.querySelectorAll('.grid-gallery-img').forEach((img, i) => { img.classList.add(i % 2 === 0 ? 'kb-active' : 'kb-alt'); });
    gridCarouselInterval = setInterval(() => {
        const allImages = Array.from(document.querySelectorAll('.grid-gallery-img'));
        if (allImages.length === 0) return;
        kbToggle = !kbToggle;
        const shuffled = allImages.sort(() => 0.5 - Math.random());
        shuffled.slice(0, Math.min(15, shuffled.length)).forEach((img, i) => transitionCard(img, i * (300 + Math.random() * 400)));
    }, 7000);
};

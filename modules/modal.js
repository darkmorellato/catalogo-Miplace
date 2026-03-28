// ============================================================
// MIPLACE MAGAZINE — modal.js
// Modal de produto, lightbox e navegação de imagens
// ============================================================

var lightboxImages = [];
var lightboxCurrentIdx = 0;
var touchStartX = 0;

window.openModal = (id) => {
    playUIClick();
    const product = productsData.find(p => p.id === id);
    if (!product) return;
    document.title = `${product.name} | Miplace Magazine`;
    trackEvent('view_item', { item_id: String(product.id), item_name: product.name, item_brand: product.brand });
    const modal = document.getElementById('product-modal');
    const container = document.getElementById('modal-container');
    const content = document.getElementById('modal-content');
    const galleryImages = product.gallery && product.gallery.length > 0 ? product.gallery : (product.image ? [product.image] : []);
    const productNameEncoded = encodeURIComponent('Olá! Gostaria de saber mais sobre o ' + product.name + '.');

    const galleryHTML = galleryImages.length > 0
        ? `<div class="w-full flex flex-col gap-3 p-3">${galleryImages.map((img, i) => `<div class="w-full aspect-video rounded overflow-hidden relative cursor-zoom-in group transition-all duration-300" style="background-color:#f4f4f0; border:1px solid rgba(28,25,23,0.1);" onclick="openLightbox('${img}', ${i})" title="Clique para ampliar"><img src="${img}" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"><div class="absolute inset-0 flex items-end justify-center pb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style="background-color:rgba(28,25,23,0.1);"><span class="text-[9px] font-sans uppercase tracking-widest px-2 py-1 rounded" style="background-color:#1c1917; color:#f4f4f0;">Ampliar</span></div></div>`).join('')}</div>`
        : `<div class="w-full flex items-center justify-center h-full"><i class="fa-solid fa-mobile-screen text-8xl" style="color:rgba(28,25,23,0.2);"></i></div>`;

    const specsHTML = product.specs && product.specs.length > 0
        ? `<div class="mt-8 pt-6" style="border-top:1px solid #1c1917;"><h4 class="font-sans text-xs uppercase tracking-[0.2em] font-bold mb-4" style="color:#1c1917;">Ficha Técnica</h4><div class="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-sm font-sans">${product.specs.map(spec => `<div class="pb-2" style="border-bottom:1px solid rgba(28,25,23,0.1);"><span class="block text-[10px] uppercase tracking-widest" style="color:#44403c;">${spec.label}</span><span class="font-medium" style="color:#1c1917;">${spec.value}</span></div>`).join('')}</div></div>` : '';

    const highlightsHTML = product.highlights && product.highlights.length > 0
        ? `<div class="mt-8"><h4 class="font-sans text-xs uppercase tracking-[0.2em] font-bold mb-4" style="color:#1c1917;">Destaques</h4><ul class="space-y-4">${product.highlights.map(h => `<li class="font-sans text-sm"><strong class="block mb-1" style="color:#1c1917;">${h.title}</strong><span class="leading-relaxed" style="color:#44403c;">${h.text}</span></li>`).join('')}</ul></div>` : '';

    const contactsHTML = `
        <div id="contacts-pira" style="display:none; background-color:#f4f4f0; color:#1c1917;" class="absolute bottom-full left-0 w-full mb-4 flex-col gap-4 animate-fade-in p-6 border z-50 max-h-[50vh] overflow-y-auto">
            <div class="flex justify-between items-center mb-2 pb-2" style="border-bottom:1px solid rgba(28,25,23,0.2);">
                <span class="font-sans text-[10px] font-bold uppercase tracking-widest" style="color:#44403c;">Lojas em Piracicaba</span>
                <button onclick="document.getElementById('contacts-pira').style.display='none'" style="color:#1c1917;" title="Fechar" aria-label="Fechar lojas de Piracicaba"><i class="fa-solid fa-xmark"></i></button>
            </div>
            ${[['Miplace XV de Novembro','5519989605504','R.+Quinze+de+Novembro,+910','R. Quinze de Novembro, 910 - Centro'],['Miplace Honor','5519994975131','R.+Dom+Pedro+II,+857','R. Dom Pedro II, 857 - Centro'],['Miplace Realme','5519994510123','R.+Benjamin+Constant,+1230','R. Benjamin Constant, 1230 - Centro']].map(([nome,tel,maps,end]) => `
            <div class="p-4" style="background-color:#eaeaeb; border-left:4px solid #1c1917;">
                <h5 class="font-serif font-bold text-lg mb-2" style="color:#1c1917;">${nome}</h5>
                <div class="flex flex-col gap-2">
                    <a href="https://wa.me/${tel}?text=${productNameEncoded}" target="_blank" rel="noopener noreferrer" class="text-sm font-sans font-bold flex items-center gap-2 w-max link-whatsapp" style="color:#1c1917;"><i class="fa-brands fa-whatsapp text-lg"></i> (${tel.slice(2,4)}) ${tel.slice(4,9)}-${tel.slice(9)}</a>
                    <a href="https://maps.google.com/?q=${maps}+-+Centro,+Piracicaba+-+SP" target="_blank" rel="noopener noreferrer" class="text-xs font-sans flex items-center gap-2 w-max link-maps" style="color:#44403c;"><i class="fa-solid fa-map-location-dot text-base"></i> ${end}</a>
                </div>
            </div>`).join('')}
        </div>
        <div id="contacts-amp" style="display:none; background-color:#f4f4f0; color:#1c1917;" class="absolute bottom-full left-0 w-full mb-4 flex-col gap-4 animate-fade-in p-6 border z-50 max-h-[50vh] overflow-y-auto">
            <div class="flex justify-between items-center mb-2 pb-2" style="border-bottom:1px solid rgba(28,25,23,0.2);">
                <span class="font-sans text-[10px] font-bold uppercase tracking-widest" style="color:#44403c;">Lojas em Amparo</span>
                <button onclick="document.getElementById('contacts-amp').style.display='none'" style="color:#1c1917;" title="Fechar" aria-label="Fechar lojas de Amparo"><i class="fa-solid fa-xmark"></i></button>
            </div>
            ${[['Miplace Kassouf','5519971077066','R.+Treze+de+Maio,+218','R. Treze de Maio, 218 - sala 09 - Centro'],['Miplace Premium','5519999618865','R.+Treze+de+Maio,+26','R. Treze de Maio, 26 - Centro']].map(([nome,tel,maps,end]) => `
            <div class="p-4" style="background-color:#eaeaeb; border-left:4px solid #1c1917;">
                <h5 class="font-serif font-bold text-lg mb-2" style="color:#1c1917;">${nome}</h5>
                <div class="flex flex-col gap-2">
                    <a href="https://wa.me/${tel}?text=${productNameEncoded}" target="_blank" rel="noopener noreferrer" class="text-sm font-sans font-bold flex items-center gap-2 w-max link-whatsapp" style="color:#1c1917;"><i class="fa-brands fa-whatsapp text-lg"></i> (${tel.slice(2,4)}) ${tel.slice(4,9)}-${tel.slice(9)}</a>
                    <a href="https://maps.google.com/?q=${maps}+-+Centro,+Amparo+-+SP" target="_blank" rel="noopener noreferrer" class="text-xs font-sans flex items-center gap-2 w-max link-maps" style="color:#44403c;"><i class="fa-solid fa-map-location-dot text-base"></i> ${end}</a>
                </div>
            </div>`).join('')}
        </div>
        <div class="flex flex-col sm:flex-row gap-4 mb-2">
            <button onclick="var p=document.getElementById('contacts-pira'),a=document.getElementById('contacts-amp'); p.style.display=p.style.display==='flex'?'none':'flex'; a.style.display='none';" class="flex-1 font-sans uppercase tracking-widest font-bold text-xs px-4 py-4 flex items-center justify-center gap-2" style="background-color:#1c1917; color:#f4f4f0;">
                <i class="fa-solid fa-location-dot"></i> Piracicaba
            </button>
            <button onclick="var p=document.getElementById('contacts-pira'),a=document.getElementById('contacts-amp'); a.style.display=a.style.display==='flex'?'none':'flex'; p.style.display='none';" class="flex-1 font-sans uppercase tracking-widest font-bold text-xs px-4 py-4 flex items-center justify-center gap-2" style="border:1px solid #1c1917; color:#1c1917; background-color:#f4f4f0;">
                <i class="fa-solid fa-location-dot"></i> Amparo
            </button>
        </div>`;

    content.innerHTML = product.description ? `
        <div class="w-full md:w-5/12 overflow-y-auto modal-scroll-pane" style="background-color:#eaeaeb; border-right:1px solid rgba(28,25,23,0.1); max-height:95vh;">
            <div class="w-full">${galleryHTML}</div>
        </div>
        <div class="w-full md:w-7/12 p-8 md:p-12 flex flex-col overflow-y-auto modal-scroll-pane" style="background-color:#f4f4f0; color:#1c1917; max-height:95vh;">
            <div class="mb-2"><span class="font-sans text-[10px] font-bold uppercase tracking-[0.2em]" style="color:#44403c;">${product.brand}</span></div>
            <h2 class="font-serif text-4xl md:text-5xl font-bold mb-4 leading-none" style="color:#1c1917;">${product.name}</h2>
            ${product.price ? `<p class="font-sans text-xl font-bold pb-4 mb-6 inline-block w-max" style="color:#1c1917; border-bottom:2px solid #1c1917;">${product.price}</p>` : ''}
            <p class="font-sans text-sm md:text-base leading-relaxed mb-6" style="color:#44403c;">${product.description}</p>
            ${highlightsHTML}${specsHTML}
            <div class="mt-10 pt-8 w-full relative" style="border-top:1px solid #1c1917;">
                <h4 class="font-sans text-xs uppercase tracking-[0.2em] font-bold mb-4" style="color:#1c1917;">Escolha a cidade para comprar</h4>
                <div class="relative w-full">${contactsHTML}</div>
            </div>
        </div>` : `
        <div class="w-full p-12 flex flex-col items-center justify-center min-h-[40vh] text-center" style="background-color:#f4f4f0;">
            <div class="w-32 h-32 rounded-full flex items-center justify-center mb-6" style="background-color:#eaeaeb;">
                ${product.image ? `<img src="${product.image}" class="w-20 h-20 object-contain" alt="${product.name}">` : `<i class="fa-solid fa-mobile-screen text-4xl" style="color:rgba(28,25,23,0.2);"></i>`}
            </div>
            <h2 class="font-serif text-3xl font-bold mb-4" style="color:#1c1917;">${product.name}</h2>
            <p class="font-sans mb-8" style="color:#44403c;">Ainda estamos preparando os detalhes deste editorial.</p>
            <div class="mt-8 pt-8 w-full text-left relative" style="border-top:1px solid #1c1917;">
                <h4 class="font-sans text-xs uppercase tracking-[0.2em] font-bold mb-4 text-center" style="color:#1c1917;">Escolha a cidade para comprar</h4>
                <div class="relative w-full">${contactsHTML}</div>
            </div>
        </div>`;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    container.classList.add('scale-95');
    modal.classList.add('opacity-0');
    void modal.offsetWidth;
    setTimeout(() => { modal.classList.remove('opacity-0'); container.classList.remove('scale-95'); }, 10);
    trapFocus(modal);
    setTimeout(() => {
        const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusable.length) focusable[0].focus();
    }, 50);
    document.body.style.overflow = 'hidden';
};

window.closeModal = () => {
    playUIClick();
    const modal = document.getElementById('product-modal');
    const container = document.getElementById('modal-container');
    modal.classList.add('opacity-0');
    container.classList.add('scale-95');
    setTimeout(() => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        document.getElementById('modal-content').innerHTML = '';
        document.body.style.overflow = 'auto';
        document.title = 'MIPLACE MAGAZINE | Catálogo Exclusivo';
    }, 300);
};

window.openLightbox = (src, idx) => {
    playUIClick();
    const lightbox = document.getElementById('lightbox');
    const img = document.getElementById('lightbox-img');
    const modalImgs = Array.from(document.querySelectorAll('#modal-content .aspect-video img'));
    lightboxImages = modalImgs.map(i => i.getAttribute('src'));
    lightboxCurrentIdx = (idx !== undefined && idx >= 0) ? idx : lightboxImages.indexOf(src);
    if (lightboxCurrentIdx < 0) lightboxCurrentIdx = 0;
    delete img.dataset.fallback; delete img.dataset.originalSrc;
    img.src = src;
    lightbox.classList.remove('hidden');
    lightbox.classList.add('flex');
    setTimeout(() => { lightbox.classList.remove('opacity-0'); img.classList.remove('scale-95'); img.classList.add('scale-100'); }, 10);
    const counter = document.getElementById('lightbox-counter');
    if (counter && lightboxImages.length > 1) counter.textContent = `${lightboxCurrentIdx + 1} / ${lightboxImages.length}`;
};

window.lightboxNavigate = (dir) => {
    if (lightboxImages.length <= 1) return;
    playUIClick();
    lightboxCurrentIdx = (lightboxCurrentIdx + dir + lightboxImages.length) % lightboxImages.length;
    const img = document.getElementById('lightbox-img');
    img.style.opacity = '0'; img.style.transform = 'scale(0.95)';
    setTimeout(() => {
        delete img.dataset.fallback; delete img.dataset.originalSrc;
        img.src = lightboxImages[lightboxCurrentIdx];
        img.style.opacity = '1'; img.style.transform = 'scale(1)';
        const counter = document.getElementById('lightbox-counter');
        if (counter && lightboxImages.length > 1) counter.textContent = `${lightboxCurrentIdx + 1} / ${lightboxImages.length}`;
    }, 200);
};

window.closeLightbox = () => {
    playUIClick();
    const lightbox = document.getElementById('lightbox');
    const img = document.getElementById('lightbox-img');
    lightbox.classList.add('opacity-0');
    img.classList.remove('scale-100'); img.classList.add('scale-95');
    setTimeout(() => { lightbox.classList.add('hidden'); lightbox.classList.remove('flex'); }, 300);
};

function initModal() {
    document.getElementById('lightbox').addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
    document.getElementById('lightbox').addEventListener('touchend', e => {
        const diff = touchStartX - e.changedTouches[0].screenX;
        if (Math.abs(diff) > 50) lightboxNavigate(diff > 0 ? 1 : -1);
    }, { passive: true });

    document.addEventListener('keydown', (e) => {
        const lightbox = document.getElementById('lightbox');
        const lightboxOpen = lightbox && !lightbox.classList.contains('hidden');
        if (e.key === 'Escape') {
            if (lightboxOpen) { closeLightbox(); return; }
            const modal = document.getElementById('product-modal');
            if (!modal.classList.contains('hidden')) closeModal();
        }
        if (lightboxOpen) {
            if (e.key === 'ArrowRight') lightboxNavigate(1);
            if (e.key === 'ArrowLeft') lightboxNavigate(-1);
        }
    });
}

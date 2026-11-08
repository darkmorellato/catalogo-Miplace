// ============================================================
// MIPLACE MAGAZINE — Dados centralizados das lojas
// @ts-check
// ============================================================

/** @type {Store[]} */
const STORES = [
    {
        id: 'xv',
        name: 'Miplace XV Prime',
        city: 'Piracicaba',
        logo: { jpg: 'logo/xv (1).webp', png: 'logo/xv (1).webp' },
        address: {
            street: 'R. Quinze de Novembro, 936 - Centro',
            cep: '13400-370',
            mapsQuery: 'R.+Quinze+de+Novembro,+936+-+Centro,+Piracicaba+-+SP'
        },
        phone: '+55-19-98960-5504',
        phoneDisplay: '(19) 98960-5504',
        whatsapp: '5519989605504',
        instagram: { handle: '@miplace.prime', url: 'https://instagram.com/miplace.prime' },
        facebook: { name: 'Miplace XV de Novembro', url: 'https://www.facebook.com/share/1G15m1Tcu8/?mibextid=wwXIfr' },
        geo: { lat: -22.7253, lng: -47.6476 }
    },
    {
        id: 'honor',
        name: 'Miplace Honor',
        city: 'Piracicaba',
        logo: { jpg: 'logo/dp (1).webp', png: 'logo/dp (1).webp' },
        address: {
            street: 'R. Dom Pedro II, 857 - Centro',
            cep: '13400-390',
            mapsQuery: 'R.+Dom+Pedro+II,+857+-+Centro,+Piracicaba+-+SP'
        },
        phone: '+55-19-99497-5131',
        phoneDisplay: '(19) 99497-5131',
        whatsapp: '5519994975131',
        instagram: { handle: '@miplace.dompedro', url: 'https://instagram.com/miplace.dompedro' },
        facebook: { name: 'Miplace Honor', url: 'https://www.facebook.com/share/1AXgkFAVgQ/?mibextid=wwXIfr' },
        geo: { lat: -22.7248, lng: -47.6491 }
    },
    {
        id: 'realme',
        name: 'Miplace Realme',
        city: 'Piracicaba',
        logo: { jpg: 'logo/realme (1).webp', png: 'logo/realme (1).webp' },
        address: {
            street: 'R. Benjamin Constant, 1230 - Centro',
            cep: '13400-053',
            mapsQuery: 'R.+Benjamin+Constant,+1230+-+Centro,+Piracicaba+-+SP'
        },
        phone: '+55-19-99451-0123',
        phoneDisplay: '(19) 99451-0123',
        whatsapp: '5519994510123',
        instagram: { handle: '@miplace.benjamin', url: 'https://instagram.com/miplace.benjamin' },
        facebook: { name: 'Miplace Realme', url: 'https://www.facebook.com/share/1KgggPkqQL/?mibextid=wwXIfr' },
        geo: { lat: -22.7261, lng: -47.6468 }
    },
    {
        id: 'premium',
        name: 'Miplace Premium',
        city: 'Amparo',
        logo: { jpg: 'logo/pr (1).webp', png: 'logo/pr (1).webp' },
        address: {
            street: 'R. Treze de Maio, 26 - Centro',
            cep: '13900-005',
            mapsQuery: 'R.+Treze+de+Maio,+26+-+Centro,+Amparo+-+SP'
        },
        phone: '+55-19-99961-8865',
        phoneDisplay: '(19) 99961-8865',
        whatsapp: '5519999618865',
        instagram: { handle: '@miplace.premium', url: 'https://instagram.com/miplace.premium' },
        facebook: { name: 'Miplace Premium', url: 'https://www.facebook.com/share/1DYqbVuA7G/?mibextid=wwXIfr' },
        geo: { lat: -22.7021, lng: -46.7708 }
    }
];

function getStoresByCity() {
    /** @type {StoresByCity} */
    const grouped = {};
    STORES.forEach(store => {
        if (!grouped[store.city]) grouped[store.city] = [];
        grouped[store.city].push(store);
    });
    return grouped;
}

/**
 * @param {string} containerId
 * @returns {void}
 */
function renderContactDropdown(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    /** @type {(s: unknown) => string} */
    const esc = window.escapeHTML;
    const grouped = getStoresByCity();
    let html = `<div class="border shadow-2xl flex flex-col py-2" style="background-color:#f5f2ea; border-color:#141414;">`;
    const cities = Object.keys(grouped);
    cities.forEach((city, ci) => {
        html += `<span class="text-[9px] px-4 py-2 uppercase tracking-[0.2em] font-bold" style="color:#4a4641; background-color:#ebe7dd;">${esc(city)}, SP</span>`;
        grouped[city].forEach((store, si) => {
            const isLast = ci === cities.length - 1 && si === grouped[city].length - 1;
            const borderBottom = !isLast && si === grouped[city].length - 1 ? 'border-bottom:1px solid #e5e5e5;' : '';
            html += `
                <a href="https://wa.me/${store.whatsapp}" target="_blank" rel="noopener noreferrer" class="px-4 py-3 text-xs font-bold flex items-center gap-3 btn-hover-ink" style="${borderBottom}">
                    <img src="${store.logo.jpg}" loading="lazy" onerror="this.onerror=null; this.src='${store.logo.png}';" alt="${esc(store.name)}" width="24" height="24" class="w-6 h-6 rounded-full object-cover"> ${esc(store.name)}
                </a>`;
        });
    });
    html += `</div>`;
    container.innerHTML = html;
}

/**
 * Lista os contatos individuais de cada loja no bloco de contato.
 * @param {string} containerId
 * @returns {void}
 */
function renderContactLinks(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    /** @type {(s: unknown) => string} */
    const esc = window.escapeHTML;
    container.innerHTML = STORES.map(store => `
        <a class="contact-store-link" href="https://wa.me/${store.whatsapp}" target="_blank" rel="noopener noreferrer">
            <span class="contact-store-name">${esc(store.name)}</span>
            <span class="contact-store-phone">${esc(store.phoneDisplay)}</span>
            <i class="fa-brands fa-whatsapp" aria-hidden="true"></i>
        </a>`).join('');
}

/**
 * @param {string} containerId
 * @returns {void}
 */
function renderStoreCards(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    /** @type {(s: unknown) => string} */
    const esc = window.escapeHTML;
    const grouped = getStoresByCity();
    let html = '';
    const cities = Object.keys(grouped);
    cities.forEach(city => {
        html += `
            <div class="store-city" data-corp-reveal>
                <h3 class="store-city-title">${esc(city)}, SP</h3>
                <div class="store-list">`;
        grouped[city].forEach(store => {
            html += `
                    <article class="store-card">
                        <div class="store-card-head">
                            <img src="${store.logo.jpg}" loading="lazy" onerror="this.onerror=null; this.src='${store.logo.png}';" alt="Logo ${esc(store.name)}" width="56" height="56" class="store-logo">
                            <div>
                                <h4>${esc(store.name)}</h4>
                                <p>${esc(store.city)}, SP</p>
                            </div>
                        </div>
                        <a href="https://maps.google.com/?q=${store.address.mapsQuery}" target="_blank" rel="noopener noreferrer" class="store-address link-maps">
                            <i class="fa-solid fa-map-location-dot" aria-hidden="true"></i>
                            <span>${esc(store.address.street)}<br>CEP: ${esc(store.address.cep)}</span>
                        </a>
                        <div class="store-links">
                            <a href="${store.instagram.url}" target="_blank" rel="noopener noreferrer" class="link-instagram" aria-label="Instagram ${esc(store.name)}"><i class="fa-brands fa-instagram" aria-hidden="true"></i> ${esc(store.instagram.handle)}</a>
                            <a href="${store.facebook.url}" target="_blank" rel="noopener noreferrer" class="link-facebook" aria-label="Facebook ${esc(store.name)}"><i class="fa-brands fa-facebook" aria-hidden="true"></i> ${esc(store.facebook.name)}</a>
                            <a href="https://wa.me/${store.whatsapp}" target="_blank" rel="noopener noreferrer" class="link-whatsapp" aria-label="WhatsApp ${esc(store.name)}"><i class="fa-brands fa-whatsapp" aria-hidden="true"></i> ${esc(store.phoneDisplay)}</a>
                        </div>
                    </article>`;
        });
        html += `
                </div>
            </div>`;
    });
    container.innerHTML = html;
}

/**
 * @returns {void}
 */
function injectSchemaOrg() {
    const el = document.getElementById('schema-org');
    if (!el) return;
    /* eslint-disable quotes -- Schema.org exige aspas duplas em todas as chaves/valores */
    const schema = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Organization",
                "@id": "https://miplacemagazine.com.br/#organization",
                "name": "Miplace Group",
                "alternateName": "Miplace Magazine",
                "description": "Grupo brasileiro de tecnologia e lifestyle com curadoria global, quatro lojas em Piracicaba e Amparo e parcelamento em até 24x no boleto.",
                "url": "https://miplacemagazine.com.br/",
                "logo": "https://miplacemagazine.com.br/favicon_io/android-chrome-512x512.png",
                "sameAs": Array.from(new Set(STORES.flatMap(store => [store.instagram.url, store.facebook.url]))),
                "location": STORES.map(store => ({
                    "@type": "Store",
                    "name": store.name,
                    "address": {
                        "@type": "PostalAddress",
                        "streetAddress": store.address.street,
                        "addressLocality": store.city,
                        "addressRegion": "SP",
                        "postalCode": store.address.cep,
                        "addressCountry": "BR"
                    },
                    "geo": { "@type": "GeoCoordinates", "latitude": store.geo.lat, "longitude": store.geo.lng },
                    "telephone": store.phone
                }))
            },
            {
                "@type": "WebSite",
                "@id": "https://miplacemagazine.com.br/#website",
                "url": "https://miplacemagazine.com.br/",
                "name": "Miplace Group",
                "inLanguage": ["pt-BR", "en", "es"],
                "publisher": { "@id": "https://miplacemagazine.com.br/#organization" }
            }
        ]
    };
    /* eslint-enable quotes */
    el.textContent = JSON.stringify(schema);
}

// Expor constantes e helpers no objeto global de uma só vez (silencia
// `no-unused-vars` do ESLint, já que algumas funções públicas são consumidas
// via `window.*` pelo app.js / HTML inline).
window.STORES = STORES;
window.getStoresByCity = getStoresByCity;
window.renderContactDropdown = renderContactDropdown;
window.renderContactLinks = renderContactLinks;
window.renderStoreCards = renderStoreCards;
window.injectSchemaOrg = injectSchemaOrg;

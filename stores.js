// ============================================================
// MIPLACE MAGAZINE — Dados centralizados das lojas
// ============================================================

const STORES = [
    {
        id: 'xv',
        name: 'Miplace XV de Novembro',
        city: 'Piracicaba',
        logo: { jpg: 'logo/xv (1).webp', png: 'logo/xv (1).webp' },
        address: {
            street: 'R. Quinze de Novembro, 910 - Centro',
            cep: '13400-370',
            mapsQuery: 'R.+Quinze+de+Novembro,+910+-+Centro,+Piracicaba+-+SP'
        },
        phone: '+55-19-98960-5504',
        phoneDisplay: '(19) 98960-5504',
        whatsapp: '5519989605504',
        instagram: { handle: '@miplace.xvdenovembro', url: 'https://instagram.com/miplace.xvdenovembro' },
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
        id: 'kassouf',
        name: 'Miplace Kassouf',
        city: 'Amparo',
        logo: { jpg: 'logo/kf (1).webp', png: 'logo/kf (1).webp' },
        address: {
            street: 'R. Treze de Maio, 218 - sala 09 - Centro',
            cep: '13900-005',
            mapsQuery: 'R.+Treze+de+Maio,+218+-+sala+09+-+Centro,+Amparo+-+SP'
        },
        phone: '+55-19-97107-7066',
        phoneDisplay: '(19) 97107-7066',
        whatsapp: '5519971077066',
        instagram: { handle: '@miplace.kassouf', url: 'https://instagram.com/miplace.kassouf' },
        facebook: { name: 'Miplace Kassouf', url: 'https://www.facebook.com/share/1ASHdG4hNB/?mibextid=wwXIfr' },
        geo: { lat: -22.7019, lng: -46.7706 }
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
    const grouped = {};
    STORES.forEach(store => {
        if (!grouped[store.city]) grouped[store.city] = [];
        grouped[store.city].push(store);
    });
    return grouped;
}

function renderContactDropdown(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const grouped = getStoresByCity();
    let html = `<div class="border shadow-2xl flex flex-col py-2" style="background-color:#f4f4f0; border-color:#1c1917;">`;
    const cities = Object.keys(grouped);
    cities.forEach((city, ci) => {
        html += `<span class="text-[9px] px-4 py-2 uppercase tracking-[0.2em] font-bold" style="color:#44403c; background-color:#eaeaeb;">${city}, SP</span>`;
        grouped[city].forEach((store, si) => {
            const isLast = ci === cities.length - 1 && si === grouped[city].length - 1;
            const borderBottom = !isLast && si === grouped[city].length - 1 ? 'border-bottom:1px solid #e5e5e5;' : '';
            html += `
                <a href="https://wa.me/${store.whatsapp}" target="_blank" rel="noopener noreferrer" class="px-4 py-3 text-xs font-bold flex items-center gap-3 btn-hover-ink" style="${borderBottom}">
                    <img src="${store.logo.jpg}" loading="lazy" onerror="this.onerror=null; this.src='${store.logo.png}';" alt="${store.name}" width="24" height="24" class="w-6 h-6 rounded-full object-cover"> ${store.name}
                </a>`;
        });
    });
    html += `</div>`;
    container.innerHTML = html;
}

function renderStoreCards(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const grouped = getStoresByCity();
    let html = '';
    const cities = Object.keys(grouped);
    cities.forEach(city => {
        html += `
            <div class="lg:col-span-6 reveal">
                <h3 class="font-sans uppercase tracking-[0.3em] text-lg font-bold pb-4 mb-8" style="color:#1c1917; border-bottom: 1px solid #1c1917;">${city}, SP</h3>
                <div class="space-y-8">`;
        grouped[city].forEach(store => {
            html += `
                    <div class="flex flex-col sm:flex-row justify-between sm:items-end pb-6" style="border-bottom: 1px solid rgba(28,25,23,0.2);">
                        <div class="flex items-center gap-4">
                            <img src="${store.logo.jpg}" loading="lazy" onerror="this.onerror=null; this.src='${store.logo.png}';" alt="Logo ${store.name}" width="64" height="64" class="w-16 h-16 rounded-full object-cover" style="border: 1px solid rgba(28,25,23,0.2);">
                            <div>
                                <h4 class="font-serif text-2xl font-bold mb-2" style="color:#1c1917;">${store.name}</h4>
                                <a href="https://maps.google.com/?q=${store.address.mapsQuery}" target="_blank" rel="noopener noreferrer" class="font-sans text-sm max-w-xs block hover:underline link-maps" style="color:#44403c;"><i class="fa-solid fa-map-location-dot mr-1"></i> ${store.address.street}<br>CEP: ${store.address.cep}</a>
                            </div>
                        </div>
                        <div class="flex flex-col items-start sm:items-end gap-2 mt-4 sm:mt-0">
                            <a href="${store.instagram.url}" target="_blank" rel="noopener noreferrer" class="font-sans text-sm font-bold flex items-center gap-2 link-instagram" style="color:#1c1917;"><i class="fa-brands fa-instagram text-lg"></i> ${store.instagram.handle}</a>
                            <a href="${store.facebook.url}" target="_blank" rel="noopener noreferrer" class="font-sans text-sm font-bold flex items-center gap-2 link-facebook" style="color:#1c1917;"><i class="fa-brands fa-facebook text-lg"></i> ${store.facebook.name}</a>
                            <a href="https://wa.me/${store.whatsapp}" target="_blank" rel="noopener noreferrer" class="font-sans text-sm font-bold flex items-center gap-2 link-whatsapp" style="color:#1c1917;"><i class="fa-brands fa-whatsapp text-lg"></i> ${store.phoneDisplay}</a>
                        </div>
                    </div>`;
        });
        html += `
                </div>
            </div>`;
    });
    container.innerHTML = html;
}

function renderModalContacts() {
    const grouped = getStoresByCity();
    let html = '';
    const cities = Object.keys(grouped);
    cities.forEach(city => {
        html += `<div class="mb-4"><h5 class="text-[10px] uppercase tracking-widest font-bold mb-2" style="color:#44403c;">${city}, SP</h5><div class="space-y-2">`;
        grouped[city].forEach(store => {
            html += `
                <a href="https://wa.me/${store.whatsapp}" target="_blank" rel="noopener noreferrer" class="flex items-center gap-3 text-xs font-bold py-2 px-3 rounded transition-colors hover:bg-black/5" style="color:#1c1917;">
                    <img src="${store.logo.jpg}" loading="lazy" onerror="this.onerror=null; this.src='${store.logo.png}';" alt="${store.name}" width="24" height="24" class="w-6 h-6 rounded-full object-cover">
                    <span class="flex-1">${store.name}</span>
                    <i class="fa-brands fa-whatsapp" style="color:#16a34a;"></i>
                </a>`;
        });
        html += `</div></div>`;
    });
    return html;
}

function injectSchemaOrg() {
    const el = document.getElementById('schema-org');
    if (!el) return;
    const schema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Miplace Magazine",
        "description": "Catálogo exclusivo de smartphones premium com parcelamento em até 24x no boleto sem consulta.",
        "url": "https://miplacemagazine.com.br/",
        "logo": "https://miplacemagazine.com.br/favicon_io/android-chrome-512x512.png",
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
            "telephone": store.phone,
            "openingHoursSpecification": [
                { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"], "opens": "09:00", "closes": "18:00" },
                { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Saturday"], "opens": "09:00", "closes": "13:00" }
            ]
        }))
    };
    el.textContent = JSON.stringify(schema);
}

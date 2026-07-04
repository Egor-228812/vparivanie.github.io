const API_BASE = 'https://vparivanie-api.onrender.com';

function getLocalData() {
    try {
        const raw = localStorage.getItem('vparivanie_admin_data');
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        return null;
    }
}

async function loadLiquids() {
    try {
        const res = await fetch(`${API_BASE}/data/расходники.json`);
        const data = await res.json();
        return data.items || [];
    } catch (err) {
        const local = getLocalData();
        if (local && local.consumables) {
            return local.consumables.filter(item => item.flavors && item.flavors.length > 0);
        }
        return [];
    }
}

function extractBrand(name) {
    const brands = ['Rick and Morty', 'Podonki', 'Catswill', 'Злая монашка', 'Злой Монах', 'Самоубийца', 'ANNIMA', 'BJORN'];
    for (const brand of brands) {
        if (name.includes(brand)) return brand;
    }
    return name.split(' ')[0];
}

function renderBrandCards(items) {
    const brands = {};

    items.forEach(item => {
        const brand = extractBrand(item.name);
        if (!brands[brand]) {
            brands[brand] = [];
        }
        brands[brand].push(item);
    });

    const grid = document.getElementById('brandGrid');
    if (!grid) return;

    grid.innerHTML = '';

    Object.keys(brands).forEach(brandName => {
        const card = document.createElement('div');
        card.className = 'brand-card';
        card.innerHTML = `<h3>${brandName}</h3><p>${brands[brandName].length} товаров</p>`;
        card.addEventListener('click', () => showBrandOverlay(brandName, brands[brandName]));
        grid.appendChild(card);
    });
}

function showBrandOverlay(brandName, products) {
    const overlay = document.getElementById('brandOverlay');
    const title = document.getElementById('overlayTitle');
    const body = document.getElementById('overlayBody');

    if (!overlay || !title || !body) return;

    title.textContent = brandName;
    body.innerHTML = '';

    products.forEach(product => {
        if (product.flavors && product.flavors.length > 0) {
            const section = document.createElement('div');
            section.style.marginBottom = '20px';
            section.innerHTML = `<div style="font-weight: 600; margin-bottom: 8px;">${product.name} — ${product.price}</div>`;

            product.flavors.forEach(flavor => {
                const status = flavor.availability ? 'in-stock' : 'out-of-stock';
                const statusLabel = flavor.availability ? 'есть в наличии' : 'нет в наличии';

                const row = document.createElement('div');
                row.className = 'product-list-item';
                row.innerHTML = `
                    <div class="name">${flavor.name}</div>
                    <span class="status ${status}">${statusLabel}</span>
                `;
                section.appendChild(row);
            });

            body.appendChild(section);
        } else {
            const status = product.availability ? 'in-stock' : 'out-of-stock';
            const statusLabel = product.availability ? 'есть в наличии' : 'нет в наличии';

            const item = document.createElement('div');
            item.className = 'product-list-item';
            item.innerHTML = `
                <div>
                    <div class="name">${product.name}</div>
                    <div style="font-size: 0.85rem; color: #666;">${product.price}</div>
                </div>
                <span class="status ${status}">${statusLabel}</span>
            `;
            body.appendChild(item);
        }
    });

    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeOverlay() {
    const overlay = document.getElementById('brandOverlay');
    if (overlay) {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const items = await loadLiquids();
    renderBrandCards(items);

    const overlayClose = document.getElementById('overlayClose');
    if (overlayClose) {
        overlayClose.addEventListener('click', closeOverlay);
    }

    const brandOverlay = document.getElementById('brandOverlay');
    if (brandOverlay) {
        brandOverlay.addEventListener('click', function(e) {
            if (e.target === brandOverlay) {
                closeOverlay();
            }
        });
    }

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeOverlay();
        }
    });
});

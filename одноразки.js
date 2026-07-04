const API_BASE = 'https://vparivanie-api.onrender.com';

function getLocalData() {
    try {
        const raw = localStorage.getItem('vparivanie_admin_data');
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        return null;
    }
}

async function loadDisposables() {
    try {
        const res = await fetch(`${API_BASE}/data/одноразки.json`);
        const data = await res.json();
        return data.items || [];
    } catch (err) {
        const local = getLocalData();
        if (local && local.disposables) {
            return local.disposables;
        }
        return [];
    }
}

function renderDisposableCards(items) {
    const grid = document.getElementById('disposableGrid');
    if (!grid) return;

    grid.innerHTML = '';

    items.forEach((item, index) => {
        
        const imageMap = {
            'Puffmi 12000': 'images/puffmi.png',
            'DualBar 12000': 'images/dualBar.png',
            'Puffmi flora 25000': 'images/puffmi_flora.png'
        };
        const imgSrc = imageMap[item.name] || 'images/puffmi_flora.png';

        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-image"><img src="${imgSrc}" alt="${item.name}" style="width:100%;height:100%;object-fit:contain;"></div>
            <div class="product-info">
                <div class="product-name">${item.name}</div>
                <div class="product-description">Одноразовый вейп</div>
                <div class="product-price">${item.price}</div>
            </div>
        `;
        card.addEventListener('click', () => showDisposableOverlay(item, index));
        grid.appendChild(card);
    });
}

function showDisposableOverlay(item, index) {
    const overlay = document.getElementById('disposableOverlay');
    const title = document.getElementById('overlayTitle');
    const body = document.getElementById('overlayBody');

    if (!overlay || !title || !body) return;

    title.textContent = item.name;
    body.innerHTML = '';

    if (item.flavors && item.flavors.length > 0) {
        item.flavors.forEach((flavor, fIndex) => {
            

            const row = document.createElement('div');
            row.className = 'product-list-item';
            row.innerHTML = `
                <div>
                    <div class="name">${flavor.name}</div>
                    <div style="font-weight: 600; margin-top: 4px;">${item.price}</div>
                </div>
            `;
            body.appendChild(row);
        });
    } else {
       
        body.innerHTML = `<p>Цена: ${item.price}</p>`;
    }

    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeOverlay() {
    const overlay = document.getElementById('disposableOverlay');
    if (overlay) {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const items = await loadDisposables();
    renderDisposableCards(items);

    const overlayClose = document.getElementById('overlayClose');
    if (overlayClose) {
        overlayClose.addEventListener('click', closeOverlay);
    }

    const disposableOverlay = document.getElementById('disposableOverlay');
    if (disposableOverlay) {
        disposableOverlay.addEventListener('click', function(e) {
            if (e.target === disposableOverlay) {
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

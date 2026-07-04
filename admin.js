const ADMIN_PASSWORD = 'SdKq180107';
let adminData = {};
let saveMode = 'server';
const API_BASE = 'https://vparivanie-api.onrender.com';

function getLocalData() {
    try {
        const raw = localStorage.getItem('vparivanie_admin_data');
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        return null;
    }
}

function setLocalData(data) {
    localStorage.setItem('vparivanie_admin_data', JSON.stringify(data));
}

function mergeWithLocal(items, localItems) {
    if (!localItems || !Array.isArray(localItems)) return items;
    return items.map(item => {
        const local = localItems.find(li => li.name === item.name);
        if (!local) return item;
        if (item.flavors && local.flavors) {
            return {
                ...item,
                flavors: item.flavors.map((f, i) => ({
                    ...f,
                    availability: local.flavors[i] ? local.flavors[i].availability : f.availability
                }))
            };
        }
        return { ...item, availability: local.availability !== undefined ? local.availability : item.availability };
    });
}

async function loadAllData() {
    const localData = getLocalData();
    let serverAvailable = false;

    try {
        const [disposables, pods, consumables, cartridgesData] = await Promise.all([
            fetch(`${API_BASE}/data/одноразки.json`).then(r => { if (!r.ok) throw new Error('Одноразки'); return r.json(); }),
            fetch(`${API_BASE}/data/подики.json`).then(r => { if (!r.ok) throw new Error('Подики'); return r.json(); }),
            fetch(`${API_BASE}/data/расходники.json`).then(r => { if (!r.ok) throw new Error('Расходники'); return r.json(); }),
            fetch(`${API_BASE}/data/карики.json`).then(r => { if (!r.ok) throw new Error('Карики'); return r.json(); })
        ]);

        adminData = {
            disposables: mergeWithLocal(disposables.items || [], localData?.disposables),
            pods: mergeWithLocal(pods.items || [], localData?.pods),
            consumables: mergeWithLocal(consumables.items || [], localData?.consumables),
            cartridges: mergeWithLocal(cartridgesData.items || [], localData?.cartridges)
        };
        serverAvailable = true;
    } catch (err) {
        console.error('Server unavailable, using localStorage:', err);
        if (localData) {
            adminData = localData;
        } else {
            adminData = { disposables: [], pods: [], consumables: [], cartridges: [] };
        }
    }

    saveMode = serverAvailable ? 'server' : 'local';
}

function persistAdminData() {
    setLocalData(adminData);
}

function getLiquids() {
    return (adminData.consumables || []).filter(item => item.flavors && item.flavors.length > 0);
}

function renderAdminLists(searchQuery = '') {
    const query = searchQuery.toLowerCase().trim();
    renderList('liquids', 'Жидкости', filterItems(getLiquids(), query));
    renderList('cartridges', 'Картриджи/Испарители', filterItems(adminData.cartridges || [], query));
    renderList('pods', 'Подики', filterItems(adminData.pods || [], query));
    renderList('disposables', 'Одноразки', filterItems(adminData.disposables || [], query));
}

function filterItems(items, query) {
    if (!query) return items;
    return items.filter(item => {
        const nameMatch = item.name.toLowerCase().includes(query);
        const descMatch = item.description && item.description.toLowerCase().includes(query);
        const flavorMatch = item.flavors && item.flavors.some(f => f.name.toLowerCase().includes(query));
        return nameMatch || descMatch || flavorMatch;
    });
}

function renderList(category, label, items) {
    const container = document.getElementById(category + 'List');
    if (!container) return;

    container.innerHTML = '';

    items.forEach(item => {
        if (item.flavors && item.flavors.length > 0) {
            item.flavors.forEach((flavor, fIndex) => {
                addAdminItem(container, item.name + ' — ' + flavor.name, '', `${category}_${item.name}_${fIndex}`, flavor.availability, category, item.name, fIndex);
            });
        } else {
            addAdminItem(container, item.name, item.description || '', `${category}_${item.name}`, item.availability, category, item.name, null);
        }
    });
}

function addAdminItem(container, name, desc, id, availability, category, itemName, flavorIndex) {
    const item = document.createElement('div');
    item.className = 'admin-item';
    item.innerHTML = `
        <div class="admin-item-info">
            <div class="admin-item-name">${name}</div>
            <div class="admin-item-desc">${desc}</div>
        </div>
        <button class="toggle-btn ${availability ? 'in-stock' : 'out-of-stock'}" data-category="${category}" data-item="${itemName}" data-flavor="${flavorIndex !== null ? flavorIndex : ''}" data-id="${id}">
            ${availability ? 'есть в наличии' : 'нет в наличии'}
        </button>
    `;
    container.appendChild(item);
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadAllData();

    const saveBtn = document.getElementById('saveChangesBtn');
    if (saveBtn) {
        saveBtn.textContent = saveMode === 'local' ? 'Сохранить в браузере' : 'Сохранить изменения';
    }

    const searchInput = document.getElementById('adminSearch');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            renderAdminLists(this.value);
        });
    }

    const loginForm = document.getElementById('adminLoginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const password = document.getElementById('adminPassword').value;
            if (password === ADMIN_PASSWORD) {
                document.getElementById('loginForm').style.display = 'none';
                document.getElementById('adminPanel').style.display = 'block';
                renderAdminLists();
            } else {
                alert('Неверный пароль!');
            }
        });
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            document.getElementById('loginForm').style.display = 'block';
            document.getElementById('adminPanel').style.display = 'none';
            document.getElementById('adminPassword').value = '';
        });
    }

    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
            this.classList.add('active');
            const tabId = this.getAttribute('data-tab');
            const section = document.getElementById(tabId);
            if (section) section.classList.add('active');
        });
    });

    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('toggle-btn')) {
            const btn = e.target;
            const category = btn.getAttribute('data-category');
            const itemName = btn.getAttribute('data-item');
            const flavorIndex = btn.getAttribute('data-flavor');
            const isInStock = btn.classList.contains('in-stock');

            btn.classList.toggle('in-stock', !isInStock);
            btn.classList.toggle('out-of-stock', isInStock);
            btn.textContent = isInStock ? 'нет в наличии' : 'есть в наличии';

            const items = category === 'liquids' ? getLiquids() :
                          category === 'cartridges' ? adminData.cartridges || [] :
                          adminData[category] || [];

            const item = items.find(i => i.name === itemName);
            if (!item) return;

            if (flavorIndex !== '') {
                if (item.flavors && item.flavors[parseInt(flavorIndex)]) {
                    item.flavors[parseInt(flavorIndex)].availability = !isInStock;
                }
            } else {
                item.availability = !isInStock;
            }

            persistAdminData();
        }
    });

    const saveBtnEl = document.getElementById('saveChangesBtn');
    if (saveBtnEl) {
        saveBtnEl.addEventListener('click', async () => {
            persistAdminData();

            if (saveMode === 'local') {
                alert('Режим localStorage: изменения сохранены в браузере.\n\nДля записи в JSON-файлы запустите python server.py и нажмите сохранить снова.');
                return;
            }

            try {
                const res = await fetch(`${API_BASE}/api/save`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        files: {
                            'одноразки.json': { items: adminData.disposables || [] },
                            'подики.json': { items: adminData.pods || [] },
                            'расходники.json': { items: adminData.consumables || [] },
                            'карики.json': { items: adminData.cartridges || [] }
                        }
                    })
                });

                const result = await res.json();
                if (res.ok) {
                    alert('Изменения сохранены в JSON-файлы!');
                    await loadAllData();
                    renderAdminLists();
                } else {
                    alert('Ошибка сохранения: ' + JSON.stringify(result));
                }
            } catch (err) {
                alert('Сервер недоступен. Изменения сохранены в localStorage.\n\nДля записи в JSON-файлы запустите python server.py.');
                saveMode = 'local';
                if (saveBtn) saveBtn.textContent = 'Сохранить в браузере';
            }
        });
    }
});

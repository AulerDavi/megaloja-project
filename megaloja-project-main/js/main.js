function navigateTo(screenId) {
    if (!screenId) return;

    const screens = document.querySelectorAll('.screen-section');
    screens.forEach(screen => {
        screen.classList.remove('active-screen');
    });

    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active-screen');
    }
    
    if (screenId === 'screen-orders' && typeof renderOrders === 'function') {
        renderOrders();
    }
    
    if (screenId === 'screen-employee-stock' && typeof renderEmployeeStock === 'function') {
        renderEmployeeStock();
    }

    if (screenId === 'screen-billing-addresses' && typeof renderBillingAddresses === 'function') {
        renderBillingAddresses();
    }

    if (screenId === 'screen-security-change-password' && typeof resetChangePasswordFeedback === 'function') {
        resetChangePasswordFeedback();
    }

    if (screenId === 'screen-employee-orders' && typeof renderEmployeeOrders === 'function') {
        renderEmployeeOrders();
    }

    const appMenu = document.getElementById('app-menu');
    const employeeMenu = document.getElementById('employee-menu');
    const container = document.getElementById('app-container');
    
    const noMenuScreens = [
        'screen-login', 
        'screen-register', 
        'screen-register-success', 
        'screen-forgot-password', 
        'screen-forgot-password-success',
        'screen-employee-login'
    ];

    const employeeScreens = [
        'screen-employee-orders',
        'screen-employee-stock',
        'screen-employee-reports',
        'screen-employee-order-detail',
        'screen-employee-order-separation',
        'screen-employee-order-pickup',
        'screen-employee-order-status'
    ];

    if (noMenuScreens.includes(screenId)) {
        if (appMenu) appMenu.style.display = 'none';
        if (employeeMenu) employeeMenu.style.display = 'none';
        document.body.style.justifyContent = 'center';
        if (container) {
            container.style.marginLeft = '0';
            container.style.width = '100%';
        }
    } else if (employeeScreens.includes(screenId)) {
        if (appMenu) appMenu.style.display = 'none';
        if (employeeMenu) employeeMenu.style.display = 'flex';
        if (window.innerWidth >= 768) {
            document.body.style.justifyContent = 'flex-start';
            if (container) {
                container.style.marginLeft = '240px';
                container.style.width = 'calc(100vw - 240px)';
                container.style.maxWidth = 'none';
            }
        }
    } else {
        if (appMenu) appMenu.style.display = 'flex';
        if (employeeMenu) employeeMenu.style.display = 'none';
        if (window.innerWidth >= 768) {
            document.body.style.justifyContent = 'flex-start';
            if (container) {
                container.style.marginLeft = '240px';
                container.style.width = 'calc(100vw - 240px)';
                container.style.maxWidth = 'none';
            }
        }
    }

    try {
        const menuItems = document.querySelectorAll('.menu-item'); 
        menuItems.forEach(item => {
            item.classList.remove('active');
        });

        if (!noMenuScreens.includes(screenId)) {
            const activeButtons = document.querySelectorAll(`.menu-item[onclick*="${screenId}"]`);
            activeButtons.forEach(btn => {
                btn.classList.add('active');
            });
        }
    } catch (e) {
        console.error("Erro na sincronização visual do menu:", e);
    }
}

function handleMenuClick(element, targetScreenId) {
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => item.classList.remove('active'));
    element.classList.add('active');
    navigateTo(targetScreenId);
}

function showModal(message) {
    document.getElementById('error-message').textContent = message;
    document.getElementById('error-modal').classList.add('active-modal');
}

function closeModal() {
    document.getElementById('error-modal').classList.remove('active-modal');
}

// ============================================================
// AUTENTICAÇÃO — com fetch para o backend Flask
// ============================================================

function handleRegister(event) {
    event.preventDefault();

    const password = document.getElementById('reg-password').value;
    const confirmPassword = document.getElementById('reg-confirm').value;
    
    if (password !== confirmPassword) {
        showModal("As senhas informadas não são idênticas. Por favor, verifique e digite novamente.");
        return; 
    }

    const name = document.getElementById('reg-name').value.trim();
    const lastname = document.getElementById('reg-lastname').value.trim();
    const email = document.getElementById('reg-email').value.trim();

    apiCadastrar({ name: name + ' ' + lastname, email, password })
        .then(() => {
            navigateTo('screen-register-success');
        })
        .catch(err => {
            showModal(err.message || 'Erro ao cadastrar. Verifique os dados e tente novamente.');
        });
}

function resetChangePasswordFeedback() {
    const feedback = document.getElementById('cp-password-feedback');
    const fields = [
        document.getElementById('cp-new-password'),
        document.getElementById('cp-confirm-password')
    ];

    if (feedback) {
        feedback.textContent = '';
        feedback.classList.remove('error', 'success');
    }

    fields.forEach(field => {
        if (field) field.closest('.input-group')?.classList.remove('input-error', 'input-success');
    });
}

function handleChangePassword(event) {
    event.preventDefault();

    const newPasswordInput = document.getElementById('cp-new-password');
    const confirmPasswordInput = document.getElementById('cp-confirm-password');
    const feedback = document.getElementById('cp-password-feedback');
    const newPassword = newPasswordInput ? newPasswordInput.value.trim() : '';
    const confirmPassword = confirmPasswordInput ? confirmPasswordInput.value.trim() : '';

    resetChangePasswordFeedback();

    if (newPassword.length < 6 || confirmPassword.length < 6) {
        if (feedback) {
            feedback.textContent = 'A nova senha precisa ter pelo menos 6 caracteres.';
            feedback.classList.add('error');
        }
        newPasswordInput?.closest('.input-group')?.classList.add('input-error');
        confirmPasswordInput?.closest('.input-group')?.classList.add('input-error');
        showModal('A nova senha precisa ter pelo menos 6 caracteres.');
        return;
    }

    if (newPassword !== confirmPassword) {
        if (feedback) {
            feedback.textContent = 'As senhas precisam ser idênticas nos dois campos.';
            feedback.classList.add('error');
        }
        newPasswordInput?.closest('.input-group')?.classList.add('input-error');
        confirmPasswordInput?.closest('.input-group')?.classList.add('input-error');
        confirmPasswordInput?.focus();
        showModal('As senhas precisam ser idênticas para alterar a senha de acesso.');
        return;
    }

    if (!window.loggedUser || !window.loggedUser.email) {
        showModal('Você precisa estar logado para alterar a senha.');
        return;
    }

    apiAlterarSenha({ email: window.loggedUser.email, newPassword })
        .then(() => {
            if (feedback) {
                feedback.textContent = 'Senha alterada com sucesso no servidor.';
                feedback.classList.add('success');
            }
            newPasswordInput?.closest('.input-group')?.classList.add('input-success');
            confirmPasswordInput?.closest('.input-group')?.classList.add('input-success');
            event.target.reset();
            showSuccessModal('Sua senha de acesso foi atualizada com sucesso.', 'Senha alterada!');
        })
        .catch(err => {
            showModal(err.message || 'Erro ao alterar senha.');
        });
}

// ============================================================
// ENDEREÇOS DE COBRANÇA — via API
// ============================================================

function escapeHTML(value) {
    return String(value || '').replace(/[&<>"']/g, char => ({
        '&': '&',
        '<': '<',
        '>': '>',
        '"': '"',
        "'": '&#039;'
    }[char]));
}

function getBillingAddressFormValues() {
    return {
        label: document.getElementById('billing-address-label')?.value.trim() || '',
        street: document.getElementById('billing-street')?.value.trim() || '',
        number: document.getElementById('billing-number')?.value.trim() || '',
        complement: document.getElementById('billing-complement')?.value.trim() || '',
        city: document.getElementById('billing-city')?.value.trim() || '',
        state: (document.getElementById('billing-state')?.value.trim() || '').toUpperCase(),
        zip: document.getElementById('billing-zip')?.value.trim() || ''
    };
}

function setBillingFormMode(isEditing) {
    const submitBtn = document.getElementById('billing-submit-btn');
    const cancelBtn = document.getElementById('billing-cancel-btn');
    if (submitBtn) submitBtn.textContent = isEditing ? 'Salvar Alterações' : 'Salvar Endereço';
    if (cancelBtn) cancelBtn.style.display = isEditing ? 'inline-flex' : 'none';
}

// Cache local de endereços
window.billingAddresses = [];

async function renderBillingAddresses() {
    const list = document.getElementById('billing-addresses-list');
    if (!list) return;

    try {
        const enderecos = await apiListarEnderecos();
        window.billingAddresses = enderecos;
    } catch (e) {
        console.warn('Erro ao carregar endereços do servidor, usando cache local:', e);
    }

    list.innerHTML = '';
    setBillingFormMode(Boolean(document.getElementById('billing-edit-index')?.value));

    if (!window.billingAddresses.length) {
        list.innerHTML = `
            <div class="billing-empty-state">
                <strong>Nenhum endereço salvo</strong>
                <span>Adicione um endereço para faturamento usando o formulário abaixo.</span>
            </div>
        `;
        return;
    }

    window.billingAddresses.forEach((address, index) => {
        const card = document.createElement('article');
        card.className = 'billing-address-card';
        card.innerHTML = `
            <div class="billing-address-main">
                <div class="billing-address-topline">
                    <strong>${escapeHTML(address.label)}</strong>
                    <span>${escapeHTML(address.state)}</span>
                </div>
                <p>${escapeHTML(address.street)}, ${escapeHTML(address.number)}${address.complement ? ' - ' + escapeHTML(address.complement) : ''}</p>
                <p>${escapeHTML(address.city)} - ${escapeHTML(address.state)} | CEP ${escapeHTML(address.zip)}</p>
            </div>
            <div class="billing-address-actions">
                <button type="button" onclick="startEditBillingAddress(${index})">Editar</button>
                <button type="button" class="danger" onclick="openBillingDeleteModal(${index})">Remover</button>
            </div>
        `;
        list.appendChild(card);
    });
}

async function handleBillingAddressSubmit(event) {
    event.preventDefault();

    const form = event.target;
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const address = getBillingAddressFormValues();
    const zipNumbers = address.zip.replace(/\D/g, '');

    if (address.state.length !== 2) {
        showModal('Informe a UF com 2 letras, como RS ou SP.');
        document.getElementById('billing-state')?.focus();
        return;
    }

    if (zipNumbers.length !== 8) {
        showModal('Informe um CEP válido com 8 números.');
        document.getElementById('billing-zip')?.focus();
        return;
    }

    address.zip = zipNumbers.replace(/(\d{5})(\d{3})/, '$1-$2');

    const editIndexInput = document.getElementById('billing-edit-index');
    const editIndex = editIndexInput ? editIndexInput.value : '';

    try {
        if (editIndex === '') {
            await apiAdicionarEndereco(address);
            showSuccessModal('Endereço de faturamento adicionado com sucesso.', 'Endereço salvo!');
        } else {
            const existing = window.billingAddresses[Number(editIndex)];
            if (existing && existing.id) {
                await apiEditarEndereco(existing.id, address);
            }
            showSuccessModal('Endereço de faturamento atualizado com sucesso.', 'Endereço atualizado!');
        }
    } catch (err) {
        showModal(err.message || 'Erro ao salvar endereço.');
        return;
    }

    form.reset();
    if (editIndexInput) editIndexInput.value = '';
    setBillingFormMode(false);
    renderBillingAddresses();
}

function startEditBillingAddress(index) {
    const address = window.billingAddresses[index];
    if (!address) return;

    document.getElementById('billing-edit-index').value = index;
    document.getElementById('billing-address-label').value = address.label;
    document.getElementById('billing-street').value = address.street;
    document.getElementById('billing-number').value = address.number;
    document.getElementById('billing-complement').value = address.complement;
    document.getElementById('billing-city').value = address.city;
    document.getElementById('billing-state').value = address.state;
    document.getElementById('billing-zip').value = address.zip;

    setBillingFormMode(true);
    document.getElementById('billing-address-label')?.focus();
}

let pendingBillingDeleteIndex = null;

function openBillingDeleteModal(index) {
    const address = window.billingAddresses[index];
    if (!address) return;
    pendingBillingDeleteIndex = index;

    const modal = document.getElementById('billing-delete-modal');
    const message = document.getElementById('billing-delete-message');
    if (message) {
        message.textContent = `O endereço "${address.label}" será removido da sua lista de faturamento.`;
    }
    if (modal) {
        modal.classList.add('active-modal');
    }
}

function closeBillingDeleteModal() {
    const modal = document.getElementById('billing-delete-modal');
    pendingBillingDeleteIndex = null;
    if (modal) {
        modal.classList.remove('active-modal');
    }
}

async function confirmBillingAddressDelete() {
    if (pendingBillingDeleteIndex === null) return;
    const address = window.billingAddresses[pendingBillingDeleteIndex];
    if (address && address.id) {
        try {
            await apiExcluirEndereco(address.id);
        } catch (err) {
            showModal(err.message || 'Erro ao remover endereço.');
            closeBillingDeleteModal();
            return;
        }
    }
    window.billingAddresses.splice(pendingBillingDeleteIndex, 1);
    cancelBillingEdit();
    renderBillingAddresses();
    closeBillingDeleteModal();
    showSuccessModal('Endereço removido da lista.', 'Endereço removido!');
}

function cancelBillingEdit() {
    const form = document.getElementById('billing-address-form');
    const editIndexInput = document.getElementById('billing-edit-index');
    if (form) form.reset();
    if (editIndexInput) editIndexInput.value = '';
    setBillingFormMode(false);
}

function cancelEditBillingAddress() {
    cancelBillingEdit();
}

document.addEventListener('DOMContentLoaded', () => {
    const stateInput = document.getElementById('billing-state');
    const zipInput = document.getElementById('billing-zip');
    const newPasswordInput = document.getElementById('cp-new-password');
    const confirmPasswordInput = document.getElementById('cp-confirm-password');

    if (stateInput) {
        stateInput.addEventListener('input', () => {
            stateInput.value = stateInput.value.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 2);
        });
    }

    if (zipInput) {
        zipInput.addEventListener('input', () => {
            const numbers = zipInput.value.replace(/\D/g, '').slice(0, 8);
            zipInput.value = numbers.length > 5 ? numbers.replace(/(\d{5})(\d{0,3})/, '$1-$2') : numbers;
        });
    }

    [newPasswordInput, confirmPasswordInput].forEach(input => {
        if (!input) return;
        input.addEventListener('input', () => {
            const feedback = document.getElementById('cp-password-feedback');
            resetChangePasswordFeedback();
            if (!feedback) return;
            if (!newPasswordInput.value || !confirmPasswordInput.value) return;
            if (newPasswordInput.value === confirmPasswordInput.value) {
                feedback.textContent = 'As senhas conferem.';
                feedback.classList.add('success');
                newPasswordInput.closest('.input-group')?.classList.add('input-success');
                confirmPasswordInput.closest('.input-group')?.classList.add('input-success');
            } else {
                feedback.textContent = 'As senhas ainda não conferem.';
                feedback.classList.add('error');
                confirmPasswordInput.closest('.input-group')?.classList.add('input-error');
            }
        });
    });
});

// --- MOSTRAR/OCULTAR SENHA ---
function togglePassword(iconElement) {
    const inputField = iconElement.previousElementSibling;
    if (inputField.type === "password") {
        inputField.type = "text";
        iconElement.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;
    } else {
        inputField.type = "password";
        iconElement.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
    }
}

// ============================================================
// LOGIN — com fetch para o backend Flask
// ============================================================

function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();

    apiLogin({ email, password })
        .then(resp => {
            window.loggedUser = resp.usuario;
            cart = []; 
            if (typeof renderCart === "function") renderCart(); 
            window.stockCache = {};

            // Atualiza tela de Perfil com dados reais do usuário logado
            try {
                renderProfileFromLoggedUser();
            } catch (e) {
                console.warn('Falha ao renderizar perfil:', e);
            }

            navigateTo('screen-stores');
        })
        .catch(err => {
            showModal(err.message || 'Email ou senha incorretos.');
        });
}


function handleEmployeeLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('emp-login-email').value.trim();
    const password = document.getElementById('emp-login-password').value.trim();

    apiLoginFuncionario({ email, password })
        .then(resp => {
            window.employeeName = resp.nome;
            window.employeeStockCache = null;
            navigateTo('screen-employee-orders');
        })
        .catch(err => {
            showModal(err.message || 'Credenciais de funcionário inválidas.');
        });
}

// ============================================================
// PERFIL DO CLIENTE — preencher nome/e-mail reais
// ============================================================
function renderProfileFromLoggedUser() {
    const u = window.loggedUser;
    if (!u) return;

    const avatarEl = document.querySelector('#screen-profile-placeholder .profile-avatar');
    const nameEl = document.querySelector('#screen-profile-placeholder .profile-user-name');
    const emailEl = document.querySelector('#screen-profile-placeholder .profile-user-email');

    const name = (u.nome || '').toString().trim();
    const email = (u.email || u.userEmail || '').toString().trim();

    // Se usuário não tiver nome/email retornados, não mexe no template estático.
    if (!name && !email) return;

    // No template existe uma seção “Nome Completo” (abaixo). Atualizamos só o 1º nome no cabeçalho,
    // para ficar mais limpo.
    const firstName = name ? name.split(/\s+/).filter(Boolean)[0] : '';

    if (avatarEl) {
        const initials = firstName ? firstName.split(/\s+/).slice(0, 2).map(p => p[0]).join('').toUpperCase() : 'U';
        avatarEl.textContent = initials || 'U';
    }

    if (nameEl && firstName) nameEl.textContent = firstName;
    if (emailEl && email) emailEl.textContent = email;

    // “Nome Completo” (se existir)
    const fullNameEl = document.querySelector('#screen-profile-placeholder .profile-data-grid .data-item:nth-child(1) p');
    if (fullNameEl && name) fullNameEl.textContent = name;
}




function handleStoreSearch() {
    const searchInput = document.querySelector('.search-box input');
    if (!searchInput) return;
    const normalize = (text) => text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    const searchTerm = normalize(searchInput.value);
    const storeCards = document.querySelectorAll('.store-card');

    storeCards.forEach(card => {
        const storeName = normalize(card.querySelector('.store-name').textContent);
        const storeAddress = normalize(card.querySelector('.store-address').textContent);
        if (storeName.includes(searchTerm) || storeAddress.includes(searchTerm)) {
            card.style.display = ''; 
        } else {
            card.style.display = 'none'; 
        }
    });
}

function handleProductSearch() {
    const searchInput = document.querySelector('.product-search-input');
    if (!searchInput) return;
    const normalize = (text) => text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    const searchTerm = normalize(searchInput.value);
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        const nameEl = card.querySelector('.product-name') || card.querySelector('h3');
        const productName = nameEl ? normalize(nameEl.textContent) : '';
        if (productName.includes(searchTerm)) {
            card.style.display = ''; 
        } else {
            card.style.display = 'none';
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const nameInput = document.getElementById('cc-name');
    if (nameInput) {
        nameInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.toUpperCase();
        });
    }
});

function updateNotificationBadge() {
    const unreadCount = document.querySelectorAll('.notification-card.unread').length;
    const badges = document.querySelectorAll('.notif-badge');
    badges.forEach(badge => {
        if (unreadCount > 0) {
            badge.style.display = 'flex'; 
            badge.textContent = unreadCount; 
        } else {
            badge.style.display = 'none'; 
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    updateNotificationBadge();
});

function toggleReadState(notificationId) {
    const card = document.getElementById(notificationId);
    if (!card) return;
    if (card.classList.contains('unread')) {
        card.classList.remove('unread');
        const secondaryBtn = card.querySelector('.notif-action-btn.secondary');
        if (secondaryBtn) secondaryBtn.remove();
        const dot = card.querySelector('.unread-dot');
        if (dot) dot.remove();
    }
    checkEmptyNotifications();
    updateNotificationBadge(); 
}

function markAllNotificationsAsRead() {
    const unreadCards = document.querySelectorAll('.notification-card.unread');
    unreadCards.forEach(card => {
        card.classList.remove('unread');
        const secondaryBtn = card.querySelector('.notif-action-btn.secondary');
        if (secondaryBtn) secondaryBtn.remove();
        const dot = card.querySelector('.unread-dot');
        if (dot) dot.remove();
    });
    checkEmptyNotifications();
    updateNotificationBadge(); 
}

function checkEmptyNotifications() {
    const list = document.getElementById('notifications-list');
    const emptyState = document.getElementById('notifications-empty');
    if (!list || !emptyState) return;
    const cards = list.querySelectorAll('.notification-card');
    if (cards.length === 0) {
        list.style.display = 'none';
        emptyState.style.display = 'flex';
    } else {
        list.style.display = 'flex';
        emptyState.style.display = 'none';
    }
}

let currentSelectedStore = ""; 
let cart = []; 
let orders = []; 

function selectStore(storeName) {
    currentSelectedStore = storeName;
    const titleElement = document.getElementById('stock-screen-title');
    if (titleElement) {
        titleElement.textContent = `Estoque - Loja ${storeName}`;
    }
    const searchInput = document.querySelector('#screen-stock .search-box input');
    if (searchInput) searchInput.value = "";
    refreshProductStockBadges();
    applyProductFilters();
    navigateTo('screen-stock');
}

// ============================================================
// ESTOQUE — via API do backend (com fallback síncrono)
// ============================================================
window.stockDatabase = window.stockDatabase || null;

// Fallback local para usar quando o servidor não estiver disponível
window._stockFallback = {
    'Monitor Gamer 24" LED FHD': 25,
    'Cafeteira Elétrica Inox': 12,
    'Smartphone 128GB Ultra': 8,
    'Fone Bluetooth Noise Cancelling': 3,
    'Teclado Mecânico RGB': 18,
    'Notebook Intel i5 16GB RAM': 6,
    'Liquidificador Turbo 1000W': 0,
    'Smart TV 4K 50" Crystal': 10,
    'Carregador Rápido GaN 65W': 4,
    'Console PlayStation 5 Slim': 2
};

async function initializeStockDatabase() {
    if (window.stockDatabase) return;
    // Primeiro usa o fallback para que as funções síncronas funcionem
    window.stockDatabase = { ...window._stockFallback };
    // Depois tenta atualizar do servidor (assíncrono)
    try {
        const produtos = await apiListarProdutos();
        window.stockDatabase = {};
        produtos.forEach(p => {
            window.stockDatabase[p.nome] = p.quantidade;
        });
    } catch (e) {
        console.warn('Erro ao carregar estoque do servidor, usando fallback local.');
    }
}

function getStockStatus(productName) {
    const key = findStockKey(productName);
    if (!key) return { text: 'Indisponível', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.15)', state: 'out' };
    const qty = window.stockDatabase[key];
    if (qty === 0) return { text: 'Indisponível', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.15)', state: 'out' };
    if (qty <= 5) return { text: 'Baixo Estoque', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)', state: 'in' };
    return { text: 'Disponível', color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)', state: 'in' };
}

function refreshProductStockBadges() {
    initializeStockDatabase().then(() => {
        const productCards = document.querySelectorAll('.product-card');
        productCards.forEach(card => {
            const nameElement = card.querySelector('.product-name');
            if (!nameElement) return;
            const productName = nameElement.textContent.trim();
            const existingBadge = card.querySelector('.stock-badge');
            if (existingBadge) existingBadge.remove();
            const stockInfo = getStockStatus(productName);
            const badge = document.createElement('span');
            badge.className = 'stock-badge';
            badge.style.display = 'inline-block';
            badge.style.padding = '4px 8px';
            badge.style.borderRadius = '4px';
            badge.style.fontSize = '11.5px';
            badge.style.fontWeight = '600';
            badge.style.marginTop = '8px';
            badge.style.color = stockInfo.color;
            badge.style.backgroundColor = stockInfo.bg;
            badge.textContent = stockInfo.text;
            if (nameElement.parentElement) {
                nameElement.parentElement.appendChild(badge);
            }
            const addBtn = card.querySelector('.add-product-btn');
            if (addBtn) {
                if (stockInfo.state === 'out') {
                    addBtn.style.opacity = '0.5';
                    addBtn.style.cursor = 'not-allowed';
                    addBtn.innerHTML = 'Esgotado';
                    card.setAttribute('data-stock', 'out');
                } else {
                    addBtn.style.opacity = '1';
                    addBtn.style.cursor = 'pointer';
                    addBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`;
                    card.setAttribute('data-stock', 'in');
                }
            }
        });
    });
}

function applyProductFilters() {
    const searchInput = document.querySelector('#screen-stock .search-box input');
    const normalize = (text) => text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    const searchTerm = searchInput ? normalize(searchInput.value) : "";
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        const nameElement = card.querySelector('.product-name');
        if (!nameElement) return; 
        const productName = normalize(nameElement.textContent);
        const allowedStoresAttr = card.getAttribute('data-stores') || "";
        const allowedStores = allowedStoresAttr.split(',').map(s => s.trim());
        const matchesStore = allowedStores.includes(currentSelectedStore);
        const matchesSearch = productName.includes(searchTerm);
        if (matchesStore && matchesSearch) {
            card.style.display = ''; 
        } else {
            card.style.display = 'none';
        }
    });
}

function normalizeProductName(name) {
    return name.replace(/[''"”'´`\u2019\u2018]/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
}

function findStockKey(productName) {
    initializeStockDatabase();
    const normalized = normalizeProductName(productName);
    for (const key of Object.keys(window.stockDatabase)) {
        if (normalizeProductName(key) === normalized) {
            return key;
        }
    }
    return null;
}

function getAvailableStock(productName) {
    initializeStockDatabase();
    const key = findStockKey(productName);
    if (!key) return 0;
    return window.stockDatabase[key];
}

function addToOrder(productName) {
    let productPriceText = "R$ 0,00";
    let productNumericPrice = 0;
    let isOutOfStock = false;

    const normalizeText = (text) => text.toLowerCase().replace(/['"”'´`]/g, '').trim();
    const cards = document.querySelectorAll('.product-card');

    for (let card of cards) {
        const nameElement = card.querySelector('.product-name');
        if (nameElement && normalizeText(nameElement.textContent) === normalizeText(productName)) {
            if (card.getAttribute('data-stock') === 'out') {
                isOutOfStock = true;
                break;
            }
            const priceElement = card.querySelector('.product-price');
            if (priceElement) {
                productPriceText = priceElement.textContent.trim();
                let numString = productPriceText.replace('R$', '').trim().replace(/\./g, '').replace(',', '.');
                productNumericPrice = parseFloat(numString);
            }
            break;
        }
    }

    if (isOutOfStock) {
        if (typeof showModal === "function") {
            showModal(`Puxa! O produto "${productName}" está Indisponível no momento nesta filial.`);
        } else {
            alert(`Puxa! O produto "${productName}" está Indisponível no momento nesta filial.`);
        }
        return;
    }

    initializeStockDatabase();
    const availableQty = getAvailableStock(productName);
    const inCartQty = (Array.isArray(cart) ? cart : [])
        .filter(it => it && it.name === productName && it.store === currentSelectedStore)
        .reduce((sum, it) => sum + (it.quantity || 1), 0);

    if (inCartQty >= availableQty) {
        if (typeof showModal === "function") {
            showModal(`Desculpe! Não há mais estoque disponível de "${productName}". Apenas ${availableQty} unidade(s) em estoque.`);
        } else {
            alert(`Desculpe! Não há mais estoque disponível de "${productName}".`);
        }
        return;
    }

    const existingIndex = (Array.isArray(cart) ? cart : []).findIndex(
        (it) => it && it.name === productName && it.store === currentSelectedStore
    );

    if (existingIndex !== -1) {
        const existing = cart[existingIndex];
        existing.quantity = (existing.quantity || 1) + 1;
        if (typeof existing.priceValue !== 'number' || Number.isNaN(existing.priceValue)) {
            existing.priceValue = productNumericPrice;
        }
        if (!existing.priceText) {
            existing.priceText = productPriceText;
        }
        showSuccessModal(`Quantidade de "${productName}" atualizada no seu pedido!`);
        renderCart();
        return;
    }

    cart.push({
        name: productName,
        store: currentSelectedStore,
        priceText: productPriceText,
        priceValue: productNumericPrice,
        quantity: 1
    });

    showSuccessModal(`"${productName}" foi adicionado ao seu pedido com sucesso!`);
    renderCart();
}

// Controladores do Pop-up de Sucesso Blindados
function showSuccessModal(message, title = 'Produto Adicionado!') {
    const modal = document.getElementById('success-modal');
    const msgEl = document.getElementById('success-message');
    const titleEl = document.getElementById('success-title');
    if (modal && msgEl) {
        if (titleEl) titleEl.textContent = title;
        msgEl.textContent = message;
        modal.classList.add('active-modal');
    } else {
        alert(message); 
    }
}

function closeSuccessModal() {
    const modal = document.getElementById('success-modal');
    if (modal) {
        modal.classList.remove('active-modal');
    }
}

// Renderização do Carrinho com Cálculo de Total
function renderCart() {
    const listContainer = document.getElementById('cart-items-list');
    const emptyMessage = document.getElementById('cart-empty-message');
    const totalContainer = document.getElementById('cart-total-container');
    const totalValueEl = document.getElementById('cart-total-value');

    if (!listContainer || !emptyMessage) return;

    cart = Array.isArray(cart) ? cart : [];
    listContainer.innerHTML = '';

    cart.forEach(item => {
        if (typeof item.quantity !== 'number' || item.quantity < 1) item.quantity = 1;
        if (typeof item.checked !== 'boolean') item.checked = false;
        const pv = item.priceValue;
        if (typeof pv !== 'number' || Number.isNaN(pv)) {
            const fallback = typeof item.priceText === 'string'
                ? item.priceText.replace('R$', '').trim().replace(/\./g, '').replace(',', '.')
                : 0;
            item.priceValue = parseFloat(fallback) || 0;
        }
    });

    if (cart.length === 0) {
        emptyMessage.style.display = 'block';
        if (totalContainer) totalContainer.style.display = 'none';
    } else {
        emptyMessage.style.display = 'none';
        if (totalContainer) totalContainer.style.display = 'flex';

        let totalAmount = 0;
        listContainer.innerHTML = '';
        cart.forEach((item, index) => {
            const subtotal = (item.priceValue || 0) * (item.quantity || 1);
            totalAmount += subtotal;
            const formattedSubtotal = (typeof formatMoney === 'function')
                ? formatMoney(subtotal)
                : subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

            listContainer.innerHTML += `
                <div style="background: #1F2937; padding: 15px; border-radius: 8px; border: 1px solid #374151; display: flex; justify-content: space-between; align-items: center; gap: 12px;">
                    <div style="display:flex; align-items:center; gap:12px; min-width: 0;">
                        <input type="checkbox"
                               class="cart-item-checkbox"
                               data-cart-index="${index}"
                               style="width: 20px; height: 20px; accent-color: #6366F1; cursor: pointer;"
                               ${item.checked ? 'checked' : ''}
                               onchange="toggleCartItemChecked(${index}, this.checked)" />
                        <div style="min-width: 0;">
                            <h3 style="color: #F9FAFB; margin: 0 0 5px 0; font-size: 16px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.name}</h3>
                            <p style="color: #818CF8; margin: 0 0 6px 0; font-size: 14px; display: flex; align-items: center; gap: 6px;">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                Retirada: Loja ${item.store}
                            </p>
                            <p style="color: #10B981; margin: 0; font-weight: bold; font-size: 15px;">${formattedSubtotal}</p>
                            <p style="color: #9CA3AF; margin: 6px 0 0 0; font-size: 12.5px;">${item.quantity}x de ${item.priceText}</p>
                        </div>
                    </div>
                    <div style="display:flex; align-items:center; gap:10px;">
                        <div style="display:flex; align-items:center; gap:8px;">
                            <button type="button" class="qty-btn" onclick="decreaseCartQuantity(${index})" style="width: 38px; height: 38px; border-radius: 10px; border: 1px solid #374151; background: #111827; color: #F3F4F6; font-size: 18px; cursor: pointer;">−</button>
                            <span style="min-width: 34px; text-align:center; color:#F9FAFB; font-weight:700;">${item.quantity}</span>
                            <button type="button" class="qty-btn" onclick="increaseCartQuantity(${index})" style="width: 38px; height: 38px; border-radius: 10px; border: 1px solid #374151; background: #111827; color: #F3F4F6; font-size: 18px; cursor: pointer;">+</button>
                        </div>
                        <button class="remove-item-btn" onclick="removeFromCart(${index})" style="background: transparent; border: 1px solid #EF4444; color: #EF4444; height: 40px; padding: 0 14px; border-radius: 10px; cursor: pointer; font-weight: 600;">Remover</button>
                    </div>
                </div>
            `;
        });

        if (totalValueEl) {
            totalValueEl.textContent = totalAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        }
    }

    const badges = document.querySelectorAll('.cart-badge');
    badges.forEach(badge => {
        if (cart.length > 0) {
            badge.style.display = 'flex';
            badge.textContent = cart.length;
        } else {
            badge.style.display = 'none';
        }
    });
}

function toggleCartItemChecked(cartIndex, isChecked) {
    if (typeof cartIndex !== 'number' || !cart[cartIndex]) return;
    cart[cartIndex].checked = Boolean(isChecked);
}

function increaseCartQuantity(cartIndex) {
    if (typeof cartIndex !== 'number' || !cart[cartIndex]) return;
    const item = cart[cartIndex];
    const availableQty = getAvailableStock(item.name);
    const newQty = (item.quantity || 1) + 1;
    if (newQty > availableQty) {
        if (typeof showModal === "function") {
            showModal(`Desculpe! Não há estoque suficiente de "${item.name}". Apenas ${availableQty} unidade(s) disponíveis.`);
        } else {
            alert(`Desculpe! Não há estoque suficiente de "${item.name}".`);
        }
        return;
    }
    item.quantity = newQty;
    renderCart();
}

function decreaseCartQuantity(cartIndex) {
    if (typeof cartIndex !== 'number' || !cart[cartIndex]) return;
    const currentQty = cart[cartIndex].quantity || 1;
    if (currentQty <= 1) {
        cart.splice(cartIndex, 1);
    } else {
        cart[cartIndex].quantity = currentQty - 1;
    }
    renderCart();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    renderCart();
}

function goToCheckout() {
    if (!cart || cart.length === 0) {
        if (typeof showModal === "function") {
            showModal("Seu carrinho está vazio! Adicione produtos antes de realizar o pedido.");
        } else {
            alert("Seu carrinho está vazio! Adicione produtos antes de realizar o pedido.");
        }
        return;
    }

    const anyChecked = cart.some(item => item && item.checked === true);
    if (!anyChecked) {
        if (typeof showModal === "function") {
            showModal("Você precisa selecionar pelo menos um item no carrinho para realizar o pedido.");
        } else {
            alert("Você precisa selecionar pelo menos um item no carrinho para realizar o pedido.");
        }
        return;
    }

    const checkedCartItems = cart.filter(item => item && item.checked === true);
    const radioButtons = document.querySelectorAll('input[name="payment_method"]');
    radioButtons.forEach(radio => radio.checked = false);
    document.querySelectorAll('.payment-card').forEach(card => {
        card.classList.remove('active-payment-box');
    });
    const pixDetails = document.getElementById('pix-details-container');
    const cardDetails = document.getElementById('card-details-container');
    if (pixDetails) pixDetails.style.display = 'none';
    if (cardDetails) cardDetails.style.display = 'none';
    window._checkoutSelectedItems = JSON.parse(JSON.stringify(checkedCartItems));
    renderCheckoutSummary(checkedCartItems);
    navigateTo('screen-checkout');
}

function renderCheckoutSummary(cartItems) {
    const itemsListContainer = document.getElementById('checkout-items-list');
    const totalValueContainer = document.getElementById('checkout-total-value');
    if (!itemsListContainer) return;
    itemsListContainer.innerHTML = '';
    let orderTotalValue = 0;
    cartItems.forEach(item => {
        let unitPrice = item.priceValue || 0;
        const quantity = item.quantity || 1;
        const subtotal = unitPrice * quantity;
        orderTotalValue += subtotal;
        const formattedUnitPrice = unitPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        const formattedSubtotal = subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        const itemCard = document.createElement('div');
        itemCard.style.display = 'flex';
        itemCard.style.justifyContent = 'space-between';
        itemCard.style.alignItems = 'center';
        itemCard.style.padding = '12px 15px';
        itemCard.style.background = '#1F2937';
        itemCard.style.border = '1px solid #374151';
        itemCard.style.borderRadius = '8px';
        itemCard.style.marginBottom = '10px';
        itemCard.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 4px;">
                <span style="color: #F9FAFB; font-weight: 500;">${item.name}</span>
                <span style="color: #9CA3AF; font-size: 0.85rem;">${quantity}x de ${formattedUnitPrice}</span>
            </div>
            <div style="color: #F3F4F6; font-weight: 600;">${formattedSubtotal}</div>
        `;
        itemsListContainer.appendChild(itemCard);
    });
    if (totalValueContainer) {
        totalValueContainer.textContent = orderTotalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }
    if (typeof updateInstallments === "function") updateInstallments();
}

// ============================================================
// PEDIDOS DO CLIENTE — via API
// ============================================================

async function renderOrders() {
    const ordersList = document.getElementById('orders-list');
    const emptyState = document.getElementById('orders-empty');
    if (!ordersList || !emptyState) return;

    try {
        const pedidos = await apiListarPedidosCliente();
        // Só substitui se veio uma lista válida do servidor
        if (Array.isArray(pedidos)) {
            orders = pedidos;
        }
    } catch (e) {
        console.warn('Erro ao carregar pedidos do servidor, mantendo lista local:', e);
    }

    ordersList.innerHTML = '';

    if (orders.length === 0) {
        ordersList.style.display = 'none';
        emptyState.style.display = 'flex';
        emptyState.style.flexDirection = 'column';
        emptyState.style.alignItems = 'center';
        emptyState.style.justifyContent = 'center';
        emptyState.style.textAlign = 'center';
        emptyState.style.width = '100%';
        emptyState.style.maxWidth = '480px'; 
        emptyState.style.margin = '60px auto'; 
        emptyState.style.padding = '40px 20px';
        emptyState.style.gap = '16px'; 
    } else {
        emptyState.style.display = 'none';
        ordersList.style.display = 'flex';
        ordersList.style.flexDirection = 'column';
        ordersList.style.gap = '15px';
        ordersList.style.width = '100%';
        ordersList.style.maxWidth = '800px'; 
        ordersList.style.margin = '0 auto';   
        ordersList.style.padding = '10px';

        orders.forEach((order) => {
            const orderCard = document.createElement('div');
            orderCard.style.background = '#1F2937';
            orderCard.style.border = '1px solid #374151';
            orderCard.style.borderRadius = '12px';
            orderCard.style.padding = '15px';
            orderCard.style.marginBottom = '10px';

            const isCreditCard = order.paymentMethod === 'credit_card';
            const installments = order.installments || 1;
            const hasInstallments = isCreditCard && installments > 1;
            const totalFormatted = order.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

            const headerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
                    <div>
                        <h3 style="color: #F9FAFB; margin: 0 0 4px 0; font-size: 16px; font-weight: 600;">Pedido ${order.id}</h3>
                        <p style="color: #9CA3AF; margin: 0; font-size: 13px;">${order.date}</p>
                    </div>
                    <span style="background: #10B981; color: #F9FAFB; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">${order.status}</span>
                </div>
                <div style="border-top: 1px solid #374151; margin: 10px 0;"></div>
            `;

            let itemsHTML = '<div style="margin-bottom: 12px;">';
            (order.items || []).forEach((item) => {
                let itemInstallmentHTML = '';
                if (hasInstallments && item.priceValue) {
                    const itemInstValue = item.priceValue / installments;
                    const itemInstFormatted = itemInstValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                    itemInstallmentHTML = `<span style="font-size: 11.5px; color: #9CA3AF; font-weight: normal; margin-top: 2px;">(${installments}x de ${itemInstFormatted})</span>`;
                }
                itemsHTML += `
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; padding: 8px 0; color: #E5E7EB; font-size: 14px;">
                        <div>
                            <p style="margin: 0; color: #F9FAFB; font-weight: 500;">${item.name}</p>
                            <p style="margin: 14px 0 2px 0; color: #9CA3AF; font-size: 12px; display: flex; align-items: center; gap: 4px;">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                Loja ${item.store}
                            </p>
                        </div>
                        <div style="text-align: right; display: flex; flex-direction: column; align-items: flex-end;">
                            <span style="color: #10B981; font-weight: 600;">${item.priceText}</span>
                            ${itemInstallmentHTML}
                            ${typeof item.quantity !== 'undefined' ? `<span style="color: #9CA3AF; font-size: 12px; font-weight: 500; margin-top: 2px;">Quantidade: ${item.quantity}</span>` : ''}
                        </div>
                    </div>
                `;
            });
            itemsHTML += '</div>';

            let totalInstallmentHTML = '';
            if (hasInstallments) {
                const totalInstValue = order.total / installments;
                const totalInstFormatted = totalInstValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                totalInstallmentHTML = `<span style="color: #10B981; font-size: 13.5px; font-weight: 600; margin-top: 2px;">(${installments}x de ${totalInstFormatted})</span>`;
            }

            const safeId = (order.id || '').replace('#', '');

            const footerHTML = `
                <div style="border-top: 1px solid #374151; padding-top: 12px; margin-top: 12px;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                        <span style="color: #9CA3AF; font-size: 14px; margin-top: 2px;">Total:</span>
                        <div style="text-align: right; display: flex; flex-direction: column; align-items: flex-end;">
                            <span style="color: #F9FAFB; font-weight: 700; font-size: 18px;">${totalFormatted}</span>
                            ${totalInstallmentHTML}
                        </div>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
                        <span style="color: #9CA3AF; font-size: 12px;">Pagamento: ${order.paymentMethod === 'pix' ? 'PIX' : `Cartão de Crédito (${installments}x)`}</span>
                    </div>
                    ${order.observation ? `<div style="margin-top: 10px; padding: 8px; background: #111827; border-radius: 6px; border-left: 3px solid #818CF8;">
                        <p style="margin: 0; color: #9CA3AF; font-size: 12px;"><strong>Observação:</strong> ${order.observation}</p>
                    </div>` : ''}
                    <div style="margin-top: 15px; border-top: 1px dashed #4B5563; padding-top: 15px; text-align: center;">
                        <button id="qr-btn-${safeId}"
                                onclick="generateOrderQRCode('${order.id}', 'qr-container-${safeId}', 'qr-btn-${safeId}', '${order.status}')"
                                ${order.status === 'Finalizado' ? 'disabled' : ''}
                                style="background: transparent; border: 1px solid #6366F1; color: #818CF8; padding: 10px 16px; border-radius: 8px; cursor: ${order.status === 'Finalizado' ? 'not-allowed' : 'pointer'}; opacity: ${order.status === 'Finalizado' ? '0.6' : '1'}; font-size: 13px; font-weight: 600; transition: 0.2s; width: 100%; max-width: 250px; display: inline-flex; align-items: center; justify-content: center; gap: 8px; margin: 0 auto;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><rect x="7" y="7" width="3" height="3"></rect><rect x="14" y="7" width="3" height="3"></rect><rect x="7" y="14" width="3" height="3"></rect><rect x="14" y="14" width="3" height="3"></rect></svg>
                            Gerar QR Code de Retirada
                        </button>
                        <div id="qr-container-${safeId}" style="display: none; flex-direction: column; align-items: center; justify-content: center; margin-top: 15px; animation: fadeIn 0.4s ease;"></div>
                    </div>
                </div>
            `;

            orderCard.innerHTML = headerHTML + itemsHTML + footerHTML;
            ordersList.appendChild(orderCard);
        });
    }
}

// ============================================================
// CONFIRMAR PEDIDO — envia para o backend
// ============================================================

async function confirmFinalOrder(event) {
    if (event) {
        if (typeof event.preventDefault === 'function') event.preventDefault();
        if (typeof event.stopPropagation === 'function') event.stopPropagation();
    }

    const selectedPayment = document.querySelector('input[name="payment_method"]:checked')?.value;

    const observationText = document.querySelector('.checkout-textarea')?.value || '';

    if (!selectedPayment) {
        if (typeof showModal === "function") {
            showModal("Por favor, selecione um método de pagamento antes de finalizar o seu pedido.");
        } else {
            alert("Por favor, selecione um método de pagamento antes de finalizar o seu pedido.");
        }
        return;
    }

    const checkoutItems = Array.isArray(window._checkoutSelectedItems) ? window._checkoutSelectedItems : [];

    if (!checkoutItems.length) {
        if (typeof showModal === "function") {
            showModal("Você precisa selecionar pelo menos um item no carrinho para realizar o pedido.");
        } else {
            alert("Você precisa selecionar pelo menos um item no carrinho para realizar o pedido.");
        }
        return;
    }

    if (selectedPayment === 'credit_card') {
        const ccNumber = document.getElementById('cc-number')?.value?.trim() || '';
        const ccName = document.getElementById('cc-name')?.value?.trim() || '';
        const ccExpiry = document.getElementById('cc-expiry')?.value?.trim() || '';
        const ccCvv = document.getElementById('cc-cvv')?.value?.trim() || '';
        if (!ccNumber || !ccName || !ccExpiry || !ccCvv) {
            if (typeof showModal === "function") {
                showModal("Por favor, preencha todos os dados obrigatórios do cartão de crédito.");
            } else {
                alert("Por favor, preencha todos os dados obrigatórios do cartão de crédito.");
            }
            return;
        }
        if (ccExpiry.length < 5) {
            if (typeof showModal === "function") {
                showModal("Por favor, insira uma data de validade válida no formato MM/AA (ex: 12/29).");
            } else {
                alert("Por favor, insira uma data de validade válida no formato MM/AA.");
            }
            return;
        }
        if (ccCvv.length < 3) {
            if (typeof showModal === "function") {
                showModal("O código de segurança (CVV) do cartão deve ter pelo menos 3 dígitos.");
            } else {
                alert("O código de segurança (CVV) do cartão deve ter pelo menos 3 dígitos.");
            }
            return;
        }
    }

    let orderTotal = 0;
    checkoutItems.forEach(item => {
        const pv = item?.priceValue || 0;
        const qty = item?.quantity || 1;
        orderTotal += pv * qty;
    });

    const ccInstallmentsEl = document.getElementById('cc-installments');
    const ccInstallments = ccInstallmentsEl ? ccInstallmentsEl.value : 1;

const itemsToSave = checkoutItems.map(item => ({
        name: item.name,
        store: item.store,
        quantity: item.quantity || 1,
        priceText: item.priceText,
        priceValue: item.priceValue,
        // SKU para sincronizar itens de pedidos do cliente com alterações do funcionário.
        sku: item.sku
    }));


    const pedidoPayload = {
        date: new Date().toLocaleString('pt-BR', { 
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        }),
        clientId: window.loggedUser?.id,
        clientName: window.loggedUser?.nome,
        items: itemsToSave,
        total: orderTotal,
        paymentMethod: selectedPayment || 'pix',
        installments: selectedPayment === 'credit_card' ? ccInstallments : 1,
        observation: observationText,
        status: 'Confirmado'
    };

    try {
        const resp = await apiCriarPedido(pedidoPayload);
        const newOrder = resp.pedido;

        // Adiciona ao array local para renderização imediata
        orders.push(newOrder);

        const storeName = newOrder.items.length > 0 ? newOrder.items[0].store : "Matriz";
        const generatedOrderId = newOrder.id;

        // Inicia polling do status do pedido do cliente para notificar mudanças (Pendente -> Em Separação -> ...)
        window._orderStatusPollState = window._orderStatusPollState || {};
        if (!window._orderStatusPollState[generatedOrderId]) {
            window._orderStatusPollState[generatedOrderId] = {
                lastStatus: newOrder.status,
            };
        }
        if (!window._orderStatusPollTimer) {
            window._orderStatusPollTimer = setInterval(async () => {
                if (!window.loggedUser) return;
                try {
                    const pedidos = await apiListarPedidosCliente();
                    if (!Array.isArray(pedidos)) return;
                    pedidos.forEach(p => {
                        if (!p || !p.id) return;

                        // só notifica para pedidos realmente criados por este usuário no backend (mesmo que sem autenticação real)
                        if (!window._orderStatusPollState[p.id]) {
                            // registra status inicial e segue (não notifica mudança no mesmo tick)
                            window._orderStatusPollState[p.id] = { lastStatus: p.status };
                            return;
                        }

                        const prev = window._orderStatusPollState[p.id].lastStatus;

                        // sincroniza array local SEMPRE que houver mudança no status,
                        // mas também substitui o objeto do pedido (items + status) para refletir nome/preço/estoque.
                        if (prev !== p.status) {
                            if (Array.isArray(orders)) {
                                const idx = orders.findIndex(o => o && o.id === p.id);
                                if (idx !== -1) {
                                    orders[idx] = p;
                                }
                            }

                            // notificação para o cliente acompanhar o fluxo
                            addOrderStatusNotification(p.id, p.status);

                            window._orderStatusPollState[p.id].lastStatus = p.status;

                            // re-renderiza a lista para refletir a mudança de status e itens
                            if (typeof renderOrders === 'function') {
                                renderOrders();
                            }
                        } else {
                            // mesmo sem trocar status, como os itens podem mudar (ex: edição de produto),
                            // atualizamos o array local para manter UI consistente.
                            if (Array.isArray(orders)) {
                                const idx = orders.findIndex(o => o && o.id === p.id);
                                if (idx !== -1) {
                                    orders[idx] = p;
                                }
                            }
                        }
                    });

                } catch (e) {
                    // silencioso para não poluir UI
                }
            }, 3000);
        }

        // Remove a notificação fixa antiga; a partir daqui a notificação vem do polling conforme status muda.
        // setTimeout(() => {
        //     addOrderNotification(generatedOrderId, storeName);
        // }, 8000);

        // Remove itens comprados do carrinho
        const checkoutKeys = new Set(checkoutItems.map(ci => `${ci.store}__${ci.name}`));
        cart = (Array.isArray(cart) ? cart : []).filter(item => {
            const key = `${item.store}__${item.name}`;
            return !(checkoutKeys.has(key) && item.checked === true);
        });

        window._checkoutSelectedItems = [];
        if (typeof renderCart === "function") renderCart();

        const badges = document.querySelectorAll('.cart-badge');
        badges.forEach(b => {
            if (cart && cart.length > 0) {
                b.style.display = 'flex';
                b.textContent = cart.length;
            } else {
                b.style.display = 'none';
            }
        });

        if (typeof renderOrders === "function") renderOrders();

        if (typeof showOrderSuccessModal === "function") {
            showOrderSuccessModal(`O pedido ${newOrder.id} foi realizado com sucesso e já está no sistema da loja.`);
        } else {
            alert(`Pedido ${newOrder.id} confirmado com sucesso!`);
            navigateTo('screen-orders');
        }
    } catch (err) {
        showModal(err.message || 'Erro ao criar pedido no servidor.');
    }
}

// --- CONTROLADORES DO MODAL DE PEDIDO CONFIRMADO ---
function showOrderSuccessModal(message) {
    const modal = document.getElementById('order-success-modal');
    const msgEl = document.getElementById('order-success-message');
    const btnEl = document.getElementById('order-success-btn');
    if (modal && msgEl) {
        msgEl.textContent = message;
        if (btnEl) {
            btnEl.textContent = window._employeeModalPending ? 'Ver pedidos' : 'Ver meus pedidos';
        }
        modal.classList.add('active-modal');
    }
}

function closeOrderSuccessModal() {
    const modal = document.getElementById('order-success-modal');
    if (modal) {
        modal.classList.remove('active-modal');
    }
    if (window._employeeModalPending) {
        window._employeeModalPending = false;
        renderEmployeeOrders();
        navigateTo('screen-employee-orders');
    } else {
        navigateTo('screen-orders');
    }
}

// --- SISTEMA DE SELEÇÃO DE PAGAMENTO ---
function togglePaymentDetails() {
    const checkedRadio = document.querySelector('input[name="payment_method"]:checked');
    const pixDetails = document.getElementById('pix-details-container');
    const cardDetails = document.getElementById('card-details-container');
    document.querySelectorAll('.payment-card').forEach(card => {
        card.classList.remove('active-payment-box');
    });
    if (!checkedRadio) return; 
    const selectedCard = checkedRadio.closest('.payment-card');
    if (selectedCard) {
        selectedCard.classList.add('active-payment-box');
    }
    const selectedPayment = checkedRadio.value;
    if (selectedPayment === 'pix') {
        if (pixDetails) pixDetails.style.display = 'block';
        if (cardDetails) cardDetails.style.display = 'none';
        generatePixCode(); 
    } else if (selectedPayment === 'credit_card') {
        if (pixDetails) pixDetails.style.display = 'none';
        if (cardDetails) cardDetails.style.display = 'block';
    }
    if (typeof updateInstallments === "function") updateInstallments();
}

// --- GERADOR DE CÓDIGO PIX ALFANUMÉRICO ---
function generatePixCode() {
    const randomHash = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const pixCode = `00020126580014br.gov.bcb.pix0136${randomHash}5204000053039865802BR5913MegaLoja6009RioGrandeDoSul62070503***6304ABCD`;
    const pixCodeEl = document.getElementById('pix-code-text');
    if (pixCodeEl) {
        pixCodeEl.textContent = pixCode;
    }
}

function copyPixCode() {
    const pixText = document.getElementById('pix-code-text').textContent;
    navigator.clipboard.writeText(pixText).then(() => {
        const copyModal = document.getElementById('pix-copy-modal');
        if (copyModal) {
            copyModal.classList.add('active-modal');
        } else {
            alert("Código Pix copiado com sucesso!");
        }
    }).catch(err => {
        console.error('Erro ao copiar o código Pix:', err);
    });
}

function formatExpiryDate(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length >= 2) {
        let month = parseInt(value.slice(0, 2), 10);
        if (month > 12) value = '12' + value.slice(2);
        else if (month === 0) value = '01' + value.slice(2);
    } else if (value.length === 1 && value !== '0' && value !== '1') {
        value = '0' + value;
    }
    if (value.length === 4) {
        let month = parseInt(value.slice(0, 2), 10);
        let year = parseInt(value.slice(2, 4), 10);
        if (year < 26) year = 26;
        if (year === 26 && month < 6) month = 6;
        let strMonth = month.toString().padStart(2, '0');
        let strYear = year.toString();
        value = strMonth + strYear;
    }
    if (value.length >= 2) {
        value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    input.value = value;
}

// --- SISTEMA DINÂMICO DE NOTIFICAÇÕES ---
function addOrderStatusNotification(orderId, newStatus) {
    const list = document.getElementById('notifications-list');
    const emptyState = document.getElementById('notifications-empty');
    if (!list) return;

    const notifId = 'notif-' + Date.now();
    const notifCard = document.createElement('div');
    notifCard.className = 'notification-card unread';
    notifCard.id = notifId;
    notifCard.style.background = '#1F2937';
    notifCard.style.border = '1px solid #374151';
    notifCard.style.borderRadius = '12px';
    notifCard.style.padding = '15px';
    notifCard.style.position = 'relative';
    notifCard.style.animation = 'fadeIn 0.5s ease';

    const titleByStatus = (st) => {
        switch (st) {
            case 'Pendente': return 'Pedido Recebido!';
            case 'Em Separação': return 'Pedido em Separação!';
            case 'Pronto para Retirada': return 'Pedido Pronto para Retirada!';
            case 'Finalizado': return 'Pedido Finalizado!';
            case 'Cancelado': return 'Pedido Cancelado!';
            default: return 'Atualização do Pedido!';
        }
    };

    const title = titleByStatus(newStatus);

    notifCard.innerHTML = `
        <div style="display: flex; gap: 15px; align-items: flex-start;">
            <div style="background: rgba(99, 102, 241, 0.15); color: #6366F1; padding: 12px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            </div>
            <div style="flex: 1;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <h4 style="margin: 0; color: #F9FAFB; font-size: 15px; font-weight: 600;">${title}</h4>
                    <span class="unread-dot" style="width: 10px; height: 10px; background: #EF4444; border-radius: 50%; display: inline-block;"></span>
                </div>
                <p style="margin: 0 0 12px 0; color: #9CA3AF; font-size: 13.5px; line-height: 1.5;">
                    Seu pedido <strong>#${orderId}</strong> agora está como <strong>${newStatus}</strong>.
                </p>
                <div style="display: flex; gap: 10px;">
                    <button class="notif-action-btn primary" onclick="navigateTo('screen-orders'); toggleReadState('${notifId}')" style="background: #6366F1; color: white; border: none; padding: 8px 14px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600; transition: 0.2s;">Ver meus pedidos</button>
                    <button class="notif-action-btn secondary" onclick="toggleReadState('${notifId}')" style="background: transparent; color: #9CA3AF; border: 1px solid #4B5563; padding: 8px 14px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 500; transition: 0.2s;">Marcar como lido</button>
                </div>
            </div>
        </div>
    `;

    list.prepend(notifCard);
    if (emptyState) emptyState.style.display = 'none';
    list.style.display = 'flex';
    if (typeof updateNotificationBadge === "function") {
        updateNotificationBadge();
    }
}

function addOrderNotification(orderId, storeName) {  
    // legado - mantém caso algum fluxo antigo chame essa função

    const list = document.getElementById('notifications-list');
    const emptyState = document.getElementById('notifications-empty');
    if (!list) return;
    const notifId = 'notif-' + Date.now();
    const notifCard = document.createElement('div');
    notifCard.className = 'notification-card unread';
    notifCard.id = notifId;
    notifCard.style.background = '#1F2937';
    notifCard.style.border = '1px solid #374151';
    notifCard.style.borderRadius = '12px';
    notifCard.style.padding = '15px';
    notifCard.style.position = 'relative';
    notifCard.style.animation = 'fadeIn 0.5s ease';
    notifCard.innerHTML = `
        <div style="display: flex; gap: 15px; align-items: flex-start;">
            <div style="background: rgba(16, 185, 129, 0.15); color: #10B981; padding: 12px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            </div>
            <div style="flex: 1;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <h4 style="margin: 0; color: #F9FAFB; font-size: 15px; font-weight: 600;">Pedido Separado!</h4>
                    <span class="unread-dot" style="width: 10px; height: 10px; background: #EF4444; border-radius: 50%; display: inline-block;"></span>
                </div>
                <p style="margin: 0 0 12px 0; color: #9CA3AF; font-size: 13.5px; line-height: 1.5;">
                    O seu pedido <strong>${orderId}</strong> já foi separado e está aguardando você na sua respectiva filial. Não esqueça de levar o QR Code ou o número de pedido!
                </p>
                <div style="display: flex; gap: 10px;">
                    <button class="notif-action-btn primary" onclick="navigateTo('screen-orders'); toggleReadState('${notifId}')" style="background: #6366F1; color: white; border: none; padding: 8px 14px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600; transition: 0.2s;">Ver Pedido</button>
                    <button class="notif-action-btn secondary" onclick="toggleReadState('${notifId}')" style="background: transparent; color: #9CA3AF; border: 1px solid #4B5563; padding: 8px 14px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 500; transition: 0.2s;">Marcar como lido</button>
                </div>
            </div>
        </div>
    `;
    list.prepend(notifCard);
    if (emptyState) emptyState.style.display = 'none';
    list.style.display = 'flex';
    if (typeof updateNotificationBadge === "function") {
        updateNotificationBadge();
    }
}

// --- SISTEMA DINÂMICO DE PARCELAMENTO ---
function updateInstallments() {
    const slider = document.getElementById('cc-installments');
    const displayCard = document.getElementById('installment-display');
    const displaySummary = document.getElementById('checkout-installment-info');
    if (!slider) return;
    const installments = parseInt(slider.value);
    let orderTotalValue = 0;
    const checkoutItems = Array.isArray(window._checkoutSelectedItems) && window._checkoutSelectedItems.length > 0
        ? window._checkoutSelectedItems
        : (Array.isArray(cart) ? cart.filter(item => item && item.checked === true) : []);
    const itemsToUse = checkoutItems.length > 0 ? checkoutItems : (Array.isArray(cart) ? cart : []);
    itemsToUse.forEach(item => {
        orderTotalValue += (item.priceValue || 0) * (item.quantity || 1);
    });
    const installmentValue = orderTotalValue / installments;
    const formattedValue = installmentValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const text = `${installments}x de ${formattedValue}`;
    if (displayCard) displayCard.textContent = text;
    if (displaySummary) {
        displaySummary.textContent = text;
        const isCreditCard = document.querySelector('input[name="payment_method"]:checked')?.value === 'credit_card';
        displaySummary.style.display = isCreditCard && installments > 0 ? 'block' : 'none';
    }
}

// --- GERADOR DE QR CODE PARA PEDIDOS ---
function generateOrderQRCode(orderId, containerId, btnId, orderStatus) {
    const container = document.getElementById(containerId);
    const btn = document.getElementById(btnId);
    if (!container) return;
    const qrData = encodeURIComponent(orderId);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${qrData}`;
    container.innerHTML = `
        <div style="background: #FFFFFF; padding: 10px; border-radius: 8px; display: inline-block; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
            <img src="${qrUrl}" alt="QR Code do Pedido ${orderId}" style="display: block; width: 180px; height: 180px;">
        </div>
        <p style="color: #10B981; font-size: 13px; font-weight: 600; margin-top: 12px; display: flex; align-items: center; gap: 6px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            Código gerado com sucesso!
        </p>
        <p style="color: #9CA3AF; font-size: 12px; margin-top: 4px;">Apresente este código na tela do seu dispositivo na loja.</p>
    `;
    container.style.display = 'flex';
    if (btn) btn.style.display = 'none';
}

// ============================================================
// FUNCIONÁRIO — ESTOQUE via API
// ============================================================

if (typeof window.employeeStockCache === 'undefined') {
    window.employeeStockCache = null;
}

async function syncEmployeeCacheWithDatabase() {
    try {
        const produtos = await apiListarProdutos();
        window.employeeStockCache = produtos.map(p => ({
            sku: p.sku,
            name: p.nome,
            category: p.categoria || 'Geral',
            price: p.preco,
            qty: p.quantidade,
            badgeClass: p.badgeClass || 'badge-in-stock',
            statusText: p.statusText || 'Disponível'
        }));
    } catch (e) {
        console.warn('Erro ao carregar produtos do servidor:', e);
        if (window.employeeStockCache === null) {
            window.employeeStockCache = [];
        }
    }
}

async function renderEmployeeStock() {
    const productListContainer = document.querySelector('.stock-products-list');
    if (!productListContainer) return;

    await syncEmployeeCacheWithDatabase();

    productListContainer.innerHTML = ''; 
    
    let totalItems = window.employeeStockCache.length;
    let baixoEstoqueCount = 0;
    let esgotadoCount = 0;

    window.employeeStockCache.forEach(prod => {
        if (prod.qty === 0) esgotadoCount++;
        else if (prod.qty <= 5) baixoEstoqueCount++;
   
        productListContainer.innerHTML += `
            <div class="stock-product-row" style="position: relative; padding-right: 45px;">
                <div class="prod-main-info" onclick="openEditProductModal('${prod.sku}')" style="cursor: pointer;" title="Clique para editar">
                    <span class="prod-sku">${prod.sku}</span>
                    <h3>${prod.name}</h3>
                    <span class="prod-category">${prod.category}</span>
                </div>
                <div class="prod-meta-info">
                    <div class="prod-price" onclick="openEditProductModal('${prod.sku}')" style="cursor: pointer;" title="Clique para editar">${prod.price}</div>
                    <div class="prod-stock-status">
                        <span class="stock-qty" ${prod.qty === 0 ? 'style="color: #EF4444;"' : ''}>${prod.qty} un.</span>
                        <span class="stock-status-badge ${prod.badgeClass}">${prod.statusText}</span>
                    </div>
                </div>
                <button class="stock-delete-btn" onclick="removeEmployeeStockItem('${prod.sku}')" title="Remover Produto" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); margin: 0; padding: 8px;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            </div>
        `;
    });

    const kpiValues = document.querySelectorAll('.stock-kpi-card .kpi-value');
    if (kpiValues.length >= 3) {
        kpiValues[0].textContent = totalItems;
        kpiValues[1].innerHTML = `${baixoEstoqueCount} <small style="font-size: 12px; font-weight: normal; color: #F59E0B;">itens</small>`;
        kpiValues[2].innerHTML = `${esgotadoCount} <small style="font-size: 12px; font-weight: normal; color: #EF4444;">itens</small>`;
    }
}

function openAddProductModal() {
    const modal = document.getElementById('stock-add-modal');
    if (modal) modal.style.display = 'flex';
}

function closeAddProductModal() {
    const modal = document.getElementById('stock-add-modal');
    if (modal) {
        modal.style.display = 'none';
        const n = document.getElementById('stock-new-name');
        const p = document.getElementById('stock-new-price');
        const q = document.getElementById('stock-new-qty');
        if (n) n.value = '';
        if (p) p.value = '';
        if (q) q.value = '';
    }
}

async function handleCreateProduct(event) {
    if (event) event.preventDefault(); 

    const nameEl = document.getElementById('stock-new-name');
    const priceEl = document.getElementById('stock-new-price');
    const qtyEl = document.getElementById('stock-new-qty');

    if (!nameEl || !priceEl || !qtyEl) {
        console.error("Erro Crítico: Campos do formulário não foram encontrados no HTML.");
        return;
    }

    const name = nameEl.value.trim();
    let price = priceEl.value.trim();
    let qty = parseInt(qtyEl.value);

    if (!name || !price) return;
    if (isNaN(qty) || qty < 0) qty = 0;
    if (!price.toUpperCase().includes('R$')) price = `R$ ${price}`;

    try {
        await apiCriarProduto({ nome: name, preco: price, quantidade: qty });
    } catch (err) {
        showModal(err.message || 'Erro ao criar produto no servidor.');
        return;
    }

    closeAddProductModal();
    renderEmployeeStock();
}

function handleEmployeeStockSearch() {
    const searchInput = document.querySelector('.stock-search-input');
    if (!searchInput) return;
    const normalize = (text) => text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    const searchTerm = normalize(searchInput.value);
    const rows = document.querySelectorAll('.stock-product-row');
    rows.forEach(row => {
        const name = normalize(row.querySelector('h3').textContent);
        const category = normalize(row.querySelector('.prod-category').textContent);
        const sku = normalize(row.querySelector('.prod-sku').textContent);
        if (name.includes(searchTerm) || category.includes(searchTerm) || sku.includes(searchTerm)) {
            row.style.display = 'flex';
        } else {
            row.style.display = 'none';
        }
    });
}

async function removeEmployeeStockItem(sku) {
    try {
        await apiExcluirProduto(sku);
    } catch (err) {
        showModal(err.message || 'Erro ao remover produto.');
        return;
    }
    if (window.employeeStockCache) {
        window.employeeStockCache = window.employeeStockCache.filter(item => item.sku !== sku);
    }
    renderEmployeeStock();
}

let currentEditSku = null;

function openEditProductModal(sku) {
    if (!window.employeeStockCache) return;
    const product = window.employeeStockCache.find(p => p.sku === sku);
    if (!product) return;
    currentEditSku = sku;
    document.getElementById('stock-edit-name').value = product.name;
    document.getElementById('stock-edit-price').value = product.price;
    document.getElementById('stock-edit-qty').value = product.qty;
    const modal = document.getElementById('stock-edit-modal');
    if (modal) modal.style.display = 'flex';
}

function closeEditProductModal() {
    const modal = document.getElementById('stock-edit-modal');
    if (modal) {
        modal.style.display = 'none';
        document.getElementById('stock-edit-name').value = '';
        document.getElementById('stock-edit-price').value = '';
        const qtyEl = document.getElementById('stock-edit-qty');
        if (qtyEl) qtyEl.value = '';
        currentEditSku = null; 
    }
}

async function handleEditProduct(event) {
    if (event) event.preventDefault();
    if (!currentEditSku || !window.employeeStockCache) return;

    const nameEl = document.getElementById('stock-edit-name');
    const priceEl = document.getElementById('stock-edit-price');
    const qtyEl = document.getElementById('stock-edit-qty');
    if (!nameEl || !priceEl) return;

    const newName = nameEl.value.trim();
    let newPrice = priceEl.value.trim();
    let newQty = qtyEl ? parseInt(qtyEl.value) : undefined;
    if (!newName || !newPrice) return;
    if (newQty !== undefined && (isNaN(newQty) || newQty < 0)) newQty = 0;
    if (!newPrice.toUpperCase().includes('R$')) newPrice = `R$ ${newPrice}`;

    try {
        await apiEditarProduto(currentEditSku, { nome: newName, preco: newPrice, quantidade: newQty });
    } catch (err) {
        showModal(err.message || 'Erro ao editar produto.');
        return;
    }

    closeEditProductModal();
    renderEmployeeStock();
}

// ============================================================
// FUNCIONÁRIO — PEDIDOS via API
// ============================================================

let employeeOrders = [];
let currentSelectedOrderId = null;
let currentSelectedOrderData = null;

async function renderEmployeeOrders() {
    const list = document.getElementById('emp-orders-list');
    if (!list) return;

    try {
        employeeOrders = await apiListarPedidosFuncionario();
    } catch (e) {
        console.warn('Erro ao carregar pedidos do funcionário:', e);
    }

    list.innerHTML = '';

    employeeOrders.forEach(order => {
        const statusClass = getStatusBadgeClass(order.status);
        const card = document.createElement('div');
        card.className = 'emp-order-card';
        card.onclick = function() { openEmployeeOrderDetail(order.id); };
        card.innerHTML = `
            <div class="emp-order-info">
                <h3>#${order.id}</h3>
                <p>Cliente: ${order.client}</p>
                <span class="emp-order-time">${order.date}</span>
            </div>
            <div class="emp-order-status-area">
                <span class="emp-badge ${statusClass}">${order.status}</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </div>
        `;
        list.appendChild(card);
    });
}

function getStatusBadgeClass(status) {
    switch(status) {
        case 'Pendente': return 'emp-badge-pending';
        case 'Em Separação': return 'emp-badge-preparing';
        case 'Pronto para Retirada': return 'emp-badge-ready';
        case 'Finalizado': return 'emp-badge-delivered';
        case 'Cancelado': return 'emp-badge-cancelled';
        default: return 'emp-badge-pending';
    }
}

function openEmployeeOrderDetail(orderId) {
    const order = employeeOrders.find(o => o.id === orderId);
    if (!order) return;

    currentSelectedOrderId = orderId;
    currentSelectedOrderData = order;
    
    document.getElementById('detail-header-id').innerText = '#' + order.id;
    
    const statusBar = document.getElementById('detail-status-bar');
    const statusClass = getStatusBadgeClass(order.status);
    statusBar.innerHTML = `<span class="emp-badge ${statusClass}" style="font-size: 14px; padding: 8px 20px;">${order.status}</span>`;
    
    document.getElementById('detail-client-name').textContent = order.client;
    document.getElementById('detail-order-date').textContent = order.date;

    const itemsList = document.getElementById('detail-items-list');
    itemsList.innerHTML = '';
    
    let totalValue = 0;
    order.items.forEach(item => {
        const subtotal = (item.price || 0) * (item.qtd || 1);
        totalValue += subtotal;
        const itemEl = document.createElement('div');
        itemEl.className = 'detail-item-row';
        itemEl.innerHTML = `
            <div class="detail-item-info">
                <span class="detail-item-name">${item.name}</span>
                <span class="detail-item-qty">Quantidade: ${item.qtd}</span>
            </div>
            <span class="detail-item-price">R$ ${(item.price || 0).toFixed(2).replace('.', ',')}</span>
        `;
        itemsList.appendChild(itemEl);
    });

    document.getElementById('detail-order-total').textContent = `R$ ${totalValue.toFixed(2).replace('.', ',')}`;

    const payMethod = order.paymentMethod || 'PIX';
    const installments = order.installments || 1;
    document.getElementById('detail-payment-method').textContent = payMethod === 'PIX' ? 'PIX' : `Cartão de Crédito (${installments}x)`;

    const actionsContainer = document.getElementById('detail-actions');
    actionsContainer.innerHTML = '';

    if (order.status === 'Em Separação') {
        actionsContainer.innerHTML += `
            <button onclick="goToEmployeeSeparation()" class="primary-btn detail-action-btn" style="background: #6366F1;">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Separar Pedido
            </button>
        `;
    }

    if (order.status !== 'Finalizado' && order.status !== 'Cancelado') {
        actionsContainer.innerHTML += `
            <button onclick="goToEmployeeUpdateStatus()" class="secondary-btn detail-action-btn" style="background: #374151; color: #F3F4F6; border: 1px solid #4B5563;">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                Atualizar Status
            </button>
        `;
    }

    if (order.status === 'Pronto para Retirada') {
        actionsContainer.innerHTML += `
            <button onclick="goToEmployeePickup()" class="primary-btn detail-action-btn" style="background: #10B981;">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Confirmar Retirada
            </button>
        `;
    }

    navigateTo('screen-employee-order-detail');
}

function goToEmployeeSeparation() {
    const order = employeeOrders.find(o => o.id === currentSelectedOrderId);
    if (!order) return;

    if (order.status !== 'Em Separação') {
        if (typeof showModal === "function") {
            showModal(`Não é possível separar o pedido #${order.id}. Status atual: "${order.status}". O pedido precisa estar em "Em Separação".`);
        } else {
            alert(`Não é possível separar o pedido #${order.id}. Status atual: "${order.status}". O pedido precisa estar em "Em Separação".`);
        }
        return;
    }

    document.getElementById('sep-header-id').innerText = '#' + order.id;
    navigateTo('screen-employee-order-separation');
    renderEmployeeSeparationItems(order);
}

function renderEmployeeSeparationItems(order) {
    const container = document.getElementById('separation-items-list');
    if (!container) return;
    container.innerHTML = order.items.map(item => `
        <label class="separation-item" id="sep-card-${item.name.replace(/\s/g, '-')}">
            <input type="checkbox" class="item-checkbox" onchange="toggleSeparationStyle(this, '${item.name.replace(/\s/g, '-')}')">
            <div class="item-details">
                <span class="item-name">${item.name}</span>
                <span class="item-qtd">Qtd: ${item.qtd}</span>
            </div>
        </label>
    `).join('');
}

async function finishEmployeeSeparation() {
    const order = employeeOrders.find(o => o.id === currentSelectedOrderId);
    if (!order) return;

    if (order.status !== 'Em Separação') {
        if (typeof showModal === "function") {
            showModal(`Não é possível concluir a separação do pedido #${order.id}. Status atual: "${order.status}".`);
        } else {
            alert(`Não é possível concluir a separação do pedido #${order.id}. Status atual: "${order.status}".`);
        }
        return;
    }

    const checkboxes = document.querySelectorAll('.item-checkbox');
    if (!checkboxes || checkboxes.length === 0) {
        if (typeof showModal === "function") {
            showModal('Nenhum item encontrado para conferência. Volte e marque os itens antes de concluir.');
        } else {
            alert('Nenhum item encontrado para conferência. Volte e marque os itens antes de concluir.');
        }
        return;
    }

    const allChecked = Array.from(checkboxes).every(cb => cb.checked === true);
    if (!allChecked) {
        if (typeof showModal === "function") {
            showModal('Não foi possível concluir: verifique se TODOS os itens estão marcados como conferidos.');
        } else {
            alert('Não foi possível concluir: verifique se TODOS os itens estão marcados como conferidos.');
        }
        return;
    }

    try {
        await apiSepararPedido(currentSelectedOrderId);
        order.status = 'Pronto para Retirada';
    } catch (err) {
        showModal(err.message || 'Erro ao separar pedido no servidor.');
        return;
    }

    const modal = document.getElementById('order-success-modal');
    const msgEl = document.getElementById('order-success-message');
    if (modal && msgEl) {
        msgEl.textContent = `Pedido #${currentSelectedOrderId} separado com sucesso! Status alterado para "Pronto para Retirada".`;
        window._employeeModalPending = true;
        modal.classList.add('active-modal');
    } else {
        renderEmployeeOrders();
        navigateTo('screen-employee-orders');
    }
}

function finishSeparation() {
    finishEmployeeSeparation();
}

function goToEmployeeUpdateStatus() {
    const order = employeeOrders.find(o => o.id === currentSelectedOrderId);
    if (!order) return;
    document.getElementById('emp-status-header-id').innerText = '#' + order.id;
    document.getElementById('emp-status-observation').value = '';
    document.querySelectorAll('input[name="emp_order_status"]').forEach(r => r.checked = false);
    navigateTo('screen-employee-order-status');
}

async function saveEmployeeOrderStatus() {
    const selectedStatus = document.querySelector('input[name="emp_order_status"]:checked');
    if (!selectedStatus) {
        if (typeof showModal === "function") {
            showModal("Por favor, selecione um status antes de salvar.");
        } else {
            alert("Por favor, selecione um status.");
        }
        return;
    }
    
    const order = employeeOrders.find(o => o.id === currentSelectedOrderId);
    if (!order) return;
    
    if (order.status === selectedStatus.value) {
        if (typeof showModal === "function") {
            showModal(`O pedido #${currentSelectedOrderId} já está com o status "${selectedStatus.value}". Selecione um status diferente para atualizar.`);
        } else {
            alert(`O pedido #${currentSelectedOrderId} já está com o status "${selectedStatus.value}".`);
        }
        return;
    }

    try {
        await apiAlterarStatusPedido(currentSelectedOrderId, selectedStatus.value);
        order.status = selectedStatus.value;
    } catch (err) {
        showModal(err.message || 'Erro ao alterar status no servidor.');
        return;
    }
    
    const modal = document.getElementById('order-success-modal');
    const msgEl = document.getElementById('order-success-message');
    if (modal && msgEl) {
        msgEl.textContent = `Status do pedido #${currentSelectedOrderId} alterado para "${selectedStatus.value}" com sucesso!`;
        window._employeeModalPending = true;
        modal.classList.add('active-modal');
    } else {
        renderEmployeeOrders();
        navigateTo('screen-employee-orders');
    }
}

function saveOrderStatus() {
    saveEmployeeOrderStatus();
}

function goToEmployeePickup() {
    const order = employeeOrders.find(o => o.id === currentSelectedOrderId);
    if (!order) return;
    if (order.status !== 'Pronto para Retirada') {
        showModal('Este pedido ainda não está pronto para retirada.');
        return;
    }
    document.getElementById('pickup-header-id').innerText = '#' + order.id;
    document.getElementById('pickup-client-name').textContent = order.client;
    document.getElementById('pickup-order-id-text').textContent = '#' + order.id;
    const itemsList = document.getElementById('pickup-items-list');
    itemsList.innerHTML = '';
    order.items.forEach(item => {
        const itemEl = document.createElement('div');
        itemEl.className = 'detail-item-row';
        itemEl.innerHTML = `
            <div class="detail-item-info">
                <span class="detail-item-name">${item.name}</span>
                <span class="detail-item-qty">Qtd: ${item.qtd}</span>
            </div>
            <span class="detail-item-price">R$ ${(item.price || 0).toFixed(2).replace('.', ',')}</span>
        `;
        itemsList.appendChild(itemEl);
    });
    navigateTo('screen-employee-order-pickup');
}

async function confirmPickup() {
    const order = employeeOrders.find(o => o.id === currentSelectedOrderId);
    if (!order) return;

    try {
        await apiConfirmarRetirada(currentSelectedOrderId);
        order.status = 'Finalizado';
    } catch (err) {
        showModal(err.message || 'Erro ao confirmar retirada no servidor.');
        return;
    }
    
    const modal = document.getElementById('order-success-modal');
    const msgEl = document.getElementById('order-success-message');
    if (modal && msgEl) {
        msgEl.textContent = `Retirada do pedido #${currentSelectedOrderId} confirmada com sucesso! Pedido finalizado.`;
        window._employeeModalPending = true;
        modal.classList.add('active-modal');
    } else {
        renderEmployeeOrders();
        navigateTo('screen-employee-orders');
    }
}
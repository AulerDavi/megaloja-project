/**
 * api.js — Camada de comunicação com o backend Flask
 * Todas as chamadas fetch centralizadas aqui.
 * O backend roda em http://localhost:5000
 */

const API_BASE = 'http://localhost:5000';

// ============================================================
// AUTENTICAÇÃO
// ============================================================

/**
 * POST /cadastro
 * @param {Object} dados - { name, email, password }
 * @returns {Promise<Object>} resposta do servidor
 */
async function apiCadastrar(dados) {
    const resp = await fetch(`${API_BASE}/cadastro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
    });
    const json = await resp.json();
    if (!resp.ok) throw new Error(json.erro || 'Erro ao cadastrar');
    return json;
}

/**
 * POST /login
 * @param {Object} dados - { email, password }
 * @returns {Promise<Object>} { mensagem, usuario: { id, nome, email } }
 */
async function apiLogin(dados) {
    const resp = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
    });
    const json = await resp.json();
    if (!resp.ok) throw new Error(json.erro || 'Erro ao fazer login');
    return json;
}

/**
 * POST /funcionario/login
 * @param {Object} dados - { email, password }
 * @returns {Promise<Object>} { mensagem, nome }
 */
async function apiLoginFuncionario(dados) {
    const resp = await fetch(`${API_BASE}/funcionario/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
    });
    const json = await resp.json();
    if (!resp.ok) throw new Error(json.erro || 'Erro no login do funcionário');
    return json;
}

/**
 * PUT /alterar-senha
 * @param {Object} dados - { email, newPassword }
 * @returns {Promise<Object>} resposta do servidor
 */
async function apiAlterarSenha(dados) {
    const resp = await fetch(`${API_BASE}/alterar-senha`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
    });
    const json = await resp.json();
    if (!resp.ok) throw new Error(json.erro || 'Erro ao alterar senha');
    return json;
}

// ============================================================
// ENDEREÇOS DE COBRANÇA
// ============================================================

/**
 * GET /enderecos
 * @returns {Promise<Array>} lista de endereços
 */
async function apiListarEnderecos() {
    const resp = await fetch(`${API_BASE}/enderecos`);
    return await resp.json();
}

/**
 * POST /enderecos
 * @param {Object} endereco
 * @returns {Promise<Object>} resposta com o endereço criado
 */
async function apiAdicionarEndereco(endereco) {
    const resp = await fetch(`${API_BASE}/enderecos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(endereco)
    });
    const json = await resp.json();
    if (!resp.ok) throw new Error(json.erro || 'Erro ao adicionar endereço');
    return json;
}

/**
 * PUT /enderecos/:id
 * @param {number} id
 * @param {Object} endereco
 * @returns {Promise<Object>} resposta com o endereço atualizado
 */
async function apiEditarEndereco(id, endereco) {
    const resp = await fetch(`${API_BASE}/enderecos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(endereco)
    });
    const json = await resp.json();
    if (!resp.ok) throw new Error(json.erro || 'Erro ao editar endereço');
    return json;
}

/**
 * DELETE /enderecos/:id
 * @param {number} id
 * @returns {Promise<Object>} resposta do servidor
 */
async function apiExcluirEndereco(id) {
    const resp = await fetch(`${API_BASE}/enderecos/${id}`, {
        method: 'DELETE'
    });
    const json = await resp.json();
    if (!resp.ok) throw new Error(json.erro || 'Erro ao excluir endereço');
    return json;
}

// ============================================================
// PRODUTOS (ESTOQUE)
// ============================================================

/**
 * GET /produtos
 * @returns {Promise<Array>} lista de produtos com status
 */
async function apiListarProdutos() {
    const resp = await fetch(`${API_BASE}/produtos`);
    return await resp.json();
}

/**
 * POST /produtos
 * @param {Object} dados - { nome, preco, quantidade, categoria }
 * @returns {Promise<Object>} produto criado
 */
async function apiCriarProduto(dados) {
    const resp = await fetch(`${API_BASE}/produtos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
    });
    const json = await resp.json();
    if (!resp.ok) throw new Error(json.erro || 'Erro ao criar produto');
    return json;
}

/**
 * PUT /produtos/:sku
 * @param {string} sku
 * @param {Object} dados - { nome, preco, quantidade, categoria }
 * @returns {Promise<Object>} produto atualizado
 */
async function apiEditarProduto(sku, dados) {
    const resp = await fetch(`${API_BASE}/produtos/${sku}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
    });
    const json = await resp.json();
    if (!resp.ok) throw new Error(json.erro || 'Erro ao editar produto');
    return json;
}

/**
 * DELETE /produtos/:sku
 * @param {string} sku
 * @returns {Promise<Object>} resposta do servidor
 */
async function apiExcluirProduto(sku) {
    const resp = await fetch(`${API_BASE}/produtos/${sku}`, {
        method: 'DELETE'
    });
    const json = await resp.json();
    if (!resp.ok) throw new Error(json.erro || 'Erro ao excluir produto');
    return json;
}

// ============================================================
// PEDIDOS DO CLIENTE
// ============================================================

/**
 * GET /pedidos
 * @returns {Promise<Array>} lista de pedidos do cliente
 */
async function apiListarPedidosCliente() {
    const resp = await fetch(`${API_BASE}/pedidos`);
    return await resp.json();
}

/**
 * POST /pedidos
 * @param {Object} pedido - { date, items, total, paymentMethod, installments, observation, status }
 * @returns {Promise<Object>} pedido criado
 */
async function apiCriarPedido(pedido) {
    const resp = await fetch(`${API_BASE}/pedidos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pedido)
    });
    const json = await resp.json();
    if (!resp.ok) throw new Error(json.erro || 'Erro ao criar pedido');
    return json;
}

// ============================================================
// PEDIDOS DO FUNCIONÁRIO
// ============================================================

/**
 * GET /funcionario/pedidos
 * @returns {Promise<Array>} lista de pedidos do funcionário
 */
async function apiListarPedidosFuncionario() {
    const resp = await fetch(`${API_BASE}/funcionario/pedidos`);
    return await resp.json();
}

/**
 * PUT /funcionario/pedidos/:id/status
 * @param {string} pedidoId
 * @param {string} novoStatus
 * @returns {Promise<Object>} pedido atualizado
 */
async function apiAlterarStatusPedido(pedidoId, novoStatus) {
    const resp = await fetch(`${API_BASE}/funcionario/pedidos/${pedidoId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: novoStatus })
    });
    const json = await resp.json();
    if (!resp.ok) throw new Error(json.erro || 'Erro ao alterar status');
    return json;
}

/**
 * PUT /funcionario/pedidos/:id/separar
 * @param {string} pedidoId
 * @returns {Promise<Object>} pedido atualizado
 */
async function apiSepararPedido(pedidoId) {
    const resp = await fetch(`${API_BASE}/funcionario/pedidos/${pedidoId}/separar`, {
        method: 'PUT'
    });
    const json = await resp.json();
    if (!resp.ok) throw new Error(json.erro || 'Erro ao separar pedido');
    return json;
}

/**
 * PUT /funcionario/pedidos/:id/retirada
 * @param {string} pedidoId
 * @returns {Promise<Object>} pedido atualizado
 */
async function apiConfirmarRetirada(pedidoId) {
    const resp = await fetch(`${API_BASE}/funcionario/pedidos/${pedidoId}/retirada`, {
        method: 'PUT'
    });
    const json = await resp.json();
    if (!resp.ok) throw new Error(json.erro || 'Erro ao confirmar retirada');
    return json;
}
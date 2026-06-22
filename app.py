from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import uuid
import json
import os

app = Flask(__name__)
CORS(app)

# JS linha 207: 
enderecos = [
    {
        "id": 1,
        "label": "Casa",
        "street": "Rua Principal",
        "number": "123",
        "complement": "Apto 302",
        "city": "Porto Alegre",
        "state": "RS",
        "zip": "90000-000"
    }
]

# JS linha 622: 
carrinho = []

# JS linha 623: 
pedidos_cliente = []

# JS linha 649:
produtos = [
    { "sku": "SKU-1000", "nome": 'Monitor Gamer 24" LED FHD',      "preco": "R$ 899,90",  "quantidade": 25, "categoria": "Informática"      },
    { "sku": "SKU-1013", "nome": "Cafeteira Elétrica Inox",         "preco": "R$ 189,00",  "quantidade": 12, "categoria": "Eletrodomésticos" },
    { "sku": "SKU-1026", "nome": "Smartphone 128GB Ultra",           "preco": "R$ 2499,00", "quantidade": 8,  "categoria": "Celulares"        },
    { "sku": "SKU-1039", "nome": "Fone Bluetooth Noise Cancelling",  "preco": "R$ 349,90",  "quantidade": 3,  "categoria": "Áudio"            },
    { "sku": "SKU-1052", "nome": "Teclado Mecânico RGB",             "preco": "R$ 279,00",  "quantidade": 18, "categoria": "Informática"      },
    { "sku": "SKU-1065", "nome": "Notebook Intel i5 16GB RAM",       "preco": "R$ 4199,00", "quantidade": 6,  "categoria": "Informática"      },
    { "sku": "SKU-1078", "nome": "Liquidificador Turbo 1000W",       "preco": "R$ 159,00",  "quantidade": 0,  "categoria": "Eletrodomésticos" },
    { "sku": "SKU-1091", "nome": 'Smart TV 4K 50" Crystal',          "preco": "R$ 2199,00", "quantidade": 10, "categoria": "TV e Vídeo"       },
    { "sku": "SKU-1104", "nome": "Carregador Rápido GaN 65W",        "preco": "R$ 129,00",  "quantidade": 4,  "categoria": "Acessórios"       },
    { "sku": "SKU-1117", "nome": "Console PlayStation 5 Slim",       "preco": "R$ 3799,00", "quantidade": 2,  "categoria": "Games"            },
]

# JS linha 2018: 
pedidos_funcionario = [
    {
        "id": "PED-9087", "client": "João Silva", "date": "Hoje, 14:30",
        "status": "Pendente", "total": 1250.90, "paymentMethod": "PIX", "store": "Centro",
        "items": [
            { "name": 'Monitor Gamer 24" LED FHD', "qtd": 1, "price": 899.90 },
            { "name": "Teclado Mecânico RGB",       "qtd": 1, "price": 279.00 }
        ]
    },
    {
        "id": "PED-9086", "client": "Maria Oliveira", "date": "Hoje, 14:15",
        "status": "Em Separação", "total": 2849.00,
        "paymentMethod": "Cartão de Crédito", "installments": 3, "store": "Shopping Mall",
        "items": [
            { "name": "Smartphone 128GB Ultra",    "qtd": 1, "price": 2499.00 },
            { "name": "Carregador Rápido GaN 65W", "qtd": 1, "price": 129.00  }
        ]
    },
    {
        "id": "PED-9085", "client": "Carlos Santos", "date": "Hoje, 13:50",
        "status": "Pronto para Retirada", "total": 549.90, "paymentMethod": "PIX", "store": "Zona Norte",
        "items": [
            { "name": "Fone Bluetooth Noise Cancelling", "qtd": 1, "price": 349.90 },
            { "name": "Cafeteira Elétrica Inox",         "qtd": 1, "price": 189.00 }
        ]
    },
    {
        "id": "PED-9084", "client": "Ana Beatriz Ribeiro", "date": "Hoje, 13:10",
        "status": "Em Separação", "total": 4498.00,
        "paymentMethod": "Cartão de Crédito", "installments": 6, "store": "Centro",
        "items": [
            { "name": "Notebook Intel i5 16GB RAM", "qtd": 1, "price": 4199.00 },
            { "name": "Mouse Pad Gamer",            "qtd": 1, "price": 0       }
        ]
    },
    {
        "id": "PED-9083", "client": "Marcos Souza Filhos", "date": "Ontem, 18:45",
        "status": "Finalizado", "total": 2378.00, "paymentMethod": "PIX", "store": "Distrito Boémio",
        "items": [
            { "name": "Console PlayStation 5 Slim", "qtd": 1, "price": 3799.00 }
        ]
    },
    {
        "id": "PED-9082", "client": "Juliana Lima Ramos", "date": "Ontem, 17:20",
        "status": "Cancelado", "total": 0, "paymentMethod": "PIX", "store": "Centro",
        "items": [
            { "name": 'Smart TV 4K 50" Crystal', "qtd": 1, "price": 2199.00 }
        ]
    },
]

# JS linha 472: usuários que fazem login
# JS linha 131: handleRegister, usuários que se cadastram

usuarios = []

# JS linha 2255: saveEmployeeOrderStatus, valida o status antes de salvar

STATUS_PERMITIDOS = ["Pendente", "Em Separação", "Pronto para Retirada", "Finalizado", "Cancelado"]

# PERSISTÊNCIA EM ARQUIVO JSON
# Salva todos os dados em dados.json para sobreviver a reinicializações do servidor.

ARQUIVO_DADOS = "dados.json"

def salvar_dados():
    try:
        with open(ARQUIVO_DADOS, "w", encoding="utf-8") as f:
            json.dump({
                "usuarios":             usuarios,
                "produtos":             produtos,
                "pedidos_cliente":      pedidos_cliente,
                "pedidos_funcionario":  pedidos_funcionario,
                "enderecos":            enderecos
            }, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"[AVISO] Não foi possível salvar dados.json: {e}")

def carregar_dados():
    if not os.path.exists(ARQUIVO_DADOS):
        return  # primeira execução: usa os dados iniciais definidos acima
    try:
        with open(ARQUIVO_DADOS, "r", encoding="utf-8") as f:
            dados = json.load(f)
        usuarios.clear();            usuarios.extend(dados.get("usuarios", []))
        produtos.clear();            produtos.extend(dados.get("produtos", []))
        pedidos_cliente.clear();     pedidos_cliente.extend(dados.get("pedidos_cliente", []))
        pedidos_funcionario.clear(); pedidos_funcionario.extend(dados.get("pedidos_funcionario", []))
        enderecos.clear();           enderecos.extend(dados.get("enderecos", []))
        print("[INFO] Dados carregados de dados.json")
    except Exception as e:
        print(f"[AVISO] Não foi possível carregar dados.json: {e}")

# JS linha 663: getStockStatus(productName)

def get_status_estoque(quantidade):
    if quantidade == 0:
        return { "statusText": "Esgotado",      "badgeClass": "badge-out-stock" }
    elif quantidade <= 5:
        return { "statusText": "Estoque Baixo", "badgeClass": "badge-low-stock" }
    else:
        return { "statusText": "Disponível",    "badgeClass": "badge-in-stock"  }

# AUTENTICAÇÃO
@app.route('/cadastro', methods=['POST'])
def cadastrar():
    dados = request.get_json()
    email = dados.get("email")
    senha = dados.get("password")

    if not email or not senha:
        return jsonify({"erro": "Email e senha são obrigatórios"}), 400

    for u in usuarios:
        if u["email"] == email:
            return jsonify({"erro": "Email já cadastrado"}), 409

    usuario = {
        "id":    len(usuarios) + 1,
        "nome":  dados.get("name", ""),
        "email": email,
        "senha": generate_password_hash(senha)  # senha armazenada com hash
    }
    usuarios.append(usuario)
    salvar_dados()
    return jsonify({"mensagem": "Cadastro realizado com sucesso!"}), 201

# JS linha 472: No back end: valida email e senha antes de deixar entrar.
@app.route('/login', methods=['POST'])
def login():
    dados = request.get_json()
    email = dados.get("email")
    senha = dados.get("password")

    for u in usuarios:
        if u["email"] == email and check_password_hash(u["senha"], senha):
            return jsonify({
                "mensagem": "Login realizado com sucesso!",
                "usuario": { "id": u["id"], "nome": u["nome"], "email": u["email"] }
            })

    return jsonify({"erro": "Email ou senha incorretos"}), 401

# JS linha 483: No back end: valida credencial do funcionário.

# Credenciais fixas dos funcionários (em produção viria de um banco de dados)
FUNCIONARIOS_VALIDOS = [
    {"email": "funcionario@megaloja.com", "senha": "func123", "nome": "Funcionário Padrão"},
    {"email": "gerente@megaloja.com",     "senha": "ger123",  "nome": "Gerente Padrão"},
]

@app.route('/funcionario/login', methods=['POST'])
def login_funcionario():
    dados = request.get_json()
    email = dados.get("email")
    senha = dados.get("password")

    for f in FUNCIONARIOS_VALIDOS:
        if f["email"] == email and f["senha"] == senha:
            return jsonify({"mensagem": "Login de funcionário realizado com sucesso!", "nome": f["nome"]})

    return jsonify({"erro": "Credenciais de funcionário inválidas"}), 401

# JS linha 162: No back end: salva a nova senha do usuário.
@app.route('/alterar-senha', methods=['PUT'])
def alterar_senha():
    dados = request.get_json()
    email     = dados.get("email")
    nova_senha = dados.get("newPassword")

    if not nova_senha or len(nova_senha) < 6:
        return jsonify({"erro": "A nova senha precisa ter pelo menos 6 caracteres"}), 400

    for u in usuarios:
        if u["email"] == email:
            u["senha"] = generate_password_hash(nova_senha)  # nova senha também com hash
            salvar_dados()
            return jsonify({"mensagem": "Senha alterada com sucesso!"})

    return jsonify({"erro": "Usuário não encontrado"}), 404

# ENDEREÇOS DE COBRANÇA
# JS linha 249: function renderBillingAddresses(), No back end: busca os endereços do servidor.

@app.route('/enderecos', methods=['GET'])
def listar_enderecos():
    return jsonify(enderecos)

# JS linha 330: function addBillingAddress(address) No back end: salva o endereço no servidor.

@app.route('/enderecos', methods=['POST'])
def adicionar_endereco():
    dados = request.get_json()
    novo = {
        "id":         len(enderecos) + 1,
        "label":      dados.get("label",      ""),
        "street":     dados.get("street",     ""),
        "number":     dados.get("number",     ""),
        "complement": dados.get("complement", ""),
        "city":       dados.get("city",       ""),
        "state":      dados.get("state",      ""),
        "zip":        dados.get("zip",        "")
    }
    enderecos.append(novo)
    salvar_dados()
    return jsonify({"mensagem": "Endereço adicionado com sucesso!", "endereco": novo}), 201

# JS linha 351: atualiza o endereço no servidor.
@app.route('/enderecos/<int:endereco_id>', methods=['PUT'])
def editar_endereco(endereco_id):
    dados = request.get_json()
    for e in enderecos:
        if e["id"] == endereco_id:
            e["label"]      = dados.get("label",      e["label"])
            e["street"]     = dados.get("street",     e["street"])
            e["number"]     = dados.get("number",     e["number"])
            e["complement"] = dados.get("complement", e["complement"])
            e["city"]       = dados.get("city",       e["city"])
            e["state"]      = dados.get("state",      e["state"])
            e["zip"]        = dados.get("zip",        e["zip"])
            salvar_dados()
            return jsonify({"mensagem": "Endereço atualizado!", "endereco": e})
    return jsonify({"erro": "Endereço não encontrado"}), 404

# JS linha 393: function deleteBillingAddress(index)
# Hoje faz window.billingAddresses.splice(index, 1).
# No back end: remove o endereço do servidor.
# ---------------------------------------------------------------
@app.route('/enderecos/<int:endereco_id>', methods=['DELETE'])
def excluir_endereco(endereco_id):
    for e in enderecos:
        if e["id"] == endereco_id:
            enderecos.remove(e)
            salvar_dados()
            return jsonify({"mensagem": "Endereço removido com sucesso!"})
    return jsonify({"erro": "Endereço não encontrado"}), 404

# ESTOQUE
# JS linha 1791: # busca a lista de produtos do servidor.
# ---------------------------------------------------------------
@app.route('/produtos', methods=['GET'])
def listar_produtos():
    resultado = []
    for p in produtos:
        status = get_status_estoque(p["quantidade"])
        resultado.append({ **p, **status })
    return jsonify(resultado)

# JS linha 1860: salva o novo produto no servidor.

@app.route('/produtos', methods=['POST'])
def criar_produto():
    dados     = request.get_json()
    nome      = dados.get("nome", "").strip()
    preco     = dados.get("preco", "").strip()
    quantidade = int(dados.get("quantidade", 0))

    if not nome or not preco:
        return jsonify({"erro": "Nome e preço são obrigatórios"}), 400

    if not preco.upper().startswith("R$"):
        preco = f"R$ {preco}"

    sku    = f"SKU-{2000 + len(produtos) + 1}"
    status = get_status_estoque(quantidade)

    produto = {
        "sku":        sku,
        "nome":       nome,
        "preco":      preco,
        "quantidade": quantidade,
        "categoria":  dados.get("categoria", "Entrada Manual"),
        **status
    }
    produtos.append(produto)
    salvar_dados()
    return jsonify({"mensagem": "Produto criado com sucesso!", "produto": produto}), 201

# JS linha 1969: atualiza o produto no servidor pelo SKU.

@app.route('/produtos/<sku>', methods=['PUT'])
def editar_produto(sku):
    dados = request.get_json()
    for p in produtos:
        if p["sku"] == sku:
            p["nome"]      = dados.get("nome",      p["nome"])
            p["preco"]     = dados.get("preco",     p["preco"])
            p["categoria"] = dados.get("categoria", p["categoria"])

            if "quantidade" in dados:
                p["quantidade"] = int(dados["quantidade"])
                status = get_status_estoque(p["quantidade"])
                p["statusText"] = status["statusText"]
                p["badgeClass"] = status["badgeClass"]

            salvar_dados()
            return jsonify({"mensagem": "Produto atualizado!", "produto": p})
    return jsonify({"erro": "Produto não encontrado"}), 404

# JS linha 1933: remove o produto do servidor pelo SKU.

@app.route('/produtos/<sku>', methods=['DELETE'])
def excluir_produto(sku):
    for p in produtos:
        if p["sku"] == sku:
            produtos.remove(p)
            salvar_dados()
            return jsonify({"mensagem": "Produto removido com sucesso!"})
    return jsonify({"erro": "Produto não encontrado"}), 404

# PEDIDOS DO CLIENTE

# JS linha 1144:.busca os pedidos do cliente no servidor.

@app.route('/pedidos', methods=['GET'])
def listar_pedidos_cliente():
    # Reconstrói itens dos pedidos com base no estado atual dos produtos (por SKU).
    # Assim, mudanças feitas pelo funcionário em nome/preço/quantidade ficam aparentes ao cliente.
    sku_index = {p.get('sku'): p for p in produtos}

    def parse_preco_numeric(preco):
        # Ex: "R$ 1.299,90" -> 1299.90
        if preco is None:
            return 0
        s = str(preco)
        s = s.replace('R$', '').strip()
        s = s.replace('.', '').replace(',', '.')
        try:
            return float(s)
        except Exception:
            return 0

    pedidos_atualizados = []
    for pedido in pedidos_cliente:
        pedido_copy = dict(pedido)
        itens = []
        for it in (pedido.get('items') or []):
            sku = it.get('sku')
            qtd = it.get('quantity', it.get('qtd', 1))

            prod = None
            # 1) Preferência: localizar pelo SKU
            if sku and sku in sku_index:
                prod = sku_index[sku]

            # 2) Compatibilidade: pedidos antigos podem vir sem sku/nulo.
            #    Nesse caso, casamos pelo nome do item com o nome atual do produto.
            if prod is None and it.get('name'):
                def normalize_nome(s):
                    if s is None:
                        return ''
                    s = str(s).strip().lower()
                    # padroniza aspas diferentes (", '', “, ”)
                    s = s.replace('“', '"').replace('”', '"').replace("'", '"')
                    # remove múltiplos espaços
                    s = ' '.join(s.split())
                    return s

                nome_atual = it.get('name')
                nome_norm = normalize_nome(nome_atual)

                for p in produtos:
                    if normalize_nome(p.get('nome')) == nome_norm:
                        prod = p
                        sku = p.get('sku')
                        break

            if prod is not None:
                # Atualiza somente o que o cliente precisa ver (nome, preço e estoque/status)
                # mantendo quantidade (qtd) do item do pedido.
                preco_text = prod.get('preco')
                itens.append({
                    'name': prod.get('nome'),
                    'store': it.get('store'),
                    'quantity': qtd,
                    'sku': sku,
                    'priceText': preco_text,
                    'priceValue': parse_preco_numeric(preco_text),
                })
            else:
                # fallback: mantém como veio (para casos muito legados ou inconsistente)
                itens.append(it)

        pedido_copy['items'] = itens
        pedidos_atualizados.append(pedido_copy)

    return jsonify(pedidos_atualizados)


# JS linha 1289, linha 1393, salva o pedido e desconta do estoque.
# JS linha 1405: checkoutItems.forEach — desconta estoque após pedido

@app.route('/pedidos', methods=['POST'])
def criar_pedido():
    dados = request.get_json()

    pedido_cliente = {
        "id":            f"PED-{str(uuid.uuid4())[:6].upper()}",  # ID gerado no backend
        "date":          dados.get("date"),
        "items":         dados.get("items", []),

        "total":         dados.get("total", 0),
        "paymentMethod": dados.get("paymentMethod", "pix"),
        "installments":  dados.get("installments", 1),
        "observation":   dados.get("observation", ""),
        "status":        dados.get("status", "Confirmado"),
    }

    # Desconta do estoque (espelho do JS linha 1405)
    # Suporte a itens com SKU (preferência) e com fallback por nome.
    for item in pedido_cliente["items"]:
        item_name = item.get("name")
        item_sku = item.get("sku")
        qtd_vendida = item.get("quantity", 1)

        matched_prod = None
        if item_sku:
            for p in produtos:
                if p.get("sku") == item_sku:
                    matched_prod = p
                    break
        if not matched_prod and item_name:
            for p in produtos:
                if p.get("nome") == item_name:
                    matched_prod = p
                    break

        if matched_prod:
            matched_prod["quantidade"] = max(0, matched_prod["quantidade"] - qtd_vendida)
            status = get_status_estoque(matched_prod["quantidade"])
            matched_prod["statusText"] = status["statusText"]
            matched_prod["badgeClass"] = status["badgeClass"]


    # Cria também o pedido do funcionário para aparecer automaticamente no painel
    client_id = dados.get("clientId")
    client_name = dados.get("clientName")

    if not client_name:
        client_name = "Cliente"  # fallback caso o frontend não envie

    # Adiciona sku dentro dos itens do pedido do cliente (se vier somente name).
    # Isso permite que GET /pedidos reconstrua corretamente itens com nome/preço atualizados.
    if pedido_cliente.get("items"):
        # índice por nome
        nome_index = {p.get('nome'): p for p in produtos}
        for it in pedido_cliente["items"]:
            if it.get('sku'):
                continue
            nome = it.get('name')
            if nome and nome in nome_index:
                it['sku'] = nome_index[nome].get('sku')

    pedidos_funcionario.append({
        # id visual do funcionário deve ser idêntico ao id do cliente
        "id": pedido_cliente["id"],
        "client": client_name,


        "date": pedido_cliente.get("date"),
        "status": "Pendente",  # status inicial no painel do funcionário
        "total": pedido_cliente.get("total", 0),
        "paymentMethod": (
            "PIX" if str(pedido_cliente.get("paymentMethod", "pix")).lower() == "pix" else "Cartão de Crédito"
        ),
        "installments": pedido_cliente.get("installments", 1),
        "store": (
            pedido_cliente.get("items", [{}])[0].get("store")
            if pedido_cliente.get("items") else "Matriz"
        ),
        "items": [
            {
                "name": it.get("name"),
                "qtd": it.get("quantity", 1),
                "price": it.get("priceValue", 0),
                # Mantém o vínculo do item com o SKU do produto para sincronizar nome/preço/quantidade no cliente.
                "sku": it.get("sku")
            }

            for it in (pedido_cliente.get("items") or [])
        ],

        "observation": pedido_cliente.get("observation", ""),
        "clientId": client_id,
        "clientName": client_name,
        # vínculo direto para sincronizar status do pedido do cliente
        "clientOrderId": pedido_cliente["id"],
    })

    pedidos_cliente.append(pedido_cliente)
    salvar_dados()
    return jsonify({"mensagem": "Pedido criado com sucesso!", "pedido": pedido_cliente}), 201

# PEDIDOS DO FUNCIONÁRIO

# JS linha 2046: 
# Hoje lê o array local employeeOrders[], busca os pedidos do funcionário no servidor.

@app.route('/funcionario/pedidos', methods=['GET'])
def listar_pedidos_funcionario():
    return jsonify(pedidos_funcionario)


# JS linha 2255: Hoje faz order.status = selectedStatus.value 
# linha 2278 do JS. atualiza o status do pedido no servidor.

@app.route('/funcionario/pedidos/<pedido_id>/status', methods=['PUT'])
def alterar_status(pedido_id):
    dados      = request.get_json()
    novo_status = dados.get("status")

    if novo_status not in STATUS_PERMITIDOS:
        return jsonify({"erro": f"Status inválido. Use: {STATUS_PERMITIDOS}"}), 400

    for pedido in pedidos_funcionario:
        if pedido["id"] == pedido_id:
            if pedido["status"] == novo_status:
                return jsonify({"erro": f"O pedido já está com o status '{novo_status}'"}), 400

            pedido["status"] = novo_status

            # Mantém pedidos_cliente sincronizado.
            # Aqui é importante: no seu dados.json atual, os pedidos do cliente podem existir
            # sem clientId/clientName (por exemplo, pedidos antigos de seed).
            # Vamos sincronizar de forma tolerante.

            client_id = pedido.get("clientId")
            client_name = pedido.get("clientName")
            client_order_id = pedido.get("clientOrderId")

            matched = False

            # 1) Preferência: vínculo direto clientOrderId (robusto)
            if client_order_id:
                for pcli in pedidos_cliente:
                    if pcli.get("id") == client_order_id:
                        pcli["status"] = novo_status
                        matched = True
                        break

            # 2) Compatibilidade: tenta casar pelo par clientId/clientName
            if not matched and client_id is not None and client_name is not None:
                for pcli in pedidos_cliente:
                    if pcli.get("clientId") == client_id and pcli.get("clientName") == client_name:
                        pcli["status"] = novo_status
                        matched = True
                        break

            salvar_dados()
            return jsonify({"mensagem": "Status atualizado com sucesso!", "pedido": pedido})

    return jsonify({"erro": "Pedido não encontrado"}), 404



# JS linha 2191: function finishEmployeeSeparation() faz order.status = 'Pronto para Retirada'
# linha 2225 muda o status para Pronto para Retirada no servidor.

@app.route('/funcionario/pedidos/<pedido_id>/separar', methods=['PUT'])
def separar_pedido(pedido_id):
    for pedido in pedidos_funcionario:
        if pedido["id"] == pedido_id:
            if pedido["status"] != "Em Separação":
                return jsonify({"erro": f"Pedido precisa estar 'Em Separação'. Status atual: '{pedido['status']}'"}), 400

            pedido["status"] = "Pronto para Retirada"

            # Sincroniza também o pedido do cliente para refletir a mudança no status
            client_order_id = pedido.get("clientOrderId")
            matched = False
            if client_order_id:
                for pcli in pedidos_cliente:
                    if pcli.get("id") == client_order_id:
                        pcli["status"] = pedido["status"]
                        matched = True
                        break

            # fallback compatível com dados antigos
            if not matched:
                client_id = pedido.get("clientId")
                client_name = pedido.get("clientName")
                if client_id is not None and client_name is not None:
                    for pcli in pedidos_cliente:
                        if pcli.get("clientId") == client_id and pcli.get("clientName") == client_name:
                            pcli["status"] = pedido["status"]
                            break

            salvar_dados()
            return jsonify({"mensagem": "Pedido separado com sucesso!", "pedido": pedido})
    return jsonify({"erro": "Pedido não encontrado"}), 404



# JS linha 2330: faz order.status = 'Finalizado' 
#  linha 2333 do JS. finaliza o pedido no servidor.

@app.route('/funcionario/pedidos/<pedido_id>/retirada', methods=['PUT'])
def confirmar_retirada(pedido_id):
    for pedido in pedidos_funcionario:
        if pedido["id"] == pedido_id:
            if pedido["status"] != "Pronto para Retirada":
                return jsonify({"erro": f"Pedido precisa estar 'Pronto para Retirada'. Status atual: '{pedido['status']}'"}), 400

            pedido["status"] = "Finalizado"

            # Sincroniza também o pedido do cliente para refletir a mudança
            client_order_id = pedido.get("clientOrderId")
            matched = False
            if client_order_id:
                for pcli in pedidos_cliente:
                    if pcli.get("id") == client_order_id:
                        pcli["status"] = pedido["status"]
                        matched = True
                        break

            # fallback compatível com dados antigos
            if not matched:
                client_id = pedido.get("clientId")
                client_name = pedido.get("clientName")
                if client_id is not None and client_name is not None:
                    for pcli in pedidos_cliente:
                        if pcli.get("clientId") == client_id and pcli.get("clientName") == client_name:
                            pcli["status"] = pedido["status"]
                            break

            salvar_dados()
            return jsonify({"mensagem": "Retirada confirmada! Pedido finalizado.", "pedido": pedido})
    return jsonify({"erro": "Pedido não encontrado"}), 404



if __name__ == '__main__':
    carregar_dados()
    app.run(debug=False)

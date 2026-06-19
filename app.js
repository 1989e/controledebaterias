let listadebaterias = JSON.parse(localStorage.getItem('transjanotti_baterias_v2')) || [];
let listadeveiculos = JSON.parse(localStorage.getItem('transjanotti_veiculos_v2')) || [];
let usuarioLogado = "";

// SISTEMA DE LOGIN LOGÍSTICO
function fazerLogin(event) {
    event.preventDefault();
    const user = document.getElementById('login-usuario').value;
    const senha = document.getElementById('login-senha').value.trim();

    // Senha padrão supersimples para testes rápidos no celular
    if (senha === "123") {
        usuarioLogado = user;
        document.getElementById('txt-user-logado').innerText = "Usuário: " + user.toUpperCase();
        
        // Aplica regras de logística de segurança (Esconde/Mostra botões)
        if (usuarioLogado === "eletricista") {
            document.querySelectorAll('.admin-only').forEach(el => el.classList.add('hidden'));
        } else {
            document.querySelectorAll('.admin-only').forEach(el => el.classList.remove('hidden'));
        }

        document.getElementById('form-login').reset();
        atualizarPainel();
        switchScreen('screen-dashboard');
    } else {
        alert("Senha incorreta! Dica: use 123");
    }
}

function fazerLogout() {
    usuarioLogado = "";
    switchScreen('screen-login');
}

function switchScreen(telaId) {
    document.querySelectorAll('.screen').forEach(tela => tela.classList.remove('active'));
    document.getElementById(telaId).classList.add('active');
    
    if (telaId === 'screen-consulta') {
        document.getElementById('resultado-scan').classList.add('hidden');
        carregarSelectVeic();
    }
    if (telaId === 'screen-cadastro-veiculo') {
        listarVeiculosExcluir();
    }
}

function atualizarPainel() {
    let emdia = 0; let vencendo = 0; let vencidas = 0;
    const hoje = new Date();

    listadebaterias.forEach(bat => {
        if (bat.status === "REMOVIDA") return;
        if (!bat.dataInstalacao) { emdia++; return; }

        const dataGarantia = new Date(bat.dataGarantiaFim);
        const diasRestantes = Math.ceil((dataGarantia - hoje) / (1000 * 60 * 60 * 24));

        if (diasRestantes < 0) vencidas++;
        else if (diasRestantes <= 30) vencendo++;
        else emdia++;
    });

    document.getElementById('dash-em-dia').innerText = "🟢 " + emdia + " Baterias em dia";
    document.getElementById('dash-vencendo').innerText = "🟠 " + vencendo + " Garantias vencendo em 30 dias";
    document.getElementById('dash-vencidas').innerText = "🔴 " + vencidas + " Garantias vencidas";
}

function salvarBateria(event) {
    event.preventDefault();
    const cod = document.getElementById('bat-codigo').value.trim().toUpperCase();
    const mar = document.getElementById('bat-marca').value.trim();
    const mod = document.getElementById('bat-modelo').value.trim();
    const gar = parseInt(document.getElementById('bat-garantia').value);

    if (listadebaterias.some(b => b.codigo === cod)) {
        alert("Erro: Código já cadastrado!"); return;
    }

    listadebaterias.push({
        codigo: cod, marca: mar, modelo: mod, garantiaMeses: isNaN(gar) ? 12 : gar,
        status: "EM ESTOQUE", veiculo: "Nenhum", dataInstalacao: null, dataGarantiaFim: null
    });
    localStorage.setItem('transjanotti_baterias_v2', JSON.stringify(listadebaterias));
    alert("Bateria em Estoque cadastrada!");
    document.getElementById('form-bateria').reset();
    atualizarPainel();
    switchScreen('screen-dashboard');
}

function salvarVeiculo(event) {
    event.preventDefault();
    const nome = document.getElementById('vei-nome').value.trim().toUpperCase();
    if (listadeveiculos.includes(nome)) { alert("Veículo já existe!"); return; }
    listadeveiculos.push(nome);
    localStorage.setItem('transjanotti_veiculos_v2', JSON.stringify(listadeveiculos));
    document.getElementById('form-veiculo').reset();
    listarVeiculosExcluir();
}

function listarVeiculosExcluir() {
    const lista = document.getElementById('lista-veiculos-excluir');
    lista.innerHTML = "";
    listadeveiculos.forEach((v, index) => {
        lista.innerHTML += '<li style="display:flex; justify-content:space-between; margin-bottom:5px;">' +
            '<span>' + v + '</span>' +
            '<button onclick="apagarVeic(' + index + ')" style="background:#b91c1c; color:white; border:none; padding:2px 6px; border-radius:4px;">🗑️</button>' +
            '</li>';
    });
}

function apagarVeic(index) {
    if(confirm("Excluir este veículo?")) {
        listadeveiculos.splice(index, 1);
        localStorage.setItem('transjanotti_veiculos_v2', JSON.stringify(listadeveiculos));
        listarVeiculosExcluir();
    }
}

function carregarSelectVeic() {
    const sel = document.getElementById('select-veiculo-instalacao');
    sel.innerHTML = '<option value="">-- Escolha o Veículo --</option>';
    listadeveiculos.forEach(v => {
        sel.innerHTML += '<option value="' + v + '">' + v + '</option>';
    });
}

let batSelecionada = null;

function simularLeitura() {
    const cod = document.getElementById('qr-input-simulado').value.trim().toUpperCase();
    batSelecionada = listadebaterias.find(b => b.codigo === cod);

    const resBox = document.getElementById('resultado-scan');
    const alUrgente = document.getElementById('alerta-urgente');
    const alVencido = document.getElementById('alerta-vencido');
    
    if (!batSelecionada) { alert("Bateria não localizada!"); resBox.classList.add('hidden'); return; }

    document.getElementById('res-codigo').innerText = batSelecionada.codigo;
    document.getElementById('res-marca').innerText = batSelecionada.marca;
    document.getElementById('res-modelo').innerText = batSelecionada.modelo;
    document.getElementById('res-veiculo').innerText = batSelecionada.veiculo;

    alUrgente.classList.add('hidden'); alVencido.classList.add('hidden');
    document.getElementById('box-instalar').classList.add('hidden');
    document.getElementById('box-retirar').classList.add('hidden');

    if (batSelecionada.status === "EM ESTOQUE") {
        document.getElementById('res-status').innerHTML = '<b>EM ESTOQUE 🔵</b>';
        document.getElementById('res-instalacao').innerText = "--";
        document.getElementById('res-garantia').innerText = batSelecionada.garantiaMeses + " meses (após instalar)";
        document.getElementById('res-dias').innerText = "--";
        document.getElementById('box-instalar').classList.remove('hidden');
    } else if (batSelecionada.status === "REMOVIDA") {
        document.getElementById('res-status').innerHTML = '<b>REMOVIDA / DESCARTE ⚪</b>';
        document.getElementById('res-instalacao').innerText = "Removida da frota";
        document.getElementById('res-garantia').innerText = "Encerrada";
        document.getElementById('res-dias').innerText = "--";
    } else {
        document.getElementById('res-status').innerHTML = '<b>ATIVA 🟢</b>';
        document.getElementById('box-retirar').classList.remove('hidden');

        const inst = new Date(batSelecionada.dataInstalacao);
        const gar = new Date(batSelecionada.dataGarantiaFim);
        const hoje = new Date();
        const dias = Math.ceil((gar - hoje) / (1000 * 60 * 60 * 24));

        document.getElementById('res-instalacao').innerText = inst.toLocaleDateString('pt-BR');
        document.getElementById('res-garantia').innerText = gar.toLocaleDateString('pt-BR');
        document.getElementById('res-dias').innerText = dias;

        if (dias < 0) { alVencido.classList.remove('hidden'); }
        else if (dias <= 30) { alUrgente.classList.remove('hidden'); }
    }
    resBox.classList.remove('hidden');
}

function instalarBateria() {
    const v = document.getElementById('select-veiculo-instalacao').value;
    if (!v) { alert("Selecione um veículo!"); return; }

    const hoje = new Date();
    const fimGar = new Date();
    fimGar.setMonth(hoje.getMonth() + batSelecionada.garantiaMeses);

    batSelecionada.status = "ATIVA";
    batSelecionada.veiculo = v;
    batSelecionada.dataInstalacao = hoje.toISOString();
    batSelecionada.dataGarantiaFim = fimGar.toISOString();

    salvarEAtualizar();
    alert("🔧 Instalada com sucesso no " + v);
}

function retirarBateria() {
    const motivo = document.getElementById('select-motivo-remocao').value;
    batSelecionada.status = "REMOVIDA";
    batSelecionada.veiculo = "Nenhum (Removida por: " + motivo + ")";
    
    salvarEAtualizar();
    alert("🔄 Bateria retirada! Veículo livre para receber outra.");
}

function excluirBateriaRegistro() {
    if (confirm("Apagar totalmente esta bateria do sistema?")) {
        listadebaterias = listadebaterias.filter(b => b.codigo !== batSelecionada.codigo);
        salvarEAtualizar();
        alert("Registro excluído.");
    }
}

function salvarEAtualizar() {
    listadebaterias = listadebaterias.map(b => b.codigo === batSelecionada.codigo ? batSelecionada : b);
    localStorage.setItem('transjanotti_baterias_v2', JSON.stringify(listadebaterias));
    document.getElementById('resultado-scan').classList.add('hidden');
    document.getElementById('qr-input-simulado').value = "";
    atualizarPainel();
    switchScreen('screen-dashboard');
}

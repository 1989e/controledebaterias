// Função para alternar de tela sem recarregar a página
function switchScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

// Funções para salvar dados simulados
function salvarBateria(event) {
    event.preventDefault();
    alert("Bateria cadastrada com sucesso! QR Code pronto para impressão.");
    document.getElementById('form-bateria').reset();
    switchScreen('screen-dashboard');
}

function salvarVeiculo(event) {
    event.preventDefault();
    alert("Veículo cadastrado com sucesso!");
    document.getElementById('form-veiculo').reset();
    switchScreen('screen-dashboard');
}

// Função que simula a consulta rápida do Eletricista
function simularLeitura() {
    const codigo = document.getElementById('qr-input-simulado').value.trim();
    const resultadoDiv = document.getElementById('resultado-scan');
    const alertaUrgente = document.getElementById('alerta-urgente');

    if (!codigo) {
        alert("Por favor, insira um código de bateria para testar.");
        return;
    }

    document.getElementById('res-codigo').innerText = codigo.toUpperCase();
    resultadoDiv.classList.remove('hidden');

    if (codigo.toUpperCase() === 'BAT-0015') {
        alertaUrgente.classList.remove('hidden');
        document.getElementById('res-dias').innerText = '15';
        document.getElementById('res-status').innerText = 'ATENÇÃO ⚠️';
    } else {
        alertaUrgente.classList.add('hidden');
        document.getElementById('res-dias').innerText = '178';
        document.getElementById('res-status').innerText = 'ATIVA 🟢';
    }
}

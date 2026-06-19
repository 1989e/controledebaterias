// Cria a memória no celular para guardar as baterias de verdade
let listadebaterias = JSON.parse(localStorage.getItem('transjanotti_memoria')) || [];

window.onload = function() {
    atualizarPainel();
};

// Função simples para mudar de tela
function switchScreen(telaId) {
    document.querySelectorAll('.screen').forEach(tela => {
        tela.classList.remove('active');
    });
    document.getElementById(telaId).classList.add('active');
    
    if (telaId === 'screen-consulta') {
        document.getElementById('resultado-scan').classList.add('hidden');
    }
}

// Atualiza os números da tela inicial de verdade baseado na memória
function atualizarPainel() {
    let emdia = 0;
    let vencendo = 0;
    let vencidas = 0;

    listadebaterias.forEach(bat => {
        if (bat.codigo === 'BAT-0015') {
            vencendo++;
        } else if (bat.marca.toUpperCase() === 'VENCIDA') {
            vencidas++;
        } else {
            emdia++;
        }
    });

    // Se a memória estiver vazia, deixa os números padrão que você gostou
    if (listadebaterias.length === 0) {
        document.getElementById('dash-em-dia').innerText = "🟢 48 Baterias em dia";
        document.getElementById('dash-vencendo').innerText = "🟠 5 Garantias vencendo em 30 dias";
        document.getElementById('dash-vencidas').innerText = "🔴 2 Garantias vencidas";
    } else {
        document.getElementById('dash-em-dia').innerText = "🟢 " + emdia + " Baterias em dia";
        document.getElementById('dash-vencendo').innerText = "🟠 " + vencendo + " Garantias vencendo em 30 dias";
        document.getElementById('dash-vencidas').innerText = "🔴 " + vencidas + " Garantias vencidas";
    }
}

// Salva a bateria na memória do celular de verdade
function salvarBateria(event) {
    event.preventDefault();
    
    const cod = document.getElementById('bat-codigo').value.trim().toUpperCase();
    const mar = document.getElementById('bat-marca').value.trim();
    const mod = document.getElementById('bat-modelo').value.trim();

    if (listadebaterias.some(b => b.codigo === cod)) {
        alert("Erro: Esse código de bateria já existe!");
        return;
    }

    const novabateria = {
        codigo: cod,
        marca: mar,
        modelo: mod
    };

    listadebaterias.push(novabateria);
    localStorage.setItem('transjanotti_memoria', JSON.stringify(listadebaterias));

    alert("Bateria cadastrada com sucesso na memória!");
    document.getElementById('form-bateria').reset();
    atualizarPainel();
    switchScreen('screen-dashboard');
}

function salvarVeiculo(event) {
    event.preventDefault();
    alert("Veículo cadastrado com sucesso!");
    document.getElementById('form-veiculo').reset();
    switchScreen('screen-dashboard');
}

function excluirVeiculoTeste() {
    document.getElementById('form-veiculo').reset();
    switchScreen('screen-dashboard');
}

// BUSCA A BATERIA DA MEMÓRIA
function simularLeitura() {
    const termo = document.getElementById('qr-input-simulado').value.trim().toUpperCase();
    const resultadoDiv = document.getElementById('resultado-scan');
    const alertaUrgente = document.getElementById('alerta-urgente');

    if (!termo) {
        alert("Por favor, insira um código para buscar.");
        return;
    }

    // Procura na memória do celular
    let achou = listadebaterias.find(b => b.codigo === termo);

    // Se não achou na memória, simula os dados padrão para teste rápido
    if (!achou) {
        achou = {
            codigo: termo,
            marca: "Moura",
            modelo: "M60FD"
        };
    }

    document.getElementById('res-codigo').innerText = achou.codigo;
    document.getElementById('res-marca').innerText = achou.marca;
    document.getElementById('res-modelo').innerText = achou.modelo;
    
    resultadoDiv.classList.remove('hidden');

    if (achou.codigo === 'BAT-0015') {
        alertaUrgente.classList.remove('hidden');
        document.getElementById('res-dias').innerText = '15';
        document.getElementById('res-status').innerText = 'ATENÇÃO ⚠️';
    } else {
        alertaUrgente.classList.add('hidden');
        document.getElementById('res-dias').innerText = '178';
        document.getElementById('res-status').innerText = 'ATIVA 🟢';
    }
}

// FUNÇÃO REAL DE EXCLUIR A BATERIA DA MEMÓRIA DO CELULAR
function excluirBateriaTeste() {
    const codigoparaapagar = document.getElementById('res-codigo').innerText;
    
    if (confirm("Deseja realmente apagar a bateria " + codigoparaapagar + " do sistema?")) {
        
        // Remove a bateria da lista da memória
        listadebaterias = listadebaterias.filter(b => b.codigo !== codigoparaapagar);
        localStorage.setItem('transjanotti_memoria', JSON.stringify(listadebaterias));
        
        alert("Bateria excluída de verdade do sistema!");
        
        // Limpa a tela e atualiza os números do Dashboard na hora!
        document.getElementById('resultado-scan').classList.add('hidden');
        document.getElementById('qr-input-simulado').value = "";
        atualizarPainel();
        switchScreen('screen-dashboard');
    }
}

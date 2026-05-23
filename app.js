// Variáveis globais para armazenar os dados


// Obter os dados do escopo global expostos por fiat_data.js
const fiatData = window.fiatData;

// Elementos DOM principais
const mainLoader = document.getElementById('main-loader');
const mainContent = document.getElementById('main-content');




// Injeção da data atual formatada
function initDate() {
    const dateDisplay = document.getElementById('current-date-display');
    if (!dateDisplay) return;
    
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const today = new Date();
    let dateStr = today.toLocaleDateString('pt-BR', options);
    // Capitalizar a primeira letra
    dateStr = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
    dateDisplay.innerText = dateStr;
}

// Inicialização da Aplicação
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Inicializar ícones do Lucide (apenas se a lib estiver disponível)
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        } else {
            console.warn('Lucide Icons não carregado. Ícones não serão renderizados.');
        }
        


        // Verificar se os dados do fiatData estão disponíveis
        if (typeof fiatData !== 'undefined' && fiatData !== null) {
            // Ocultar Loader e mostrar conteúdo principal
            mainLoader.classList.add('hidden');
            mainContent.classList.remove('hidden');
            
            // Inicializar componentes
            initDate();
            initTrocaOleo();
            
            // Re-renderizar ícones
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        } else {
            showError("O arquivo de base de dados (fiat_data.js) não foi encontrado na pasta ou está vazio.");
        }
    } catch (err) {
        console.error("Erro na inicialização da aplicação:", err);
        showError("Ocorreu um erro ao carregar a aplicação. Detalhes: " + err.message);
    }
        

});

// Exibir mensagem de erro amigável no lugar do loader
function showError(msg) {
    mainLoader.innerHTML = `
        <div style="text-align: center; padding: 2rem; max-width: 500px; margin: 0 auto; background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 12px; box-shadow: 0 8px 32px var(--shadow-color);">
            <div style="font-size: 3rem; color: var(--accent-red); margin-bottom: 1rem;">⚠️</div>
            <p style="color: var(--text-primary); font-family: 'Outfit', sans-serif; font-size: 1.2rem; font-weight: 600; margin-bottom: 0.5rem;">Erro de Inicialização</p>
            <p style="color: var(--text-secondary); font-family: 'Inter', sans-serif; font-size: 0.95rem; line-height: 1.5; margin-bottom: 1.5rem;">${msg}</p>
            <button onclick="window.location.reload();" style="background: var(--accent-red); color: white; border: none; padding: 10px 20px; border-radius: 6px; font-family: 'Outfit', sans-serif; font-weight: 500; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; transition: all 0.2s;">
                Recarregar Página
            </button>
        </div>
    `;
}



// FORMATADORES AUXILIARES
function formatCurrency(val) {
    if (val === null || val === undefined || isNaN(val)) return 'R$ 0,00';
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}







// ==========================================
// 4. TROCA DE ÓLEO (ABA 4)
// ==========================================
// Função auxiliar para determinar o modelo raiz a partir do nome completo do veículo
function getRootModel(name) {
    const nameUpper = name.toUpperCase();
    if (nameUpper.includes("STRADA")) return "STRADA";
    if (nameUpper.includes("SIENA")) return "GRAND SIENA";
    if (nameUpper.includes("PALIO")) return "PALIO";
    if (nameUpper.includes("FASTBACK")) return "FASTBACK";
    if (nameUpper.includes("DUCATO")) return "DUCATO";
    if (nameUpper.includes("SCUDO")) return "SCUDO";
    if (nameUpper.includes("DOBLO")) return "DOBLO";
    if (nameUpper.includes("FIORINO")) return "FIORINO";
    if (nameUpper.includes("CRONOS")) return "CRONOS";
    if (nameUpper.includes("ARGO")) return "ARGO";
    if (nameUpper.includes("MOBI")) return "MOBI";
    if (nameUpper.includes("PULSE")) return "PULSE";
    if (nameUpper.includes("TITANO")) return "TITANO";
    if (nameUpper.includes("TORO")) return "TORO";
    if (nameUpper.includes("UNO")) return "UNO";
    
    // Padrão: primeira palavra em maiúsculo
    return name.split(" ")[0].toUpperCase();
}

// Função auxiliar para decompor o nome da versão em título principal e subtítulo
function parseVersionName(fullName) {
    const root = getRootModel(fullName);
    let rest = fullName;
    
    // Remover o nome do modelo raiz no início
    if (fullName.toUpperCase().startsWith(root)) {
        rest = fullName.substring(root.length).trim();
    } else if (fullName.toUpperCase().startsWith("NOVA " + root)) {
        rest = fullName.substring(("NOVA " + root).length).trim();
    } else if (fullName.toUpperCase().startsWith("NOVO " + root)) {
        rest = fullName.substring(("NOVO " + root).length).trim();
    } else if (fullName.toUpperCase().startsWith("PALIO WEEKEND")) {
        rest = fullName.substring("PALIO WEEKEND".length).trim();
    } else if (fullName.toUpperCase().startsWith("GRAND SIENA")) {
        rest = fullName.substring("GRAND SIENA".length).trim();
    }
    
    let title = rest;
    let subtitle = "";
    
    // Tenta encontrar "MY", "ATÉ", ou parênteses "("
    const myIndex = rest.toUpperCase().indexOf("MY");
    const ateIndex = rest.toUpperCase().indexOf("ATÉ");
    const parenIndex = rest.indexOf("(");
    
    let splitIndex = -1;
    if (myIndex !== -1) splitIndex = myIndex;
    if (ateIndex !== -1 && (splitIndex === -1 || ateIndex < splitIndex)) splitIndex = ateIndex;
    if (parenIndex !== -1 && (splitIndex === -1 || parenIndex < splitIndex)) splitIndex = parenIndex;
    
    if (splitIndex !== -1) {
        title = rest.substring(0, splitIndex).trim();
        subtitle = rest.substring(splitIndex).trim();
        
        // Limpar parênteses se necessário
        if (subtitle.startsWith("(") && subtitle.endsWith(")")) {
            subtitle = subtitle.substring(1, subtitle.length - 1).trim();
        }
    }
    
    // Se o título ficou vazio, usa o nome completo
    if (!title) {
        title = fullName;
    }
    
    return { title, subtitle };
}

let currentOilCar = null;
let selectedRootModel = null;

function initTrocaOleo() {
    const searchInput = document.getElementById('oil-model-search');
    const rootListContainer = document.getElementById('oil-root-list-container');
    const listContainer = document.getElementById('oil-vehicle-list-container');
    
    // Obter todos os nomes de veículos (excluindo os elétricos)
    const carNames = Object.keys(fiatData.modelos)
        .filter(name => name.toLowerCase() !== '500e' && name.toLowerCase() !== 'e-scudo')
        .sort();
        
    // Agrupar veículos por modelo raiz
    const rootGroups = {};
    carNames.forEach((name) => {
        const root = getRootModel(name);
        if (!rootGroups[root]) {
            rootGroups[root] = [];
        }
        rootGroups[root].push(name);
    });
    
    // Obter lista ordenada de modelos raiz
    const rootModelsList = Object.keys(rootGroups).sort();
    
    // Função para renderizar a coluna de Modelos Raiz
    function renderRootList(filterText = '') {
        rootListContainer.innerHTML = '';
        const filteredRoots = rootModelsList.filter(root => 
            root.toLowerCase().includes(filterText.toLowerCase())
        );
        
        filteredRoots.forEach((root) => {
            const btn = document.createElement('button');
            btn.className = 'root-model-btn';
            if (selectedRootModel === root) {
                btn.classList.add('active');
            }
            btn.innerHTML = `<span>${root}</span>`;
            
            btn.addEventListener('click', () => {
                document.querySelectorAll('.root-model-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                selectedRootModel = root;
                // Ao mudar o modelo raiz, atualiza a coluna central
                renderVersionList();
            });
            
            rootListContainer.appendChild(btn);
        });
    }
    
    // Função para renderizar a coluna central de Versões
    function renderVersionList() {
        listContainer.innerHTML = '';
        
        if (!selectedRootModel) return;
        
        const versions = rootGroups[selectedRootModel] || [];
        
        versions.forEach((name) => {
            const btn = document.createElement('button');
            btn.className = 'model-item-btn oil-model-btn';
            if (currentOilCar && currentOilCar.modelo === name) {
                btn.classList.add('active');
            }
            
            const parsed = parseVersionName(name);
            const subtitleHtml = parsed.subtitle ? `<span class="version-subtitle">${parsed.subtitle}</span>` : '';
            btn.innerHTML = `
                <div class="version-info">
                    <span class="version-title">${parsed.title}</span>
                    ${subtitleHtml}
                </div>
                <i data-lucide="chevron-right" class="chevron"></i>
            `;
            
            btn.addEventListener('click', () => {
                document.querySelectorAll('.oil-model-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                selectOilCar(name);
            });
            listContainer.appendChild(btn);
        });
        
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
    
    // Listener do campo de busca de modelos raiz
    searchInput.addEventListener('input', (e) => {
        renderRootList(e.target.value);
    });
    
    // Inicialização: seleciona "TORO" se disponível, ou o primeiro modelo da lista
    if (rootModelsList.length > 0) {
        selectedRootModel = rootModelsList.includes("TORO") ? "TORO" : rootModelsList[0];
        renderRootList();
        renderVersionList();
    }
}


// Selecionar um veículo na aba de Troca de Óleo
function selectOilCar(carName) {
    try {
        currentOilCar = fiatData.modelos[carName];
        
        // Definir horas padrão para troca de óleo do veículo
        let defaultHours = 0.15;
        const nameLower = carName.toLowerCase();
        if (nameLower.includes('titano') || 
            nameLower.includes('scudo') || 
            nameLower.includes('toro') || 
            nameLower.includes('ducato')) {
            defaultHours = 0.30;
        }
        
        // Atualizar título
        document.getElementById('oil-car-name').innerText = currentOilCar.modelo;
        
        const welcomeCover = document.getElementById('oil-welcome-cover');
        const combustionContainer = document.getElementById('oil-combustion-container');
        const electricAlert = document.getElementById('oil-electric-alert');
        
        // Ocultar a capa inicial usando style.display para sobrepor qualquer inline style
        if (welcomeCover) welcomeCover.style.display = 'none';
        
        // Caso especial: veículos elétricos (500e e e-SCUDO)
        const isElectric = carName.toLowerCase() === '500e' || carName.toLowerCase() === 'e-scudo';
        if (isElectric) {
            combustionContainer.style.display = 'none';
            electricAlert.style.display = 'block';
            electricAlert.classList.remove('hidden');
            
            // Injetar dinamicamente o nome do modelo no texto de alerta
            const pElem = electricAlert.querySelector('p');
            if (pElem) {
                pElem.innerHTML = `
                    O <strong>${currentOilCar.modelo}</strong> utiliza propulsão 100% elétrica. Por não possuir motor a combustão interna, ele <strong>não necessita de óleo lubrificante de motor</strong> nem filtro de óleo, resultando em um custo de <strong>R$ 0,00</strong> para este serviço.
                `;
            }
            
            document.getElementById('oil-total-price').innerText = 'R$ 0,00';
            return;
        }
        
        combustionContainer.style.display = 'block';
        combustionContainer.classList.remove('hidden');
        electricAlert.style.display = 'none';
        
        const partsTableBody = document.getElementById('oil-parts-table-body');
        partsTableBody.innerHTML = '';
        
        // Identificar itens da primeira revisão (índice 0)
        const firstRevName = currentOilCar.revisoes[0];
        
        let subtotalPecas = 0;
        let moHoras = 0;
        let moPrecoHora = 0;
        let moSubtotal = 0;
        let indexItem = 0;
        
        // Listar peças de troca
        currentOilCar.itens.forEach(item => {
            const qty = item.trocas[firstRevName];
            const custo = item.custos[firstRevName];
            
            // Se for serviço (mão de obra) na 1a revisão
            if (item.tipo === 'serviço' && qty !== undefined && qty > 0) {
                moHoras = defaultHours; // Sempre calcular a mão de obra com as horas padrão definidas para o veículo
                moPrecoHora = parseFloat(item.preco_unitario) || 0;
                moSubtotal = moHoras * moPrecoHora;
            }
            
            // Identificar óleo ou filtro (heurística de busca)
            const nameLower = item.nome.toLowerCase();
            
            const isFiltroOleo = item.tipo === 'peça' && 
                (nameLower.includes('filtro de óleo') || 
                 nameLower.includes('filtro óleo') || 
                 nameLower.includes('filtro de oleo') || 
                 nameLower.includes('filtro oleo') || 
                 nameLower.includes('filtrante do filtro óleo') || 
                 nameLower.includes('filtrante do óleo') || 
                 nameLower.includes('filtrante de óleo') ||
                 nameLower.includes('filtrante de oleo') ||
                 nameLower.includes('filtrante do filtro oleo') ||
                 nameLower.includes('filtrante do oleo'));
                 
            const isOleoMotor = item.tipo === 'peça' && 
                (nameLower.includes('mopar maxpro') || 
                 nameLower.includes('oleo motor') || 
                 nameLower.includes('óleo motor') || 
                 nameLower.includes('selenia') || 
                 nameLower.includes('ineo') || 
                 nameLower.includes('0w20') || 
                 nameLower.includes('5w30') || 
                 nameLower.includes('0w30')) && 
                !(nameLower.includes('cambio') || 
                  nameLower.includes('câmbio') || 
                  nameLower.includes('diferencial') || 
                  nameLower.includes('freio') || 
                  nameLower.includes('caixa') || 
                  nameLower.includes('transferência') || 
                  nameLower.includes('direção'));
                  
            if (isFiltroOleo || isOleoMotor) {
                // Pegar as quantidades na 1ª revisão
                const itemQty = (qty !== undefined && qty > 0) ? qty : 1;
                const precoUnit = parseFloat(item.preco_unitario) || 0;
                const totalItem = (custo !== undefined && qty !== undefined && qty > 0) ? parseFloat(custo) : (itemQty * precoUnit);
                
                subtotalPecas += totalItem;
                
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="item-name-cell" data-label="Componente">${item.nome}</td>
                    <td data-label="Código (PN)"><span class="item-pn">${item.pn}</span></td>
                    <td class="text-right" data-label="Preço Unit.">${formatCurrency(precoUnit)}</td>
                    <td class="text-right td-highlight" data-label="QTD">${itemQty}</td>
                    <td class="text-right td-highlight" data-label="Subtotal">${formatCurrency(totalItem)}</td>
                `;
                partsTableBody.appendChild(tr);
                indexItem++;
            }
        });
        
        if (indexItem === 0) {
            partsTableBody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; color: var(--text-muted); padding: 2rem;">
                        Nenhum componente de óleo ou filtro identificado para este modelo.
                    </td>
                </tr>
            `;
        }
        
        // Se a mão de obra da 1ª revisão for zero ou não encontrada
        if (moSubtotal === 0) {
            moHoras = defaultHours; // Sempre as horas padrão do veículo
            moPrecoHora = 349.0; 
            moSubtotal = moHoras * moPrecoHora;
        }
        
        const custoTotalTroca = subtotalPecas + moSubtotal;
        
        // Atualizar interface de mão de obra
        document.getElementById('oil-mo-hours').innerText = `${moHoras.toFixed(2)}h`;
        document.getElementById('oil-mo-rate').innerText = formatCurrency(moPrecoHora);
        document.getElementById('oil-mo-subtotal').innerText = formatCurrency(moSubtotal);
        
        // Atualizar resumo e display principal
        document.getElementById('oil-sum-parts-cost').innerText = formatCurrency(subtotalPecas);
        document.getElementById('oil-sum-mo-cost').innerText = formatCurrency(moSubtotal);
        document.getElementById('oil-sum-total-cost').innerText = formatCurrency(custoTotalTroca);
        document.getElementById('oil-total-price').innerText = formatCurrency(custoTotalTroca);
    } catch (err) {
        console.error("Erro ao selecionar o veículo:", err);
        alert("Erro ao selecionar o veículo: " + err.message);
    }
}

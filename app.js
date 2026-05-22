// Variáveis globais para armazenar os dados


// Obter os dados do escopo global expostos por fiat_data.js
const fiatData = window.fiatData;

// Elementos DOM principais
const mainLoader = document.getElementById('main-loader');
const mainContent = document.getElementById('main-content');


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
let currentOilCar = null;

function initTrocaOleo() {
    const searchInput = document.getElementById('oil-model-search');
    const listContainer = document.getElementById('oil-vehicle-list-container');
    
    // Obter todos os nomes de veículos (excluindo os elétricos) e ordenar alfabeticamente
    const carNames = Object.keys(fiatData.modelos)
        .filter(name => name.toLowerCase() !== '500e' && name.toLowerCase() !== 'e-scudo')
        .sort();
    
    // Renderizar botões da sidebar do óleo
    function renderSidebarList(filterText = '') {
        listContainer.innerHTML = '';
        const searchFiltered = carNames.filter(name => 
            name.toLowerCase().includes(filterText.toLowerCase())
        );
        
        searchFiltered.forEach((name) => {
            const btn = document.createElement('button');
            btn.className = 'model-item-btn oil-model-btn';
            if (currentOilCar && currentOilCar.modelo === name) {
                btn.classList.add('active');
            }
            btn.innerHTML = `
                <span>${name}</span>
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
    
    // Adicionar listener de busca
    searchInput.addEventListener('input', (e) => {
        renderSidebarList(e.target.value);
    });
    
    // Inicializar carregando o primeiro veículo da lista
    if (carNames.length > 0) {
        renderSidebarList();
        selectOilCar(carNames[0]);
        // Ativar a primeira linha do botão
        setTimeout(() => {
            const firstBtn = listContainer.querySelector('.oil-model-btn');
            if (firstBtn) firstBtn.classList.add('active');
        }, 50);
    }
}

// Selecionar um veículo na aba de Troca de Óleo
function selectOilCar(carName) {
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
    
    const combustionContainer = document.getElementById('oil-combustion-container');
    const electricAlert = document.getElementById('oil-electric-alert');
    
    // Caso especial: veículos elétricos (500e e e-SCUDO)
    const isElectric = carName.toLowerCase() === '500e' || carName.toLowerCase() === 'e-scudo';
    if (isElectric) {
        combustionContainer.classList.add('hidden');
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
    
    combustionContainer.classList.remove('hidden');
    electricAlert.classList.add('hidden');
    
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
                <td class="item-name-cell">${item.nome}</td>
                <td><span class="item-pn">${item.pn}</span></td>
                <td class="text-right">${formatCurrency(precoUnit)}</td>
                <td class="text-right td-highlight">${itemQty}</td>
                <td class="text-right td-highlight">${formatCurrency(totalItem)}</td>
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
}

// src/main.js
import { api } from './js/api.js';
import { formatarMoeda, calcularFechamentoMensal } from './js/utils.js';

window.router = {
    go: (route) => {
        document.querySelectorAll('#bottom-nav button').forEach(b => b.classList.remove('active'));
        const btn = document.getElementById(`nav-${route}`);
        if(btn) btn.classList.add('active');
        if (route === 'dashboard') carregarDashboard();
        if (route === 'lotes') window.abrirFormularioLote();
        if (route === 'relatorios') carregarRelatorios();
    }
};

const initApp = () => {
    if (!localStorage.getItem('tourCompleted')) {
        iniciarSmartTour();
    } else {
        router.go('dashboard');
    }
};

const iniciarSmartTour = () => {
    const container = document.getElementById('view-container');
    container.innerHTML = `
        <div style="text-align:center; margin-top:20%; background:var(--white); padding:2.5rem 1.5rem; border-radius:20px; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
            <h2>Ateliê da Naomi 🪡</h2>
            <p class="text-muted" style="margin-bottom: 2rem;">Seu Sistema de Gestão de Produção e Financeiro.</p>
            <button class="btn-primary" id="btn-end-tour">Acessar Painel</button>
        </div>
    `;
    document.getElementById('btn-end-tour').addEventListener('click', () => {
        localStorage.setItem('tourCompleted', 'true');
        router.go('dashboard');
    });
};

const getMesLote = (lote) => {
    if (lote.prazoEntrega) return lote.prazoEntrega.substring(0, 7);
    if (lote.dataRecebimento) return lote.dataRecebimento.substring(0, 7);
    if (lote.dataRegistro) {
        const parts = lote.dataRegistro.split('/');
        if (parts.length === 3) return `${parts[2]}-${parts[1]}`;
    }
    return "";
};

// --- DASHBOARD ---
const carregarDashboard = async () => {
    const container = document.getElementById('view-container');
    const lotes = await api.getLotes();
    
    lotes.sort((a, b) => (b.prazoEntrega || b.dataRegistro).localeCompare(a.prazoEntrega || a.dataRegistro));

    const listaLotesHTML = lotes.length === 0 
        ? '<p class="text-muted" style="text-align: center; margin-top: 2rem;">Nenhuma produção ativa no momento.</p>' 
        : lotes.map(l => `
            <div class="dashboard-card">
                <div class="dashboard-card-header">
                    <div>
                        <div class="dashboard-card-title">${l.tipoPeca}</div>
                        <div class="text-muted">${l.fornecedorPrincipal} • ${l.qtdTotal} unidades</div>
                    </div>
                    <div class="dashboard-card-actions">
                        <button class="icon-btn" onclick="window.abrirFormularioLote('${l.id}')">✏️</button>
                        <button class="icon-btn" onclick="window.excluirLote('${l.id}')">🗑️</button>
                    </div>
                </div>
                <div style="margin-top: 10px; font-size: 0.9rem;">
                    <div style="margin-bottom: 4px;">
                        <span class="text-muted">Recebido:</span> <strong>${l.dataRecebimento ? l.dataRecebimento.split('-').reverse().join('/') : 'Não informada'}</strong>
                    </div>
                    <div>
                        <span class="text-muted">Prazo:</span> <strong class="${!l.prazoEntrega ? 'text-danger' : ''}">${l.prazoEntrega ? l.prazoEntrega.split('-').reverse().join('/') : 'A definir'}</strong>
                    </div>
                </div>
            </div>
        `).join('');

    container.innerHTML = `
        <h2>Produções Correntes</h2>
        ${listaLotesHTML}
        <button class="btn-primary" onclick="router.go('lotes')" style="margin-top: 1.5rem;">
            <span>+</span> Nova Produção
        </button>
    `;
};

window.excluirLote = async (id) => {
    if (confirm('Tem certeza que deseja excluir este registro de produção?')) {
        await api.excluirLote(id);
        carregarDashboard();
    }
};

// --- FORMULÁRIO DE PRODUÇÃO ---
window.abrirFormularioLote = async (idEdicao = null) => {
    const container = document.getElementById('view-container');
    const contatos = await api.getContatos();
    const fornecedores = await api.getFornecedores();
    let lote = idEdicao ? await api.getLote(idEdicao) : {};

    container.innerHTML = `
        <div class="form-container">
            <h2>${idEdicao ? 'Editar Produção' : 'Nova Produção'}</h2>
            
            <fieldset>
                <legend>Detalhes da Entrada</legend>
                <div class="input-group">
                    <label>Fornecedor Principal</label>
                    <select id="fornecedor-select" class="form-control">
                        <option value="">Selecione o Fornecedor...</option>
                        ${fornecedores.map(f => `<option value="${f}" ${lote.fornecedorPrincipal === f ? 'selected' : ''}>${f}</option>`).join('')}
                        <option value="novo">+ Adicionar novo...</option>
                    </select>
                </div>
                <div class="input-group">
                    <input type="text" id="fornecedor-novo" class="form-control" placeholder="Nome do Fornecedor" style="display:none;">
                </div>
                
                <div class="input-group">
                    <label>Tipo de Peça</label>
                    <input type="text" id="tipo-peca" class="form-control" placeholder="Ex: Calça Pantalona" value="${lote.tipoPeca || ''}">
                </div>
                <div class="input-row">
                    <div class="input-group">
                        <label>Quantidade</label>
                        <input type="number" id="qtd-total" class="form-control" placeholder="0" value="${lote.qtdTotal || ''}">
                    </div>
                    <div class="input-group">
                        <label>Receita Unitária (R$)</label>
                        <input type="number" id="valor-receita" class="form-control" placeholder="0,00" step="0.01" value="${lote.valorReceita || ''}">
                    </div>
                </div>
                <div class="input-row" style="margin-bottom: 0;">
                    <div class="input-group">
                        <label>Data de Recebimento</label>
                        <input type="date" id="data-recebimento" class="form-control" value="${lote.dataRecebimento || ''}">
                    </div>
                    <div class="input-group">
                        <label>Prazo de Entrega</label>
                        <input type="date" id="prazo" class="form-control" value="${lote.prazoEntrega || ''}">
                    </div>
                </div>
            </fieldset>

            <fieldset>
                <legend>Terceirização (Saída)</legend>
                <div class="input-group">
                    <label>Costureira Terceirizada</label>
                    <select id="terceirizado-select" class="form-control">
                        <option value="">Nenhuma (Produção Interna)</option>
                        ${contatos.map(c => `<option value="${c}" ${lote.terceirizadoNome === c ? 'selected' : ''}>${c}</option>`).join('')}
                        <option value="novo">+ Adicionar nova...</option>
                    </select>
                </div>
                <div class="input-group">
                    <input type="text" id="terceirizado-novo" class="form-control" placeholder="Nome da Costureira" style="display:none;">
                </div>
                <div class="input-row" style="margin-bottom: 0;">
                    <div class="input-group">
                        <label>Qtd. Repassada</label>
                        <input type="number" id="qtd-terc" class="form-control" placeholder="0" value="${lote.qtdTerceirizada || 0}">
                    </div>
                    <div class="input-group">
                        <label>Custo Unitário (R$)</label>
                        <input type="number" id="valor-terc" class="form-control" placeholder="0,00" step="0.01" value="${lote.valorTerceirizado || 0}">
                    </div>
                </div>
            </fieldset>

            <fieldset>
                <legend>Despesas Avulsas</legend>
                <div class="input-group" style="margin-bottom: 0;">
                    <label>Materiais Extras / Frete (R$)</label>
                    <input type="number" id="custo-extra" class="form-control" placeholder="0,00" value="${lote.custoExtra || 0}">
                </div>
            </fieldset>
            
            <button class="btn-primary" id="save">${idEdicao ? 'Salvar Alterações' : 'Cadastrar Serviço'}</button>
            <button class="btn-text" onclick="router.go('dashboard')">Cancelar</button>
        </div>
    `;

    const fSelect = document.getElementById('fornecedor-select');
    const fInputNovo = document.getElementById('fornecedor-novo');
    fSelect.addEventListener('change', () => fInputNovo.style.display = fSelect.value === 'novo' ? 'block' : 'none');
    
    if (lote.fornecedorPrincipal && !fornecedores.includes(lote.fornecedorPrincipal)) {
        fSelect.value = 'novo';
        fInputNovo.style.display = 'block';
        fInputNovo.value = lote.fornecedorPrincipal;
    }

    const tSelect = document.getElementById('terceirizado-select');
    const tInputNovo = document.getElementById('terceirizado-novo');
    tSelect.addEventListener('change', () => tInputNovo.style.display = tSelect.value === 'novo' ? 'block' : 'none');

    document.getElementById('save').addEventListener('click', async () => {
        let fNome = fSelect.value === 'novo' ? fInputNovo.value.trim() : fSelect.value;
        if (fSelect.value === 'novo' && fNome) await api.salvarFornecedor(fNome);

        let tNome = tSelect.value === 'novo' ? tInputNovo.value.trim() : tSelect.value;
        if (tSelect.value === 'novo' && tNome) await api.salvarContato(tNome);

        const dados = {
            fornecedorPrincipal: fNome || null,
            tipoPeca: document.getElementById('tipo-peca').value.trim(),
            qtdTotal: Number(document.getElementById('qtd-total').value),
            valorReceita: Number(document.getElementById('valor-receita').value),
            terceirizadoNome: tNome || null,
            qtdTerceirizada: Number(document.getElementById('qtd-terc').value),
            valorTerceirizado: Number(document.getElementById('valor-terc').value),
            dataRecebimento: document.getElementById('data-recebimento').value,
            prazoEntrega: document.getElementById('prazo').value,
            custoExtra: Number(document.getElementById('custo-extra').value)
        };

        if(!dados.fornecedorPrincipal || !dados.tipoPeca) return alert("Fornecedor e Tipo de Peça são obrigatórios.");

        idEdicao ? await api.atualizarLote(idEdicao, dados) : await api.salvarLote(dados);
        router.go('dashboard');
    });
};

// --- RELATÓRIOS (CONTROLE INDIVIDUAL) ---
const carregarRelatorios = async (mesSelecionado = null) => {
    const container = document.getElementById('view-container');
    
    if (!mesSelecionado) {
        const hoje = new Date();
        mesSelecionado = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;
    }

    const lotesRaw = await api.getLotes();
    const lotesDoMes = lotesRaw.filter(l => getMesLote(l) === mesSelecionado);
    const contaEnergia = await api.getEnergia(mesSelecionado);

    const grupos = lotesDoMes.reduce((acc, l) => {
        if (!acc[l.fornecedorPrincipal]) acc[l.fornecedorPrincipal] = { lotes: [], total: 0 };
        acc[l.fornecedorPrincipal].lotes.push(l);
        acc[l.fornecedorPrincipal].total += (l.qtdTotal * l.valorReceita);
        return acc;
    }, {});

    const dividas = lotesDoMes.reduce((acc, l) => {
        if (l.terceirizadoNome) {
            acc[l.terceirizadoNome] = (acc[l.terceirizadoNome] || 0) + (l.qtdTerceirizada * l.valorTerceirizado);
        }
        return acc;
    }, {});

    let receitaBruta = 0, custoTerc = 0, custosExtras = 0;
    lotesDoMes.forEach(l => {
        receitaBruta += (l.qtdTotal * l.valorReceita);
        custoTerc += (l.qtdTerceirizada * l.valorTerceirizado);
        custosExtras += Number(l.custoExtra || 0);
    });

    const f = calcularFechamentoMensal(receitaBruta, custoTerc, custosExtras, contaEnergia);

    let htmlFornecedores = Object.keys(grupos).map(fNome => `
        <div class="supplier-group">
            <div class="supplier-header">
                <span>${fNome}</span>
                <span class="text-success">${formatarMoeda(grupos[fNome].total)}</span>
            </div>
            ${grupos[fNome].lotes.map(l => `
                <div class="supplier-item">
                    <div>
                        <strong>${l.tipoPeca}</strong> <span class="text-muted">(${l.qtdTotal} un)</span>
                    </div>
                    <div class="text-muted" style="font-size: 0.85rem;">
                        ${l.prazoEntrega ? l.prazoEntrega.split('-').reverse().join('/') : '-'}
                    </div>
                </div>
            `).join('')}
        </div>
    `).join('');

    let htmlDividas = Object.keys(dividas).map(tNome => `
        <div class="debt-card">
            <strong>${tNome}</strong>
            <strong class="text-danger">${formatarMoeda(dividas[tNome])}</strong>
        </div>
    `).join('');

    container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; background: var(--white); padding: 12px; border-radius: 8px; border: 1px solid var(--border);">
            <label style="font-weight: bold; color: var(--primary); margin: 0;">Mês Base:</label>
            <input type="month" id="filtro-mes" class="form-control" value="${mesSelecionado}" style="width: auto; padding: 6px; border: none; background: #f4f0ea; font-weight: bold;">
        </div>

        <h3 style="margin-top: 1.5rem;">Faturamento por Fornecedor</h3>
        ${htmlFornecedores || '<p class="text-muted">Nenhuma entrada registrada neste mês.</p>'}

        <h3 style="margin-top: 1.5rem; color: var(--danger);">Acertos (Terceirizados)</h3>
        ${htmlDividas || '<p class="text-muted">Nenhum repasse pendente neste mês.</p>'}

        <div class="summary-panel">
            <h3 style="text-align: center;">Balanço Operacional do Mês</h3>
            <div class="summary-row" style="margin-top: 1rem;">
                <span class="text-muted">(+) Faturamento Total</span>
                <span>${formatarMoeda(receitaBruta)}</span>
            </div>
            <div class="summary-row">
                <span class="text-muted">(-) Mão de obra Externa</span>
                <span class="text-danger">${formatarMoeda(custoTerc)}</span>
            </div>
            <div class="summary-row">
                <span class="text-muted">(-) Custos Extras</span>
                <span class="text-danger">${formatarMoeda(custosExtras)}</span>
            </div>
            
            <div class="summary-divider"></div>
            
            <div class="summary-row" style="align-items: center;">
                <span class="text-muted" style="font-weight: 600;">Conta de Energia do Mês</span>
                <div style="display: flex; gap: 5px;">
                    <input type="number" id="input-energia" class="form-control" value="${contaEnergia}" style="width: 80px; padding: 6px; text-align: center;">
                    <button id="save-energy" class="btn-primary" style="width: auto; padding: 6px 12px; border-radius: 8px;">OK</button>
                </div>
            </div>
        </div>

        <h3 style="text-align: center; margin-top: 2rem;">Resultado do Período</h3>
        <div class="socia-card">
            <div class="socia-header">
                <div class="socia-avatar">N</div>
            </div>
            <div class="socia-info">
                <div class="socia-name">CAIXA DA NAOMI</div>
                <div class="socia-value">${formatarMoeda(f.lucroLiquido)}</div>
            </div>
        </div>
    `;

    document.getElementById('filtro-mes').addEventListener('change', (e) => {
        carregarRelatorios(e.target.value);
    });

    document.getElementById('save-energy').addEventListener('click', async () => {
        await api.salvarEnergia(mesSelecionado, document.getElementById('input-energia').value);
        carregarRelatorios(mesSelecionado);
    });
};

document.addEventListener('DOMContentLoaded', initApp);
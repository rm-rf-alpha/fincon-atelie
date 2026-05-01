// src/js/utils.js

export const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(valor);
};

export const calcularFechamentoMensal = (receitaTotalBruta, custoTerceiros, custosExtras, contaEnergia) => {
    const lucroOperacional = receitaTotalBruta - custoTerceiros - custosExtras;
    const lucroLiquido = lucroOperacional - contaEnergia;

    return {
        lucroOperacional,
        lucroLiquido
    };
};
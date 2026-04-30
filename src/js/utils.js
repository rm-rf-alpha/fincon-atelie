// src/js/utils.js

export const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(valor);
};

export const calcularFechamentoMensal = (receitaTotalBruta, custoTerceiros, custosExtras, contaEnergia) => {
    // Agora o custo extra também é abatido para achar o lucro operacional
    const lucroOperacional = receitaTotalBruta - custoTerceiros - custosExtras;
    const lucroLiquido = lucroOperacional - contaEnergia;
    
    // Rateio 50/50
    const cotaIndividual = lucroLiquido / 2;

    return {
        lucroOperacional,
        lucroLiquido,
        cotaIndividual
    };
};
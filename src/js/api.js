// src/js/api.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// CORREÇÃO: A URL deve terminar no ".co", sem adicionar "/rest/v1"
const supabaseUrl = 'https://rkttidfbvpalqdoaelpw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJrdHRpZGZidnBhbHFkb2FlbHB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NTg1NTAsImV4cCI6MjA5MzEzNDU1MH0.TmZc5Qx4-LJ2kongPdAiizfnnhhdPEM4bvwLzdc-7kA';

const supabase = createClient(supabaseUrl, supabaseKey);

export const api = {
    // --- LOTES ---
    getLotes: async () => {
        const { data, error } = await supabase.from('lotes').select('*');
        if (error) console.error(error);
        return data || [];
    },
    getLote: async (id) => {
        const { data } = await supabase.from('lotes').select('*').eq('id', id).single();
        return data || {};
    },
    salvarLote: async (lote) => {
        const novoLote = { 
            id: Date.now().toString(), 
            dataRegistro: new Date().toLocaleDateString('pt-BR'), 
            ...lote 
        };
        await supabase.from('lotes').insert([novoLote]);
        return novoLote;
    },
    atualizarLote: async (id, dados) => {
        await supabase.from('lotes').update(dados).eq('id', id);
    },
    excluirLote: async (id) => {
        await supabase.from('lotes').delete().eq('id', id);
    },

    // --- CONTATOS (Terceirizados) ---
    getContatos: async () => {
        const { data, error } = await supabase.from('contatos').select('nome');
        if (error) console.error(error);
        return data ? data.map(c => c.nome) : [];
    },
    salvarContato: async (nome) => {
        const { data } = await supabase.from('contatos').select('nome').eq('nome', nome);
        if (!data || data.length === 0) {
            await supabase.from('contatos').insert([{ nome }]);
        }
        return nome;
    },

    // --- FORNECEDORES ---
    getFornecedores: async () => {
        const { data, error } = await supabase.from('fornecedores').select('nome');
        if (error) console.error(error);
        return data ? data.map(f => f.nome) : [];
    },
    salvarFornecedor: async (nome) => {
        const { data } = await supabase.from('fornecedores').select('nome').eq('nome', nome);
        if (!data || data.length === 0) {
            await supabase.from('fornecedores').insert([{ nome }]);
        }
        return nome;
    },

    // --- ENERGIA ---
    getEnergia: async (mes) => {
        const { data, error } = await supabase.from('energia').select('valor').eq('mes', mes).maybeSingle();
        if (error) console.error(error);
        return data ? Number(data.valor) : 0;
    },
    salvarEnergia: async (mes, valor) => {
        const { data } = await supabase.from('energia').select('mes').eq('mes', mes).maybeSingle();
        if (data) {
            await supabase.from('energia').update({ valor }).eq('mes', mes);
        } else {
            await supabase.from('energia').insert([{ mes, valor }]);
        }
        return valor;
    }
};
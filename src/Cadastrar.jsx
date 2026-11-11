import React, { useState } from 'react';
import { Shield } from 'lucide-react';

export function Cadastrar() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [sucesso, setSucesso] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aqui podes adicionar a lógica de criação do utilizador no Firebase Auth/Firestore se desejado
    setSucesso(true);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-3xl max-w-md w-full p-8 space-y-6 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="bg-blue-600 p-3 rounded-2xl text-white w-fit mx-auto shadow-lg shadow-blue-500/30">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-wide text-white">LABAGI</h1>
          <p className="text-xs text-slate-400">Cadastro de Dentista Parceiro</p>
        </div>

        {sucesso ? (
          <div className="bg-emerald-950/60 border border-emerald-800 text-emerald-300 p-4 rounded-xl text-center space-y-2">
            <p className="font-semibold text-sm">Cadastro enviado com sucesso!</p>
            <p className="text-xs text-slate-300">O seu acesso será validado pela administração do LABAGI.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Nome Completo</label>
              <input 
                type="text" 
                required 
                placeholder="Dr(a). Nome Sobrenome" 
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500" 
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">E-mail</label>
              <input 
                type="email" 
                required 
                placeholder="seu.email@exemplo.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500" 
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Senha de Acesso</label>
              <input 
                type="password" 
                required 
                placeholder="••••••••" 
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500" 
              />
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl text-sm transition shadow-lg shadow-blue-500/20">
              Concluir Cadastro
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

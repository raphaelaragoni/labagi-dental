import React, { useState } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { Shield, UserPlus, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

export function Cadastrar() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [role, setRole] = useState('dentista'); // 'admin', 'cadista', 'dentista'
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Configuração do Firebase (mesma do seu main.jsx)
  const firebaseConfig = {
    apiKey: "AizaSyAFit7yJbO2qdnbLdn16oDOGcj8di-9yoM",
    authDomain: "labagi.firebaseapp.com",
    projectId: "labagi",
    storageBucket: "labagi.firebasestorage.app",
    messagingSenderId: "346001346837",
    appId: "1:346001346837:web:258713bf5086115296591c"
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Inicializa uma app secundária isolada para não afetar a sessão do Admin atual
      const secondaryAppName = 'SecondaryRegisterApp';
      const secondaryApp = getApps().find(app => app.name === secondaryAppName) 
        || initializeApp(firebaseConfig, secondaryAppName);
      
      const secondaryAuth = getAuth(secondaryApp);
      const secondaryDb = getFirestore(secondaryApp);

      // 2. Cria a conta no Firebase Auth secundário
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
      const newUser = userCredential.user;

      // 3. Salva os dados e a role na coleção 'Usuarios' (com 'U' maiúsculo)
      await setDoc(doc(secondaryDb, "Usuarios", newUser.uid), {
        uid: newUser.uid,
        nome: nome,
        email: email,
        role: role,
        createdAt: new Date()
      });

      // 4. Faz logout na instância secundária para limpar e encerra com sucesso
      await signOut(secondaryAuth);
      
      setSuccess(true);
      setEmail('');
      setPassword('');
      setNome('');
      setRole('dentista');

    } catch (err) {
      console.error("Erro ao registar utilizador:", err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Este e-mail já está registado.');
      } else if (err.code === 'auth/weak-password') {
        setError('A senha deve ter pelo menos 6 caracteres.');
      } else {
        setError('Erro ao criar conta. Verifique os dados e tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-3xl max-w-md w-full p-8 space-y-6 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="bg-blue-600 p-3 rounded-2xl text-white w-fit mx-auto shadow-lg shadow-blue-500/30">
            <UserPlus className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-wide text-white">Registo de Utilizador</h1>
          <p className="text-xs text-slate-400">LABAGI - Painel Administrativo</p>
        </div>

        {error && (
          <div className="bg-rose-950/60 border border-rose-800 text-rose-300 p-3 rounded-xl text-xs">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-emerald-950/60 border border-emerald-800 text-emerald-300 p-3 rounded-xl text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Utilizador criado com sucesso e perfil guardado!</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Nome Completo</label>
            <input 
              type="text" 
              required 
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Nome do profissional" 
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500" 
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">E-mail</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@exemplo.com" 
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500" 
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Senha Temporária</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo de 6 caracteres" 
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500 pr-10" 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Perfil de Acesso (Role)</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="dentista">Dentista Parceiro</option>
              <option value="cadista">Cadista</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-sm transition shadow-lg shadow-blue-500/20"
          >
            {loading ? 'A registar...' : 'Criar Conta'}
          </button>
        </form>

        <div className="text-center pt-2">
          <a href="/" className="text-xs text-slate-400 hover:text-slate-200 underline">
            ← Voltar para o Painel Principal
          </a>
        </div>
      </div>
    </div>
  );
}

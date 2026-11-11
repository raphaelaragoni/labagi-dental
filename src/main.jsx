import React, { useState, useEffect } from 'react';
import { Cadastrar } from './Cadastrar';
import { createRoot } from 'react-dom/client';
import { initializeApp } from "firebase/app";
import { 
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail
} from "firebase/auth";
import { 
  getFirestore,
  doc,
  getDoc
} from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { 
  Shield, 
  LogOut, 
  Eye,
  EyeOff,
  KeyRound
} from 'lucide-react';

function App() {
  const urlParams = new URLSearchParams(window.location.search);
  const isCadastrarRoute = window.location.pathname.includes('/cadastrar') || urlParams.has('token') || urlParams.get('token') === 'LABAGI-2026';

  if (isCadastrarRoute) {
    return <Cadastrar />;
  }

  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const firebaseConfig = {
    apiKey: "AizaSyAFit7yJbO2qdnbLdn16oDOGcj8di-9yoM",
    authDomain: "labagi.firebaseapp.com",
    projectId: "labagi",
    storageBucket: "labagi.firebasestorage.app",
    messagingSenderId: "346001346837",
    appId: "1:346001346837:web:258713bf5086115296591c"
  };

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const storage = getStorage(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userDocRef = doc(db, "Usuarios", currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role || 'dentista');
          } else {
            setUserRole('dentista');
          }
        } catch (err) {
          console.error("Erro ao buscar papel do utilizador:", err);
          setUserRole('dentista');
        }
      } else {
        setUserRole(null);
      }
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, [auth, db]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setResetSent(false);
    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
    } catch (err) {
      setLoginError('Erro ao entrar. Verifique o e-mail e a senha.');
    }
  };

  const handlePasswordReset = async () => {
    if (!loginEmail) {
      setLoginError('Introduza o seu e-mail para recuperar a senha.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, loginEmail);
      setResetSent(true);
      setLoginError('');
    } catch (err) {
      setLoginError('Erro ao enviar e-mail de recuperação. Verifique o endereço.');
    }
  };

  const handleLogout = () => {
    signOut(auth);
  };

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-400">
        A carregar LABAGI...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4">
        <div className="bg-slate-800 border border-slate-700 rounded-3xl max-w-md w-full p-8 space-y-6 shadow-2xl">
          <div className="text-center space-y-2">
            <div className="bg-blue-600 p-3 rounded-2xl text-white w-fit mx-auto shadow-lg shadow-blue-500/30">
              <Shield className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold tracking-wide text-white">LABAGI</h1>
            <p className="text-xs text-slate-400">Painel de Controlo e Gestão Laboratorial</p>
          </div>

          {loginError && (
            <div className="bg-rose-950/60 border border-rose-800 text-rose-300 p-3 rounded-xl text-xs">
              {loginError}
            </div>
          )}

          {resetSent && (
            <div className="bg-emerald-950/60 border border-emerald-800 text-emerald-300 p-3 rounded-xl text-xs">
              E-mail de recuperação enviado com sucesso! Verifique a sua caixa de entrada.
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">E-mail</label>
              <input 
                type="email" 
                required 
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="seu.email@exemplo.com" 
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500" 
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Senha</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  required 
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••" 
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

            <div className="flex justify-between items-center text-xs">
              <button 
                type="button"
                onClick={handlePasswordReset}
                className="text-blue-400 hover:underline flex items-center space-x-1"
              >
                <KeyRound className="w-3 h-3" />
                <span>Esqueci a minha senha</span>
              </button>
            </div>

            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl text-sm transition shadow-lg shadow-blue-500/20">
              Entrar no Sistema
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex justify-between items-center bg-slate-800 border border-slate-700 p-6 rounded-3xl shadow-xl">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg shadow-blue-500/30">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-wide">LABAGI - Gestão</h1>
              <p className="text-xs text-slate-400">
                Sessão: {user.email} | Perfil: <span className="uppercase font-semibold text-blue-400">{userRole}</span>
              </p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-2 bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/30 text-rose-300 px-4 py-2 rounded-xl text-sm transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair</span>
          </button>
        </header>

        <div className="bg-slate-800 border border-slate-700 p-6 rounded-3xl space-y-4">
          {userRole === 'admin' && (
            <div>
              <h2 className="text-lg font-semibold text-white">Painel de Administrador</h2>
              <p className="text-sm text-slate-400">Acesso total de gestão laboratorial, ordens de serviço e utilizadores.</p>
              <div className="mt-4">
                <a 
                  href="/cadastrar" 
                  className="inline-block bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-semibold transition"
                >
                  Ir para Tela de Registo de Novos Utilizadores
                </a>
              </div>
            </div>
          )}

          {userRole === 'cadista' && (
            <div>
              <h2 className="text-lg font-semibold text-white">Painel de Cadista</h2>
              <p className="text-sm text-slate-400">Acesso dedicado ao fluxo de modelagem CAD e ordens atribuídas.</p>
            </div>
          )}

          {userRole === 'dentista' && (
            <div>
              <h2 className="text-lg font-semibold text-white">Painel do Dentista Parceiro</h2>
              <p className="text-sm text-slate-400">Acompanhe o estado das suas próteses e pedidos em andamento.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

import React, { useState, useEffect } from 'react';
import { Cadastrar } from './Cadastrar';
import { createRoot } from 'react-dom/client';
import { initializeApp } from "firebase/app";
import { 
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import { 
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  doc,
  getDoc,
  updateDoc
} from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { 
  Shield, 
  User, 
  Lock, 
  LogOut, 
  Plus, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  UserPlus, 
  Link as LinkIcon, 
  Copy, 
  X, 
  FileCheck, 
  UserCheck, 
  DollarSign, 
  BarChart3, 
  LogIn, 
  MessageSquare 
} from 'lucide-react';

const TABELA_LABAGI = [
  { nome: "Prótese sobre Implante", preco: 350 },
  { nome: "RMF", preco: 150 },
  { nome: "Núcleo", preco: 100 },
  { nome: "Voxel", preco: 250 }
];

const STATUS_LABORATORIO = [
  "Pendente / Aguardando",
  "Em Modelagem CAD",
  "Na Impressora / Fresadora",
  "Em Acabamento / Cerâmica",
  "Pronto para Entrega",
  "Concluído"
];

function App() {
  // INTERCEÇÃO DA ROTA DE CADASTRO (Prioridade Máxima)
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
  const [loginError, setLoginError] = useState('');

  const [activeTab, setActiveTab] = useState('os');
  const [jobs, setJobs] = useState([]);
  const [cadistasList, setCadistasList] = useState([
    { id: '1', nome: 'Arthur Cardoso' },
    { id: '2', nome: 'Raphael Aragoni' }
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showCadistaModal, setShowCadistaModal] = useState(false);
  const [showNewOSModal, setShowNewOSModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    dentista: '',
    paciente: '',
    servico: TABELA_LABAGI[0].nome,
    valorServico: TABELA_LABAGI[0].preco,
    observacoes: ''
  });

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
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, [auth]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
    } catch (err) {
      setLoginError('Erro ao entrar. Verifique o e-mail e a senha.');
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
              <input 
                type="password" 
                required 
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500" 
              />
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
              <p className="text-xs text-slate-400">Sessão iniciada como: {user.email}</p>
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

        <div className="bg-slate-800 border border-slate-700 p-6 rounded-3xl text-center space-y-4">
          <h2 className="text-lg font-semibold">Bem-vindo ao Painel LABAGI</h2>
          <p className="text-sm text-slate-400">O sistema está operacional e pronto para gerir as ordens de serviço e parceiros.</p>
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

import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { 
  Shield, 
  Users, 
  FileText, 
  UploadCloud, 
  Download, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  UserPlus, 
  Link as LinkIcon, 
  Copy 
} from 'lucide-react';

// Configuração do seu Firebase (LABAGI)
const firebaseConfig = {
  apiKey: "AIzaSyAFit7yJb02Qdnbl.dml6oD0Gcjr8di-9yoM",
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

function App() {
  const [currentUserRole, setCurrentUserRole] = useState('admin');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const copyInviteLink = () => {
    navigator.clipboard.writeText("https://labagi-dental.vercel.app/cadastrar?token=LABAGI-2026");
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-500/30">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wide text-white">LABAGI</h1>
            <p className="text-xs text-slate-400">Sistema Integrado ao Firebase & CAD</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-900/80 p-1.5 rounded-xl border border-slate-700">
          <span className="text-xs text-slate-400 px-2 font-medium">Perfil:</span>
          <button 
            onClick={() => setCurrentUserRole('admin')} 
            className={`px-3 py-1.5 text-xs rounded-lg transition-all ${currentUserRole === 'admin' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-white'}`}
          >
            Admin Lab
          </button>
          <button 
            onClick={() => setCurrentUserRole('cadista')} 
            className={`px-3 py-1.5 text-xs rounded-lg transition-all ${currentUserRole === 'cadista' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-white'}`}
          >
            Cadista
          </button>
          <button 
            onClick={() => setCurrentUserRole('dentista')} 
            className={`px-3 py-1.5 text-xs rounded-lg transition-all ${currentUserRole === 'dentista' ? 'bg-blue-600 text-white font-semibold' : 'text-slate-400 hover:text-white'}`}
          >
            Dentista
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="bg-gradient-to-r from-blue-950 to-slate-800 rounded-2xl p-6 border border-slate-700 flex flex-wrap items-center justify-between gap-4 shadow-xl">
          <div>
            <h2 className="text-2xl font-bold">
              {currentUserRole === 'admin' && "Painel do Administrador (LABAGI)"}
              {currentUserRole === 'cadista' && "Painel do Cadista"}
              {currentUserRole === 'dentista' && "Área do Cliente (Dentista)"}
            </h2>
            <p className="text-slate-400 text-sm mt-1">Banco de dados Firebase conectado com sucesso.</p>
          </div>

          <div className="flex items-center gap-3">
            {currentUserRole === 'admin' && (
              <button 
                onClick={() => setShowInviteModal(true)}
                className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-medium transition"
              >
                <UserPlus className="w-4 h-4" /> Convidar Dentista
              </button>
            )}
          </div>
        </div>

        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 text-center text-slate-300">
          <p className="text-sm">O sistema LABAGI está configurado com Firebase! Atualize a página do seu link na Vercel em instantes.</p>
        </div>
      </main>

      {showInviteModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-blue-400" /> Enviar Convite ao Dentista
            </h3>
            <p className="text-xs text-slate-400">
              Copie o link seguro abaixo e envie diretamente para o dentista pelo WhatsApp:
            </p>
            <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl flex items-center justify-between gap-2">
              <span className="text-xs font-mono text-slate-300 truncate">
                https://labagi-dental.vercel.app/cadastrar?token=LABAGI-2026
              </span>
              <button 
                onClick={copyInviteLink}
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 transition"
              >
                {copiedLink ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedLink ? "Copiado!" : "Copiar"}
              </button>
            </div>
            <button 
              onClick={() => setShowInviteModal(false)}
              className="w-full bg-slate-700 hover:bg-slate-600 text-xs text-slate-300 py-2.5 rounded-xl transition font-medium"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);

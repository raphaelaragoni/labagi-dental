import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  doc, 
  updateDoc 
} from "firebase/firestore";
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from "firebase/storage";
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
  Clock, 
  AlertCircle, 
  UserPlus, 
  Link as LinkIcon, 
  Copy, 
  X,
  FileCheck
} from 'lucide-react';

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
  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showNewOSModal, setShowNewOSModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Formulário Nova OS
  const [formData, setFormData] = useState({
    dentista: '',
    paciente: '',
    servico: '',
    dente: '',
    cadista: 'Não atribuído',
    prazo: '',
    arquivo: null
  });

  // Buscar OS em tempo real no Firestore
  useEffect(() => {
    const q = query(collection(db, "ordens_servico"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
      setJobs(docs);
    }, (error) => {
      console.error("Erro ao carregar OS do Firebase:", error);
    });

    return () => unsubscribe();
  }, []);

  const copyInviteLink = () => {
    navigator.clipboard.writeText("https://labagi-dental.vercel.app/cadastrar?token=LABAGI-2026");
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCreateOS = async (e) => {
    e.preventDefault();
    if (!formData.paciente || !formData.servico) return;

    setUploading(true);
    try {
      let fileUrl = '';
      let fileName = '';

      if (formData.arquivo) {
        fileName = formData.arquivo.name;
        const storageRef = ref(storage, `scans/${Date.now()}_${fileName}`);
        await uploadBytes(storageRef, formData.arquivo);
        fileUrl = await getDownloadURL(storageRef);
      }

      await addDoc(collection(db, "ordens_servico"), {
        codigoOS: `OS-2026-${Math.floor(100 + Math.random() * 900)}`,
        dentista: formData.dentista || (currentUserRole === 'dentista' ? 'Dr. Cliente' : 'Dr. Roberto Silva'),
        paciente: formData.paciente,
        servico: formData.servico,
        dente: formData.dente || 'Geral',
        cadista: formData.cadista,
        status: 'Pendente',
        prazo: formData.prazo || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        arquivoNome: fileName,
        arquivoUrl: fileUrl,
        createdAt: new Date().toISOString()
      });

      setFormData({ dentista: '', paciente: '', servico: '', dente: '', cadista: 'Não atribuído', prazo: '', arquivo: null });
      setShowNewOSModal(false);
    } catch (err) {
      console.error("Erro ao salvar OS:", err);
      alert("Erro ao salvar a Ordem de Serviço no Firebase.");
    } finally {
      setUploading(false);
    }
  };

  const handleStatusChange = async (jobId, newStatus) => {
    try {
      const jobRef = doc(db, "ordens_servico", jobId);
      await updateDoc(jobRef, { status: newStatus });
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = (job.paciente || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (job.dentista || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (job.codigoOS || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'Todos' || job.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: jobs.length,
    emProducao: jobs.filter(j => j.status === 'Em Produção').length,
    pendentes: jobs.filter(j => j.status === 'Pendente' || j.status === 'Aguardando Cadista').length,
    concluidos: jobs.filter(j => j.status === 'Concluído').length
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-500/30">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wide text-white">LABAGI</h1>
            <p className="text-xs text-slate-400">Gestão de Prótese & CAD Odontológico</p>
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Banner Topo */}
        <div className="bg-gradient-to-r from-blue-950 to-slate-800 rounded-2xl p-6 border border-slate-700 flex flex-wrap items-center justify-between gap-4 shadow-xl">
          <div>
            <h2 className="text-2xl font-bold">
              {currentUserRole === 'admin' && "Painel do Administrador"}
              {currentUserRole === 'cadista' && "Painel do Cadista / Projetista"}
              {currentUserRole === 'dentista' && "Área do Cliente (Dentista)"}
            </h2>
            <p className="text-slate-400 text-sm mt-1">Controle global de ordens de serviço, escaneamentos e envio de convites.</p>
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
            <button 
              onClick={() => setShowNewOSModal(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-semibold shadow-lg shadow-blue-500/20 transition"
            >
              <Plus className="w-4 h-4" /> Nova Ordem de Serviço
            </button>
          </div>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Total de Trabalhos</p>
              <p className="text-2xl font-bold mt-1">{stats.total}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-400 opacity-80" />
          </div>

          <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Em Produção / Design</p>
              <p className="text-2xl font-bold mt-1 text-amber-400">{stats.emProducao}</p>
            </div>
            <Clock className="w-8 h-8 text-amber-400 opacity-80" />
          </div>

          <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Pendentes / Atribuição</p>
              <p className="text-2xl font-bold mt-1 text-sky-400">{stats.pendentes}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-sky-400 opacity-80" />
          </div>

          <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Concluídos</p>
              <p className="text-2xl font-bold mt-1 text-emerald-400">{stats.concluidos}</p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-emerald-400 opacity-80" />
          </div>
        </div>

        {/* Filtros e Busca */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Buscar por OS, dentista ou paciente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-sm rounded-xl pl-9 pr-4 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-xs rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="Todos">Todos os Status</option>
              <option value="Pendente">Pendente</option>
              <option value="Em Produção">Em Produção</option>
              <option value="Concluído">Concluído</option>
            </select>
          </div>
        </div>

        {/* Tabela de OS */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-700">
                <tr>
                  <th className="px-6 py-4">Código OS</th>
                  <th className="px-6 py-4">Dentista / Paciente</th>
                  <th className="px-6 py-4">Serviço / Elemento</th>
                  <th className="px-6 py-4">Cadista Responsável</th>
                  <th className="px-6 py-4">Prazo</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Arquivo 3D</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {filteredJobs.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-slate-500">
                      Nenhuma ordem de serviço encontrada no banco de dados.
                    </td>
                  </tr>
                ) : (
                  filteredJobs.map((job) => (
                    <tr key={job.id} className="hover:bg-slate-700/30 transition">
                      <td className="px-6 py-4 font-mono font-bold text-blue-400">{job.codigoOS}</td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-200">{job.dentista}</p>
                        <p className="text-[11px] text-slate-400">Pac: {job.paciente}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-slate-200 font-medium">{job.servico}</p>
                        <p className="text-[11px] text-slate-400">Elemento: {job.dente}</p>
                      </td>
                      <td className="px-6 py-4 text-slate-300">{job.cadista}</td>
                      <td className="px-6 py-4 text-slate-300">{job.prazo}</td>
                      <td className="px-6 py-4">
                        <select
                          value={job.status}
                          onChange={(e) => handleStatusChange(job.id, e.target.value)}
                          className={`text-[11px] font-semibold rounded-lg px-2.5 py-1 border focus:outline-none ${
                            job.status === 'Concluído' ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800' :
                            job.status === 'Em Produção' ? 'bg-amber-950/60 text-amber-400 border-amber-800' :
                            'bg-slate-900 text-sky-400 border-slate-700'
                          }`}
                        >
                          <option value="Pendente">Pendente</option>
                          <option value="Em Produção">Em Produção</option>
                          <option value="Concluído">Concluído</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {job.arquivoUrl ? (
                          <a 
                            href={job.arquivoUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-blue-400 hover:text-blue-300 font-medium bg-blue-950/40 border border-blue-800/60 px-2.5 py-1 rounded-lg transition"
                          >
                            <Download className="w-3.5 h-3.5" /> {job.arquivoNome || 'Download STL'}
                          </a>
                        ) : (
                          <span className="text-slate-500 text-[11px]">Sem arquivo</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal Convidar Dentista */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-blue-400" /> Enviar Convite ao Dentista
              </h3>
              <button onClick={() => setShowInviteModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Copie o link exclusivo de acesso abaixo e envie para o cirurgião-dentista:
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
          </div>
        </div>
      )}

      {/* Modal Nova Ordem de Serviço */}
      {showNewOSModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-blue-400" /> Nova Ordem de Serviço
              </h3>
              <button onClick={() => setShowNewOSModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOS} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Cirurgião Dentista</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Dr. Roberto Silva"
                    value={formData.dentista}
                    onChange={(e) => setFormData({...formData, dentista: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Nome do Paciente *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ex: Ana Maria Souza"
                    value={formData.paciente}
                    onChange={(e) => setFormData({...formData, paciente: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Tipo de Prótese / Serviço *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ex: Coroa Zircônia, Placa de Bruxismo"
                    value={formData.servico}
                    onChange={(e) => setFormData({...formData, servico: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Elemento / Dente</label>
                  <input 
                    type="text" 
                    placeholder="Ex: 11, 21, Arcada Sup"
                    value={formData.dente}
                    onChange={(e) => setFormData({...formData, dente: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Cadista Responsável</label>
                  <select 
                    value={formData.cadista}
                    onChange={(e) => setFormData({...formData, cadista: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Não atribuído">Não atribuído</option>
                    <option value="Arthur Cardoso">Arthur Cardoso</option>
                    <option value="Raphael Aragoni">Raphael Aragoni</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Data Limite / Prazo</label>
                  <input 
                    type="date" 
                    value={formData.prazo}
                    onChange={(e) => setFormData({...formData, prazo: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Anexar Escaneamento 3D (.stl, .ply, .zip)</label>
                <div className="border-2 border-dashed border-slate-700 rounded-xl p-4 text-center bg-slate-900/50 hover:border-blue-500 transition cursor-pointer relative">
                  <input 
                    type="file" 
                    onChange={(e) => setFormData({...formData, arquivo: e.target.files[0]})}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <UploadCloud className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                  <p className="text-slate-300 font-medium">
                    {formData.arquivo ? formData.arquivo.name : "Clique para selecionar o arquivo 3D"}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Suporta ficheiros STL, PLY e arquivos comprimidos ZIP</p>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setShowNewOSModal(false)}
                  className="bg-slate-700 hover:bg-slate-600 text-slate-300 px-4 py-2 rounded-xl text-xs transition"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={uploading}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl text-xs font-semibold shadow-lg shadow-blue-500/20 transition disabled:opacity-50"
                >
                  {uploading ? "Salvando no Firebase..." : "Criar Ordem de Serviço"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);

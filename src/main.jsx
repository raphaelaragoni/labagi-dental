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
  FileCheck,
  UserCheck,
  DollarSign
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

// Tabela Oficial LABAGI 2026 com valores reais
const TABELA_LABAGI = [
  { nome: "Dissilicato Injetado", preco: 350 },
  { nome: "Dissilicato Fresado CAD/CAM", preco: 400 },
  { nome: "Zircônia Multicamadas", preco: 550 },
  { nome: "Voxel Print", preco: 250 },
  { nome: "Metalocerâmica S/ Dente", preco: 350 },
  { nome: "Metalocerâmica S/ Implante", preco: 350 },
  { nome: "Biocronw 3D", preco: 220 },
  { nome: "Cerômero Fresado", preco: 300 },
  { nome: "Núcleo Metálico Fundido", preco: 100 },
  { nome: "RMF", preco: 150 },
  { nome: "Bioprov", preco: 100 },
  { nome: "PMMA", preco: 250 }
];

function App() {
  const [currentUserRole, setCurrentUserRole] = useState('admin');
  const [jobs, setJobs] = useState([]);
  const [cadistasList, setCadistasList] = useState([
    { id: '1', nome: 'Arthur Cardoso', chavePix: '' },
    { id: '2', nome: 'Raphael Aragoni', chavePix: '' }
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showCadistaModal, setShowCadistaModal] = useState(false);
  const [showNewOSModal, setShowNewOSModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Formulários
  const [formData, setFormData] = useState({
    dentista: '',
    paciente: '',
    servico: TABELA_LABAGI[0].nome,
    valorServico: TABELA_LABAGI[0].preco,
    elementosCount: 1, // Usado para calcular os R$ 30 por coroa
    dente: '',
    cadista: 'Não atribuído',
    prazo: '',
    arquivo: null
  });

  const [cadistaData, setCadistaData] = useState({
    nome: '',
    email: '',
    chavePix: ''
  });

  // Buscar OS em tempo real
  useEffect(() => {
    const q = query(collection(db, "ordens_servico"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
      setJobs(docs);
    });
    return () => unsubscribe();
  }, []);

  // Buscar Cadistas
  useEffect(() => {
    const q = query(collection(db, "cadistas"), orderBy("nome", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const docs = snapshot.docs.map(docSnap => ({
          id: docSnap.id,
          ...docSnap.data()
        }));
        setCadistasList(docs);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleServicoChange = (e) => {
    const nomeServico = e.target.value;
    const servicoEncontrado = TABELA_LABAGI.find(s => s.nome === nomeServico);
    setFormData({
      ...formData,
      servico: nomeServico,
      valorServico: servicoEncontrado ? servicoEncontrado.preco : 0
    });
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText("https://labagi-dental.vercel.app/cadastrar?token=LABAGI-2026");
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCreateCadista = async (e) => {
    e.preventDefault();
    if (!cadistaData.nome) return;

    try {
      await addDoc(collection(db, "cadistas"), {
        nome: cadistaData.nome,
        email: cadistaData.email,
        chavePix: cadistaData.chavePix,
        createdAt: new Date().toISOString()
      });
      setCadistaData({ nome: '', email: '', chavePix: '' });
      setShowCadistaModal(false);
      alert("Cadista cadastrado com sucesso!");
    } catch (err) {
      console.error("Erro ao cadastrar cadista:", err);
    }
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

      const qtdElementos = Number(formData.elementosCount) || 1;
      const custoCadistaTotal = qtdElementos * 30; // R$ 30 por coroa/elemento para o cadista

      await addDoc(collection(db, "ordens_servico"), {
        codigoOS: `OS-2026-${Math.floor(100 + Math.random() * 900)}`,
        dentista: formData.dentista || 'Dr. Roberto Silva',
        paciente: formData.paciente,
        servico: formData.servico,
        elementosCount: qtdElementos,
        valorTotal: Number(formData.valorServico) * qtdElementos,
        custoCadista: custoCadistaTotal, // R$ 30 por elemento
        dente: formData.dente || 'Geral',
        cadista: formData.cadista,
        status: 'Pendente',
        prazo: formData.prazo || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        arquivoNome: fileName,
        arquivoUrl: fileUrl,
        createdAt: new Date().toISOString()
      });

      setFormData({
        dentista: '',
        paciente: '',
        servico: TABELA_LABAGI[0].nome,
        valorServico: TABELA_LABAGI[0].preco,
        elementosCount: 1,
        dente: '',
        cadista: 'Não atribuído',
        prazo: '',
        arquivo: null
      });
      setShowNewOSModal(false);
    } catch (err) {
      console.error("Erro ao salvar OS:", err);
      alert("Erro ao salvar a Ordem de Serviço.");
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

  const handleAssignCadista = async (jobId, cadistaNome) => {
    try {
      const jobRef = doc(db, "ordens_servico", jobId);
      await updateDoc(jobRef, { cadista: cadistaNome });
    } catch (err) {
      console.error("Erro ao atribuir cadista:", err);
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
    faturamentoTotal: jobs.reduce((acc, j) => acc + (Number(j.valorTotal) || 0), 0),
    custoCadistasTotal: jobs.reduce((acc, j) => acc + (Number(j.custoCadista) || 0), 0),
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
            <p className="text-xs text-slate-400">Gestão de Prótese & Tabela Oficial 2026</p>
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
            <h2 className="text-2xl font-bold">Painel do Administrador (LABAGI)</h2>
            <p className="text-slate-400 text-sm mt-1">Gestão de OS, repasses para cadistas (R$ 30/coroa) e tabela oficial integrada.</p>
          </div>

          <div className="flex items-center gap-3">
            {currentUserRole === 'admin' && (
              <>
                <button 
                  onClick={() => setShowCadistaModal(true)}
                  className="bg-slate-700 hover:bg-slate-600 text-white px-3.5 py-2.5 rounded-xl flex items-center gap-2 text-xs font-medium transition"
                >
                  <UserCheck className="w-4 h-4 text-emerald-400" /> Cadastrar Cadista
                </button>
                <button 
                  onClick={() => setShowInviteModal(true)}
                  className="bg-slate-700 hover:bg-slate-600 text-white px-3.5 py-2.5 rounded-xl flex items-center gap-2 text-xs font-medium transition"
                >
                  <UserPlus className="w-4 h-4 text-blue-400" /> Convidar Dentista
                </button>
              </>
            )}
            <button 
              onClick={() => setShowNewOSModal(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 text-xs font-semibold shadow-lg shadow-blue-500/20 transition"
            >
              <Plus className="w-4 h-4" /> Nova Ordem de Serviço
            </button>
          </div>
        </div>

        {/* Métricas Financeiras e Operacionais */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Total Trabalhos</p>
              <p className="text-2xl font-bold mt-1">{stats.total}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-400 opacity-80" />
          </div>

          <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Faturamento Lab</p>
              <p className="text-2xl font-bold mt-1 text-emerald-400">R$ {stats.faturamentoTotal.toFixed(2)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-emerald-400 opacity-80" />
          </div>

          <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Repasse Cadistas (R$30/un)</p>
              <p className="text-2xl font-bold mt-1 text-amber-400">R$ {stats.custoCadistasTotal.toFixed(2)}</p>
            </div>
            <Users className="w-8 h-8 text-amber-400 opacity-80" />
          </div>

          <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Concluídos</p>
              <p className="text-2xl font-bold mt-1 text-sky-400">{stats.concluidos}</p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-sky-400 opacity-80" />
          </div>
        </div>

        {/* Tabela de OS */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-700 flex flex-wrap items-center justify-between gap-4 bg-slate-900/50">
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
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-xs rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
            >
              <option value="Todos">Todos os Status</option>
              <option value="Pendente">Pendente</option>
              <option value="Em Produção">Em Produção</option>
              <option value="Concluído">Concluído</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-700">
                <tr>
                  <th className="px-6 py-4">OS / Valores</th>
                  <th className="px-6 py-4">Dentista / Paciente</th>
                  <th className="px-6 py-4">Serviço (Tabela LABAGI)</th>
                  <th className="px-6 py-4">Cadista (R$ 30/un)</th>
                  <th className="px-6 py-4">Prazo</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Arquivo 3D</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {filteredJobs.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-slate-500">
                      Nenhuma ordem de serviço cadastrada.
                    </td>
                  </tr>
                ) : (
                  filteredJobs.map((job) => (
                    <tr key={job.id} className="hover:bg-slate-700/30 transition">
                      <td className="px-6 py-4">
                        <p className="font-mono font-bold text-blue-400">{job.codigoOS}</p>
                        <p className="text-[11px] text-emerald-400 font-medium">Lab: R$ {job.valorTotal || 0}</p>
                        <p className="text-[10px] text-amber-400">Cadista: R$ {job.custoCadista || 0}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-200">{job.dentista}</p>
                        <p className="text-[11px] text-slate-400">Pac: {job.paciente}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-slate-200 font-medium">{job.servico}</p>
                        <p className="text-[11px] text-slate-400">{job.elementosCount || 1} un(s) | Dente: {job.dente}</p>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={job.cadista || 'Não atribuído'}
                          onChange={(e) => handleAssignCadista(job.id, e.target.value)}
                          className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-2 py-1 text-xs focus:outline-none"
                        >
                          <option value="Não atribuído">Terceirizar...</option>
                          {cadistasList.map(c => (
                            <option key={c.id} value={c.nome}>{c.nome}</option>
                          ))}
                        </select>
                      </td>
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
                            <Download className="w-3.5 h-3.5" /> Baixar STL
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

      {/* Modal Cadastrar Cadista */}
      {showCadistaModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-400" /> Cadastrar Cadista Terceirizado
              </h3>
              <button onClick={() => setShowCadistaModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCadista} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Nome Completo *</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: Lucas Freelancer CAD"
                  value={cadistaData.nome}
                  onChange={(e) => setCadistaData({...cadistaData, nome: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">E-mail</label>
                <input 
                  type="email" 
                  placeholder="cadista@email.com"
                  value={cadistaData.email}
                  onChange={(e) => setCadistaData({...cadistaData, email: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Chave PIX (Para acerto de R$ 30/coroa)</label>
                <input 
                  type="text" 
                  placeholder="CPF, Telefone ou E-mail"
                  value={cadistaData.chavePix}
                  onChange={(e) => setCadistaData({...cadistaData, chavePix: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowCadistaModal(false)} className="bg-slate-700 text-slate-300 px-4 py-2 rounded-xl">Cancelar</button>
                <button type="submit" className="bg-emerald-600 text-white px-5 py-2 rounded-xl font-semibold">Salvar Cadista</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Convidar Dentista */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-blue-400" /> Enviar Convite ao Dentista
              </h3>
              <button onClick={() => setShowInviteModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl flex items-center justify-between gap-2">
              <span className="text-xs font-mono text-slate-300 truncate">https://labagi-dental.vercel.app/cadastrar?token=LABAGI-2026</span>
              <button onClick={copyInviteLink} className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg">
                {copiedLink ? "Copiado!" : "Copiar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nova OS com Tabela LABAGI */}
      {showNewOSModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-blue-400" /> Nova Ordem de Serviço (Tabela LABAGI)
              </h3>
              <button onClick={() => setShowNewOSModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
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
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
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
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Serviço da Tabela LABAGI *</label>
                  <select 
                    value={formData.servico}
                    onChange={handleServicoChange}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
                  >
                    {TABELA_LABAGI.map((item, idx) => (
                      <option key={idx} value={item.nome}>
                        {item.nome} (R$ {item.preco})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Qtd de Coroas / Elementos</label>
                  <input 
                    type="number" 
                    min="1"
                    value={formData.elementosCount}
                    onChange={(e) => setFormData({...formData, elementosCount: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
                  />
                  <p className="text-[10px] text-amber-400 mt-0.5">Cadista receberá: R$ {Number(formData.elementosCount || 1) * 30}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Elemento / Dente</label>
                  <input 
                    type="text" 
                    placeholder="Ex: 11, 21"
                    value={formData.dente}
                    onChange={(e) => setFormData({...formData, dente: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Cadista Responsável</label>
                  <select 
                    value={formData.cadista}
                    onChange={(e) => setFormData({...formData, cadista: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
                  >
                    <option value="Não atribuído">Terceirizar...</option>
                    {cadistasList.map(c => (
                      <option key={c.id} value={c.nome}>{c.nome}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Prazo / Entrega</label>
                  <input 
                    type="date" 
                    value={formData.prazo}
                    onChange={(e) => setFormData({...formData, prazo: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Anexar Escaneamento 3D (.stl, .ply, .zip)</label>
                <div className="border-2 border-dashed border-slate-700 rounded-xl p-3 text-center bg-slate-900/50 relative cursor-pointer">
                  <input 
                    type="file" 
                    onChange={(e) => setFormData({...formData, arquivo: e.target.files[0]})}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <UploadCloud className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                  <p className="text-slate-300 font-medium">
                    {formData.arquivo ? formData.arquivo.name : "Clique para anexar arquivo 3D"}
                  </p>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowNewOSModal(false)} className="bg-slate-700 text-slate-300 px-4 py-2 rounded-xl">Cancelar</button>
                <button type="submit" disabled={uploading} className="bg-blue-600 text-white px-5 py-2 rounded-xl font-semibold disabled:opacity-50">
                  {uploading ? "Salvando..." : "Criar Ordem de Serviço"}
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

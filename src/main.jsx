import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
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
  LogOut,
  FolderZip
} from 'lucide-react';

// Dados simulados iniciais
const INITIAL_JOBS = [
  {
    id: "OS-2026-001",
    dentista: "Dr. Roberto Silva",
    paciente: "Ana Maria Souza",
    servico: "Coroa Cerâmica (Metal-Free)",
    dente: "11",
    cadista: "Arthur Cardoso",
    status: "Em Produção",
    prazo: "2026-11-14",
    arquivoEnviado: "escaneamento_sup_11.stl",
    tamanhoArquivo: "14.2 MB",
    dataCriacao: "2026-11-08"
  },
  {
    id: "OS-2026-002",
    dentista: "Dra. Katiane Bastos",
    paciente: "Carlos Eduardo",
    servico: "Protocolo Superior / Implante",
    dente: "Arcada Sup",
    cadista: "Pendente",
    status: "Pendente",
    prazo: "2026-11-18",
    arquivoEnviado: "moldagem_implante.ply",
    tamanhoArquivo: "38.5 MB",
    dataCriacao: "2026-11-10"
  },
  {
    id: "OS-2026-003",
    dentista: "Dr. Paulo Gazzotti",
    paciente: "Fernanda Lima",
    servico: "Placa Miorrelaxante (RG Shield)",
    dente: "Arcada Sup",
    cadista: "Arthur Cardoso",
    status: "Concluído",
    prazo: "2026-11-09",
    arquivoEnviado: "placa_modelada_final.stl",
    tamanhoArquivo: "8.7 MB",
    dataCriacao: "2026-11-05"
  }
];

function App() {
  const [currentUserRole, setCurrentUserRole] = useState('admin'); // 'admin', 'cadista', 'dentista'
  const [jobs, setJobs] = useState(INITIAL_JOBS);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [showNewJobModal, setShowNewJobModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Filtro de OS baseado no perfil logado
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          job.dentista.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          job.paciente.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'Todos' || job.status === filterStatus;

    if (currentUserRole === 'cadista') {
      return matchesSearch && matchesStatus && job.cadista.includes("Arthur");
    }
    if (currentUserRole === 'dentista') {
      return matchesSearch && matchesStatus && job.dentista.includes("Katiane");
    }
    return matchesSearch && matchesStatus;
  });

  const copyInviteLink = () => {
    navigator.clipboard.writeText("https://labagi-dental.vercel.app/cadastrar?convite=LABAGI-2026-DENTISTA");
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      {/* Topo / Barra de Navegação */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-500/30">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wide text-white">LABAGI</h1>
            <p className="text-xs text-slate-400">Sistema de Gestão & CAD Dentário</p>
          </div>
        </div>

        {/* Simulação de Alteração de Perfil */}
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

      {/* Conteúdo Principal */}
      <main className="max-w-7xl mx-auto p-6 space-y-6">
        
        {/* Banner de Boas-Vindas & Ações */}
        <div className="bg-gradient-to-r from-blue-950 to-slate-800 rounded-2xl p-6 border border-slate-700 flex flex-wrap items-center justify-between gap-4 shadow-xl">
          <div>
            <h2 className="text-2xl font-bold">
              {currentUserRole === 'admin' && "Painel do Administrador"}
              {currentUserRole === 'cadista' && "Painel do Cadista"}
              {currentUserRole === 'dentista' && "Área do Cliente (Dentista)"}
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              {currentUserRole === 'admin' && "Controle global de ordens de serviço, cadistas e envio de convites."}
              {currentUserRole === 'cadista' && "Gerencie seus projetos 3D e acompanhe os prazos de entrega."}
              {currentUserRole === 'dentista' && "Envie novos escaneamentos e baixe os projetos finalizados."}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {currentUserRole === 'admin' && (
              <button 
                onClick={() => setShowInviteModal(true)}
                className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-medium transition"
              >
                <UserPlus className="w-4 h-4" /> Convidadar Dentista
              </button>
            )}

            {(currentUserRole === 'admin' || currentUserRole === 'dentista') && (
              <button 
                onClick={() => setShowNewJobModal(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-semibold shadow-lg shadow-blue-600/30 transition"
              >
                <Plus className="w-4 h-4" /> Nova Ordem de Serviço
              </button>
            )}
          </div>
        </div>

        {/* Módulos de Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
            <p className="text-slate-400 text-xs font-medium">Total de Trabalhos</p>
            <p className="text-2xl font-bold text-white mt-1">{filteredJobs.length}</p>
          </div>
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
            <p className="text-slate-400 text-xs font-medium">Em Produção / Design</p>
            <p className="text-2xl font-bold text-blue-400 mt-1">
              {filteredJobs.filter(j => j.status === 'Em Produção').length}
            </p>
          </div>
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
            <p className="text-slate-400 text-xs font-medium">Pendentes de Atribuição</p>
            <p className="text-2xl font-bold text-amber-400 mt-1">
              {filteredJobs.filter(j => j.status === 'Pendente').length}
            </p>
          </div>
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
            <p className="text-slate-400 text-xs font-medium">Concluídos</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">
              {filteredJobs.filter(j => j.status === 'Concluído').length}
            </p>
          </div>
        </div>

        {/* Tabela de Ordens de Serviço */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-700 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 bg-slate-900 px-3 py-2 rounded-xl border border-slate-700 w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Buscar por OS, dentista ou paciente..."
                className="bg-transparent text-xs text-white focus:outline-none w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select 
                className="bg-slate-900 border border-slate-700 text-xs text-white rounded-xl px-3 py-2 focus:outline-none"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="Todos">Todos os Status</option>
                <option value="Pendente">Pendente</option>
                <option value="Em Produção">Em Produção</option>
                <option value="Concluído">Concluído</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/50 text-xs text-slate-400 uppercase border-b border-slate-700">
                <tr>
                  <th className="px-6 py-4">Código OS</th>
                  <th className="px-6 py-4">Dentista / Paciente</th>
                  <th className="px-6 py-4">Serviço / Elemento</th>
                  <th className="px-6 py-4">Cadista Responsável</th>
                  <th className="px-6 py-4">Prazo</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Arquivos 3D</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {filteredJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-700/30 transition">
                    <td className="px-6 py-4 font-mono font-semibold text-blue-400">{job.id}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{job.dentista}</div>
                      <div className="text-xs text-slate-400">Pac: {job.paciente}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div>{job.servico}</div>
                      <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded">Dente/Região: {job.dente}</span>
                    </td>
                    <td className="px-6 py-4">
                      {job.cadista === "Pendente" ? (
                        <span className="text-xs text-amber-400 font-medium">Aguardando Cadista</span>
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs text-slate-200">
                          <Users className="w-3.5 h-3.5 text-slate-400" /> {job.cadista}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs font-mono">{job.prazo}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        job.status === 'Concluído' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        job.status === 'Em Produção' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                        'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="bg-slate-700 hover:bg-slate-600 text-xs px-3 py-1.5 rounded-lg text-slate-200 flex items-center gap-1.5 ml-auto transition">
                        <Download className="w-3.5 h-3.5" /> {job.arquivoEnviado}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal de Gerar Convite para Dentista */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-blue-400" /> Enviar Convite ao Dentista
            </h3>
            <p className="text-xs text-slate-400">
              Copie o link seguro abaixo e envie diretamente para o dentista pelo WhatsApp. Ele poderá se cadastrar e se vincular ao seu laboratório.
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

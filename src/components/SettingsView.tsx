import React, { useState } from "react";
import { Settings, User, RefreshCw, Monitor, Moon, Sun, Shield } from "lucide-react";
import { MemberProfile } from "../types";

interface SettingsViewProps {
  members: MemberProfile[];
  idleTimeoutMinutes: number;
  onChangeIdleTimeout: (mins: number) => void;
  onResetFactoryData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  members,
  idleTimeoutMinutes,
  onChangeIdleTimeout,
  onResetFactoryData,
}) => {
  const [highContrast, setHighContrast] = useState(true);

  const handleReset = () => {
    if (
      window.confirm(
        "Tem certeza que deseja restaurar os dados do ALLDAY Home para o estado inicial da família?"
      )
    ) {
      onResetFactoryData();
      alert("✅ Dados do ALLDAY Home restaurados com sucesso!");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-slate-800 text-slate-300 rounded-xl">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Configurações do Painel</h2>
            <p className="text-xs text-slate-400">
              Ajustes de exibição do computador da cozinha (LG All-In-One), perfis e dados
            </p>
          </div>
        </div>
      </div>

      {/* Family Profiles Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-lg space-y-4">
        <h3 className="font-bold text-white text-base flex items-center gap-2">
          <User className="w-4 h-4 text-amber-400" />
          <span>Membros da Família</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {members.map((m) => (
            <div
              key={m.id}
              className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex items-center gap-3"
            >
              <div
                className={`w-10 h-10 rounded-xl font-bold flex items-center justify-center text-sm ${m.avatarColor}`}
              >
                {m.initials}
              </div>
              <div>
                <p className="text-sm font-bold text-white">{m.name}</p>
                <p className="text-xs text-slate-400">{m.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Kitchen Display & Kiosk Timeout */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-lg space-y-4">
        <h3 className="font-bold text-white text-base flex items-center gap-2">
          <Monitor className="w-4 h-4 text-amber-400" />
          <span>Modo Kiosk & Porta-Retrato de Cozinha</span>
        </h3>

        <div className="space-y-4 text-sm">
          <div className="flex items-center justify-between p-3.5 bg-slate-950 border border-slate-800 rounded-2xl">
            <div>
              <p className="font-semibold text-white">
                Tempo de Inatividade para Entrar no Porta-Retrato
              </p>
              <p className="text-xs text-slate-400">
                Ativa automaticamente o slideshow quando a tela não for tocada
              </p>
            </div>

            <select
              value={idleTimeoutMinutes}
              onChange={(e) => onChangeIdleTimeout(Number(e.target.value))}
              className="bg-slate-900 border border-slate-800 text-xs font-bold text-amber-300 px-3 py-2 rounded-xl outline-none cursor-pointer"
            >
              <option value={1}>1 Minuto</option>
              <option value={2}>2 Minutos</option>
              <option value={5}>5 Minutos</option>
              <option value={10}>10 Minutos</option>
              <option value={0}>Nunca (Desativar)</option>
            </select>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-slate-950 border border-slate-800 rounded-2xl">
            <div>
              <p className="font-semibold text-white">Alta Legibilidade para Cozinha (2-3 metros)</p>
              <p className="text-xs text-slate-400">
                Aumenta o contraste visual e tipografia para facilitar a leitura distante
              </p>
            </div>

            <input
              type="checkbox"
              checked={highContrast}
              onChange={(e) => setHighContrast(e.target.checked)}
              className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-slate-900 border border-red-500/30 rounded-3xl p-6 shadow-lg space-y-3">
        <h3 className="font-bold text-red-400 text-base flex items-center gap-2">
          <Shield className="w-4 h-4" />
          <span>Dados e Restauração</span>
        </h3>

        <p className="text-xs text-slate-400">
          Você pode restaurar todos os compromissos, tarefas e listas para os dados de exemplo da família do Thiago a qualquer momento.
        </p>

        <button
          onClick={handleReset}
          className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Restaurar Dados Iniciais da Família</span>
        </button>
      </div>
    </div>
  );
};

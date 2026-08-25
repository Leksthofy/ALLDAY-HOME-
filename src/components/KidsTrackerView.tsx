import React, { useState } from "react";
import { HeartHandshake, Plus, Trash2, ShieldCheck, Stethoscope, Ruler, Pill, X } from "lucide-react";
import { ChildLogRecord } from "../types";

interface KidsTrackerViewProps {
  logs: ChildLogRecord[];
  onAddLog: (log: Omit<ChildLogRecord, "id">) => void;
  onDeleteLog: (id: string) => void;
}

export const KidsTrackerView: React.FC<KidsTrackerViewProps> = ({
  logs,
  onAddLog,
  onDeleteLog,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form
  const [type, setType] = useState<"Vacina" | "Consulta" | "Crescimento" | "Remédio">("Vacina");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [value, setValue] = useState("");
  const [notes, setNotes] = useState("");

  const getTypeIcon = (t: string) => {
    if (t === "Vacina") return <ShieldCheck className="w-5 h-5 text-emerald-400" />;
    if (t === "Consulta") return <Stethoscope className="w-5 h-5 text-purple-400" />;
    if (t === "Crescimento") return <Ruler className="w-5 h-5 text-amber-400" />;
    return <Pill className="w-5 h-5 text-rose-400" />;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddLog({
      type,
      title,
      date,
      value: value.trim() || undefined,
      notes: notes.trim() || undefined,
    });

    setTitle("");
    setValue("");
    setNotes("");
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <HeartHandshake className="w-4 h-4" />
            <span>Acompanhamento Infantil</span>
          </div>
          <h2 className="text-xl font-bold text-white">Diário da Zoe (Saúde & Crescimento)</h2>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md shadow-amber-500/20 cursor-pointer transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Evento da Zoe</span>
        </button>
      </div>

      {/* Log Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {logs.map((log) => (
          <div
            key={log.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-start justify-between gap-3 shadow-md hover:border-slate-700 transition-all group"
          >
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl">
                {getTypeIcon(log.type)}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                    {log.type}
                  </span>
                  <span className="text-xs text-slate-400">{log.date}</span>
                </div>

                <h3 className="font-semibold text-slate-100 text-base">{log.title}</h3>

                {log.value && (
                  <p className="text-xs font-mono font-bold text-amber-300 mt-1">
                    {log.value}
                  </p>
                )}

                {log.notes && (
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {log.notes}
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() => onDeleteLog(log.id)}
              className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800 transition-all cursor-pointer opacity-0 group-hover:opacity-100"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Add Log Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl p-6 text-slate-100 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-4">
              Novo Registro no Diário da Zoe
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Tipo de Registro
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-amber-500"
                  >
                    <option value="Vacina">Vacina</option>
                    <option value="Consulta">Consulta Pediatra</option>
                    <option value="Crescimento">Medição (Peso/Altura)</option>
                    <option value="Remédio">Remédio / Vitamina</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Data *
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Título do Evento *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Consulta 2 Anos Dra. Mariana / Reforço Vacina"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Valor / Dose / Medida (Opcional)
                </label>
                <input
                  type="text"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="Ex: 86 cm / 12.4 kg ou 3 gotas ao dia"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Observações & Anotações
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Não teve febre. Próxima dose daqui 6 meses."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs cursor-pointer shadow-md shadow-amber-500/20"
                >
                  Salvar Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

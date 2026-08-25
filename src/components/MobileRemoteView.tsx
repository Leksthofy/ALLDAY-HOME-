import React, { useState, useEffect } from "react";
import {
  Smartphone,
  LayoutDashboard,
  Calendar,
  ShoppingBag,
  CheckSquare,
  Repeat,
  Utensils,
  Image as ImageIcon,
  DollarSign,
  HeartHandshake,
  Bot,
  Sparkles,
  Mic,
  MicOff,
  Send,
  Radio,
  Tv,
  SkipForward,
  Plus,
  Trash2,
  CheckCircle2,
  ArrowLeft,
  Volume2,
  MessageSquare,
  Clock,
  User,
  ExternalLink,
  ChevronRight,
  AlertCircle
} from "lucide-react";
import {
  ActiveTab,
  FamilyMember,
  ShoppingItem,
  CalendarEvent,
  TaskItem,
  ChildLogRecord
} from "../types";
import { remoteClient, ConnectionStatus } from "../lib/remoteClient";
import { Storage } from "../lib/storage";

interface MobileRemoteViewProps {
  onExitRemoteMode?: () => void;
  activeScreenTab: ActiveTab;
  onScreenTabChange: (tab: ActiveTab) => void;
  isScreenSaverActive: boolean;
  onToggleScreenSaver: () => void;
  shopping: ShoppingItem[];
  onAddShoppingItem: (item: Omit<ShoppingItem, "id">) => void;
  onToggleShoppingItem: (id: string) => void;
  events: CalendarEvent[];
  onAddCalendarEvent: (event: Omit<CalendarEvent, "id">) => void;
  tasks: TaskItem[];
  onAddTaskItem: (task: Omit<TaskItem, "id">) => void;
  onToggleTaskItem: (id: string) => void;
  childLogs: ChildLogRecord[];
  onAddChildLog: (log: Omit<ChildLogRecord, "id">) => void;
  onTriggerAiAction?: (intent: string, data: any) => void;
}

type RemoteTab = "control" | "shopping" | "calendar" | "tasks" | "zoe" | "ai" | "announcements";

export function MobileRemoteView({
  onExitRemoteMode,
  activeScreenTab,
  onScreenTabChange,
  isScreenSaverActive,
  onToggleScreenSaver,
  shopping,
  onAddShoppingItem,
  onToggleShoppingItem,
  events,
  onAddCalendarEvent,
  tasks,
  onAddTaskItem,
  onToggleTaskItem,
  childLogs,
  onAddChildLog,
  onTriggerAiAction,
}: MobileRemoteViewProps) {
  const [currentRemoteTab, setCurrentRemoteTab] = useState<RemoteTab>("control");
  const [selectedSender, setSelectedSender] = useState<FamilyMember>("Thiago");
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("connecting");
  const [connectedDevicesCount, setConnectedDevicesCount] = useState<number>(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form states for quick adds
  const [newShoppingName, setNewShoppingName] = useState("");
  const [newShoppingCategory, setNewShoppingCategory] = useState<ShoppingItem["category"]>("Supermercado");

  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDate, setNewEventDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [newEventTime, setNewEventTime] = useState("10:00");
  const [newEventMember, setNewEventMember] = useState<FamilyMember>("Família");

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskAssignee, setNewTaskAssignee] = useState<FamilyMember>("Thiago");
  const [newTaskPriority, setNewTaskPriority] = useState<TaskItem["priority"]>("medium");

  const [newZoeTitle, setNewZoeTitle] = useState("");
  const [newZoeType, setNewZoeType] = useState<ChildLogRecord["type"]>("Consulta");
  const [newZoeNotes, setNewZoeNotes] = useState("");

  const [customAnnouncement, setCustomAnnouncement] = useState("");

  // AI Voice / Text processing
  const [aiInputText, setAiInputText] = useState("");
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [aiResultSummary, setAiResultSummary] = useState<string | null>(null);

  useEffect(() => {
    remoteClient.init("mobile", selectedSender);
    const unsub = remoteClient.onStatusChange((status, count) => {
      setConnectionStatus(status);
      setConnectedDevicesCount(count);
    });

    return () => unsub();
  }, [selectedSender]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Switch Screen Tab
  const handleSelectScreenTab = async (tab: ActiveTab) => {
    onScreenTabChange(tab);
    await remoteClient.sendCommand("NAVIGATE_TAB", { tab }, selectedSender);
    showToast(`Tela mudada para: ${getTabLabel(tab)}`);
  };

  // Toggle Screen Saver
  const handleToggleScreenSaverRemote = async () => {
    onToggleScreenSaver();
    await remoteClient.sendCommand("TOGGLE_SCREENSAVER", {}, selectedSender);
    showToast(isScreenSaverActive ? "Porta-Retrato desativado" : "Porta-Retrato ativado na tela");
  };

  // Next Photo
  const handleNextPhoto = async () => {
    await remoteClient.sendCommand("NEXT_PHOTO", {}, selectedSender);
    showToast("Próxima foto solicitada na tela");
  };

  // Add Shopping
  const handleAddShoppingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShoppingName.trim()) return;

    const item = {
      name: newShoppingName.trim(),
      category: newShoppingCategory,
      completed: false,
      addedBy: selectedSender,
    };

    onAddShoppingItem(item);
    await remoteClient.sendCommand("ADD_SHOPPING", { item }, selectedSender);
    setNewShoppingName("");
    showToast(`🛒 Item adicionado: ${item.name}`);
  };

  // Add Calendar
  const handleAddCalendarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;

    const event = {
      title: newEventTitle.trim(),
      date: newEventDate,
      time: newEventTime,
      member: newEventMember,
      category: "Pessoal" as const,
      googleSynced: true,
    };

    onAddCalendarEvent(event);
    await remoteClient.sendCommand("ADD_EVENT", { event }, selectedSender);
    setNewEventTitle("");
    showToast(`📅 Evento adicionado: ${event.title}`);
  };

  // Add Task
  const handleAddTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const task = {
      title: newTaskTitle.trim(),
      assignee: newTaskAssignee,
      dueDate: new Date().toISOString().split("T")[0],
      completed: false,
      priority: newTaskPriority,
      category: "Geral" as const,
    };

    onAddTaskItem(task);
    await remoteClient.sendCommand("ADD_TASK", { task }, selectedSender);
    setNewTaskTitle("");
    showToast(`✅ Tarefa criada: ${task.title}`);
  };

  // Add Zoe Log
  const handleAddZoeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newZoeTitle.trim()) return;

    const log = {
      title: newZoeTitle.trim(),
      type: newZoeType,
      date: new Date().toISOString().split("T")[0],
      notes: newZoeNotes.trim(),
    };

    onAddChildLog(log);
    await remoteClient.sendCommand("ADD_ZOE_LOG", { log }, selectedSender);
    setNewZoeTitle("");
    setNewZoeNotes("");
    showToast(`👶 Registro da Zoe adicionado!`);
  };

  // Send Announcement
  const handleSendAnnouncement = async (msgToSend?: string) => {
    const text = msgToSend || customAnnouncement;
    if (!text.trim()) return;

    await remoteClient.sendAnnouncement(text.trim(), "alert", selectedSender);
    setCustomAnnouncement("");
    showToast(`📢 Recado enviado para o monitor da cozinha!`);
  };

  // AI Voice / Text Submit
  const handleProcessAiText = async (textToProcess?: string) => {
    const query = textToProcess || aiInputText;
    if (!query.trim()) return;

    setIsAiProcessing(true);
    setAiResultSummary(null);

    try {
      const res = await fetch("/api/ai/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: query }),
      });

      if (!res.ok) throw new Error("Erro na resposta da IA");

      const data = await res.json();
      setAiResultSummary(data.summary || "Ação processada com sucesso!");

      if (data.intent && data.data) {
        if (onTriggerAiAction) {
          onTriggerAiAction(data.intent, data.data);
        }
        await remoteClient.sendCommand(
          "TRIGGER_AI_PARSE",
          { intent: data.intent, data: data.data, summary: data.summary },
          selectedSender
        );
      }

      setAiInputText("");
      showToast(`✨ IA: ${data.summary || "Comando executado!"}`);
    } catch (e: any) {
      console.error(e);
      setAiResultSummary("Não foi possível processar o comando. Tente novamente.");
    } finally {
      setIsAiProcessing(false);
    }
  };

  // Web Speech API for voice recognition on mobile
  const handleToggleVoiceRecognition = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Reconhecimento de voz não suportado neste navegador. Use a caixa de texto abaixo!");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = "pt-BR";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setAiInputText(transcript);
        setIsListening(false);
        handleProcessAiText(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      console.error("Erro no reconhecimento de voz:", e);
      setIsListening(false);
    }
  };

  const getTabLabel = (tab: ActiveTab) => {
    const map: Record<ActiveTab, string> = {
      dashboard: "Início",
      calendar: "Agenda",
      shopping: "Compras",
      tasks: "Tarefas",
      routines: "Rotinas",
      meals: "Cardápio",
      photos: "Fotos",
      finances: "Finanças",
      zoe: "Diário Zoe",
      alexa: "Voz & Alexa",
      settings: "Ajustes",
    };
    return map[tab] || tab;
  };

  const navButtons: Array<{ tab: ActiveTab; label: string; icon: React.ReactNode; color: string }> = [
    { tab: "dashboard", label: "Início", icon: <LayoutDashboard className="w-5 h-5" />, color: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
    { tab: "shopping", label: "Compras", icon: <ShoppingBag className="w-5 h-5" />, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
    { tab: "calendar", label: "Agenda", icon: <Calendar className="w-5 h-5" />, color: "text-blue-400 bg-blue-500/10 border-blue-500/30" },
    { tab: "tasks", label: "Tarefas", icon: <CheckSquare className="w-5 h-5" />, color: "text-rose-400 bg-rose-500/10 border-rose-500/30" },
    { tab: "routines", label: "Rotinas", icon: <Repeat className="w-5 h-5" />, color: "text-purple-400 bg-purple-500/10 border-purple-500/30" },
    { tab: "meals", label: "Cardápio", icon: <Utensils className="w-5 h-5" />, color: "text-orange-400 bg-orange-500/10 border-orange-500/30" },
    { tab: "photos", label: "Fotos", icon: <ImageIcon className="w-5 h-5" />, color: "text-pink-400 bg-pink-500/10 border-pink-500/30" },
    { tab: "finances", label: "Finanças", icon: <DollarSign className="w-5 h-5" />, color: "text-teal-400 bg-teal-500/10 border-teal-500/30" },
    { tab: "zoe", label: "Diário Zoe", icon: <HeartHandshake className="w-5 h-5" />, color: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
    { tab: "alexa", label: "Voz & Alexa", icon: <Bot className="w-5 h-5" />, color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/30" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans max-w-md mx-auto shadow-2xl border-x border-slate-800">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-amber-500 text-slate-950 font-bold px-4 py-2 rounded-2xl shadow-xl text-xs flex items-center gap-2 animate-in slide-in-from-top-4">
          <Sparkles className="w-4 h-4" />
          {toastMessage}
        </div>
      )}

      {/* Top Mobile Bar */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/20">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                ALLDAY Remote
                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Conectado à TV
                </span>
              </h1>
              <p className="text-[11px] text-slate-400">
                Controle o monitor da cozinha pelo smartphone
              </p>
            </div>
          </div>

          {onExitRemoteMode && (
            <button
              onClick={onExitRemoteMode}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 transition-colors"
              title="Voltar ao modo painel completo"
            >
              <Tv className="w-4 h-4 text-amber-400" />
              Painel
            </button>
          )}
        </div>

        {/* Sender Profile Switcher */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <User className="w-3.5 h-3.5" /> Quem está usando:
          </span>
          <div className="flex items-center gap-1.5">
            {(["Thiago", "Erika", "Família"] as FamilyMember[]).map((member) => (
              <button
                key={member}
                onClick={() => setSelectedSender(member)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  selectedSender === member
                    ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
                    : "bg-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                {member}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Screen Active Status Banner */}
      <div className="bg-slate-900/60 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>Aba atual no monitor:</span>
          <strong className="text-amber-400 font-bold">{getTabLabel(activeScreenTab)}</strong>
        </div>
        {isScreenSaverActive && (
          <span className="text-[11px] text-pink-400 font-semibold px-2 py-0.5 bg-pink-500/10 rounded-full border border-pink-500/20">
            🖼️ Porta-Retrato Ativo
          </span>
        )}
      </div>

      {/* Mobile Remote Sub-Tabs */}
      <div className="flex items-center gap-1.5 p-2 bg-slate-900 border-b border-slate-800 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setCurrentRemoteTab("control")}
          className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
            currentRemoteTab === "control"
              ? "bg-amber-500 text-slate-950 shadow-md"
              : "bg-slate-800/60 text-slate-300 hover:bg-slate-800"
          }`}
        >
          <Tv className="w-3.5 h-3.5" />
          Controle da Tela
        </button>

        <button
          onClick={() => setCurrentRemoteTab("ai")}
          className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
            currentRemoteTab === "ai"
              ? "bg-amber-500 text-slate-950 shadow-md"
              : "bg-slate-800/60 text-slate-300 hover:bg-slate-800"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          IA & Voz
        </button>

        <button
          onClick={() => setCurrentRemoteTab("shopping")}
          className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
            currentRemoteTab === "shopping"
              ? "bg-amber-500 text-slate-950 shadow-md"
              : "bg-slate-800/60 text-slate-300 hover:bg-slate-800"
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          + Compras
        </button>

        <button
          onClick={() => setCurrentRemoteTab("calendar")}
          className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
            currentRemoteTab === "calendar"
              ? "bg-amber-500 text-slate-950 shadow-md"
              : "bg-slate-800/60 text-slate-300 hover:bg-slate-800"
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          + Agenda
        </button>

        <button
          onClick={() => setCurrentRemoteTab("tasks")}
          className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
            currentRemoteTab === "tasks"
              ? "bg-amber-500 text-slate-950 shadow-md"
              : "bg-slate-800/60 text-slate-300 hover:bg-slate-800"
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5" />
          + Tarefas
        </button>

        <button
          onClick={() => setCurrentRemoteTab("zoe")}
          className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
            currentRemoteTab === "zoe"
              ? "bg-amber-500 text-slate-950 shadow-md"
              : "bg-slate-800/60 text-slate-300 hover:bg-slate-800"
          }`}
        >
          <HeartHandshake className="w-3.5 h-3.5" />
          + Zoe
        </button>

        <button
          onClick={() => setCurrentRemoteTab("announcements")}
          className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
            currentRemoteTab === "announcements"
              ? "bg-amber-500 text-slate-950 shadow-md"
              : "bg-slate-800/60 text-slate-300 hover:bg-slate-800"
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Recados
        </button>
      </div>

      {/* Main Remote Content Body */}
      <main className="flex-1 p-4 overflow-y-auto space-y-5 pb-24">
        {/* ============================================================ */}
        {/* TAB 1: SCREEN CONTROLLER & D-PAD                             */}
        {/* ============================================================ */}
        {currentRemoteTab === "control" && (
          <div className="space-y-5">
            {/* Quick TV Actions */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Tv className="w-4 h-4 text-amber-400" />
                Ações Rápidas no Monitor
              </h2>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={handleToggleScreenSaverRemote}
                  className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-bold transition-all ${
                    isScreenSaverActive
                      ? "bg-pink-500/20 border-pink-500 text-pink-300"
                      : "bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-200"
                  }`}
                >
                  <ImageIcon className="w-4 h-4 text-pink-400" />
                  {isScreenSaverActive ? "Sair do Porta-Retrato" : "Ligar Porta-Retrato"}
                </button>

                <button
                  onClick={handleNextPhoto}
                  className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-200 flex items-center gap-2 text-xs font-bold transition-all"
                >
                  <SkipForward className="w-4 h-4 text-cyan-400" />
                  Próxima Foto
                </button>
              </div>
            </div>

            {/* Change Screen Tab (Large Grid) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Trocar Aba na Tela da Cozinha
                </h2>
                <span className="text-[11px] text-slate-500">Toque para mudar</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {navButtons.map((btn) => {
                  const isActive = activeScreenTab === btn.tab;
                  return (
                    <button
                      key={btn.tab}
                      onClick={() => handleSelectScreenTab(btn.tab)}
                      className={`p-4 rounded-2xl border flex flex-col items-start gap-2.5 text-left transition-all active:scale-95 ${
                        isActive
                          ? "bg-amber-500/15 border-amber-500 text-amber-300 ring-2 ring-amber-500/30 shadow-lg shadow-amber-500/10"
                          : "bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-200"
                      }`}
                    >
                      <div className={`p-2.5 rounded-xl border ${btn.color}`}>
                        {btn.icon}
                      </div>
                      <div>
                        <span className="font-bold text-sm block text-slate-100">
                          {btn.label}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {isActive ? "🟢 Exibindo agora" : "Mudar tela"}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: AI GEMINI VOICE & NATURAL LANGUAGE COMMANDS           */}
        {/* ============================================================ */}
        {currentRemoteTab === "ai" && (
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/30 rounded-2xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-100">
                    Comando de Voz & IA Gemini
                  </h3>
                  <p className="text-xs text-slate-400">
                    Fale ou digite o que precisa e o monitor da cozinha é atualizado
                  </p>
                </div>
              </div>

              {/* Big Voice Button */}
              <div className="flex flex-col items-center justify-center py-4">
                <button
                  onClick={handleToggleVoiceRecognition}
                  disabled={isAiProcessing}
                  className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-xl active:scale-95 ${
                    isListening
                      ? "bg-rose-500 text-white animate-pulse shadow-rose-500/50 scale-110"
                      : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/40"
                  }`}
                >
                  {isListening ? (
                    <Mic className="w-8 h-8 animate-bounce" />
                  ) : (
                    <Mic className="w-8 h-8" />
                  )}
                </button>
                <span className="text-xs font-semibold text-slate-300 mt-3">
                  {isListening ? "Ouvindo... Fale agora!" : "Toque no microfone para falar"}
                </span>
              </div>

              {/* Text Input Alternative */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ex: Adicionar ovos e marcar almoço sábado..."
                  value={aiInputText}
                  onChange={(e) => setAiInputText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleProcessAiText()}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={() => handleProcessAiText()}
                  disabled={isAiProcessing || !aiInputText.trim()}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  {isAiProcessing ? "Processando..." : <Send className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Result box */}
              {aiResultSummary && (
                <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                  <div>
                    <strong className="block text-emerald-200">Resultado executado:</strong>
                    <span>{aiResultSummary}</span>
                  </div>
                </div>
              )}

              {/* Quick AI Chips */}
              <div className="space-y-1.5 pt-2">
                <span className="text-[11px] text-slate-400 font-medium">Sugestões rápidas:</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "Adicionar leite, pão e café nas compras",
                    "Dentista da Erika quinta-feira às 14:00",
                    "Lembrar de trocar lâmpada da cozinha",
                    "Colocar Lasanha no jantar de sábado",
                  ].map((phrase) => (
                    <button
                      key={phrase}
                      onClick={() => {
                        setAiInputText(phrase);
                        handleProcessAiText(phrase);
                      }}
                      className="text-[11px] px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-left transition-colors"
                    >
                      "{phrase}"
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: SHOPPING LIST QUICK ADD & VIEW                        */}
        {/* ============================================================ */}
        {currentRemoteTab === "shopping" && (
          <div className="space-y-5">
            {/* Quick Add Form */}
            <form onSubmit={handleAddShoppingSubmit} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Plus className="w-4 h-4" />
                Adicionar Item nas Compras
              </h3>

              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Nome do item (ex: Queijo mussarela 500g)"
                  value={newShoppingName}
                  onChange={(e) => setNewShoppingName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />

                <div className="flex gap-2">
                  <select
                    value={newShoppingCategory}
                    onChange={(e: any) => setNewShoppingCategory(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="Supermercado">Supermercado</option>
                    <option value="Feira">Feira / Hortifrúti</option>
                    <option value="Farmácia">Farmácia</option>
                    <option value="Casa">Casa / Limpeza</option>
                    <option value="Outros">Outros</option>
                  </select>

                  <button
                    type="submit"
                    disabled={!newShoppingName.trim()}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors shrink-0"
                  >
                    + Adicionar
                  </button>
                </div>
              </div>
            </form>

            {/* Current Shopping Items (Live from phone) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold">Itens na Lista ({shopping.filter((s) => !s.completed).length} pendentes):</span>
                <span className="text-[11px]">Sincronizado com a tela</span>
              </div>

              <div className="space-y-1.5 max-h-80 overflow-y-auto">
                {shopping.length === 0 ? (
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-center text-xs text-slate-500">
                    Nenhum item na lista de compras.
                  </div>
                ) : (
                  shopping.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => onToggleShoppingItem(item.id)}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs transition-all cursor-pointer ${
                        item.completed
                          ? "bg-slate-900/40 border-slate-800/60 text-slate-500 line-through"
                          : "bg-slate-900 border-slate-800 text-slate-200 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                            item.completed
                              ? "bg-emerald-500 border-emerald-500 text-slate-950"
                              : "border-slate-600"
                          }`}
                        >
                          {item.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </div>
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                        {item.category}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 4: CALENDAR QUICK ADD                                    */}
        {/* ============================================================ */}
        {currentRemoteTab === "calendar" && (
          <div className="space-y-5">
            <form onSubmit={handleAddCalendarSubmit} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                <Plus className="w-4 h-4" />
                Novo Compromisso na Agenda
              </h3>

              <div className="space-y-2.5">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Título do Evento</label>
                  <input
                    type="text"
                    placeholder="Ex: Consulta Pediátrica da Zoe"
                    value={newEventTitle}
                    onChange={(e) => setNewEventTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Data</label>
                    <input
                      type="date"
                      value={newEventDate}
                      onChange={(e) => setNewEventDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Horário</label>
                    <input
                      type="time"
                      value={newEventTime}
                      onChange={(e) => setNewEventTime(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Para quem é?</label>
                  <select
                    value={newEventMember}
                    onChange={(e: any) => setNewEventMember(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="Família">Família (Todos)</option>
                    <option value="Thiago">Thiago</option>
                    <option value="Erika">Erika</option>
                    <option value="Zoe">Zoe</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={!newEventTitle.trim()}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  Adicionar ao Calendário
                </button>
              </div>
            </form>

            {/* Upcoming Events Preview */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400 block">
                Próximos compromissos na tela:
              </span>
              <div className="space-y-1.5 max-h-60 overflow-y-auto">
                {events.slice(0, 5).map((evt) => (
                  <div key={evt.id} className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-slate-200 block">{evt.title}</span>
                      <span className="text-[11px] text-slate-400">
                        {evt.date} às {evt.time || "o dia todo"} • {evt.member}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 5: TASKS QUICK ADD                                       */}
        {/* ============================================================ */}
        {currentRemoteTab === "tasks" && (
          <div className="space-y-5">
            <form onSubmit={handleAddTaskSubmit} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                <Plus className="w-4 h-4" />
                Nova Tarefa Rápida
              </h3>

              <div className="space-y-2.5">
                <input
                  type="text"
                  placeholder="Ex: Trocar o refil do filtro de água"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Responsável</label>
                    <select
                      value={newTaskAssignee}
                      onChange={(e: any) => setNewTaskAssignee(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                    >
                      <option value="Thiago">Thiago</option>
                      <option value="Erika">Erika</option>
                      <option value="Família">Família</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Prioridade</label>
                    <select
                      value={newTaskPriority}
                      onChange={(e: any) => setNewTaskPriority(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                    >
                      <option value="low">Baixa</option>
                      <option value="medium">Média</option>
                      <option value="high">Alta</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!newTaskTitle.trim()}
                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  Salvar Tarefa
                </button>
              </div>
            </form>

            {/* Tasks list */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400 block">
                Tarefas pendentes ({tasks.filter((t) => !t.completed).length}):
              </span>
              <div className="space-y-1.5 max-h-60 overflow-y-auto">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => onToggleTaskItem(task.id)}
                    className={`p-3 rounded-xl border flex items-center justify-between text-xs cursor-pointer ${
                      task.completed
                        ? "bg-slate-900/40 border-slate-800 text-slate-500 line-through"
                        : "bg-slate-900 border-slate-800 text-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center ${
                          task.completed ? "bg-rose-500 border-rose-500 text-white" : "border-slate-600"
                        }`}
                      >
                        {task.completed && <CheckCircle2 className="w-3 h-3" />}
                      </div>
                      <span>{task.title}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 bg-slate-800 text-slate-400 rounded">
                      {task.assignee}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 6: ZOE DIARY QUICK ADD                                   */}
        {/* ============================================================ */}
        {currentRemoteTab === "zoe" && (
          <div className="space-y-5">
            <form onSubmit={handleAddZoeSubmit} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <HeartHandshake className="w-4 h-4" />
                Registrar no Diário da Zoe
              </h3>

              <div className="space-y-2.5">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Tipo de Registro</label>
                  <select
                    value={newZoeType}
                    onChange={(e: any) => setNewZoeType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="Consulta">Consulta Médica / Pediatra</option>
                    <option value="Vacina">Vacina / Imunização</option>
                    <option value="Remédio">Medicamento / Horário</option>
                    <option value="Crescimento">Peso & Altura</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Título</label>
                  <input
                    type="text"
                    placeholder="Ex: Vacina Tetravalente ou Peso 11.2kg"
                    value={newZoeTitle}
                    onChange={(e) => setNewZoeTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Anotações adicionais</label>
                  <textarea
                    rows={2}
                    placeholder="Ex: Dr. Paulo recomendou dar paracetamol se tiver febre"
                    value={newZoeNotes}
                    onChange={(e) => setNewZoeNotes(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!newZoeTitle.trim()}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 rounded-xl text-xs font-bold transition-colors shadow-lg shadow-amber-500/20"
                >
                  Salvar no Diário da Zoe
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 7: ANNOUNCEMENTS ON SCREEN                               */}
        {/* ============================================================ */}
        {currentRemoteTab === "announcements" && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4" />
                Mandar Recado na Tela da Cozinha
              </h3>
              <p className="text-xs text-slate-400">
                O recado piscará em destaque no topo do monitor para todos verem!
              </p>

              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Ex: Almoço tá na mesa! Venham comer."
                  value={customAnnouncement}
                  onChange={(e) => setCustomAnnouncement(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendAnnouncement()}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />

                <button
                  onClick={() => handleSendAnnouncement()}
                  disabled={!customAnnouncement.trim()}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 rounded-xl text-xs font-bold transition-colors"
                >
                  Enviar para a Tela
                </button>
              </div>

              {/* Quick Presets */}
              <div className="pt-2 space-y-1.5">
                <span className="text-[11px] text-slate-400 font-medium">Recados rápidos com 1 toque:</span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    "🍽️ Almoço na mesa!",
                    "🚗 Chegando em 10 minutos",
                    "👶 Zoe acabou de dormir",
                    "🛒 Quem vai no mercado?",
                    "☕ Café quentinho passado",
                    "❤️ Amo vocês!",
                  ].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => handleSendAnnouncement(preset)}
                      className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-medium text-left border border-slate-700/60 transition-colors"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

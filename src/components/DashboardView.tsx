import React from "react";
import {
  Calendar as CalendarIcon,
  ShoppingBag,
  CheckSquare,
  Repeat,
  Utensils,
  Sun,
  AlertCircle,
  Plus,
  CheckCircle2,
  ArrowRight,
  Heart,
  ExternalLink,
} from "lucide-react";
import {
  CalendarEvent,
  ShoppingItem,
  TaskItem,
  DailyRoutine,
  MealPlanItem,
  FamilyPhoto,
  BillItem,
  ActiveTab,
  MemberProfile,
} from "../types";

interface DashboardViewProps {
  events: CalendarEvent[];
  shopping: ShoppingItem[];
  tasks: TaskItem[];
  routines: DailyRoutine[];
  meals: MealPlanItem[];
  photos: FamilyPhoto[];
  bills: BillItem[];
  members: MemberProfile[];
  onToggleShoppingItem: (id: string) => void;
  onToggleTaskItem: (id: string) => void;
  onToggleRoutineItem: (id: string) => void;
  onNavigateTab: (tab: ActiveTab) => void;
  onOpenAiModal: () => void;
  quoteOfDay: string;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  events,
  shopping,
  tasks,
  routines,
  meals,
  photos,
  bills,
  members,
  onToggleShoppingItem,
  onToggleTaskItem,
  onToggleRoutineItem,
  onNavigateTab,
  onOpenAiModal,
  quoteOfDay,
}) => {
  const todayStr = new Date().toISOString().split("T")[0];

  // Helper for member avatar badge
  const getMemberColor = (memberName: string) => {
    const member = members.find((m) => m.name === memberName);
    return member?.avatarColor || "bg-amber-500 text-slate-950";
  };

  // Filter today's events
  const todayEvents = events.filter((e) => e.date === todayStr);

  // Filter urgent shopping items
  const activeShopping = shopping.filter((s) => !s.completed);

  // Filter today tasks
  const todayTasks = tasks.filter((t) => t.dueDate === todayStr || !t.completed);

  // Current Day of Week in PT-BR
  const daysMap = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
  const currentDayOfWeek = daysMap[new Date().getDay()];

  // Today's routines
  const todayRoutines = routines.filter((r) => r.dayOfWeek === currentDayOfWeek);

  // Today's Meal Plan
  const todayMeal = meals.find((m) => m.dayOfWeek === currentDayOfWeek) || meals[0];

  // Featured Photo
  const featuredPhoto = photos[0] || {
    title: "Família no Parque",
    url: "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1200&q=80",
    caption: "Alegria da Zoe no parque ☀️",
  };

  // Urgent Unpaid Bills (within 7 days)
  const pendingBills = bills.filter((b) => !b.paid);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner Quote & Voice AI Prompt */}
      <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/5 border border-amber-500/30 rounded-3xl p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Heart className="w-4 h-4 fill-amber-400" />
            <span>Lembrete do Dia • ALLDAY Home</span>
          </div>
          <p className="text-base md:text-lg font-medium text-slate-100 italic">
            "{quoteOfDay}"
          </p>
        </div>

        <button
          onClick={onOpenAiModal}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-3 rounded-2xl text-sm transition-all shadow-md shadow-amber-500/20 flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <span>Adicionar por Voz / IA</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Primary Kiosk Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* CARD 1: Próximos Compromissos */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
                  <CalendarIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-base">Compromissos de Hoje</h3>
                  <p className="text-xs text-slate-400">{todayEvents.length} agendados</p>
                </div>
              </div>

              <button
                onClick={() => onNavigateTab("calendar")}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>Ver tudo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Event List */}
            <div className="space-y-2.5">
              {todayEvents.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-sm">
                  Nenhum compromisso pendente para hoje.
                </div>
              ) : (
                todayEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-2xl flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold font-mono text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-1 rounded-lg">
                        {evt.time || "Dia todo"}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-slate-100 line-clamp-1">
                          {evt.title}
                        </p>
                        {evt.location && (
                          <p className="text-[11px] text-slate-400">{evt.location}</p>
                        )}
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getMemberColor(
                        evt.member
                      )}`}
                    >
                      {evt.member}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            onClick={() => onNavigateTab("calendar")}
            className="mt-4 w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Adicionar Compromisso</span>
          </button>
        </div>

        {/* CARD 2: Tarefas da Casa */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-base">Tarefas do Dia</h3>
                  <p className="text-xs text-slate-400">
                    {todayTasks.filter((t) => t.completed).length}/{todayTasks.length} concluídas
                  </p>
                </div>
              </div>

              <button
                onClick={() => onNavigateTab("tasks")}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>Gerenciar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Task List */}
            <div className="space-y-2">
              {todayTasks.slice(0, 4).map((task) => (
                <div
                  key={task.id}
                  onClick={() => onToggleTaskItem(task.id)}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                    task.completed
                      ? "bg-slate-950/40 border-slate-800/40 text-slate-500 line-through"
                      : "bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => onToggleTaskItem(task.id)}
                      className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                    />
                    <span className="text-sm font-medium">{task.title}</span>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getMemberColor(
                      task.assignee
                    )}`}
                  >
                    {task.assignee}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigateTab("tasks")}
            className="mt-4 w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Nova Tarefa</span>
          </button>
        </div>

        {/* CARD 3: Lista de Compras (Itens Ativos) */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-base">Lista de Compras</h3>
                  <p className="text-xs text-slate-400">
                    {activeShopping.length} itens pendentes
                  </p>
                </div>
              </div>

              <button
                onClick={() => onNavigateTab("shopping")}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>Ver lista</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Shopping Item Quick List */}
            <div className="space-y-2">
              {activeShopping.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-sm">
                  🎉 Nenhum item pendente na lista de compras!
                </div>
              ) : (
                activeShopping.slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onToggleShoppingItem(item.id)}
                    className="p-3 bg-slate-950/70 border border-slate-800 hover:border-slate-700 rounded-2xl flex items-center justify-between gap-3 cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => onToggleShoppingItem(item.id)}
                        className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                      />
                      <div>
                        <p className="text-sm font-semibold text-slate-100">
                          {item.name}
                        </p>
                        {item.quantity && (
                          <p className="text-[10px] text-slate-400">{item.quantity}</p>
                        )}
                      </div>
                    </div>

                    <span className="text-[10px] uppercase tracking-wider font-semibold bg-slate-800 text-slate-400 px-2 py-0.5 rounded-lg">
                      {item.category}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            onClick={() => onNavigateTab("shopping")}
            className="mt-4 w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Adicionar à Lista</span>
          </button>
        </div>

        {/* CARD 4: Rotinas de Hoje */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
                  <Repeat className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-base">
                    Rotina de {currentDayOfWeek}
                  </h3>
                  <p className="text-xs text-slate-400">Habituais da família</p>
                </div>
              </div>

              <button
                onClick={() => onNavigateTab("routines")}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>Grade</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2">
              {todayRoutines.length === 0 ? (
                <div className="py-6 text-center text-slate-500 text-sm">
                  Sem rotinas cadastradas para hoje.
                </div>
              ) : (
                todayRoutines.map((routine) => (
                  <div
                    key={routine.id}
                    onClick={() => onToggleRoutineItem(routine.id)}
                    className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                      routine.completed
                        ? "bg-slate-950/40 border-slate-800/40 text-slate-500 line-through"
                        : "bg-slate-950/70 border-slate-800 text-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={routine.completed}
                        onChange={() => onToggleRoutineItem(routine.id)}
                        className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                      />
                      <span className="text-sm font-medium">{routine.title}</span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getMemberColor(
                        routine.assignee
                      )}`}
                    >
                      {routine.assignee}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            onClick={() => onNavigateTab("routines")}
            className="mt-4 w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-all cursor-pointer"
          >
            Ver Rotina Completa da Semana
          </button>
        </div>

        {/* CARD 5: Cardápio do Dia */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-orange-500/10 text-orange-400 rounded-xl border border-orange-500/20">
                  <Utensils className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-base">Refeições do Dia</h3>
                  <p className="text-xs text-slate-400">{currentDayOfWeek}</p>
                </div>
              </div>

              <button
                onClick={() => onNavigateTab("meals")}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>Semana</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-2xl">
                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                  ☀️ Almoço
                </span>
                <p className="text-sm font-semibold text-slate-100 mt-0.5">
                  {todayMeal.lunch}
                </p>
              </div>

              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-2xl">
                <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider">
                  🌙 Jantar
                </span>
                <p className="text-sm font-semibold text-slate-100 mt-0.5">
                  {todayMeal.dinner}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab("meals")}
            className="mt-4 w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-all cursor-pointer"
          >
            Editar Cardápio da Semana
          </button>
        </div>

        {/* CARD 6: Porta-Retrato / Lembranças de Família */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between shadow-xl overflow-hidden relative group">
          <div>
            <div className="flex items-center justify-between mb-3 z-10 relative">
              <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-400 fill-red-400" />
                <span>Porta-Retrato</span>
              </h3>

              <button
                onClick={() => onNavigateTab("photos")}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>Galeria</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="relative rounded-2xl overflow-hidden h-44 border border-slate-800 shadow-inner">
              <img
                src={featuredPhoto.url}
                alt={featuredPhoto.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent p-3 flex flex-col justify-end">
                <p className="text-xs font-bold text-white leading-tight">
                  {featuredPhoto.title}
                </p>
                {featuredPhoto.caption && (
                  <p className="text-[11px] text-slate-300 line-clamp-1">
                    {featuredPhoto.caption}
                  </p>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab("photos")}
            className="mt-3 w-full py-2 bg-slate-800/80 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
          >
            Ativar Slideshow em Tela Cheia
          </button>
        </div>
      </div>

      {/* Unpaid Bills Warning Bar */}
      {pendingBills.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-500/10 text-red-400 rounded-xl border border-red-500/20">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">
                {pendingBills.length} Contas / Boletos com Vencimento Próximo
              </p>
              <p className="text-xs text-slate-400">
                Próximo: {pendingBills[0].title} (R$ {pendingBills[0].amount.toFixed(2)})
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab("finances")}
            className="bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold px-4 py-2 rounded-xl text-xs cursor-pointer"
          >
            Ver Financeiro
          </button>
        </div>
      )}
    </div>
  );
};

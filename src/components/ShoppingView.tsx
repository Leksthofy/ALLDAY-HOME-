import React, { useState } from "react";
import {
  ShoppingBag,
  Plus,
  Trash2,
  CheckCircle2,
  Filter,
  Sparkles,
  RefreshCw,
  X,
  User,
} from "lucide-react";
import { ShoppingItem, FamilyMember } from "../types";

interface ShoppingViewProps {
  shopping: ShoppingItem[];
  onToggleItem: (id: string) => void;
  onAddItem: (item: Omit<ShoppingItem, "id">) => void;
  onDeleteItem: (id: string) => void;
  onClearCompleted: () => void;
}

export const ShoppingView: React.FC<ShoppingViewProps> = ({
  shopping,
  onToggleItem,
  onAddItem,
  onDeleteItem,
  onClearCompleted,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("Todas");
  const [newItemName, setNewItemName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [category, setCategory] = useState<
    "Supermercado" | "Farmácia" | "Feira" | "Casa" | "Outros"
  >("Supermercado");
  const [addedBy, setAddedBy] = useState<FamilyMember>("Thiago");

  const categories = ["Todas", "Supermercado", "Farmácia", "Feira", "Casa", "Outros"];

  const filteredItems = shopping.filter((item) => {
    if (selectedCategory !== "Todas" && item.category !== selectedCategory) return false;
    return true;
  });

  const completedCount = shopping.filter((s) => s.completed).length;
  const progressPercent = shopping.length === 0 ? 0 : Math.round((completedCount / shopping.length) * 100);

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    onAddItem({
      name: newItemName.trim(),
      category,
      completed: false,
      addedBy,
      quantity: quantity.trim() || undefined,
    });

    setNewItemName("");
    setQuantity("");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner & Quick Add Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
              <ShoppingBag className="w-4 h-4" />
              <span>Lista de Compras Compartilhada</span>
            </div>
            <h2 className="text-xl font-bold text-white">Supermercado & Casa</h2>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <div className="text-right">
              <span className="text-xs text-slate-400">Progresso</span>
              <p className="text-sm font-bold text-emerald-400">
                {completedCount} de {shopping.length} comprados ({progressPercent}%)
              </p>
            </div>

            {completedCount > 0 && (
              <button
                onClick={onClearCompleted}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all"
              >
                Limpar Concluídos
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden mb-6 border border-slate-800">
          <div
            className="bg-emerald-500 h-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Quick Add Form */}
        <form onSubmit={handleQuickAdd} className="grid grid-cols-1 sm:grid-cols-12 gap-2 bg-slate-950 p-2 border border-slate-800 rounded-2xl">
          <input
            type="text"
            required
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder="Adicionar item (ex: Leite, Café, Fralda)..."
            className="sm:col-span-5 bg-transparent px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500"
          />

          <input
            type="text"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Qtd (ex: 2L, 1 un)"
            className="sm:col-span-2 bg-slate-900 border border-slate-800 px-3 py-2 text-xs text-white rounded-xl outline-none"
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as any)}
            className="sm:col-span-2 bg-slate-900 border border-slate-800 px-3 py-2 text-xs text-slate-300 rounded-xl outline-none"
          >
            <option value="Supermercado">Supermercado</option>
            <option value="Farmácia">Farmácia</option>
            <option value="Feira">Feira</option>
            <option value="Casa">Casa</option>
            <option value="Outros">Outros</option>
          </select>

          <select
            value={addedBy}
            onChange={(e) => setAddedBy(e.target.value as FamilyMember)}
            className="sm:col-span-2 bg-slate-900 border border-slate-800 px-3 py-2 text-xs text-slate-300 rounded-xl outline-none"
          >
            <option value="Thiago">Thiago</option>
            <option value="Erika">Erika</option>
            <option value="Zoe">Zoe</option>
          </select>

          <button
            type="submit"
            className="sm:col-span-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer transition-all"
          >
            <Plus className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <Filter className="w-4 h-4 text-slate-500 shrink-0" />
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
              selectedCategory === cat
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Item List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredItems.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-slate-900 border border-slate-800 rounded-3xl text-slate-500">
            Nenhum item encontrado nesta categoria.
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => onToggleItem(item.id)}
              className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer group ${
                item.completed
                  ? "bg-slate-950/40 border-slate-800/40 opacity-60"
                  : "bg-slate-900 border-slate-800 hover:border-slate-700 shadow-md"
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => onToggleItem(item.id)}
                  className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                />

                <div>
                  <p
                    className={`text-sm font-semibold ${
                      item.completed ? "line-through text-slate-500" : "text-slate-100"
                    }`}
                  >
                    {item.name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                    {item.quantity && <span className="font-mono text-emerald-400">{item.quantity}</span>}
                    <span>•</span>
                    <span>Adicionado por {item.addedBy}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-semibold bg-slate-950 border border-slate-800 px-2 py-0.5 rounded-lg text-slate-400">
                  {item.category}
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteItem(item.id);
                  }}
                  className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800 transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

import React, { useState } from "react";
import { Utensils, ShoppingBag, Edit3, ArrowRight, CheckCircle2, X } from "lucide-react";
import { MealPlanItem, ShoppingItem } from "../types";

interface MealsViewProps {
  meals: MealPlanItem[];
  onUpdateMeal: (meal: MealPlanItem) => void;
  onAddShoppingItems: (items: string[]) => void;
}

export const MealsView: React.FC<MealsViewProps> = ({
  meals,
  onUpdateMeal,
  onAddShoppingItems,
}) => {
  const [editingMeal, setEditingMeal] = useState<MealPlanItem | null>(null);
  const [lunch, setLunch] = useState("");
  const [dinner, setDinner] = useState("");
  const [ingredientsStr, setIngredientsStr] = useState("");

  const handleEditClick = (meal: MealPlanItem) => {
    setEditingMeal(meal);
    setLunch(meal.lunch);
    setDinner(meal.dinner);
    setIngredientsStr((meal.ingredientsNeeded || []).join(", "));
  };

  const handleSaveMeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMeal) return;

    const ingList = ingredientsStr
      .split(",")
      .map((i) => i.trim())
      .filter((i) => i.length > 0);

    onUpdateMeal({
      ...editingMeal,
      lunch,
      dinner,
      ingredientsNeeded: ingList,
    });

    setEditingMeal(null);
  };

  const handleTransferToShopping = (meal: MealPlanItem) => {
    if (!meal.ingredientsNeeded || meal.ingredientsNeeded.length === 0) {
      alert("Nenhum ingrediente listado para este dia.");
      return;
    }

    onAddShoppingItems(meal.ingredientsNeeded);
    alert(`✅ Ingredientes de ${meal.dayOfWeek} adicionados à Lista de Compras!`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-orange-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Utensils className="w-4 h-4" />
            <span>Planejamento Alimentar Semanal</span>
          </div>
          <h2 className="text-xl font-bold text-white">Cardápio da Família & Receitas</h2>
        </div>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {meals.map((meal) => (
          <div
            key={meal.id}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between shadow-lg hover:border-slate-700 transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
                <span className="text-base font-bold text-amber-400">
                  {meal.dayOfWeek}
                </span>

                <button
                  onClick={() => handleEditClick(meal)}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-all"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Editar</span>
                </button>
              </div>

              {/* Meals */}
              <div className="space-y-3 mb-4">
                <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-2xl">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                    ☀️ Almoço
                  </span>
                  <p className="text-sm font-semibold text-slate-100 mt-0.5">
                    {meal.lunch}
                  </p>
                </div>

                <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-2xl">
                  <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">
                    🌙 Jantar
                  </span>
                  <p className="text-sm font-semibold text-slate-100 mt-0.5">
                    {meal.dinner}
                  </p>
                </div>
              </div>

              {/* Ingredients */}
              {meal.ingredientsNeeded && meal.ingredientsNeeded.length > 0 && (
                <div className="mb-4">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Ingredientes Principais:
                  </span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {meal.ingredientsNeeded.map((ing, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] bg-slate-950 border border-slate-800 text-slate-300 px-2.5 py-0.5 rounded-lg"
                      >
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Transfer to Shopping Button */}
            <button
              onClick={() => handleTransferToShopping(meal)}
              className="w-full py-2.5 bg-slate-800 hover:bg-emerald-600/20 text-slate-300 hover:text-emerald-300 border border-slate-700/60 hover:border-emerald-500/30 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
              <span>Copiar Ingredientes para Compras</span>
            </button>
          </div>
        ))}
      </div>

      {/* Edit Meal Modal */}
      {editingMeal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl p-6 text-slate-100 shadow-2xl relative">
            <button
              onClick={() => setEditingMeal(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-4">
              Editar Cardápio: {editingMeal.dayOfWeek}
            </h3>

            <form onSubmit={handleSaveMeal} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  ☀️ Almoço
                </label>
                <input
                  type="text"
                  required
                  value={lunch}
                  onChange={(e) => setLunch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  🌙 Jantar
                </label>
                <input
                  type="text"
                  required
                  value={dinner}
                  onChange={(e) => setDinner(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Ingredientes Necessários (Separados por vírgula)
                </label>
                <input
                  type="text"
                  value={ingredientsStr}
                  onChange={(e) => setIngredientsStr(e.target.value)}
                  placeholder="Ex: Frango, Arroz, Feijão, Tomate"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingMeal(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs cursor-pointer shadow-md shadow-amber-500/20"
                >
                  Salvar Cardápio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

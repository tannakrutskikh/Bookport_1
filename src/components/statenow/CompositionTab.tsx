import React from "react";
import { Utensils } from "lucide-react";
import { motion } from "motion/react";
import AnnaTabSpoiler from "./AnnaTabSpoiler";
import { NextStepRecommendation } from "../../utils/nextStepEngine";

interface CompositionTabProps {
  key?: any;
  aggregatedIngredients: {
    name: string;
    weight: number;
    status: "green" | "yellow" | "red";
  }[];
  cookedBookDishes: {
    id: string;
    name: string;
    source: string;
    category: string;
    page: number;
    ingredientsText: string;
    time: string;
  }[];
  todayCustomDishes: {
    id: string;
    name: string;
    category?: string;
    ingredients?: { name: string; weight: string; status?: "green" | "yellow" | "red" }[];
  }[];
  annaAnalysisText?: string;
  recommendedAction?: NextStepRecommendation;
}

export default function CompositionTab({
  aggregatedIngredients,
  cookedBookDishes,
  todayCustomDishes,
  annaAnalysisText,
  recommendedAction,
}: CompositionTabProps) {
  const totalMass = aggregatedIngredients.reduce((acc, curr) => acc + curr.weight, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-5"
    >
      {/* 0. Anna's Tab Spoiler Analysis */}
      {annaAnalysisText && recommendedAction && (
        <AnnaTabSpoiler 
          tabId="composition"
          tabName="Сырьевой состав рациона"
          analysisText={annaAnalysisText}
          recommendedAction={recommendedAction}
        />
      )}
      {/* Total Raw Mass Weight list of ingredients */}
      <div className="bg-white rounded-[32px] border border-gray-100 shadow-[0_8px_24px_rgba(43,49,55,0.02)] p-5 text-left">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[14px] font-black text-slate-850 tracking-tight uppercase flex items-center gap-1.5 select-none font-sans">
            <span className="text-emerald-500">⚖️</span> Вес ингредиентов рациона за день
          </h2>
          <span className="text-[10px] uppercase font-mono font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
            Всего: {totalMass} г
          </span>
        </div>
        <p className="text-[11.5px] text-gray-400 mb-4 leading-normal font-sans">
          Общие очищенные ингредиенты всех ваших блюд дня с суммированным сухим или чистым весом.
        </p>

        {aggregatedIngredients.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {aggregatedIngredients.map((ing) => (
              <div 
                key={ing.name} 
                className={`px-3 py-1.5 rounded-2xl border text-[11.5px] font-semibold flex items-center gap-1.5 transition-all ${
                  ing.status === "red" 
                    ? "bg-rose-50 border-rose-100 text-rose-700" 
                    : (ing.status === "yellow" ? "bg-amber-50 border-amber-100 text-amber-700" : "bg-[#F0FDF4] border-emerald-150/40 text-emerald-800")
                }`}
              >
                <span className="font-extrabold">{ing.name}</span>
                <span className="opacity-35 font-normal">•</span>
                <span className="font-mono">{ing.weight} г</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-slate-200 p-6 rounded-2xl text-center">
            <span className="text-[12px] text-slate-400 font-bold font-sans">Список сырья пуст</span>
            <p className="text-[11px] text-slate-500 mt-1 font-sans">Ингредиенты появятся при заполнении рациона в книге или меню Сделай сам.</p>
          </div>
        )}
      </div>

      {/* Cooked dishes archive or history list */}
      <div className="bg-white rounded-[32px] border border-gray-100 shadow-[0_8px_24px_rgba(43,49,55,0.02)] p-5 text-left">
        <h2 className="text-[14px] font-black text-slate-850 tracking-tight mb-4 uppercase flex items-center gap-1.5 select-none font-sans">
          <span className="text-emerald-500">📖</span> Приготовлено сегодня / Архив дня
        </h2>

        <div className="flex flex-col gap-3">
          {cookedBookDishes.length === 0 && todayCustomDishes.length === 0 ? (
            <div className="border border-dashed border-slate-200 p-6 rounded-2xl text-center flex flex-col items-center justify-center">
              <Utensils className="w-8 h-8 text-slate-350 mb-2" />
              <span className="text-[13px] font-extrabold text-slate-400 font-sans">Архив блюд пуст</span>
              <p className="text-[11.5px] text-slate-400 max-w-[200px] mt-1 leading-snug font-sans">
                Приготовьте блюда из Книги или создайте рецепт в меню «Сделай сам»
              </p>
            </div>
          ) : (
            <>
              {/* Book Recipes */}
              {cookedBookDishes.map((dish) => (
                <div key={dish.id} className="border border-slate-100 bg-slate-50/40 rounded-2xl p-3 flex items-start gap-3 relative hover:bg-slate-50/80 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 text-[18px]">
                    📖
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="text-[9px] font-black text-indigo-650 bg-indigo-50 px-2 py-0.5 rounded uppercase font-mono">
                        {dish.category}
                      </span>
                      <span className="text-[9.5px] font-bold text-slate-400 whitespace-nowrap">
                        {dish.time} • Стр. {dish.page}
                      </span>
                    </div>
                    <h3 className="text-[13px] font-bold text-slate-800 tracking-tight truncate mt-1">
                      {dish.name}
                    </h3>
                    <div className="text-[11px] text-slate-450 truncate mt-1 font-sans">
                      <span className="font-semibold">Ингредиенты:</span> {dish.ingredientsText}
                    </div>
                  </div>
                </div>
              ))}

              {/* Custom DIY Dishes */}
              {todayCustomDishes.map((dish) => (
                <div key={dish.id} className="border border-slate-100 bg-emerald-50/10 rounded-2xl p-3 flex items-start gap-3 relative hover:bg-emerald-50/20 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 text-[18px]">
                    🌱
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded uppercase font-mono">
                        {dish.category || "Сделай сам"}
                      </span>
                      <span className="text-[9.5px] font-bold text-emerald-650 whitespace-nowrap bg-emerald-50/50 px-2 py-0.5 rounded font-mono">
                        Сделай сам
                      </span>
                    </div>
                    <h3 className="text-[13px] font-bold text-slate-800 tracking-tight truncate mt-1">
                      {dish.name}
                    </h3>
                    <div className="text-[11px] text-slate-450 truncate mt-1 font-sans">
                      <span className="font-semibold">Ингредиенты:</span> {(dish.ingredients || []).map(i => `${i.name} (${i.weight})`).join(", ")}
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

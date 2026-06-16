import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  ChevronLeft, 
  MoreHorizontal, 
  HeartPulse, 
  Flame, 
  ArrowUp, 
  Droplet, 
  Activity, 
  Hourglass, 
  Droplets, 
  Flower2, 
  Shield, 
  BatteryLow, 
  Brain, 
  Wind, 
  Heart, 
  Layers, 
  Link, 
  Waves, 
  CloudRain, 
  Moon, 
  ShieldCheck, 
  MoreHorizontal as DotsIcon,
  Sprout,
  Scale,
  Zap,
  EyeOff,
  Leaf,
  Clock,
  ArrowDown,
  ShieldAlert,
  Sparkles,
  Smile,
  CloudLightning,
  Cookie,
  Ban,
  Sun,
  Check
} from "lucide-react";
import BottomBar from "./BottomBar";

interface HealthGoalsScreenProps {
  onBack: () => void;
  onNext: () => void;
  selectedChronic?: string[];
  setSelectedChronic?: React.Dispatch<React.SetStateAction<string[]>>;
  selectedGoals?: string[];
  setSelectedGoals?: React.Dispatch<React.SetStateAction<string[]>>;
}

// Chronic Conditions with specified icons
const CHRONIC_CONDITIONS = [
  { id: "hypertension", name: "Гипертония", icon: HeartPulse, color: "text-red-500 bg-red-50" },
  { id: "gastritis", name: "Гастрит", icon: Flame, color: "text-orange-500 bg-orange-50" },
  { id: "reflux", name: "Рефлюкс", icon: ArrowUp, color: "text-amber-500 bg-amber-50" },
  { id: "diabetes", name: "Диабет", icon: Droplet, color: "text-blue-500 bg-blue-50" },
  { id: "ibs", name: "СРК", icon: Activity, color: "text-emerald-500 bg-emerald-50" },
  { id: "constipation", name: "Запоры", icon: Hourglass, color: "text-cyan-500 bg-cyan-50" },
  { id: "cholesterol", name: "Высокий холестерин", icon: Activity, color: "text-rose-500 bg-rose-50" },
  { id: "anemia", name: "Анемия", icon: Droplets, color: "text-red-600 bg-red-100" },
  { id: "allergy", name: "Аллергия", icon: Flower2, color: "text-pink-500 bg-pink-50" },
  { id: "thyroid", name: "Заболевания щитовидной железы", icon: Shield, color: "text-violet-500 bg-violet-50" },
  { id: "fatigue", name: "Хроническая усталость", icon: BatteryLow, color: "text-slate-500 bg-slate-100" },
  { id: "migraine", name: "Мигрень", icon: Brain, color: "text-indigo-500 bg-indigo-50" },
  { id: "asthma", name: "Астма", icon: Wind, color: "text-sky-500 bg-sky-50" },
  { id: "liver", name: "Заболевания печени", icon: Heart, color: "text-red-400 bg-red-50" },
  { id: "kidneys", name: "Заболевания почек", icon: Layers, color: "text-teal-600 bg-teal-50" },
  { id: "arthritis", name: "Артрит / боли в суставах", icon: Link, color: "text-stone-600 bg-stone-100" },
  { id: "anxiety", name: "Тревожность", icon: Waves, color: "text-purple-500 bg-purple-50" },
  { id: "depression", name: "Депрессия", icon: CloudRain, color: "text-blue-600 bg-blue-100" },
  { id: "insomnia", name: "Нарушения сна", icon: Moon, color: "text-indigo-900 bg-indigo-50" },
  { id: "autoimmune", name: "Аутоиммунные заболевания", icon: ShieldCheck, color: "text-lime-600 bg-lime-50" },
  { id: "other_chronic", name: "Другое", icon: DotsIcon, color: "text-gray-500 bg-gray-100" }
];

// Goals list with beautiful icons
const GOALS = [
  { id: "improve_digestion", name: "Улучшить пищеварение", icon: Sprout, color: "text-emerald-500 bg-emerald-50" },
  { id: "lose_weight", name: "Снизить вес", icon: Scale, color: "text-teal-500 bg-teal-50" },
  { id: "increase_energy", name: "Повысить энергию", icon: Zap, color: "text-amber-500 bg-amber-50" },
  { id: "normalize_sleep", name: "Нормализовать сон", icon: Moon, color: "text-indigo-500 bg-indigo-50" },
  { id: "reduce_sugar_cravings", name: "Уменьшить тягу к сладкому", icon: Ban, color: "text-purple-500 bg-purple-50" },
  { id: "plant_diet", name: "Перейти на растительное питание", icon: Leaf, color: "text-green-500 bg-green-50" },
  { id: "regular_stool", name: "Наладить регулярный стул", icon: Clock, color: "text-cyan-500 bg-cyan-50" },
  { id: "lower_pressure", name: "Снизить давление", icon: HeartPulse, color: "text-red-500 bg-red-50" },
  { id: "stabilize_sugar", name: "Стабилизировать сахар", icon: Activity, color: "text-blue-500 bg-blue-50" },
  { id: "lower_cholesterol", name: "Снизить холестерин", icon: ArrowDown, color: "text-rose-500 bg-rose-50" },
  { id: "reduce_inflammation", name: "Снизить воспаление", icon: ShieldAlert, color: "text-emerald-600 bg-emerald-50" },
  { id: "improve_skin", name: "Улучшить состояние кожи", icon: Sparkles, color: "text-pink-500 bg-pink-50" },
  { id: "improve_mood", name: "Улучшить настроение", icon: Smile, color: "text-yellow-600 bg-yellow-50" },
  { id: "reduce_anxiety", name: "Уменьшить тревожность", icon: CloudLightning, color: "text-indigo-400 bg-indigo-50" },
  { id: "improve_eating_habits", name: "Улучшить пищевые привычки", icon: Heart, color: "text-rose-400 bg-rose-50" },
  { id: "more_wfpb", name: "Есть больше цельной растительной еды", icon: Cookie, color: "text-orange-500 bg-orange-50" },
  { id: "less_overeating", name: "Меньше переедать", icon: Ban, color: "text-stone-500 bg-stone-50" },
  { id: "drink_water", name: "Пить достаточно воды", icon: Droplet, color: "text-sky-500 bg-sky-50" },
  { id: "routine_stability", name: "Быть устойчивее в режиме", icon: Clock, color: "text-teal-600 bg-teal-50" },
  { id: "improve_wellbeing", name: "Улучшить общее самочувствие", icon: Sun, color: "text-amber-600 bg-amber-50" },
  { id: "other_goal", name: "Другое", icon: Sparkles, color: "text-gray-500 bg-gray-100" }
];

export default function HealthGoalsScreen(props: HealthGoalsScreenProps) {
  // Pre-selected values from mockup/reference design
  const [localChronic, setLocalChronic] = useState<string[]>([]);
  const [localGoals, setLocalGoals] = useState<string[]>([]);

  const selectedChronic = props.selectedChronic ?? localChronic;
  const setSelectedChronic = props.setSelectedChronic ?? setLocalChronic;

  const selectedGoals = props.selectedGoals ?? localGoals;
  const setSelectedGoals = props.setSelectedGoals ?? setLocalGoals;

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    (window as any).currentScreenContext = {
      screen_id: "health-goals",
      screen_title: "Цели Оздоровления и Хронические ограничения ЖКТ",
      current_status: "Выбор терапевтических ограничений и направлений превентивного питания",
      selectedChronic,
      selectedGoals,
      user_input_values: {
        chronic_ids: selectedChronic,
        goal_ids: selectedGoals
      }
    };

    return () => {
      if ((window as any).currentScreenContext?.screen_id === "health-goals") {
        delete (window as any).currentScreenContext;
      }
    };
  }, [selectedChronic, selectedGoals]);

  const toggleChronic = (id: string) => {
    setSelectedChronic(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleGoal = (id: string) => {
    setSelectedGoals(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="w-full flex flex-col justify-between" id="health-goals-screen">
      
      {/* Scrollable interior content */}
      <div className="flex-1 px-5 pt-3 pb-2">
        
        {/* Top bar with back button and options */}
        <div className="flex items-center justify-between mb-5">
          <button 
            onClick={props.onBack}
            className="w-10 h-10 rounded-full bg-[#FAFAFA] border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex items-center justify-center text-text-sec hover:bg-white active:scale-95 transition-all duration-200 cursor-pointer"
            aria-label="Назад"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5] text-text-dark" />
          </button>
          
          <button 
            className="w-10 h-10 rounded-full bg-[#FAFAFA] border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex items-center justify-center text-text-sec hover:bg-white active:scale-95 transition-all duration-200 cursor-pointer"
            aria-label="Опции"
          >
            <MoreHorizontal className="w-5 h-5 stroke-[2.5] text-text-dark" />
          </button>
        </div>

        {/* Title and Subtitle */}
        <div className="text-center flex flex-col gap-1.5 mb-6">
          <h2 
            className="text-[28px] sm:text-[30px] font-bold text-text-dark leading-tight"
            style={{ fontFamily: '"Calibri", "Candara", sans-serif' }}
          >
            Здоровье и цели
          </h2>
          <p 
            className="text-[16px] sm:text-[17px] text-text-muted leading-tight"
            style={{ fontFamily: '"Calibri", "Candara", sans-serif' }}
          >
            Выберите то, что важно учитывать в рекомендациях
          </p>
        </div>

        {/* Sections Containment */}
        <div className="flex flex-col gap-6 mb-7">

          {/* Section 1: Хронические состояния */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-0.5">
              <span 
                className="text-[18px] sm:text-[20px] font-bold text-text-dark leading-tight"
                style={{ fontFamily: '"Calibri", "Candara", sans-serif' }}
              >
                Хронические состояния
              </span>
              <span 
                className="text-[15px] sm:text-[16px] text-text-muted leading-none font-normal"
                style={{ fontFamily: '"Calibri", "Candara", sans-serif' }}
              >
                Выберите всё, что подходит
              </span>
            </div>

            {/* Scrollable container with indicator track */}
            <div className="relative rounded-2xl border border-gray-100 bg-white shadow-[0_4px_18px_rgba(43,49,55,0.03)] overflow-hidden">
              <div className="max-h-[224px] overflow-y-auto px-4 py-2.5 flex flex-col gap-1 text-[15px] sm:text-[17px] custom-scrollbar scroll-smooth">
                {CHRONIC_CONDITIONS.map((cond) => {
                  const IconComponent = cond.icon;
                  const isChecked = selectedChronic.includes(cond.id);
                  return (
                    <button
                      key={cond.id}
                      type="button"
                      onClick={() => toggleChronic(cond.id)}
                      className="w-full flex items-center justify-between py-2.5 px-1.5 rounded-xl hover:bg-[#FAFAFA] transition-colors duration-150 text-left cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg ${cond.color} flex items-center justify-center transition-all duration-200 group-hover:scale-105`}>
                          <IconComponent className="w-5 h-5 stroke-[2]" />
                        </div>
                        <span 
                          className="font-medium text-[15px] sm:text-[16px] text-text-dark"
                          style={{ fontFamily: '"Calibri", "Candara", sans-serif' }}
                        >
                          {cond.name}
                        </span>
                      </div>

                      {/* Custom circular selection marker right */}
                      <div className="flex items-center justify-center">
                        {isChecked ? (
                          <div className="w-6 h-6 rounded-full bg-brand-green-bright flex items-center justify-center shadow-[0_2px_8px_rgba(20,200,90,0.3)] animate-[pop_0.2s_ease-out_1]">
                            <Check className="w-3.5 h-3.5 stroke-[3] text-white" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-white border border-gray-200" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 2: Мои цели */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-0.5">
              <span 
                className="text-[18px] sm:text-[20px] font-bold text-text-dark leading-tight"
                style={{ fontFamily: '"Calibri", "Candara", sans-serif' }}
              >
                Мои цели
              </span>
              <span 
                className="text-[15px] sm:text-[16px] text-text-muted leading-none font-normal"
                style={{ fontFamily: '"Calibri", "Candara", sans-serif' }}
              >
                Выберите всё, что важно для вас
              </span>
            </div>

            {/* Scrollable container with indicator track */}
            <div className="relative rounded-2xl border border-gray-100 bg-white shadow-[0_4px_18px_rgba(43,49,55,0.03)] overflow-hidden">
              <div className="max-h-[224px] overflow-y-auto px-4 py-2.5 flex flex-col gap-1 text-[15px] sm:text-[17px] custom-scrollbar scroll-smooth">
                {GOALS.map((goal) => {
                  const IconComponent = goal.icon;
                  const isChecked = selectedGoals.includes(goal.id);
                  return (
                    <button
                      key={goal.id}
                      type="button"
                      onClick={() => toggleGoal(goal.id)}
                      className="w-full flex items-center justify-between py-2.5 px-1.5 rounded-xl hover:bg-[#FAFAFA] transition-colors duration-150 text-left cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg ${goal.color} flex items-center justify-center transition-all duration-200 group-hover:scale-105`}>
                          <IconComponent className="w-5 h-5 stroke-[2]" />
                        </div>
                        <span 
                          className="font-medium text-[15px] sm:text-[16px] text-text-dark"
                          style={{ fontFamily: '"Calibri", "Candara", sans-serif' }}
                        >
                          {goal.name}
                        </span>
                      </div>

                      {/* Custom circular selection marker right */}
                      <div className="flex items-center justify-center">
                        {isChecked ? (
                          <div className="w-6 h-6 rounded-full bg-brand-green-bright flex items-center justify-center shadow-[0_2px_8px_rgba(20,200,90,0.3)] animate-[pop_0.2s_ease-out_1]">
                            <Check className="w-3.5 h-3.5 stroke-[3] text-white" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-white border border-gray-200" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

        </div>

        {/* Section 4: Premium "Продолжить" button */}
        <div className="w-full px-2 mb-6 flex justify-center">
          <button
            id="btn-continue"
            type="button"
            onClick={props.onNext}
            className="w-full max-w-[340px] h-[58px] rounded-[28px] text-[18px] sm:text-[20px] font-bold text-white volumetric-btn flex items-center justify-center cursor-pointer overflow-hidden relative select-none"
            style={{ fontFamily: '"Calibri", "Candara", sans-serif' }}
          >
            {/* Shimmer glaze overlay inside the button */}
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_3s_infinite_linear]" />
            <div className="absolute top-1 right-8 w-2 h-2 rounded-full bg-white/30 blur-[0.5px]" />
            <span className="relative z-10 drop-shadow-[0_1.5px_2px_rgba(9,102,43,0.35)] tracking-wide">
              Продолжить
            </span>
          </button>
        </div>

      </div>

      {/* Embedded stationary Bottom Bar layout with back logic attached to nav-home */}
      <div className="w-full">
        <BottomBar onHomeClick={props.onBack} />
      </div>

    </div>
  );
}

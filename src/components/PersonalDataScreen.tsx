import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  ChevronLeft, 
  MoreHorizontal, 
  User, 
  Calendar, 
  Ruler, 
  Scale, 
  Heart, 
  Minus, 
  Plus 
} from "lucide-react";
import BottomBar from "./BottomBar";

interface PersonalDataScreenProps {
  onBack: () => void;
  onNext: () => void;
  userName: string;
  setUserName: (val: string) => void;
  userGender: "female" | "male";
  setUserGender: (val: "female" | "male") => void;
  age: number;
  setAge: React.Dispatch<React.SetStateAction<number>>;
  height: number;
  setHeight: React.Dispatch<React.SetStateAction<number>>;
  weight: number;
  setWeight: React.Dispatch<React.SetStateAction<number>>;
  systolic: number;
  setSystolic: React.Dispatch<React.SetStateAction<number>>;
  diastolic: number;
  setDiastolic: React.Dispatch<React.SetStateAction<number>>;
}

export default function PersonalDataScreen(props: PersonalDataScreenProps) {
  const { 
    userName, 
    setUserName, 
    userGender,
    setUserGender,
    age, 
    setAge, 
    height, 
    setHeight, 
    weight, 
    setWeight, 
    systolic, 
    setSystolic, 
    diastolic, 
    setDiastolic 
  } = props;

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    (window as any).currentScreenContext = {
      screen_id: "personal-data",
      screen_title: "Персональный Антропометрический паспорт пользователя",
      current_status: "Редактирование или первичная настройка параметров здоровья организма",
      userName: userName,
      metrics: {
        age_years: age,
        height_cm: height,
        weight_kg: weight,
        blood_pressure: `${systolic}/${diastolic}`,
        gender: userGender
      },
      user_input_values: {
        raw_name: userName,
        gender_selection: userGender
      }
    };

    return () => {
      if ((window as any).currentScreenContext?.screen_id === "personal-data") {
        delete (window as any).currentScreenContext;
      }
    };
  }, [userName, userGender, age, height, weight, systolic, diastolic]);

  // Stepper functions with limits
  const adjustValue = (type: "age" | "height" | "weight" | "systolic" | "diastolic", direction: "up" | "down") => {
    switch (type) {
      case "age":
        setAge(prev => Math.max(1, Math.min(120, direction === "up" ? prev + 1 : prev - 1)));
        break;
      case "height":
        setHeight(prev => Math.max(50, Math.min(250, direction === "up" ? prev + 1 : prev - 1)));
        break;
      case "weight":
        setWeight(prev => Math.max(20, Math.min(300, direction === "up" ? prev + 1 : prev - 1)));
        break;
      case "systolic":
        setSystolic(prev => Math.max(60, Math.min(220, direction === "up" ? prev + 5 : prev - 5)));
        break;
      case "diastolic":
        setDiastolic(prev => Math.max(30, Math.min(140, direction === "up" ? prev + 5 : prev - 5)));
        break;
    }
  };

  return (
    <div className="w-full flex flex-col justify-between" id="personal-data-screen">
      
      {/* Scrollable interior content */}
      <div className="flex-1 px-5 pt-3 pb-2">
        
        {/* Top bar with back button and options (No phone status elements) */}
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
        <div className="text-center flex flex-col gap-1.5 mb-7">
          <h2 
            className="text-[28px] sm:text-[30px] font-bold text-text-dark leading-tight"
            style={{ fontFamily: '"Calibri", "Candara", sans-serif' }}
          >
            Личные данные
          </h2>
          <p 
            className="text-[16px] sm:text-[17px] text-text-muted leading-tight"
            style={{ fontFamily: '"Calibri", "Candara", sans-serif' }}
          >
            Эти данные помогут точнее отслеживать ваш путь
          </p>
        </div>

        {/* Input Blocks Group */}
        <div className="flex flex-col gap-4.5 mb-8">
          
          {/* Card 1: Имя */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_18px_rgba(43,49,55,0.03)] p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-brand-green-pure/10 flex items-center justify-center text-brand-green-dark">
                <User className="w-4.5 h-4.5 stroke-[2.3]" />
              </div>
              <span 
                className="text-[16px] sm:text-[17px] font-bold text-text-dark"
                style={{ fontFamily: '"Calibri", "Candara", sans-serif' }}
              >
                Имя
              </span>
            </div>
            
            <input 
              type="text" 
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Введите имя"
              className="w-full h-12 px-4 rounded-xl bg-[#FAFAFA] border border-gray-100 shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)] text-[16px] focus:outline-none focus:border-brand-green-pure/40 focus:bg-white hover:bg-white text-text-dark placeholder-gray-300 font-normal transition-all duration-200"
              style={{ fontFamily: '"Calibri", "Candara", sans-serif' }}
            />
          </div>

          {/* Card: Пол человека */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_18px_rgba(43,49,55,0.03)] p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-brand-green-pure/10 flex items-center justify-center text-brand-green-dark">
                <User className="w-4.5 h-4.5 stroke-[2.3]" />
              </div>
              <span 
                className="text-[16px] sm:text-[17px] font-bold text-text-dark"
                style={{ fontFamily: '"Calibri", "Candara", sans-serif' }}
              >
                Ваш пол
              </span>
            </div>
            
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setUserGender("female")}
                className={`flex-1 h-11 rounded-xl text-[14.5px] font-bold transition-all duration-300 border flex items-center justify-center gap-1.5 cursor-pointer ${
                  userGender === "female"
                    ? "bg-[#E8F8EE] border-[#10D150] text-[#16B551]"
                    : "bg-[#FAFAFA] border-gray-100 text-text-sec hover:bg-gray-50"
                }`}
                style={{ fontFamily: '"Calibri", "Candara", sans-serif' }}
              >
                <span>Женский 👩</span>
              </button>
              <button
                type="button"
                onClick={() => setUserGender("male")}
                className={`flex-1 h-11 rounded-xl text-[14.5px] font-bold transition-all duration-300 border flex items-center justify-center gap-1.5 cursor-pointer ${
                  userGender === "male"
                    ? "bg-[#E8F8EE] border-[#10D150] text-[#16B551]"
                    : "bg-[#FAFAFA] border-gray-100 text-text-sec hover:bg-gray-50"
                }`}
                style={{ fontFamily: '"Calibri", "Candara", sans-serif' }}
              >
                <span>Мужской 👨</span>
              </button>
            </div>
          </div>

          {/* Card 2: Возраст */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_18px_rgba(43,49,55,0.03)] p-4 flex flex-col gap-3 relative overflow-hidden">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-brand-green-pure/10 flex items-center justify-center text-brand-green-dark">
                <Calendar className="w-4.5 h-4.5 stroke-[2.3]" />
              </div>
              <span 
                className="text-[16px] sm:text-[17px] font-bold text-text-dark"
                style={{ fontFamily: '"Calibri", "Candara", sans-serif' }}
              >
                Возраст
              </span>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button 
                type="button"
                onClick={() => adjustValue("age", "down")}
                className="w-10 h-10 rounded-lg bg-white border border-gray-100 shadow-[0_2px_6px_rgba(0,0,0,0.03)] flex items-center justify-center text-text-sec active:scale-90 hover:border-gray-200 cursor-pointer"
              >
                <Minus className="w-4 h-4 stroke-[2.5]" />
              </button>

              <div className="w-20 h-10 rounded-lg bg-white border border-gray-100 flex items-center justify-center">
                <span 
                  className="text-[19px] sm:text-[20px] font-bold text-text-dark"
                  style={{ fontFamily: '"Calibri", "Candara", sans-serif' }}
                >
                  {age}
                </span>
              </div>

              <button 
                type="button"
                onClick={() => adjustValue("age", "up")}
                className="w-10 h-10 rounded-lg bg-white border border-gray-100 shadow-[0_2px_6px_rgba(0,0,0,0.03)] flex items-center justify-center text-text-sec active:scale-90 hover:border-gray-200 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {/* Decorative glassy circle detail on right mimicking the reference artwork */}
            <div className="absolute right-[-20px] top-[30%] w-24 h-24 rounded-full bg-brand-green-pure/3 blur-sm border border-brand-green-pure/5 pointer-events-none" />
          </div>

          {/* Card 3: Рост, см */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_18px_rgba(43,49,55,0.03)] p-4 flex flex-col gap-3 relative overflow-hidden">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-brand-green-pure/10 flex items-center justify-center text-brand-green-dark">
                <Ruler className="w-4.5 h-4.5 stroke-[2.3]" />
              </div>
              <span 
                className="text-[16px] sm:text-[17px] font-bold text-text-dark"
                style={{ fontFamily: '"Calibri", "Candara", sans-serif' }}
              >
                Рост, см
              </span>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button 
                type="button"
                onClick={() => adjustValue("height", "down")}
                className="w-10 h-10 rounded-lg bg-white border border-gray-100 shadow-[0_2px_6px_rgba(0,0,0,0.03)] flex items-center justify-center text-text-sec active:scale-90 hover:border-gray-200 cursor-pointer"
              >
                <Minus className="w-4 h-4 stroke-[2.5]" />
              </button>

              <div className="w-20 h-10 rounded-lg bg-white border border-gray-100 flex items-center justify-center">
                <span 
                  className="text-[19px] sm:text-[20px] font-bold text-text-dark"
                  style={{ fontFamily: '"Calibri", "Candara", sans-serif' }}
                >
                  {height}
                </span>
              </div>

              <button 
                type="button"
                onClick={() => adjustValue("height", "up")}
                className="w-10 h-10 rounded-lg bg-white border border-gray-100 shadow-[0_2px_6px_rgba(0,0,0,0.03)] flex items-center justify-center text-text-sec active:scale-90 hover:border-gray-200 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {/* Decorative glassy circle detail */}
            <div className="absolute right-[-20px] top-[30%] w-24 h-24 rounded-full bg-brand-green-pure/3 blur-sm border border-brand-green-pure/5 pointer-events-none" />
          </div>

          {/* Card 4: Вес, кг */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_18px_rgba(43,49,55,0.03)] p-4 flex flex-col gap-3 relative overflow-hidden">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-brand-green-pure/10 flex items-center justify-center text-brand-green-dark">
                <Scale className="w-4.5 h-4.5 stroke-[2.3]" />
              </div>
              <span 
                className="text-[16px] sm:text-[17px] font-bold text-text-dark"
                style={{ fontFamily: '"Calibri", "Candara", sans-serif' }}
              >
                Вес, кг
              </span>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button 
                type="button"
                onClick={() => adjustValue("weight", "down")}
                className="w-10 h-10 rounded-lg bg-white border border-gray-100 shadow-[0_2px_6px_rgba(0,0,0,0.03)] flex items-center justify-center text-text-sec active:scale-90 hover:border-gray-200 cursor-pointer"
              >
                <Minus className="w-4 h-4 stroke-[2.5]" />
              </button>

              <div className="w-20 h-10 rounded-lg bg-white border border-gray-100 flex items-center justify-center">
                <span 
                  className="text-[19px] sm:text-[20px] font-bold text-text-dark"
                  style={{ fontFamily: '"Calibri", "Candara", sans-serif' }}
                >
                  {weight}
                </span>
              </div>

              <button 
                type="button"
                onClick={() => adjustValue("weight", "up")}
                className="w-10 h-10 rounded-lg bg-white border border-gray-100 shadow-[0_2px_6px_rgba(0,0,0,0.03)] flex items-center justify-center text-text-sec active:scale-90 hover:border-gray-200 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {/* Decorative glassy circle detail */}
            <div className="absolute right-[-20px] top-[30%] w-24 h-24 rounded-full bg-brand-green-pure/3 blur-sm border border-brand-green-pure/5 pointer-events-none" />
          </div>

          {/* Card 5: Давление */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_18px_rgba(43,49,55,0.03)] p-4 flex flex-col gap-3 relative overflow-hidden">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-brand-green-pure/10 flex items-center justify-center text-brand-green-dark">
                <Heart className="w-4.5 h-4.5 stroke-[2.3]" />
              </div>
              <div className="flex flex-col">
                <span 
                  className="text-[16px] sm:text-[17px] font-bold text-text-dark leading-tight"
                  style={{ fontFamily: '"Calibri", "Candara", sans-serif' }}
                >
                  Давление
                </span>
                <span 
                  className="text-[11px] sm:text-[12px] text-text-muted font-normal leading-none"
                  style={{ fontFamily: '"Calibri", "Candara", sans-serif' }}
                >
                  (необязательно)
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button 
                type="button"
                onClick={() => {
                  adjustValue("systolic", "down");
                  adjustValue("diastolic", "down");
                }}
                className="w-10 h-10 rounded-lg bg-white border border-gray-100 shadow-[0_2px_6px_rgba(0,0,0,0.03)] flex items-center justify-center text-text-sec active:scale-90 hover:border-gray-200 cursor-pointer"
              >
                <Minus className="w-4 h-4 stroke-[2.5]" />
              </button>

              <div className="px-3 h-10 rounded-lg bg-white border border-gray-100 flex items-center justify-center min-w-[90px]">
                <span 
                  className="text-[19px] sm:text-[20px] font-bold text-text-dark whitespace-nowrap"
                  style={{ fontFamily: '"Calibri", "Candara", sans-serif' }}
                >
                  {systolic} / {diastolic}
                </span>
              </div>

              <button 
                type="button"
                onClick={() => {
                  adjustValue("systolic", "up");
                  adjustValue("diastolic", "up");
                }}
                className="w-10 h-10 rounded-lg bg-white border border-gray-100 shadow-[0_2px_6px_rgba(0,0,0,0.03)] flex items-center justify-center text-text-sec active:scale-90 hover:border-gray-200 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {/* Decorative glassy circle detail */}
            <div className="absolute right-[-20px] top-[30%] w-24 h-24 rounded-full bg-brand-green-pure/3 blur-sm border border-brand-green-pure/5 pointer-events-none" />
          </div>

        </div>

        {/* Section 4: Premium "Далее" button */}
        <div className="w-full px-2 mb-6 flex justify-center">
          <button
            id="btn-next"
            type="button"
            onClick={props.onNext}
            className="w-full max-w-[340px] h-[58px] rounded-[28px] text-[18px] sm:text-[20px] font-bold text-white volumetric-btn flex items-center justify-center cursor-pointer overflow-hidden relative select-none"
            style={{ fontFamily: '"Calibri", "Candara", sans-serif' }}
          >
            {/* Shimmer glaze overlay inside the button */}
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_3s_infinite_linear]" />
            <div className="absolute top-1 right-8 w-2 h-2 rounded-full bg-white/30 blur-[0.5px]" />
            <span className="relative z-10 drop-shadow-[0_1.5px_2px_rgba(9,102,43,0.35)] tracking-wide">
              Далее
            </span>
          </button>
        </div>

      </div>

      {/* Embedded stationary Bottom Bar layout */}
      <div className="w-full">
        <BottomBar />
      </div>

    </div>
  );
}

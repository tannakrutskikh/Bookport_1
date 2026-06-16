import React, { useRef, useState } from "react";
import { Home, ClipboardList, BarChart3, Settings, User, PlusCircle } from "lucide-react";

interface BottomBarProps {
  onHomeClick?: () => void;
  onDiaryClick?: () => void;
  onAnalyticsClick?: () => void;
  onProfileClick?: () => void;
  onAnnaClick?: () => void;
  activeTab?: "my-day" | "add-food" | "progress" | "cellular-impulse" | "home" | "diary" | "anna" | "settings";
}

export default function BottomBar({ 
  onHomeClick, 
  onDiaryClick, 
  onAnalyticsClick, 
  onProfileClick,
  onAnnaClick,
  activeTab = "my-day" 
}: BottomBarProps) {
  const pressStartTimeRef = useRef<number>(0);
  const isHoldingRef = useRef<boolean>(false);
  const [isHolding, setIsHolding] = useState<boolean>(false);

  return (
    <div className="w-full bg-white/95 backdrop-blur-md rounded-t-[32px] rounded-b-[40px] px-2 py-4 border-t border-gray-100 shadow-[0_-12px_30px_rgba(43,49,55,0.02)] flex items-center justify-between relative mt-4 select-none">
      {/* Dynamic soft shadow accent behind the central Anna button */}
      {activeTab !== "anna" && (
        <div className="absolute left-1/2 -top-5 -translate-x-1/2 w-20 h-20 bg-brand-green-pure/20 rounded-full blur-xl pointer-events-none" />
      )}

      {/* Item 1: Мой день */}
      <button 
        id="nav-home"
        type="button"
        onClick={onHomeClick}
        className="flex-1 flex flex-col items-center justify-center gap-1 py-0.5 transition-all duration-200 cursor-pointer active:scale-95 text-center"
      >
        <div className={`w-7 h-7 flex items-center justify-center ${
          activeTab === "my-day" || activeTab === "home"
            ? "text-[#16B551]" 
            : "text-[#737C86] hover:text-brand-green-dark"
        }`}>
          <Home className="w-6 h-6 stroke-[2]" />
        </div>
        <span 
          className={`text-[12px] sm:text-[13px] font-bold leading-none tracking-tight ${
            activeTab === "my-day" || activeTab === "home"
              ? "text-[#16B551]"
              : "text-[#737C86]"
          }`}
          style={{ fontFamily: '"Calibri", "Candara", sans-serif' }}
        >
          Мой день
        </span>
      </button>

      {/* Item 2: Добавить еду */}
      <button 
        id="nav-diary"
        type="button"
        onClick={onDiaryClick}
        className="flex-1 flex flex-col items-center justify-center gap-1 py-0.5 transition-all duration-200 cursor-pointer active:scale-95 text-center"
      >
        <div className={`w-7 h-7 flex items-center justify-center ${
          activeTab === "add-food" || activeTab === "diary"
            ? "text-[#16B551]" 
            : "text-[#737C86] hover:text-brand-green-dark"
        }`}>
          <PlusCircle className="w-6 h-6 stroke-[1.8]" />
        </div>
        <span 
          className={`text-[12px] sm:text-[13px] font-bold leading-none tracking-tight ${
            activeTab === "add-food" || activeTab === "diary"
              ? "text-[#16B551]"
              : "text-[#737C86]"
          }`}
          style={{ fontFamily: '"Calibri", "Candara", sans-serif' }}
        >
          Добавить еду
        </span>
      </button>

      {/* Central Volumetric Anna / Voice Chat Button */}
      <div className="relative -top-7 mx-2 z-10 shrink-0">
        <button
          id="nav-anna-voice"
          type="button"
          aria-label="Анна - Голосовой помощник"
          onPointerDown={(e) => {
            if (activeTab === "anna") return;
            
            // Set pointer capture to catch releasing outside bounds
            try {
              e.currentTarget.setPointerCapture(e.pointerId);
            } catch (capErr) {
              console.warn("setPointerCapture not supported:", capErr);
            }
            
            pressStartTimeRef.current = Date.now();
            isHoldingRef.current = true;
            setIsHolding(true);
            
            // Dispatch event to open overlay in connecting/listening state
            window.dispatchEvent(new CustomEvent("anna-overlay-start-press"));
          }}
          onPointerUp={(e) => {
            if (activeTab === "anna") return;
            
            try {
              e.currentTarget.releasePointerCapture(e.pointerId);
            } catch (relErr) {}
            
            if (!isHoldingRef.current) return;
            
            isHoldingRef.current = false;
            setIsHolding(false);
            
            const pressDuration = Date.now() - pressStartTimeRef.current;
            if (pressDuration < 350) {
              // It's a short tap! Cancel background speech overlay and navigate to "Анна на связи"
              window.dispatchEvent(new CustomEvent("anna-overlay-cancel-press"));
              if (onAnnaClick) {
                onAnnaClick();
              } else {
                window.dispatchEvent(new CustomEvent("open-anna-screen"));
              }
            } else {
              // It's a long press release! Submit message to active overlay screen
              window.dispatchEvent(new CustomEvent("anna-overlay-end-press"));
            }
          }}
          onPointerCancel={(e) => {
            if (activeTab === "anna") return;
            
            try {
              e.currentTarget.releasePointerCapture(e.pointerId);
            } catch (relErr) {}
            
            if (!isHoldingRef.current) return;
            isHoldingRef.current = false;
            setIsHolding(false);
            
            window.dispatchEvent(new CustomEvent("anna-overlay-cancel-press"));
          }}
          onClick={(e) => {
            // Prevent additional click interference since we handle tap inside pointer events
            e.preventDefault();
            e.stopPropagation();
          }}
          className={`w-[74px] h-[74px] rounded-full flex items-center justify-center transition-all duration-300 relative select-none ${
            activeTab === "anna" ? "cursor-default" : "hover:scale-[1.04] active:scale-95 cursor-pointer"
          } ${isHolding ? "scale-110" : ""}`}
        >
          {/* Outer glowing glass protection ring */}
          <div className={`absolute inset-[-6px] rounded-full bg-white border border-gray-100 flex items-center justify-center transition-all ${
            activeTab === "anna" 
              ? "shadow-none" 
              : isHolding 
              ? "shadow-[0_0_20px_rgba(22,181,81,0.4)] border-brand-green-bright/30"
              : "shadow-[0_8px_16px_rgba(16,181,81,0.12)]"
          }`}>
            {/* Soft secondary overlay ring */}
            {activeTab !== "anna" && (
              <div className="absolute inset-[2px] rounded-full bg-gradient-to-tr from-brand-green-mint/20 to-transparent" />
            )}
          </div>

          {/* Core volumetric green sphere button */}
          <div className={`absolute inset-0 rounded-full flex items-center justify-center overflow-hidden transition-all ${
            activeTab === "anna"
              ? "bg-[#D8ECD9] text-[#789D80] border border-[#CBDCCB]"
              : isHolding
              ? "bg-gradient-to-b from-brand-green-bright to-brand-green-dark shadow-[inset_0_2px_4px_rgba(0,0,0,0.2),_0_4px_8px_rgba(22,181,81,0.2)]"
              : "bg-gradient-to-b from-brand-green-light through-brand-green-bright to-brand-green-dark shadow-[inset_0_4px_6px_rgba(255,255,255,0.5),_inset_0_-4px_8px_rgba(8,91,36,0.5),_0_6px_14px_rgba(16,181,81,0.35)]"
          }`}>
            {/* Curved light glazed reflection */}
            {activeTab !== "anna" && (
              <div className="absolute top-1 left-[15%] right-[15%] h-[30%] rounded-full bg-gradient-to-b from-white/60 to-transparent pointer-events-none" />
            )}
            
            {/* Highlight sparkle */}
            {activeTab !== "anna" && (
              <div className="absolute bottom-1 right-2 w-4 h-4 rounded-full bg-white/10 blur-[1px] pointer-events-none" />
            )}

            {/* Speech bubble icon containing three dots */}
            <div className="relative z-10 flex flex-col gap-1 items-center justify-center scale-110">
              <div className="relative">
                {/* Custom glowing white message bubble container */}
                <div className={`w-7 h-6 rounded-[10px] flex items-center justify-center shadow-sm relative after:content-[''] after:absolute after:bottom-[-4px] after:left-[35%] after:w-0 after:h-0 after:border-t-[5px] after:border-x-[4px] after:border-x-transparent ${
                  activeTab === "anna"
                    ? "bg-[#F3F8F4] after:border-t-[#F3F8F4]"
                    : "bg-white after:border-t-white"
                }`}>
                  {/* Three friendly voice assistance dots inside */}
                  <div className="flex gap-1 items-center justify-center">
                    <span 
                      className={`w-1 h-1 rounded-full ${
                        activeTab === "anna" 
                          ? "bg-[#789D80]" 
                          : "bg-brand-green-dark animate-ping"
                      }`} 
                      style={activeTab === "anna" ? undefined : { animationDuration: '1.4s' }} 
                    />
                    <span className={`w-1 h-1 rounded-full ${activeTab === "anna" ? "bg-[#789D80]" : "bg-brand-green-dark"}`} />
                    <span className={`w-1 h-1 rounded-full ${activeTab === "anna" ? "bg-[#789D80]" : "bg-brand-green-dark"}`} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </button>
      </div>

      {/* Item 3: Прогресс */}
      <button 
        id="nav-analytics"
        type="button"
        onClick={onAnalyticsClick}
        className="flex-1 flex flex-col items-center justify-center gap-1 py-0.5 transition-all duration-200 cursor-pointer active:scale-95 text-center"
      >
        <div className={`w-7 h-7 flex items-center justify-center ${
          activeTab === "progress"
            ? "text-[#16B551]" 
            : "text-[#737C86] hover:text-brand-green-dark"
        }`}>
          <BarChart3 className="w-6 h-6 stroke-[1.8]" />
        </div>
        <span 
          className={`text-[12px] sm:text-[13px] font-bold leading-none tracking-tight ${
            activeTab === "progress"
              ? "text-[#16B551]"
              : "text-[#737C86]"
          }`}
          style={{ fontFamily: '"Calibri", "Candara", sans-serif' }}
        >
          Прогресс
        </span>
      </button>

      {/* Item 4: Настройки */}
      <button 
        id="nav-profile"
        type="button"
        onClick={() => {
          if (onProfileClick) {
            onProfileClick();
          } else {
            window.dispatchEvent(new CustomEvent("open-settings-screen"));
          }
        }}
        className="flex-1 flex flex-col items-center justify-center gap-1.5 py-0.5 transition-all duration-200 cursor-pointer active:scale-95 text-center"
      >
        <div className={`w-11 h-11 rounded-[14px] flex items-center justify-center transition-all duration-300 ${
          activeTab === "cellular-impulse" || activeTab === "settings"
            ? "bg-gradient-to-b from-[#F8FAFC] via-[#E2E8F0] to-[#94A3B8] border border-[#64748B]/30 shadow-[0_5px_15px_rgba(100,116,139,0.3),_inset_0_2px_3px_rgba(255,255,255,0.9),_inset_0_-2px_4px_rgba(71,85,105,0.25)] text-[#334155]" 
            : "text-[#737C86] hover:bg-slate-50 hover:text-[#475569] bg-transparent border border-transparent"
        }`}>
          <Settings className={`w-5.5 h-5.5 stroke-[2] ${
            activeTab === "cellular-impulse" || activeTab === "settings" ? "animate-spin-slow text-[#334155]" : ""
          }`} />
        </div>
        <span 
          className={`text-[12px] sm:text-[12.5px] font-black leading-none tracking-tight transition-colors ${
            activeTab === "cellular-impulse" || activeTab === "settings"
              ? "text-[#475569]"
              : "text-[#737C86]"
          }`}
          style={{ fontFamily: '"Calibri", "Candara", sans-serif' }}
        >
          Настройки
        </span>
      </button>

      {/* Simulated Home Indicator bar inside our application's viewport bottom area */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-[5px] bg-[#E2E8F0]/80 rounded-full text-center" />
    </div>
  );
}

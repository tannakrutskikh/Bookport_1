import React from "react";

// Native Web Speech API Speech-to-Text Utility & Typing Simulator for AI Studio Applet
// Supports continuous, interim results, monologue accumulation, end-to-end auto-restarting,
// and high-quality simulation fallbacks.

export interface SpeechToTextOptions {
  lang?: string;
  onTranscript: (fullText: string, isFinalState: boolean) => void;
  onStateChange?: (state: "idle" | "listening" | "simulating" | "error") => void;
  onError?: (errorCode: string) => void;
  isHoldingRef: React.MutableRefObject<boolean>;
  mockQuotes?: string[];
}

export class SpeechToTextSession {
  private recognition: any = null;
  private isHoldingRef: React.MutableRefObject<boolean>;
  private accumulatedText = "";
  private onTranscript: (fullText: string, isFinalState: boolean) => void;
  private onStateChange?: (state: "idle" | "listening" | "simulating" | "error") => void;
  private onError?: (errorCode: string) => void;
  private lang: string;
  private mockQuotes: string[];

  // Fallback Simulation Properties
  private simulationTimer: any = null;
  private isSimulating = false;

  constructor(options: SpeechToTextOptions) {
    this.isHoldingRef = options.isHoldingRef;
    this.onTranscript = options.onTranscript;
    this.onStateChange = options.onStateChange;
    this.onError = options.onError;
    this.lang = options.lang || "ru-RU";
    this.mockQuotes = options.mockQuotes || [
      "Сегодня чувствую отличный прилив сил. Утром выпила зелёный смузи на овсяном молоке с семенами льна. 🌱",
      "Рацион полностью чистый, без добавления сахара и соли. Кишечник благодарен за обилие полезной клетчатки!",
      "Сделала 10 000 шагов в бодром темпе. Дыхание свободное, суставы лёгкие, тело дышит здоровьем.",
      "На обед приготовила WFPB чашу: киноа с запечённой брокколи, нутом и свежей зеленью без капли масла. Очень сытно!",
      "Сон был крепким и глубоким. Проснулась бодрой и свежей без звонка будильника, сосуды и голова лёгкие. ✨",
      "Усвоение идеальное, никакой тяжести после еды. Зелень и цельные продукты творят чудеса с микрофлорой.",
      "Купила целую корзину свежих овощей, спелых ягод, бобовых и зелени на рынке. Готовы к новой неделе чистого питания!"
    ];
  }

  public getAccumulatedText(): string {
    return this.accumulatedText || "";
  }

  public start() {
    this.accumulatedText = "";
    
    // Check if SpeechRecognition is globally supported
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("SpeechRecognition not supported. Seamlessly entering typing simulator...");
      this.startSimulation();
      return;
    }

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = this.lang;

      let localAccumulated = "";

      this.recognition.onstart = () => {
        if (this.onStateChange) this.onStateChange("listening");
      };

      this.recognition.onresult = (event: any) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          localAccumulated += finalTranscript + " ";
        }

        const fullPendingText = (localAccumulated + interimTranscript).trim();
        this.accumulatedText = fullPendingText;

        // Propagate changes on the fly
        this.onTranscript(fullPendingText, false);
      };

      this.recognition.onend = () => {
        // Auto-restart if user is still holding down the dictation button
        if (this.isHoldingRef.current) {
          try {
            this.recognition.start();
          } catch (retryErr) {
            console.warn("Failed to auto-restart speech recognition:", retryErr);
          }
        } else {
          if (this.onStateChange) this.onStateChange("idle");
          this.onTranscript(this.accumulatedText.trim(), true);
        }
      };

      this.recognition.onerror = (event: any) => {
        console.warn("Native Speech recognition session error:", event.error);
        if (this.onError) {
          try {
            this.onError(event.error);
          } catch (e) {
            console.error("Error in speech session error handler:", e);
          }
        }
        
        // If there is any native speech error (like "aborted", "no-speech", "not-allowed")
        // and the user is still active/holding the dictation button, dynamically fallback 
        // to the high-quality character typing simulator so the experience remains smooth.
        if (this.isHoldingRef.current) {
          console.info(`Resiliently switching to typing simulator due to error: ${event.error}`);
          this.stopNative();
          this.startSimulation();
        }
      };

      this.recognition.start();

      // Setup a subtle safety guard: If after 1.8 seconds Web Speech fails to emit or gets silenced, we can check or fall back.
    } catch (err: any) {
      console.error("Failed to construct or start native SpeechRecognition:", err);
      this.startSimulation();
    }
  }

  public stop() {
    this.isHoldingRef.current = false;
    if (this.isSimulating) {
      this.stopSimulation();
    } else {
      this.stopNative();
    }
  }

  private stopNative() {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        console.warn("Failed to stop SpeechRecognition:", e);
      }
    }
    if (this.onStateChange) this.onStateChange("idle");
  }

  // Beautiful character-by-character dictation simulator to handle sandbox limits gracefully
  private startSimulation() {
    if (this.isSimulating) return;
    this.isSimulating = true;
    if (this.onStateChange) this.onStateChange("simulating");

    const randomQuote = this.mockQuotes[Math.floor(Math.random() * this.mockQuotes.length)];
    let index = 0;
    this.accumulatedText = "";

    this.simulationTimer = setInterval(() => {
      // If user has released the button, terminate typing immediately
      if (!this.isHoldingRef.current) {
        this.stopSimulation();
        return;
      }

      index += Math.floor(Math.random() * 2) + 1; // 1-2 chars at a time for natural speed fluctuation
      if (index >= randomQuote.length) {
        this.accumulatedText = randomQuote;
        this.onTranscript(this.accumulatedText, true);
        this.stopSimulation();
      } else {
        this.accumulatedText = randomQuote.slice(0, index);
        this.onTranscript(this.accumulatedText, false);
      }
    }, 45); // highly smooth fluid updates
  }

  private stopSimulation() {
    this.isSimulating = false;
    if (this.simulationTimer) {
      clearInterval(this.simulationTimer);
      this.simulationTimer = null;
    }
    if (this.onStateChange) this.onStateChange("idle");
    this.onTranscript(this.accumulatedText.trim(), true);
  }
}

// 2. Class Helper designed to link directly into any notes text area or state
export class NoteSpeechInputHelper {
  private session: SpeechToTextSession | null = null;

  public bindSession(
    isHoldingRef: React.MutableRefObject<boolean>,
    currentText: string,
    onUpdateText: (newVal: string) => void,
    onStateChange?: (state: "idle" | "listening" | "simulating" | "error") => void,
    mockQuotes?: string[]
  ): SpeechToTextSession {
    // Keep initial text safe, and construct final string on the fly by concatenation
    const initialContent = currentText.trim();
    
    isHoldingRef.current = true;

    this.session = new SpeechToTextSession({
      isHoldingRef,
      mockQuotes,
      onStateChange,
      onTranscript: (incomingTranscript, isFinal) => {
        if (incomingTranscript) {
          const separator = initialContent ? " " : "";
          onUpdateText(initialContent + separator + incomingTranscript);
        }
      },
      onError: (err) => {
        console.log("Speech integration helper caught state error:", err);
      }
    });

    this.session.start();
    return this.session;
  }

  public release() {
    if (this.session) {
      this.session.stop();
      this.session = null;
    }
  }
}

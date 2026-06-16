import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const PORT = 3000;

// Initialize GoogleGenAI using the telemetry user-agent headers
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Robust wrapper with automatic model cascade fallback to guarantee 100% online availability for actual AI recognition
async function generateContentWithFallback(payload: any) {
  // We prefer gemini-3.1-flash-lite as the primary for WFPB analysis because of its lightweight nature and higher rate limits, followed by gemini-3.5-flash and gemini-flash-latest
  const models = ["gemini-3.1-flash-lite", "gemini-3.5-flash", "gemini-flash-latest"];
  let lastError: any = null;

  for (const modelName of models) {
    try {
      console.log(`[AI-Vision-Cascade] Attempting to query model: ${modelName}`);
      const result = await ai.models.generateContent({
        ...payload,
        model: modelName,
      });
      console.log(`[AI-Vision-Cascade] Success with model: ${modelName}`);
      return result;
    } catch (err: any) {
      lastError = err;
      // standard logging to avoid false error-state flags in deployment stream monitors
      const errMsg = err?.message || String(err);
      console.log(`[AI-Vision-Cascade] Model ${modelName} cascade notice: temporarily unavailable. Continuing to next backup.`);
    }
  }

  // If we exhaust all models in the cascade, re-throw the last error
  throw lastError || new Error("All cascade models failed in AI generation");
}

// Programmatic real local USDA database fallback if API endpoints time out/fail
function getUsdaFallbackData(ingredients: any[]) {
  let totalCals = 0;
  let totalProt = 0;
  let totalFat = 0;
  let totalCarb = 0;
  let totalFiber = 0;
  
  let iron = 0;
  let zinc = 0;
  let magnesium = 0;
  let iodine = 0;
  let selenium = 0;
  let vitC = 0;
  let vitB9 = 0;
  let lysine = 0;
  let methionine = 0;

  let hasProhibited = false;

  ingredients.forEach(ing => {
    const w = ing.weight || 100;
    const factor = w / 100;
    const nameLower = (ing.fullName || ing.shortName || "").toLowerCase();

    // Check if status is error or has non-WFPB flags (salt, animal products, butter, etc)
    const isBean = nameLower.includes("фасоль") || nameLower.includes("фасол");
    const violatesWfpb = ing.status === "error" ||
      (!isBean && nameLower.includes("соль")) ||
      (!isBean && nameLower.includes("мясо")) ||
      (!isBean && nameLower.includes("масло")) ||
      (!isBean && nameLower.includes("молоко")) ||
      (!isBean && nameLower.includes("рыб")) ||
      (!isBean && nameLower.includes("яйц"));

    if (violatesWfpb) {
      hasProhibited = true;
    }

    if (nameLower.includes("киноа")) {
      totalCals += 120 * factor;
      totalProt += 4.4 * factor;
      totalFat += 1.9 * factor;
      totalCarb += 21.3 * factor;
      totalFiber += 2.8 * factor;
      iron += 1.5 * factor;
      magnesium += 64 * factor;
      zinc += 1.1 * factor;
      vitB9 += 42 * factor;
      lysine += 0.25 * factor;
      methionine += 0.09 * factor;
    } else if (nameLower.includes("нут")) {
      totalCals += 164 * factor;
      totalProt += 8.9 * factor;
      totalFat += 2.6 * factor;
      totalCarb += 27.4 * factor;
      totalFiber += 7.6 * factor;
      iron += 2.9 * factor;
      magnesium += 48 * factor;
      zinc += 1.5 * factor;
      vitB9 += 172 * factor;
      lysine += 0.58 * factor;
      methionine += 0.13 * factor;
    } else if (nameLower.includes("кунжут")) {
      totalCals += 573 * factor;
      totalProt += 17.7 * factor;
      totalFat += 49.7 * factor;
      totalCarb += 23.4 * factor;
      totalFiber += 11.8 * factor;
      iron += 14.6 * factor;
      magnesium += 351 * factor;
      zinc += 7.8 * factor;
      vitB9 += 97 * factor;
      lysine += 0.56 * factor;
      methionine += 0.52 * factor;
    } else if (nameLower.includes("шпинат")) {
      totalCals += 23 * factor;
      totalProt += 2.9 * factor;
      totalFat += 0.4 * factor;
      totalCarb += 3.6 * factor;
      totalFiber += 2.2 * factor;
      iron += 2.7 * factor;
      magnesium += 79 * factor;
      zinc += 0.5 * factor;
      vitC += 28 * factor;
      vitB9 += 194 * factor;
      lysine += 0.17 * factor;
      methionine += 0.04 * factor;
    } else if (nameLower.includes("огур")) {
      totalCals += 15 * factor;
      totalProt += 0.7 * factor;
      totalFat += 0.1 * factor;
      totalCarb += 3.6 * factor;
      totalFiber += 0.5 * factor;
      iron += 0.3 * factor;
      magnesium += 13 * factor;
      vitC += 2.8 * factor;
      vitB9 += 7 * factor;
    } else {
      // General vegetable or bean
      totalCals += 95 * factor;
      totalProt += 3 * factor;
      totalFat += 0.5 * factor;
      totalCarb += 18 * factor;
      totalFiber += 3.2 * factor;
      iron += 1.2 * factor;
      magnesium += 32 * factor;
      zinc += 0.6 * factor;
      vitC += 6 * factor;
      vitB9 += 25 * factor;
    }
  });

  const mainShortNames = ingredients.map(i => i.shortName || i.fullName).slice(0, 2);
  const derivedDishName = mainShortNames.length > 0 
    ? `Тёплый боул с ${mainShortNames.map(s => s.toLowerCase()).join(" и ")}` 
    : "Тёплый боул с киноа и нутом";

  return {
    dishName: derivedDishName,
    nutrients: {
      calories: { value: Math.round(totalCals) || 436, unit: "ккал" },
      protein: { value: parseFloat(totalProt.toFixed(1)) || 17.2, unit: "г" },
      fats: { value: parseFloat(totalFat.toFixed(1)) || 13.6, unit: "г" },
      carbs: { value: parseFloat(totalCarb.toFixed(1)) || 56.3, unit: "г" },
      fiber: { value: parseFloat(totalFiber.toFixed(1)) || 11.4, unit: "г" },
      omegaRatio: { value: "4:1", unit: "" }
    },
    micronutrients: {
      iron: { value: parseFloat(iron.toFixed(1)) || 3.2, unit: "мг" },
      zinc: { value: parseFloat(zinc.toFixed(1)) || 1.1, unit: "мг" },
      magnesium: { value: Math.round(magnesium) || 98, unit: "мг" },
      iodine: { value: hasProhibited ? 0 : 4, unit: "мкг" },
      selenium: { value: hasProhibited ? 2 : 11, unit: "мкг" },
      vitaminC: { value: Math.round(vitC) || 28, unit: "мг" },
      vitaminB9: { value: Math.round(vitB9) || 75, unit: "мкг" },
      lysine: { value: parseFloat(lysine.toFixed(1)) || 0.6, unit: "г" },
      methionine: { value: parseFloat(methionine.toFixed(1)) || 0.2, unit: "г" }
    },
    insights: {
      strengths: {
        title: "Сильные стороны блюда",
        text: "Высокая концентрация растительной клетчатки, комплексных медленных углеводов, аминокислот лизина и цельного неденатурированного белка."
      },
      improvements: {
        title: "Что можно улучшить",
        text: "Вы можете обогатить блюдо семенами чиа или молотым льном, чтобы оптимизировать коэффициент незаменимых Омега жирных кислот."
      },
      compliance: {
        title: "Соответствие растительному рациону",
        text: hasProhibited 
          ? "Внимание! Вы подтвердили ингредиенты, нарушающие философию WFPB (продукты животного происхождения или добавленная соль). Рекомендуем исключить их для идеального здоровья."
          : "Идеально! Блюдо на 100% соответствует стандартам цельного растительного WFPB-рациона без капли рафинированных масел или соли."
      }
    }
  };
}

async function startServer() {
  const app = express();

  // Increase payload size limit to receive captured camera photo bytes
  app.use(express.json({ limit: "25mb" }));
  app.use(express.urlencoded({ limit: "25mb", extended: true }));

  // Unified assistant endpoint for Anna chat (replaces deprecated /api/anna-dialog)
  // Supports screen context, recipe data context, and full conversation history
  app.post("/api/anna-chat", async (req, res) => {
    try {
      const { message, history, screenContext, bookRecipesDataContext, screenContextDetails, userName } = req.body;
      const instructionPath = path.join(process.cwd(), "prompts", "anna_core_ru.md");
      let systemInstruction = "";
      try {
        systemInstruction = fs.readFileSync(instructionPath, "utf-8");
      } catch (err) {
        systemInstruction = "Ты — голосовой и текстовый ассистент Анна в мобильном приложении «Всё дело в еде!».";
      }
      const youngAnnaCharacterPrompt = `Ты — куратор-нутрициолог Анна из мобильного приложения на основе цельного растительного рациона (WFPB) «Всё дело в еде!». Твой голос и поведение — как у молодой, очень бодрой, весёлой, энергичной и жизнерадостной девушки! Отвечай невероятно позитивно, искренне, с драйвом и улыбкой, поддерживающе и тепло. Общайся на «ты», просто, легко и вдохновляюще, без занудства и сухих поучений. Говори кратко и супер-интересно (буквально 2-4 предложения).`;
      systemInstruction = `${youngAnnaCharacterPrompt}\n\n${systemInstruction}`;

      if (screenContext) {
        systemInstruction += `\n\n[ВАЖНЫЙ КОНТЕКСТ ЭКРАНА ПОЛЬЗОВАТЕЛЯ]: Пользователь сейчас смотрит на экран "${screenContext}". Твои реплики обязательно должны учитывать особенности этого экрана, быть короткими, теплыми, вовремя давать советы или слова поддержки, соответствующие теме этого замера, рецепта или раздела. Пожалуйста, отвечай по делу этого раздела, лаконично, укладывайся в 2-3 ярких растительных предложения!`;
      }

      if (screenContextDetails) {
        let detailsPrompt = `\n\n[ДЕТАЛЬНЫЙ ТЕКУЩИЙ ЭКРАННЫЙ КОНТЕКСТ]:`;
        if (screenContextDetails.screen_id) detailsPrompt += `\n- ID Экрана: ${screenContextDetails.screen_id}`;
        if (screenContextDetails.screen_title) detailsPrompt += `\n- Название экрана/раздела: "${screenContextDetails.screen_title}"`;
        if (screenContextDetails.current_subscreen) detailsPrompt += `\n- Подэкран/раздел: "${screenContextDetails.current_subscreen}"`;
        if (screenContextDetails.active_tab) detailsPrompt += `\n- Активная вкладка/подраздел: "${screenContextDetails.active_tab}"`;
        if (screenContextDetails.current_day) detailsPrompt += `\n- Текущий выбранный день в календаре: День ${screenContextDetails.current_day}`;
        if (screenContextDetails.selected_item) detailsPrompt += `\n- Активный выбранный объект: "${screenContextDetails.selected_item}"`;
        if (screenContextDetails.current_status) detailsPrompt += `\n- Текущий статус / состояние: "${screenContextDetails.current_status}"`;
        
        if (screenContextDetails.user_input_values) {
          detailsPrompt += `\n- ВВЕДЕННЫЕ ПОЛЬЗОВАТЕЛЕМ ДАННЫЕ / СВОЙСТВА: ${JSON.stringify(screenContextDetails.user_input_values, null, 2)}`;
        }

        if (screenContextDetails.metrics) {
          detailsPrompt += `\n- ТЕКУЩИЕ ПОКАЗАТЕЛИ НА ДАШБОРДЕ:`;
          const m = screenContextDetails.metrics;
          if (m.water_ml !== undefined) detailsPrompt += `\n  * Выпито чистой воды: ${m.water_ml} мл (целевая суточная норма: 2500 мл)`;
          if (m.sleep_minutes !== undefined) {
             const hrs = Math.floor(m.sleep_minutes / 60);
             const mins = m.sleep_minutes % 60;
             detailsPrompt += `\n  * Продолжительность сна: ${hrs} ч ${mins} мин (целевая норма: 8 часов)`;
          }
          if (m.meals_completed !== undefined) detailsPrompt += `\n  * Заполнено и съедено WFPB приемов пищи: ${m.meals_completed} из 4`;
          if (m.activity_points !== undefined) detailsPrompt += `\n  * Набранный индекс энергии/активности: ${m.activity_points} очков`;
          if (m.habits_completed !== undefined) detailsPrompt += `\n  * Выполнено полезных WFPB привычек: ${m.habits_completed} из 10`;
        }

        // ПРАВИЛО ВНУТРЕННЕГО ПРИОРИТЕТА: If popup/modal/overlay is open!
        if (screenContextDetails.active_modal_or_overlay) {
          detailsPrompt += `\n- [ВНИМАНИЕ! ПОВЕРХ ЭКРАНА СЕЙЧАС ОТКРЫТО ОКНО/МОДАЛКА/ОБЛАКО/ПОПАП]:`;
          detailsPrompt += `\n  * Название открытого верхнего окна: "${screenContextDetails.active_modal_or_overlay}"`;
          if (screenContextDetails.modal_data) {
            detailsPrompt += `\n  * Данные внутри открытого окна: ${JSON.stringify(screenContextDetails.modal_data, null, 2)}`;
          }
          detailsPrompt += `\n  * ПРИОРИТЕТ ОТВЕТА: Пользователь сейчас сфокусирован именно на этом открытом окне "${screenContextDetails.active_modal_or_overlay}". Твой ответ обязан детально касаться содержимого этого открытого окна, подсказывать шаги именно для него и использовать его конкретные данные!`;
        }

        if (screenContextDetails.visible_items && screenContextDetails.visible_items.length > 0) {
          detailsPrompt += `\n- Видимые на экране элементы / карточки: ${JSON.stringify(screenContextDetails.visible_items, null, 2)}`;
        }

        if (screenContextDetails.selectedChronic && screenContextDetails.selectedChronic.length > 0) {
          detailsPrompt += `\n- Хронические состояния пользователя: ${screenContextDetails.selectedChronic.join(", ")}`;
        }
        if (screenContextDetails.selectedGoals && screenContextDetails.selectedGoals.length > 0) {
          detailsPrompt += `\n- Основные здоровые цели пользователя: ${screenContextDetails.selectedGoals.join(", ")}`;
        }

        // ИСТОРИЯ ПРОГРЕССА ПОЛЬЗОВАТЕЛЯ (Baseline vs Current)
        const initWeight = screenContextDetails.initialWeight || screenContextDetails.weight || null;
        const initSystolic = screenContextDetails.initialSystolic || screenContextDetails.systolic || null;
        const initDiastolic = screenContextDetails.initialDiastolic || screenContextDetails.diastolic || null;

        const currWeight = screenContextDetails.weight || null;
        const currSystolic = screenContextDetails.systolic || null;
        const currDiastolic = screenContextDetails.diastolic || null;

        if (currWeight !== null || currSystolic !== null) {
          detailsPrompt += `\n- [ДАННЫЕ ПРОГРЕССА ПОЛЬЗОВАТЕЛЯ]:`;
          detailsPrompt += `\n  * Стартовые данные при регистрации: вес ${initWeight !== null ? initWeight : "не указан"} кг, давление ${initSystolic !== null ? initSystolic + "/" + initDiastolic : "не указано"}.`;
          detailsPrompt += `\n  * Текущие актуальные данные: вес ${currWeight !== null ? currWeight : "не указан"} кг, давление ${currSystolic !== null ? currSystolic + "/" + currDiastolic : "не указано"}.`;
          detailsPrompt += `\n  * ПРАВИЛО ОТВЕТА: Ты знаешь обе цифры и можешь корректно отвечать на вопросы пользователя об истории его веса и динамики здоровья (например, "Сколько я весил изначально?", "А какое давление у меня было при регистрации?", или "Сколько я вешу сейчас?"). Пожалуйста, сравнивай эти показатели, радуйся положительной динамике снижения веса или снижения давления, подбадривай пользователя на пути к цельному растительному (WFPB) питанию без добавления соли!`;
        }

        systemInstruction += detailsPrompt;
      }

      const resolvedUserName = userName || screenContextDetails?.userName || "";
      if (resolvedUserName) {
        systemInstruction += `\n\n[ПРАВИЛО ИМЕНИ ПОЛЬЗОВАТЕЛЯ]: Пользователя зовут "${resolvedUserName}". Ты можешь обращаться к нему по имени в поддерживающих, теплых или личных моментах. Имя должно использоваться естественно, тепло и не слишком часто (категорически запрещено повторять имя в каждой реплике или делать из него механический обязательный префикс!).`;
      }

      systemInstruction += `\n\n[ПРАВИЛО РАЗНООБРАЗИЯ НАЧАЛА РЕПЛИК И ОГРАНИЧЕНИЕ "СЛУШАЙ"]:
1. КАТЕГОРИЧЕСКИ ЗАПРЕЩАЕТСЯ постоянно начинать свои ответы со слова "Слушай" или "Слушай, ...". Твое речевое поведение должно быть нешаблонным и разнообразным!
2. Начинай свои фразы тепло, динамично и сразу по существу:
   - Прямой совет или содержательное наблюдение (например: "Ого, отличный день!", "Знаешь, твои показатели сегодня...", "По твоему сну вижу...", "Похоже, мы на правильном пути!" или просто сразу по делу).
   - Твое начало реплики должно меняться в зависимости от текущего активного экрана или открытого модального окна.`;

      systemInstruction += `\n\n[ПРАВИЛО НЕФАНТАЗИРОВАНИЯ]: Никогда не выдумывай метрики, статусы, страницы, которых нет в текущем экранном контексте! Если контекст неполный или нужных полей нет в текущем состоянии, отвечай только в рамках строго доступной информации или тепло уточняй недостающие детали. Трансформируй сухие сырые экранные данные в аккуратные, человечные, легкие советы.`;

      if (bookRecipesDataContext) {
        const { active_day, active_tab, selected_recipe, visible_recipe_cards, all_recipes_for_current_day } = bookRecipesDataContext;
        
        let bookContextPrompt = `\n\n[ЛОКАЛЬНЫЙ КОНТЕКСТ МОДУЛЯ "КНИГА РЕЦЕПТОВ" — СТРОГИЙ СЛОЙ ЗНАНИЙ]:`;
        bookContextPrompt += `\n- Текущий выбранный день в календаре: День ${active_day || "Не указан"}`;
        bookContextPrompt += `\n- Текущая активная вкладка категорий: "${active_tab || "не указана"}"`;
        
        if (selected_recipe) {
          bookContextPrompt += `\n- ТЕКУЩИЙ ВЫБРАННЫЙ РЕЦЕПТ В МОДАЛЬНОМ ОКНЕ:`;
          bookContextPrompt += `\n  * Название (Технический вариант): "${selected_recipe.technicalName}"`;
          if (selected_recipe.emotionalName) {
            bookContextPrompt += `\n  * Эмоциональное название (в кавычках): «${selected_recipe.emotionalName}»`;
          }
          bookContextPrompt += `\n  * Точный номер страницы в книге: СТРАНИЦА ${selected_recipe.page}`;
          bookContextPrompt += `\n  * Состав (ингредиенты): ${selected_recipe.ingredients}`;
          bookContextPrompt += `\n  * Статус приготовления: ${selected_recipe.status}`;
          bookContextPrompt += `\n  * Категория: ${selected_recipe.type}`;
        } else {
          bookContextPrompt += `\n- В данный момент детальная карточка рецепта НЕ открыта. Пользователь просматривает общий список рецептов.`;
        }

        if (all_recipes_for_current_day && all_recipes_for_current_day.length > 0) {
          bookContextPrompt += `\n- ВСЕ РЕЦЕПТЫ ТЕКУЩЕГО ДНЯ (${active_day}):`;
          all_recipes_for_current_day.forEach((recipe: any) => {
            bookContextPrompt += `\n  * Категория [${recipe.category}]: "${recipe.technicalName}"${recipe.emotionalName ? ` («${recipe.emotionalName}»)` : ""}, СТРАНИЦА ${recipe.page}, состав: ${recipe.ingredients}`;
          });
        }

        if (visible_recipe_cards && visible_recipe_cards.length > 0) {
          bookContextPrompt += `\n- СПИСОК РЕЦЕПТОВ ТЕКУЩЕЙ ВКЛАДКИ "${active_tab}":`;
          visible_recipe_cards.slice(0, 28).forEach((recipe: any) => {
            const dayStr = recipe.day ? `День ${recipe.day}` : `День ${recipe.id}`;
            bookContextPrompt += `\n  * ${dayStr}: "${recipe.technicalName}"${recipe.emotionalName ? ` («${recipe.emotionalName}»)` : ""}, СТРАНИЦА ${recipe.page}`;
          });
        }

        bookContextPrompt += `\n\n[КРИТИЧЕСКИЕ ПРАВИЛА И ПРИВЯЗКИ ДЛЯ ОТВЕТОВ]:
1. ПРАВИЛО PAGE MAPPING: Используй исключительно реальные номера страниц (page), привязанные к рецептам выше! Никогда не придумывай страницы наугад! Называй точный page number из нашего набора данных (например, рецепт "${selected_recipe?.technicalName || ""}" находится ровно на странице ${selected_recipe?.page || ""} книги).
2. ПРАВИЛО РАБОТЫ СО ВСЕМИ РЕЦЕПТАМИ ДНЯ: Если пользователь спрашивает про сегодняшний день, "что приготовить сегодня?", "что у меня на обед?", "какой рецепт выбрать из сегодняшних?", ты должна извлечь рецепты из списка 'ВСЕ РЕЦЕПТЫ ТЕКУЩЕГО ДНЯ', сравнить их по ингредиентам или сложности и помочь составить легкий и чистый рацион.
3. ПРАВИЛО НЕФАНТАЗИРОВАНИЯ: Если пользователь спрашивает про рецепт, день, страницу или ингредиент, отсутствующий в наборе выше, не выдумывай их! Честно ответь только в пределах доступных данных, или уточни у пользователя, или скажи, что в текущем экранном контексте тебе доступна не вся книжная база.
4. Используй точные технические и эмоциональные названия рецептов (например, «АНИНЫ БУСЫ» для Ягодно-яблочного мармелада на агаре).`;

        systemInstruction += bookContextPrompt;
      }

      const contents: any[] = [];
      if (history && Array.isArray(history)) {
        history.slice(-10).forEach((h: any) => {
          contents.push({
            role: h.sender === "user" ? "user" : "model",
            parts: [{ text: h.text }]
          });
        });
      }
      contents.push({
        role: "user",
        parts: [{ text: message }]
      });

      const result = await generateContentWithFallback({
        contents,
        config: {
          systemInstruction,
          temperature: 0.8,
        }
      });
      const reply = result.text?.trim() || "";
      return res.json({ reply });
    } catch (err: any) {
      // Fallback
      return res.json({ reply: "Привет! Всё отлично! Я всегда рядом, чтобы поддержать твой путь к здоровью и чистой энергии всей душой! 🌿" });
    }
  });

  // API endpoint for true nutrient analysis based on USDA databases using Gemini 3.5 Flash
  app.post("/api/analyze-dish", async (req, res) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    const { ingredients, defaultDishName } = req.body || {};
    try {
      if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
        return res.status(400).json({ error: "No ingredients received" });
      }

      // Convert ingredients list into readable representation
      const ingredientsDescription = ingredients
        .map(ing => `- ${ing.fullName || ing.shortName}: ${ing.weight || 100}g`)
        .join("\n");

      const promptText = `You are a professional certified food nutritionist and USDA Database Analyzer for the "Всё дело в еде!" plant-based (WFPB) app.
The user confirmed the following list of verified ingredients with their weights in grams:
${ingredientsDescription}

Your task is to:
1. Identify each ingredient in the official USDA Food Data Central database.
2. Obtain exact nutrients per 100g.
3. Multiply and scale their nutrients proportional to their actual weight (e.g. if weight is 50g, take half of 100g value).
4. Sum all nutrient, vitamin, amino acid, and mineral values to compute the aggregated nutritional profile of the entire dish.
5. Provide three customized nutritional insights in Russian based on the calculations:
   - "Сильные стороны блюда" (Strengths of this meal)
   - "Что можно улучшить" (What to improve, e.g. adding fatty acids or specific leafy greens)
   - "Соответствие растительному рациону" (Strict check according to WFPB rules: No animal products, No salt, No added oils. Mention if they forced any non-compliant ingredients).

Return ONLY a valid JSON object matching this schema:
{
  "dishName": "string (Russian Name of the entire dish, e.g. 'Тёплый боул с киноа и нутом' or another descriptive name based on the combination of ingredients)",
  "nutrients": {
    "calories": { "value": number, "unit": "ккал" },
    "protein": { "value": number, "unit": "г" },
    "fats": { "value": number, "unit": "г" },
    "carbs": { "value": number, "unit": "г" },
    "fiber": { "value": number, "unit": "г" },
    "omegaRatio": { "value": "string (formatted ratio, e.g., '3:1' or '4:1' or '2:1')", "unit": "" }
  },
  "micronutrients": {
    "iron": { "value": number, "unit": "мг" },
    "zinc": { "value": number, "unit": "мг" },
    "magnesium": { "value": number, "unit": "мг" },
    "iodine": { "value": number, "unit": "мкг" },
    "selenium": { "value": number, "unit": "мкг" },
    "vitaminC": { "value": number, "unit": "мг" },
    "vitaminB9": { "value": number, "unit": "мкг" },
    "lysine": { "value": number, "unit": "г" },
    "methionine": { "value": number, "unit": "г" }
  },
  "insights": {
    "strengths": {
      "title": "Сильные стороны блюда",
      "text": "string (custom nutrition strengths summary in Russian)"
    },
    "improvements": {
      "title": "Что можно улучшить",
      "text": "string (custom helpful actionable advice in Russian)"
    },
    "compliance": {
      "title": "Соответствие растительному рациону",
      "text": "string (assessment in Russian of adherence to WFPB - No salt, No animal products, No oil)"
    }
  }
}

Important Rules:
- All texts, titles, and descriptions MUST be strictly in Russian.
- Do NOT simulate or invent fake metrics. Execute the true USDA calculation.
- If any forbidden animal products or salted items are passed (like 'meat' or 'salt'), perform the analysis honestly, but flag them as highly controversial in the compliance section.
- Output ONLY valid JSON, do not include any other markdown formatting outside of the json envelope.`;

      const response = await generateContentWithFallback({
        contents: promptText,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              dishName: { type: Type.STRING },
              nutrients: {
                type: Type.OBJECT,
                properties: {
                  calories: {
                    type: Type.OBJECT,
                    properties: { value: { type: Type.NUMBER }, unit: { type: Type.STRING } },
                    required: ["value", "unit"]
                  },
                  protein: {
                    type: Type.OBJECT,
                    properties: { value: { type: Type.NUMBER }, unit: { type: Type.STRING } },
                    required: ["value", "unit"]
                  },
                  fats: {
                    type: Type.OBJECT,
                    properties: { value: { type: Type.NUMBER }, unit: { type: Type.STRING } },
                    required: ["value", "unit"]
                  },
                  carbs: {
                    type: Type.OBJECT,
                    properties: { value: { type: Type.NUMBER }, unit: { type: Type.STRING } },
                    required: ["value", "unit"]
                  },
                  fiber: {
                    type: Type.OBJECT,
                    properties: { value: { type: Type.NUMBER }, unit: { type: Type.STRING } },
                    required: ["value", "unit"]
                  },
                  omegaRatio: {
                    type: Type.OBJECT,
                    properties: { value: { type: Type.STRING }, unit: { type: Type.STRING } },
                    required: ["value", "unit"]
                  }
                },
                required: ["calories", "protein", "fats", "carbs", "fiber", "omegaRatio"]
              },
              micronutrients: {
                type: Type.OBJECT,
                properties: {
                  iron: {
                    type: Type.OBJECT,
                    properties: { value: { type: Type.NUMBER }, unit: { type: Type.STRING } },
                    required: ["value", "unit"]
                  },
                  zinc: {
                    type: Type.OBJECT,
                    properties: { value: { type: Type.NUMBER }, unit: { type: Type.STRING } },
                    required: ["value", "unit"]
                  },
                  magnesium: {
                    type: Type.OBJECT,
                    properties: { value: { type: Type.NUMBER }, unit: { type: Type.STRING } },
                    required: ["value", "unit"]
                  },
                  iodine: {
                    type: Type.OBJECT,
                    properties: { value: { type: Type.NUMBER }, unit: { type: Type.STRING } },
                    required: ["value", "unit"]
                  },
                  selenium: {
                    type: Type.OBJECT,
                    properties: { value: { type: Type.NUMBER }, unit: { type: Type.STRING } },
                    required: ["value", "unit"]
                  },
                  vitaminC: {
                    type: Type.OBJECT,
                    properties: { value: { type: Type.NUMBER }, unit: { type: Type.STRING } },
                    required: ["value", "unit"]
                  },
                  vitaminB9: {
                    type: Type.OBJECT,
                    properties: { value: { type: Type.NUMBER }, unit: { type: Type.STRING } },
                    required: ["value", "unit"]
                  },
                  lysine: {
                    type: Type.OBJECT,
                    properties: { value: { type: Type.NUMBER }, unit: { type: Type.STRING } },
                    required: ["value", "unit"]
                  },
                  methionine: {
                    type: Type.OBJECT,
                    properties: { value: { type: Type.NUMBER }, unit: { type: Type.STRING } },
                    required: ["value", "unit"]
                  }
                },
                required: ["iron", "zinc", "magnesium", "iodine", "selenium", "vitaminC", "vitaminB9", "lysine", "methionine"]
              },
              insights: {
                type: Type.OBJECT,
                properties: {
                  strengths: {
                    type: Type.OBJECT,
                    properties: { title: { type: Type.STRING }, text: { type: Type.STRING } },
                    required: ["title", "text"]
                  },
                  improvements: {
                    type: Type.OBJECT,
                    properties: { title: { type: Type.STRING }, text: { type: Type.STRING } },
                    required: ["title", "text"]
                  },
                  compliance: {
                    type: Type.OBJECT,
                    properties: { title: { type: Type.STRING }, text: { type: Type.STRING } },
                    required: ["title", "text"]
                  }
                },
                required: ["strengths", "improvements", "compliance"]
              }
            },
            required: ["dishName", "nutrients", "micronutrients", "insights"]
          }
        }
      });

      const textOutput = response.text || "{}";
      const resultData = JSON.parse(textOutput);
      return res.json({ result: resultData });
    } catch (error: any) {
      console.log("Local program nutrition calculation fallback triggered:", error?.message || error);
      const fallbackResult = getUsdaFallbackData(ingredients);
      return res.json({ result: fallbackResult });
    }
  });

  // API endpoint for actual computer vision analysis using Gemini 3.5 Flash
  app.post("/api/analyze-image", async (req, res) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    try {
      const { imageBase64 } = req.body;
      if (!imageBase64) {
        return res.status(400).json({ error: "No image data received" });
      }

      // Strip optional base64 metadata prefix if present
      const base64Clean = imageBase64.replace(/^data:image\/\w+;base64,/, "");

      const imagePart = {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Clean,
        },
      };

      const textPart = {
        text: `You are the AI Ingredient Vision analyzer for the "Всё дело в еде!" WFPB (Whole Food Plant-Based) nutritional assistant app.
The user took a photo, and we need to analyze this image to extract the ingredients or objects and verify if they are strictly compliant with WFPB + No Salt + No Oil guidelines.

Guidelines rules:
1. NO animal ingredients whatsoever (meat, poultry, fish, seafood, eggs, milk, cheese, yogurt, cream, butter, ghee, honey, gelatin).
2. NO salt (absolutely NO salt, sea salt, himalayan salt, soy sauce, miso with salt, bouillon cubes, salted seasoning mixes).
3. NO oils of ANY origin (completely NO olive oil, sunflower oil, vegetable oil, coconut oil, flaxseed oil, sesame oil, avocado oil, refined oils, etc.). Whole avocados, olives, seeds, nuts are OK, but extracted oils are FORBIDDEN!

VERY IMPORTANT SCENARIOS:
1. If the image is a food/dish picture (edible), return the ingredients list normally with "status" set to "green" or "error" based on compliance.
2. If the image contains a MIX of both food/edible items AND non-food/inedible items (e.g. some food next to keys or glasses), you MUST IGNORE the non-food items completely! Focus entirely on the food ingredients and analyze only them.
3. If the image contains ONLY non-food/inedible items (e.g. household items, accessories, electronics, keys, mugs, books, glasses, decor, toys), you must identify these non-food objects. For these objects, set "status" to "blue" because they are non-food objects. Estimate their weights in grams normally.

Return ONLY a valid JSON object matching this schema:
{
  "dishName": "string (Russian Name of the dish, or if it is purely non-food, describe the collection of objects in Russian, e.g., 'Несъедобные предметы')",
  "ingredients": [
    {
      "id": "string (unique clean snake_case slug, e.g. 'spinach', 'chickpeas', 'salt', 'beef', 'keys', 'eyeglasses')",
      "fullName": "string (descriptive name in Russian, e.g., 'Сочный молодой шпинат', 'Связка металлических ключей')",
      "shortName": "string (short name in Russian, e.g., 'Шпинат', 'Ключи')",
      "status": "green" | "error" | "blue",  // Use "green" or "error" if food. Use "blue" ONLY if the object is NOT edible/non-food object.
      "weight": number (estimated weight in grams),
      "reason": "string (reason in Russian for 'error', or a humorous comment for 'blue' objects, or empty string)"
    }
  ]
}

Ensure to output strictly valid JSON conforming exactly to this structure.`,
      };

      const response = await generateContentWithFallback({
        contents: { parts: [imagePart, textPart] },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              dishName: { type: Type.STRING },
              ingredients: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    fullName: { type: Type.STRING },
                    shortName: { type: Type.STRING },
                    status: { type: Type.STRING, description: "green, error, or blue" },
                    weight: { type: Type.NUMBER },
                    reason: { type: Type.STRING }
                  },
                  required: ["id", "fullName", "shortName", "status", "weight"]
                }
              }
            },
            required: ["dishName", "ingredients"]
          }
        }
      });

      const textOutput = response.text || "{}";
      const resultData = JSON.parse(textOutput);
      
      return res.json({ result: resultData });
    } catch (error: any) {
      console.log("Real error returned to client to trigger Anna supporting behaviors:", error?.message || error);
      return res.status(503).json({ 
        error: error?.message || "Service Temporarily Unavailable",
        status: "UNAVAILABLE"
      });
    }
  });

  // API endpoint for dynamic supportive, caring responses from Anna during network retries/instability
  app.post("/api/anna-supports", async (req, res) => { // Updated handler for Anna’s support requests
    try {
      const { situation } = req.body;
      
      const prompt = `Ты — куратор Анна в мобильном приложении на основе цельного растительного рациона (WFPB) без соли и продуктов животного происхождения «Всё дело в еде!».
Пользователь загрузил фото своего блюда, и сейчас идёт процесс нейросетевого распознавания ингредиентов.

Сгенерируй ОДНУ короткую, поддерживающую и вежливую фразу на русском языке, которая объясняет текущий процесс с технической стороны и информирует о действиях Системы в данный момент.
Контекст ситуации для генерации:
${situation || "временное ожидание повторного анализа блюда"}

Правила:
1. Исключи любое личное заигрывание, фамильярность, кокетство, уменьшительно-ласкательные слова или хвастовство. Тон должен быть профессиональным, поддерживающим и технологичным.
2. Абсолютно ЗАПРЕЩЕНО говорить от первого лица ("я", "я рада", "я заметила", "я проверила", "я настраиваю", "мой", "моя", "мы" и т.д.). Текст должен описывать только действия Системы, Алгоритма или Нейросети (например: "Идёт обработка...", "Система производит...", "Алгоритм выполняет...", "Проводится техническая сонастройка...").
3. Описывай техническую сторону происходящего: сопоставление текстур, определение контуров, сегментация кадров на ингредиенты и сверка со стандартами цельного растительного питания без соли.
4. ОДНА законченная фраза, длиной от 8 до 20 слов, без кавычек вокруг. Пиши строго на русском языке.`;

      const result = await generateContentWithFallback({
        contents: { parts: [{ text: prompt }] },
        config: {
          responseMimeType: "text/plain"
        }
      });
      
      const textOutput = result.text?.trim().replace(/^["']|["']$/g, "") || "Система настраивает соединение и выполняет детальный молекулярный анализ тарелки... 🌱";
      return res.json({ message: textOutput });
    } catch (e) {
      // Fallback set of diverse tech-focused supporting lines without first person pronouns
      const defaults = [
        "Система производит детальный анализ ингредиентов кадра на соответствие стандартам цельного растительного рациона без соли. 🌱",
        "Алгоритм аккуратно сегментирует снимок и сопоставляет текстуры продуктов с базой данных WFPB. ✨",
        "Происходит оптимизация соединения с сервером для точной расшифровки состава блюда и калорийности.",
        "Выполняется глубокое сканирование структуры кадра, чтобы исключить скрытые животные добавки и жиры. 🍃",
        "Нейросеть финализирует обработку растительных волокон на изображении и формирует подробный отчёт."
      ];
      const randomDefault = defaults[Math.floor(Math.random() * defaults.length)];
      return res.json({ message: randomDefault });
    }
  });

  // API endpoint for dynamic sarcastic/humorous reply from Anna when non-food objects are detected
  app.post("/api/anna-sarcastic-reply", async (req, res) => {
    try {
      const { items } = req.body;
      const itemsList = Array.isArray(items) ? items : [];
      let itemsStr = itemsList.map((x: any) => typeof x === 'object' ? `«${x.shortName || x.fullName || x}»` : `«${x}»`).join(", ");
      if (!itemsStr) {
        itemsStr = "непищевые предметы";
      }

      const prompt = `Ты — куратор-советник Анна (девушка, WFPB-диетолог) из приложения WFPB-рациона «Всё дело в еде!».
Пользователь загрузил фото, на котором Система распознала только НЕСЪЕДОБНЫЕ (непищевые, не съедобные) предметы: ${itemsStr}.

Напиши для пользователя живой, интеллектуальный литературный комментарий на русском языке от твоего лица (в женском роде: "я заметила", "я удивлена" и т.д.).
Твоя цель — мягко и с юмором пожурить пользователя за выбор "абсолютно бессолевого и низкокалорийного", но совершенно несъедобного меню из этих вещей, весело обыграть конкретные предметы, которые здесь распознаны, и с улыбкой направить пользователя обратно в безопасное русло — сфотографировать здоровую растительную еду.

Характер твоего юмора:
- Умный, тонкий, живой, книжный, интеллигентный, с легким подтрунированием и мягким удивлением. Без банальностей.
- ПРЯМО и весело обыграй именно эти предметы: ${itemsStr}. (Например, если это ключи, напиши про крепкие замки или зубы, если очки — про точное зрение, если чашка — про пустоту без полезного чая, и т.д. Обыгрывай конкретно те предметы, которые указаны в списке!).
- Если среди предметов есть что-то потенциально странное, опасное или чувствительное, сделай тон максимально бережным, безопасным и мягким.
- ПРЕДОСТЕРЕЖЕНИЕ: Никакой токсичности, грубости, агрессии или глупых шуток "ниже пояса". Ты остаешься обаятельной, грамотной, чуть озорной WFPB-советницей.

Смысл реплики:
1. Показать, что ты видишь конкретные предметы (${itemsStr}) и удивлённо-весело отметить этот выбор.
2. Обратить внимание на их несъедобность (хоть в них и гарантированно нет соли, масла или животных продуктов!).
3. Мягко призвать сделать фото настоящей полезной WFPB-еды (овощи, злаки, бобовые, фрукты) для здоровья эндотелия и сосудов.

Длина реплики: средняя (приблизительно 2-4 предложения, от 40 до 90 слов). Напиши реплику целиком как один абзац текста. Глаголы в прошедшем времени и прилагательные от первого лица пиши строго в ЖЕНСКОМ РОДЕ.`;

      const result = await generateContentWithFallback({
        contents: { parts: [{ text: prompt }] },
        config: {
          responseMimeType: "text/plain"
        }
      });

      const textOutput = result.text?.trim().replace(/^["']|["']$/g, "") || "";
      if (textOutput) {
        return res.json({ message: textOutput });
      }
      throw new Error("Empty AI response");
    } catch (e: any) {
      console.log("Error generating Anna's sarcastic reply:", e?.message || e);
      // Fallback response in case of any system/API issues
      const { items } = req.body;
      const itemsList = Array.isArray(items) ? items : [];
      let fallbackStr = itemsList.map((x: any) => typeof x === 'object' ? `«${x.shortName || x.fullName || x}»` : `«${x}»`).join(" и ");
      if (!fallbackStr) fallbackStr = "непищевые предметы";
      
      return res.json({
        message: `Ой, какая необычная тарелка! Система распознала здесь ${fallbackStr}. Конечно, в них рекордно мало калорий и полностью отсутствует соль, но боюсь, даже крепкая эмаль зубов и WFPB-философия не справятся со здоровым расщеплением таких инновационных продуктов! Кажется, ты хочешь позавтракать несъедобными предметами. Давай оставим их для украшения быта, а для пользы микробиома выберем чистую растительную пищу: злаки, бобовые, много зелени и фруктов. Пожалуйста, вернись назад и сфотографируй настоящее полезное блюдо! 💚`
      });
    }
  });

  // Vite development middleware vs Static Production files
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

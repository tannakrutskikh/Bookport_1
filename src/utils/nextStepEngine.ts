import { NormalizedIngredient } from "../services/DailyNutritionStore";

export interface NextStepInput {
  water: number;
  waterPct: number;
  sleep: number;
  sleepPct: number;
  mealCount: number;
  mealsPct: number;
  habitsDone: number;
  habitsPct: number;
  integralScore: number;
  ratingWellbeing: number;
  ratingEnergy: number;
  ratingLightness: number;
  currentDayIndex: number;
  aggregatedIngredients: { name: string; weight: number; status: "green" | "yellow" | "red" }[];
  dayNotes: { text: string; time: string; source?: string }[];
  selectedChronic: string[];
  totalFiber: number;
  totalCalories: number;
}

export interface NextStepRecommendation {
  title: string;
  desc: string;
  icon: string;
  btnText: string;
  actionType: "water" | "meals" | "habits" | "sleep" | "diary" | "what-i-eat" | "book-recipes" | "notes";
  reasoning: string;
}

/**
 * Universal dynamic priority-based system for electing the absolute best next step
 * based on the entire daily state of the user.
 */
export function getRecommendedNextStep(input: NextStepInput): NextStepRecommendation {
  const {
    water,
    waterPct,
    sleep,
    sleepPct,
    mealCount,
    mealsPct,
    habitsDone,
    habitsPct,
    integralScore,
    ratingWellbeing,
    ratingEnergy,
    ratingLightness,
    currentDayIndex,
    aggregatedIngredients = [],
    dayNotes = [],
    selectedChronic = [],
    totalFiber = 0,
    totalCalories = 0,
  } = input;

  const notesTextLower = dayNotes.map(n => (n.text || "").toLowerCase()).join(" ");
  const hasChronicPressure = selectedChronic.some(c => 
    c.toLowerCase().includes("давлен") || 
    c.toLowerCase().includes("гипертон") || 
    c.toLowerCase().includes("сосуд")
  );
  
  // Look for any non-WFPB or red items that user recorded
  const redIngredients = aggregatedIngredients.filter(ing => ing.status === "red");
  const yellowIngredients = aggregatedIngredients.filter(ing => ing.status === "yellow");

  // ==========================================
  // LEVEL 1: CRITICAL DEFICITS (Highest Priority)
  // ==========================================

  // 1. Critical Sleep Deficit
  if (sleep > 0 && sleep < 240) { // slept less than 4 hours
    return {
      title: "Дыхательное снижение стресса",
      desc: "Из-за критического дефицита сна ночного восстановления не произошло. Сделай 5-минутную паузу для глубокого дыхания 4-7-8, чтобы заблокировать выброс кортизола и защитить сердце.",
      icon: "🧘",
      btnText: "Перейти к дыханию",
      actionType: "habits",
      reasoning: `Поскольку вы спали всего ${Math.round(sleep / 60)} ч., ваша симпатическая нервная система сейчас находится в перегруженном состоянии. Медленное брюшное дыхание — это кратчайший способ стимулировать блуждающий нерв, снизить системное сосудистое сопротивление и уберечь клетки от оксидативного шока.`
    };
  }

  // 2. Severe Dehydration
  if (water < 1200) {
    return {
      title: "Клеточная гидратация",
      desc: `Уровень чистой влаги критически низок (${water} мл). Это сгущает лимфу и затрудняет работу капилляров почек. Сделай паузу и выпей стакан (250 мл) тёплой структурированной воды прямо сейчас.`,
      icon: "💧",
      btnText: "Добавить 250 мл воды",
      actionType: "water",
      reasoning: `Ваш организм функционирует в условиях водного дефицита (${water} мл вместо рекомендованных 2500 мл). Полноценная клеточная перфузия падает, эритроциты склеиваются, замедляя перенос кислорода. Тёплая чистая вода без газа мгновенно впитается и оживит водно-солевой насос клеток.`
    };
  }

  // 3. Unfriendly / Non-WFPB (Red status) components detected
  if (redIngredients.length > 0) {
    const badNames = redIngredients.slice(0, 2).map(i => i.name.toLowerCase()).join(" и ");
    return {
      title: "Нейтрализация волокнами",
      desc: `В текущем рационе замечена нагрузка (${badNames}). Сделай следующий приём пищи максимально цельным и богатым клетчаткой (добавь шпинат или ложку льна), чтобы связать и вывести простые гликотоксины.`,
      icon: "🍃",
      btnText: "Выбрать зелёный рецепт",
      actionType: "book-recipes",
      reasoning: `Обнаружены вещества, не соответствующие строгому оздоровительному WFPB-стандарту (${badNames}). Рафинированные сахара или насыщенные жиры повреждают тонкий эндотелий сосудов и провоцируют гликемические качели. Мягкая нейтрализация органическими волокнами шпината, брокколи или пектином яблока замедляет всасывание вредных элементов и защищает ваши почки.`
    };
  }

  // 4. Low light feel or Heavy stomach reported in notes or ratingLightness
  if (ratingLightness <= 2 || notesTextLower.includes("тяжесть") || notesTextLower.includes("вздутие") || notesTextLower.includes("дискомфорт")) {
    return {
      title: "Мягкая разгрузка ЖКТ",
      desc: "Наблюдается нагрузка на пищеварительный тракт. Воздержись от твёрдой еды на 4 часа, выпей тёплый ромашковый настой мелкими глотками для снятия мышечных зажимов.",
      icon: "☕",
      btnText: "Записать самочувствие",
      actionType: "diary",
      reasoning: "Повышенное вздутие или чувство тяжести указывает на то, что моторика ЖКТ перегружена или адаптируется к новой дозе клетчатки. Тёплые глотки настоя ромашки или фенхеля блокируют рецепторы блуждающего нерва, нормализуют тонус гладких сфинктеров и деликатно снижают газообразование."
    };
  }

  // 5. Extreme fatigue and energy drain
  if (ratingEnergy <= 2) {
    return {
      title: "Травяное заземление",
      desc: "Физическая энергия упала до минимума. Вместо искусственной стимуляции кофеином выпей тёплый напиток из шиповника или иван-чая и отложи гаджеты на 10 минут.",
      icon: "🍵",
      btnText: "Зафиксировать покой",
      actionType: "diary",
      reasoning: `Падение тонуса до уровня ${ratingEnergy}/5 сигнализирует о временном истощении запасов гликогена и накоплении аденозина. Кофеин лишь усугубит спазм почечных артериол. Тёплый безкофеиновый настой шиповника, богатый витамином C и антиоксидантами, напитает плазму и очистит рецепторы, возвращая бодрость естественно.`
    };
  }

  // 6. Extreme fiber lack
  if (mealCount > 0 && totalFiber < 10) {
    return {
      title: "Клетчаточный импульс",
      desc: `В дневном рационе зафиксировано всего ${Math.round(totalFiber)} г терапевтической клетчатки. Сделай перекус яблоком или добавь две ложки семян чиа/льна, чтобы пробудить метаболическое очищение.`,
      icon: "🍏",
      btnText: "Записать перекус",
      actionType: "what-i-eat",
      reasoning: `Пищевые волокна (${totalFiber} г при норме от 35 г) служат питанием для благородных бактерий. Без волокон они начинают разрушать собственный защитный слой слизистой кишечника. Небольшая горсть семян или свежий фрукт восполнят этот пробел мгновенно.`
    };
  }

  // ==========================================
  // LEVEL 2: CONSTRAINTS & ROAD BLOCKS (Moderate)
  // ==========================================

  // 7. Mild Dehydration (between 1200 and 2000 ml)
  if (waterPct < 80) {
    return {
      title: "Накопление клеточной влаги",
      desc: `Баланс гидратации стабилен (${water} мл), но сосуды запрашивают дополнительный объём плазмы. Выпей ещё один стакан чистой воды, чтобы облегчить фильтрацию лимфы.`,
      icon: "🥛",
      btnText: "Добавить 250 мл воды",
      actionType: "water",
      reasoning: `С каждым часом почки фильтруют около 5 литров крови. Поддерживая водно-солевое равновесие мелкими порциями воды (${water} мл), вы предохраняете клетки крови от склеивания и деликатно регулируете тонус стенок средних сосудов без их сужения.`
    };
  }

  // 8. Low habits count
  if (habitsDone < 3 || habitsPct < 60) {
    return {
      title: "Клеточный импульс",
      desc: `Сегодня выполнено всего ${habitsDone} из 4 ключевых микро-привычек. Сделай короткую разминку или просто отметь свой биологический импульс, чтобы укрепить нейронный контур здоровья.`,
      icon: "⚡",
      btnText: "Перейти к привычкам",
      actionType: "habits",
      reasoning: `Каждое выполненное простое действие оздоровительного проекта (${habitsDone}/4) закрепляет гормональную дугу удовлетворения через выработку дофамина. Это снижает вечернюю тягу к простым стимуляторам и поддерживает ритмичность внутренних биологических часов.`
    };
  }

  // 9. Chronic pressure adjustments (high sodium protection)
  if (hasChronicPressure && yellowIngredients.some(i => i.name.toLowerCase().includes("соль") || i.name.toLowerCase().includes("масло"))) {
    return {
      title: "Защита сосудистого русла",
      desc: "В дневном рационе замечен скрытый натрий или добавленные масла. Съешь банан или порцию сельдерея, богатых калием, для мгновенного снижения сосудистого тонуса.",
      icon: "🍌",
      btnText: "Выбрать калиевое блюдо",
      actionType: "book-recipes",
      reasoning: "При чувствительности к давлению скрытый натрий задерживает внутрисосудистую жидкость, вызывая растяжение артериальных стенок. Калий и биологические фталиды сельдерея или банана являются антагонистами натрия: они расслабляют мышечный слой артериол и способствуют плавной экскреции излишков соли."
    };
  }

  // 10. Empty Nutrition Log (mealCount is 0, late in the day or starting optimal menu)
  if (mealCount === 0) {
    return {
      title: "Цельный WFPB-старт",
      desc: "В архиве питания пока нет подтверждённых блюд. Посмотри сегодняшнее расписание Книги рецептов и выбери простое согревающее блюдо для поддержки кишечника.",
      icon: "🍲",
      btnText: "Открыть книгу блюд",
      actionType: "book-recipes",
      reasoning: "Сегодня организм ещё не получил дозу биоактивных антиоксидантов и сырых макронутриентов. Своевременные приёмы пищи исключают резкие ночные скачки грелина и застой жёлчи. Загляните в рекомендованный рацион Дня на сегодня."
    };
  }

  // ==========================================
  // LEVEL 3: PERFORMANCE AMPLIFIERS (High state)
  // ==========================================

  // 11. Everything is going great (integralScore >= 75%)
  if (integralScore >= 75) {
    return {
      title: "Антиоксидантный купол",
      desc: `Восхитительный баланс дня (${integralScore}%)! Твои клетки на пике тонуса. Чтобы закрепить успех и защитить митохондрии, добавь щепоть микрозелени или горсть сырых грецких орехов к ужину.`,
      icon: "🧠",
      btnText: "Перейти в дневник",
      actionType: "diary",
      reasoning: "При таком высоком уровне баланса системы детоксикации работают безупречно. Омега-3 кислоты грецких орехов и полифенолы микрозелени выступят коферментами и защитят клеточные мембраны от естественного возрастного износа."
    };
  }

  // Fallback
  return {
    title: "Фиксация биологического баланса",
    desc: "Хороший, стабильный темп дня. Размеренно наполняй шкалы, делай тёплые глотки воды и прислушивайся к внутренним сигналам лёгкости в теле.",
    icon: "🧘",
    btnText: "Записать замеры",
    actionType: "diary",
    reasoning: "Все системы находятся в физиологическом равновесии. Продолжайте следовать природному маршруту оздоровления."
  };
}

export type Exercise = {
  name: string;
  sets: number;
  reps: string;
  image: string;
  tip: string;
};

export type RoutineDay = {
  day: number;
  title: string;
  muscleGroup: string;
  color: string;
  gradient: string;
  emoji: string;
  exercises: Exercise[];
  extra?: string;
};

export const ROUTINE: RoutineDay[] = [
  {
    day: 1,
    title: "Pecho + Tríceps",
    muscleGroup: "Pecho · Tríceps",
    color: "#ef4444",
    gradient: "from-red-600 to-orange-600",
    emoji: "🏋️",
    exercises: [
      { name: "Press banca plano", sets: 4, reps: "10", image: "https://picsum.photos/seed/benchpress/600/400", tip: "Barra al pecho (línea pezones). Pies firmes en el suelo." },
      { name: "Press inclinado mancuerna", sets: 4, reps: "12", image: "https://picsum.photos/seed/inclinepress/600/400", tip: "Banco a 30-45°. Movimiento controlado, dumbbells sobre clavículas." },
      { name: "Aperturas planas mancuernas", sets: 3, reps: "15", image: "https://picsum.photos/seed/flyes/600/400", tip: "Brazos con ligera flexión. No bajes de la línea del cuerpo." },
      { name: "Copa tríceps de pie", sets: 3, reps: "12", image: "https://picsum.photos/seed/tricepscup/600/400", tip: "Manos juntas. Codos pegados a la cabeza. Extiende completamente." },
      { name: "Extensión tríceps polea", sets: 3, reps: "15", image: "https://picsum.photos/seed/tricepsrope/600/400", tip: "Codos quietos y pegados al cuerpo. Solo mueve el antebrazo." },
      { name: "Fondos paralelas", sets: 3, reps: "al fallo", image: "https://picsum.photos/seed/dips/600/400", tip: "Cuerpo recto. Baja hasta 90°. Empuja con fuerza." },
    ],
    extra: "HIIT 15 min",
  },
  {
    day: 2,
    title: "Espalda + Bíceps",
    muscleGroup: "Espalda · Bíceps",
    color: "#3b82f6",
    gradient: "from-blue-600 to-cyan-600",
    emoji: "💪",
    exercises: [
      { name: "Jalón al pecho", sets: 4, reps: "12", image: "https://picsum.photos/seed/latpulldown/600/400", tip: "Agarre ancho. Lleva la barra a la parte superior del pecho." },
      { name: "Remo con barra", sets: 4, reps: "10", image: "https://picsum.photos/seed/barbellrow/600/400", tip: "Espalda recta. Lleva la barra al ombligo, no al pecho." },
      { name: "Remo mancuerna", sets: 3, reps: "12", image: "https://picsum.photos/seed/dumbbellrow/600/400", tip: "Apoya la rodilla en el banco. Codo pegado al cuerpo en el tirón." },
      { name: "Pull down estrecho", sets: 3, reps: "12", image: "https://picsum.photos/seed/closerow/600/400", tip: "Agarre neutro. Contrae la espalda baja al final del movimiento." },
      { name: "Curl barra", sets: 3, reps: "12", image: "https://picsum.photos/seed/barbellcurl/600/400", tip: "Codos fijos al costado. No balancees el torso." },
      { name: "Curl martillo", sets: 3, reps: "15", image: "https://picsum.photos/seed/hammercurl/600/400", tip: "Agarre neutro (pulgar arriba). Trabaja el braquial." },
    ],
    extra: "HIIT 15 min",
  },
  {
    day: 3,
    title: "Piernas",
    muscleGroup: "Cuádriceps · Isquios · Glúteos",
    color: "#f97316",
    gradient: "from-orange-500 to-yellow-500",
    emoji: "🦵",
    exercises: [
      { name: "Sentadilla libre", sets: 4, reps: "12", image: "https://picsum.photos/seed/squat/600/400", tip: "Pies a ancho de hombros. Rodillas alineadas con los pies. Pecho arriba." },
      { name: "Prensa", sets: 4, reps: "12", image: "https://picsum.photos/seed/legpress/600/400", tip: "No bloquees las rodillas arriba. Pies al ancho de hombros en la plataforma." },
      { name: "Extensión cuádriceps", sets: 3, reps: "15", image: "https://picsum.photos/seed/legextension/600/400", tip: "Control en la bajada. No uses impulso, trabaja el quad." },
      { name: "Curl femoral", sets: 3, reps: "15", image: "https://picsum.photos/seed/legcurl/600/400", tip: "Caderas pegadas al banco. Contrae el isquio al máximo." },
      { name: "Peso muerto piernas rígidas", sets: 4, reps: "10", image: "https://picsum.photos/seed/rdl/600/400", tip: "Rodillas casi extendidas. Siente el estiramiento en los isquios." },
      { name: "Pantorrillas", sets: 4, reps: "20", image: "https://picsum.photos/seed/calfraise/600/400", tip: "Rango completo. Pausa arriba 1 segundo apretando el gemelo." },
    ],
    extra: "Cardio 20 min + cinta inclinada",
  },
  {
    day: 4,
    title: "Hombros + Trapecios",
    muscleGroup: "Hombros · Trapecios",
    color: "#a855f7",
    gradient: "from-purple-600 to-pink-600",
    emoji: "🎯",
    exercises: [
      { name: "Press militar", sets: 4, reps: "10", image: "https://picsum.photos/seed/militarypress/600/400", tip: "Barra frente al cuello. No bloquees codos arriba. Core apretado." },
      { name: "Elevaciones laterales", sets: 4, reps: "15", image: "https://picsum.photos/seed/lateralraise/600/400", tip: "Ligeramente inclinado adelante. Lleva los codos a la altura del hombro." },
      { name: "Elevaciones frontales", sets: 3, reps: "12", image: "https://picsum.photos/seed/frontraise/600/400", tip: "Agarre neutro. Sin impulso. Control total en la bajada." },
      { name: "Pájaros posterior", sets: 3, reps: "15", image: "https://picsum.photos/seed/reardelt/600/400", tip: "Inclinado al frente. Abre los brazos como alas." },
      { name: "Encogimientos trapecios", sets: 4, reps: "15", image: "https://picsum.photos/seed/shrugs/600/400", tip: "Pausa arriba 1 seg. No gires los hombros." },
      { name: "Face pull polea", sets: 3, reps: "15", image: "https://picsum.photos/seed/facepull/600/400", tip: "Polea alta. Tira hacia la cara. Codos arriba al final del movimiento." },
    ],
    extra: "HIIT 15 min, alta intensidad (30s ON / 30s OFF)",
  },
  {
    day: 5,
    title: "Pecho + Core",
    muscleGroup: "Pecho · Core",
    color: "#ec4899",
    gradient: "from-pink-600 to-rose-600",
    emoji: "🔥",
    exercises: [
      { name: "Press inclinado barra", sets: 4, reps: "12", image: "https://picsum.photos/seed/inclinebar/600/400", tip: "Banco 30-45°. Barra sobre clavículas. Pies firmes." },
      { name: "Aperturas inclinadas", sets: 4, reps: "12", image: "https://picsum.photos/seed/inclinefly/600/400", tip: "Movimiento en arco. Siente el estiramiento del pecho superior." },
      { name: "Pullover mancuerna", sets: 3, reps: "15", image: "https://picsum.photos/seed/pullover/600/400", tip: "Hombros alineados con el banco. Baja la mancuerna detrás de la cabeza." },
      { name: "Crossover polea", sets: 3, reps: "15", image: "https://picsum.photos/seed/cablecross/600/400", tip: "Polea alta. Cruza en el centro. Aprieta el pecho al final." },
      { name: "Flexiones al fallo", sets: 3, reps: "al fallo", image: "https://picsum.photos/seed/pushups/600/400", tip: "Cuerpo recto como tabla. Pecho toca el suelo en cada rep." },
      { name: "Plancha", sets: 4, reps: "40 seg", image: "https://picsum.photos/seed/plank/600/400", tip: "Caderas neutras, ni arriba ni abajo. Respira de forma controlada." },
      { name: "Crunch bicicleta", sets: 3, reps: "15", image: "https://picsum.photos/seed/bicycle/600/400", tip: "Codo hacia rodilla opuesta. No jaques el cuello." },
      { name: "Elevación piernas colgado", sets: 3, reps: "15", image: "https://picsum.photos/seed/hanginleg/600/400", tip: "Sin balanceo. Sube las piernas a 90°. Pelvis bascula al final." },
    ],
    extra: "HIIT 15 min, alta intensidad (30s ON / 30s OFF)",
  },
  {
    day: 6,
    title: "Full Body Funcional",
    muscleGroup: "Cuerpo completo",
    color: "#10b981",
    gradient: "from-emerald-500 to-teal-500",
    emoji: "⚡",
    exercises: [
      { name: "Sentadilla con press", sets: 3, reps: "15", image: "https://picsum.photos/seed/squatpress/600/400", tip: "Combina sentadilla + press arriba en un movimiento fluido." },
      { name: "Peso muerto convencional", sets: 3, reps: "10", image: "https://picsum.photos/seed/deadlift/600/400", tip: "Espalda recta. Barra pegada al cuerpo. Empuja el suelo." },
      { name: "Remo + curl combinado", sets: 3, reps: "12", image: "https://picsum.photos/seed/rowcurl/600/400", tip: "Rema con la mancuerna y al subir haz el curl. Movimiento continuo." },
      { name: "Fondos + rodillas al pecho", sets: 3, reps: "12", image: "https://picsum.photos/seed/dipknee/600/400", tip: "Al bajar en el fondo, sube las rodillas al pecho." },
      { name: "Burpees", sets: 3, reps: "20", image: "https://picsum.photos/seed/burpees/600/400", tip: "Máxima intensidad. Salta con los brazos arriba al final." },
      { name: "Mountain climbers", sets: 3, reps: "20", image: "https://picsum.photos/seed/mountainclimber/600/400", tip: "Caderas bajas. Lleva las rodillas al pecho de forma alterna y rápida." },
    ],
    extra: "Running / cinta 30 min (30s ON / 30s OFF) + activación de core",
  },
];

export function getDay(dayNumber: number): RoutineDay | undefined {
  return ROUTINE.find((d) => d.day === dayNumber);
}

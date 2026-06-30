export type Exercise = {
  name: string;
  sets: number;
  reps: string;
};

export type RoutineDay = {
  day: number;
  title: string;
  muscleGroup: string;
  exercises: Exercise[];
  extra?: string;
};

export const ROUTINE: RoutineDay[] = [
  {
    day: 1,
    title: "Pecho + Tríceps",
    muscleGroup: "pecho-triceps",
    exercises: [
      { name: "Press banca plano", sets: 4, reps: "10" },
      { name: "Press inclinado mancuerna", sets: 4, reps: "12" },
      { name: "Aperturas planas mancuernas", sets: 3, reps: "15" },
      { name: "Copa tríceps de pie", sets: 3, reps: "12" },
      { name: "Extensión tríceps polea", sets: 3, reps: "15" },
      { name: "Fondos paralelas", sets: 3, reps: "al fallo" },
    ],
    extra: "HIIT 15 min",
  },
  {
    day: 2,
    title: "Espalda + Bíceps",
    muscleGroup: "espalda-biceps",
    exercises: [
      { name: "Jalón al pecho", sets: 4, reps: "12" },
      { name: "Remo con barra", sets: 4, reps: "10" },
      { name: "Remo mancuerna", sets: 3, reps: "12" },
      { name: "Pull down estrecho", sets: 3, reps: "12" },
      { name: "Curl barra", sets: 3, reps: "12" },
      { name: "Curl martillo", sets: 3, reps: "15" },
    ],
    extra: "HIIT 15 min",
  },
  {
    day: 3,
    title: "Piernas",
    muscleGroup: "piernas",
    exercises: [
      { name: "Sentadilla libre", sets: 4, reps: "12" },
      { name: "Prensa", sets: 4, reps: "12" },
      { name: "Extensión cuádriceps", sets: 3, reps: "15" },
      { name: "Curl femoral", sets: 3, reps: "15" },
      { name: "Peso muerto piernas rígidas", sets: 4, reps: "10" },
      { name: "Pantorrillas", sets: 4, reps: "20" },
    ],
    extra: "Cardio 20 min + cinta inclinada",
  },
  {
    day: 4,
    title: "Hombros + Trapecios",
    muscleGroup: "hombros-trapecios",
    exercises: [
      { name: "Press militar", sets: 4, reps: "10" },
      { name: "Elevaciones laterales", sets: 4, reps: "15" },
      { name: "Elevaciones frontales", sets: 3, reps: "12" },
      { name: "Pájaros posterior", sets: 3, reps: "15" },
      { name: "Encogimientos trapecios", sets: 4, reps: "15" },
      { name: "Face pull polea", sets: 3, reps: "15" },
    ],
    extra: "HIIT 15 min, alta intensidad (30s ON / 30s OFF)",
  },
  {
    day: 5,
    title: "Pecho + Core",
    muscleGroup: "pecho-core",
    exercises: [
      { name: "Press inclinado barra", sets: 4, reps: "12" },
      { name: "Aperturas inclinadas", sets: 4, reps: "12" },
      { name: "Pullover mancuerna", sets: 3, reps: "15" },
      { name: "Crossover polea", sets: 3, reps: "15" },
      { name: "Flexiones al fallo", sets: 3, reps: "al fallo" },
      { name: "Plancha", sets: 4, reps: "40 seg" },
      { name: "Crunch bicicleta", sets: 3, reps: "15" },
      { name: "Elevación piernas colgado", sets: 3, reps: "15" },
    ],
    extra: "HIIT 15 min, alta intensidad (30s ON / 30s OFF)",
  },
  {
    day: 6,
    title: "Full Body Funcional",
    muscleGroup: "full-body",
    exercises: [
      { name: "Sentadilla con press", sets: 3, reps: "15" },
      { name: "Peso muerto convencional", sets: 3, reps: "10" },
      { name: "Remo + curl combinado", sets: 3, reps: "12" },
      { name: "Fondos + rodillas al pecho", sets: 3, reps: "12" },
      { name: "Burpees", sets: 3, reps: "20" },
      { name: "Mountain climbers", sets: 3, reps: "20" },
    ],
    extra: "Running / cinta 30 min (30s ON / 30s OFF) + activación de core",
  },
];

export function getDay(dayNumber: number): RoutineDay | undefined {
  return ROUTINE.find((d) => d.day === dayNumber);
}

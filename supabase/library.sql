-- Librería global de ejercicios. Correr una vez en el SQL Editor de Supabase.

create table if not exists exercise_library (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  muscle_group text not null,
  equipment text not null default '',
  image text not null default '',
  tip text not null default '',
  created_at timestamptz not null default now()
);

alter table exercise_library enable row level security;

-- Lectura pública; escritura solo desde el panel de Supabase (sin policies de insert/update)
create policy "Anyone can read exercise library"
  on exercise_library for select using (true);

-- Las rutinas ahora referencian la librería (la copia local queda como fallback)
alter table routine_exercises
  add column if not exists exercise_id uuid references exercise_library(id);

create index if not exists exercise_library_muscle_idx on exercise_library (muscle_group);
create index if not exists routine_exercises_exercise_idx on routine_exercises (exercise_id);

-- ─── Seed: ejercicios actuales de la rutina (mantener estos nombres exactos) ───
insert into exercise_library (name, muscle_group, equipment, tip) values
  ('Press banca plano', 'pecho', 'barra', 'Barra al pecho (línea pezones). Pies firmes en el suelo.'),
  ('Press inclinado mancuerna', 'pecho', 'mancuernas', 'Banco a 30-45°. Movimiento controlado sobre clavículas.'),
  ('Aperturas planas mancuernas', 'pecho', 'mancuernas', 'Brazos con ligera flexión. No bajes de la línea del cuerpo.'),
  ('Copa tríceps de pie', 'triceps', 'mancuernas', 'Manos juntas, codos pegados a la cabeza. Extiende completamente.'),
  ('Extensión tríceps polea', 'triceps', 'polea', 'Codos quietos y pegados al cuerpo. Solo mueve el antebrazo.'),
  ('Fondos paralelas', 'triceps', 'peso corporal', 'Cuerpo recto. Baja hasta 90°. Empuja con fuerza.'),
  ('Jalón al pecho', 'espalda', 'polea', 'Agarre ancho. Lleva la barra a la parte superior del pecho.'),
  ('Remo con barra', 'espalda', 'barra', 'Espalda recta. Lleva la barra al ombligo, no al pecho.'),
  ('Remo mancuerna', 'espalda', 'mancuernas', 'Rodilla en el banco. Codo pegado al cuerpo en el tirón.'),
  ('Pull down estrecho', 'espalda', 'polea', 'Agarre neutro. Contrae la espalda al final del movimiento.'),
  ('Curl barra', 'biceps', 'barra', 'Codos fijos al costado. No balancees el torso.'),
  ('Curl martillo', 'biceps', 'mancuernas', 'Agarre neutro (pulgar arriba). Trabaja el braquial.'),
  ('Sentadilla libre', 'piernas', 'barra', 'Pies a ancho de hombros. Rodillas alineadas. Pecho arriba.'),
  ('Prensa', 'piernas', 'maquina', 'No bloquees las rodillas arriba. Pies al ancho de hombros.'),
  ('Extensión cuádriceps', 'piernas', 'maquina', 'Control en la bajada. Sin impulso.'),
  ('Curl femoral', 'piernas', 'maquina', 'Caderas pegadas al banco. Contrae el isquio al máximo.'),
  ('Peso muerto piernas rígidas', 'piernas', 'barra', 'Rodillas casi extendidas. Estiramiento en isquios.'),
  ('Pantorrillas', 'piernas', 'maquina', 'Rango completo. Pausa arriba 1 segundo.'),
  ('Press militar', 'hombros', 'barra', 'Barra frente al cuello. Core apretado.'),
  ('Elevaciones laterales', 'hombros', 'mancuernas', 'Codos a la altura del hombro. Sin impulso.'),
  ('Elevaciones frontales', 'hombros', 'mancuernas', 'Agarre neutro. Control total en la bajada.'),
  ('Pájaros posterior', 'hombros', 'mancuernas', 'Inclinado al frente. Abre los brazos como alas.'),
  ('Encogimientos trapecios', 'espalda', 'mancuernas', 'Pausa arriba 1 seg. No gires los hombros.'),
  ('Face pull polea', 'hombros', 'polea', 'Polea alta. Tira hacia la cara, codos arriba.'),
  ('Press inclinado barra', 'pecho', 'barra', 'Banco 30-45°. Barra sobre clavículas.'),
  ('Aperturas inclinadas', 'pecho', 'mancuernas', 'Movimiento en arco. Estira el pecho superior.'),
  ('Pullover mancuerna', 'pecho', 'mancuernas', 'Hombros en el banco. Baja la mancuerna tras la cabeza.'),
  ('Crossover polea', 'pecho', 'polea', 'Cruza en el centro. Aprieta el pecho al final.'),
  ('Flexiones al fallo', 'pecho', 'peso corporal', 'Cuerpo recto como tabla. Pecho al suelo en cada rep.'),
  ('Plancha', 'core', 'peso corporal', 'Caderas neutras. Respiración controlada.'),
  ('Crunch bicicleta', 'core', 'peso corporal', 'Codo a rodilla opuesta. No tires del cuello.'),
  ('Elevación piernas colgado', 'core', 'peso corporal', 'Sin balanceo. Piernas a 90°.'),
  ('Sentadilla con press', 'full body', 'mancuernas', 'Sentadilla + press arriba en un movimiento fluido.'),
  ('Peso muerto convencional', 'piernas', 'barra', 'Espalda recta. Barra pegada al cuerpo.'),
  ('Remo + curl combinado', 'full body', 'mancuernas', 'Remá y al subir hacé el curl. Movimiento continuo.'),
  ('Fondos + rodillas al pecho', 'full body', 'peso corporal', 'Al bajar en el fondo, subí las rodillas al pecho.'),
  ('Burpees', 'full body', 'peso corporal', 'Máxima intensidad. Salto con brazos arriba al final.'),
  ('Mountain climbers', 'core', 'peso corporal', 'Caderas bajas. Rodillas al pecho, alternadas y rápidas.')
on conflict (name) do nothing;

-- ─── Seed: ejercicios nuevos (glúteos, variantes y funcionales) ───
insert into exercise_library (name, muscle_group, equipment, tip) values
  ('Hip thrust', 'gluteos', 'barra', 'Espalda apoyada en banco. Aprieta glúteos arriba 1 seg.'),
  ('Sentadilla búlgara', 'gluteos', 'mancuernas', 'Pie trasero en banco. Baja vertical, rodilla estable.'),
  ('Zancadas caminando', 'gluteos', 'mancuernas', 'Paso largo. Rodilla trasera casi toca el suelo.'),
  ('Peso muerto sumo', 'gluteos', 'barra', 'Pies bien abiertos, puntas afuera. Empuja con talones.'),
  ('Patada de glúteo en polea', 'gluteos', 'polea', 'Tobillera en polea baja. Extiende sin arquear la espalda.'),
  ('Abducción de cadera', 'gluteos', 'maquina', 'Abre controlado. Pausa 1 seg en máxima apertura.'),
  ('Aducción de cadera', 'piernas', 'maquina', 'Cierra controlado, sin golpear las placas.'),
  ('Puente de glúteos', 'gluteos', 'peso corporal', 'Talones cerca de glúteos. Sube caderas y aprieta.'),
  ('Sentadilla goblet', 'piernas', 'mancuernas', 'Mancuerna al pecho. Codos entre las rodillas al bajar.'),
  ('Sentadilla hack', 'piernas', 'maquina', 'Espalda pegada al respaldo. Baja profundo.'),
  ('Step up al banco', 'gluteos', 'mancuernas', 'Sube con un solo pie, sin impulsar con el otro.'),
  ('Buenos días con barra', 'piernas', 'barra', 'Rodillas semiflexionadas. Bisagra de cadera, espalda recta.'),
  ('Dominadas', 'espalda', 'peso corporal', 'Desde brazos extendidos, mentón sobre la barra.'),
  ('Remo en polea baja', 'espalda', 'polea', 'Pecho afuera. Lleva el agarre al abdomen.'),
  ('Remo en máquina', 'espalda', 'maquina', 'Pecho apoyado. Junta las escápulas al tirar.'),
  ('Pullover en polea alta', 'espalda', 'polea', 'Brazos casi rectos. Lleva la barra a los muslos.'),
  ('Hiperextensiones', 'espalda', 'peso corporal', 'Sube hasta alinear el cuerpo. No hiperextiendas.'),
  ('Press banca mancuernas', 'pecho', 'mancuernas', 'Mayor rango que con barra. Controla la bajada.'),
  ('Press de pecho en máquina', 'pecho', 'maquina', 'Espalda apoyada. Empuja sin bloquear codos.'),
  ('Peck deck', 'pecho', 'maquina', 'Brazos semiflexionados. Junta al centro y aprieta.'),
  ('Flexiones inclinadas', 'pecho', 'peso corporal', 'Manos en banco. Ideal para empezar o cerrar la sesión.'),
  ('Press Arnold', 'hombros', 'mancuernas', 'Rota las palmas al subir. Movimiento continuo.'),
  ('Press mancuernas sentado', 'hombros', 'mancuernas', 'Espalda apoyada. Sube hasta casi juntar las mancuernas.'),
  ('Elevaciones laterales en polea', 'hombros', 'polea', 'Tensión constante. Sube hasta la altura del hombro.'),
  ('Remo al mentón', 'hombros', 'barra', 'Codos siempre más arriba que las manos.'),
  ('Curl inclinado', 'biceps', 'mancuernas', 'Banco a 45°. Brazos colgando, estira bien abajo.'),
  ('Curl concentrado', 'biceps', 'mancuernas', 'Codo apoyado en el muslo. Contracción máxima.'),
  ('Curl en polea baja', 'biceps', 'polea', 'Tensión constante en todo el recorrido.'),
  ('Curl predicador', 'biceps', 'maquina', 'Brazos sobre el banco. No extiendas de golpe.'),
  ('Press francés', 'triceps', 'barra', 'Acostado. Baja la barra a la frente, codos quietos.'),
  ('Patada de tríceps', 'triceps', 'mancuernas', 'Torso paralelo al suelo. Extiende hacia atrás.'),
  ('Fondos en banco', 'triceps', 'peso corporal', 'Manos al borde del banco. Codos hacia atrás.'),
  ('Extensión sobre cabeza en polea', 'triceps', 'polea', 'De espaldas a la polea. Extiende sobre la cabeza.'),
  ('Crunch abdominal', 'core', 'peso corporal', 'Despega solo los omóplatos. Exhala al subir.'),
  ('Russian twist', 'core', 'peso corporal', 'Torso a 45°. Gira controlado de lado a lado.'),
  ('Plancha lateral', 'core', 'peso corporal', 'Cuerpo en línea. Cadera arriba, sin colapsar.'),
  ('Rueda abdominal', 'core', 'peso corporal', 'Rueda hacia adelante sin arquear la lumbar.'),
  ('Elevación de piernas en suelo', 'core', 'peso corporal', 'Lumbar pegada al suelo. Baja lento sin tocar.'),
  ('Dead bug', 'core', 'peso corporal', 'Extiende brazo y pierna opuestos. Lumbar al suelo.'),
  ('Kettlebell swing', 'full body', 'kettlebell', 'Impulso de cadera, no de brazos. Hasta la altura del pecho.'),
  ('Battle ropes', 'full body', 'cuerdas', 'Ondas rápidas y constantes. Rodillas semiflexionadas.'),
  ('Remo ergómetro', 'cardio', 'maquina', 'Piernas → torso → brazos. Ritmo constante.'),
  ('Saltos al cajón', 'full body', 'peso corporal', 'Aterriza suave con rodillas flexionadas.'),
  ('Jumping jacks', 'cardio', 'peso corporal', 'Ritmo constante. Ideal para calentar.'),
  ('Farmer''s walk', 'full body', 'mancuernas', 'Peso pesado, torso erguido. Camina pasos cortos.')
on conflict (name) do nothing;

-- ─── Migrar rutinas existentes: vincular por nombre ───
update routine_exercises re
set exercise_id = el.id
from exercise_library el
where re.exercise_id is null and el.name = re.name;

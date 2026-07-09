-- Vincular imágenes del bucket "ejercicios" a la librería global.
-- Correr en el SQL Editor. Re-ejecutable: solo pisa la columna image.

update exercise_library el
set image = 'https://fdhhloorqmrzkybdicpx.supabase.co/storage/v1/object/public/ejercicios/' || v.slug || '.webp'
from (values
  ('Aperturas planas mancuernas', 'aperturas-planas-mancuernas'),
  ('Jalón al pecho', 'jalon-al-pecho'),
  ('Remo con barra', 'remo-con-barra'),
  ('Remo mancuerna', 'remo-mancuerna'),
  ('Pull down estrecho', 'pull-down-estrecho'),
  ('Curl barra', 'curl-barra'),
  ('Curl martillo', 'curl-martillo'),
  ('Sentadilla libre', 'sentadilla-libre'),
  ('Prensa', 'prensa'),
  ('Extensión cuádriceps', 'extension-cuadriceps'),
  ('Curl femoral', 'curl-femoral'),
  ('Peso muerto piernas rígidas', 'peso-muerto-piernas-rigidas'),
  ('Pantorrillas', 'pantorrillas'),
  ('Press militar', 'press-militar'),
  ('Elevaciones laterales', 'elevaciones-laterales'),
  ('Elevaciones frontales', 'elevaciones-frontales'),
  ('Pájaros posterior', 'pajaros-posterior'),
  ('Encogimientos trapecios', 'encogimientos-trapecios'),
  ('Face pull polea', 'face-pull-polea'),
  ('Press inclinado barra', 'press-inclinado-barra'),
  ('Aperturas inclinadas', 'aperturas-inclinadas'),
  ('Pullover mancuerna', 'pullover-mancuerna'),
  ('Crossover polea', 'crossover-polea'),
  ('Flexiones al fallo', 'flexiones-al-fallo'),
  ('Plancha', 'plancha'),
  ('Crunch bicicleta', 'crunch-bicicleta'),
  ('Elevación piernas colgado', 'elevacion-piernas-colgado'),
  ('Sentadilla con press', 'sentadilla-con-press'),
  ('Peso muerto convencional', 'peso-muerto-convencional'),
  ('Fondos + rodillas al pecho', 'fondos-rodillas-al-pecho'),
  ('Burpees', 'burpees'),
  ('Mountain climbers', 'mountain-climbers'),
  ('Flexiones inclinadas', 'flexiones-inclinadas'),
  ('Crunch abdominal', 'crunch-abdominal'),
  ('Elevación de piernas en suelo', 'elevacion-de-piernas-en-suelo')
) as v(name, slug)
where el.name = v.name;

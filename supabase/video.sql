-- Columna de video para la librería de ejercicios. Correr una vez en el SQL Editor.
-- Acepta: URL de .mp4/.webm (ej. del bucket "ejercicios") o link de YouTube.

alter table exercise_library
  add column if not exists video text not null default '';

-- Ejemplo para vincular videos subidos al bucket (mismo patrón que las imágenes):
-- update exercise_library set video = 'https://fdhhloorqmrzkybdicpx.supabase.co/storage/v1/object/public/ejercicios/press-banca-plano.mp4'
--   where name = 'Press banca plano';

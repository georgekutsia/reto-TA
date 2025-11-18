# IA-USO

## Modelos empleados
- ChatGPT (Codex CLI, modelo GPT-4.1) para idear prompts y refinar la implementacion.
- Apify + GPT (via prompt sugerido) para obtener un extracto simplificado del DOM/CSS/JS del cronometro original.

## Prompts clave
1. **"Visit https://www.online-stopwatch.com/stopwatch/. Output only the DOM, styles, and inline JavaScript needed to recreate the stopwatch widget..."**  
   - Usado para que Apify + GPT entregara un snippet base minimalista con display, botones de start/stop/reset y funcionalidad esencial.
2. **"Esta es la respuesta. dime si es suficiente..."** (en ChatGPT)  
   - Conversacion para evaluar si el snippet era suficiente como punto de partida y definir alcances.
3. **"pues empieza"**  
   - Peticion directa a ChatGPT para generar la solucion completa con UI mejorada, laps, fullscreen y documentacion.

## Respuestas aprovechadas casi tal cual
- El bloque HTML/CSS/JS devuelto por Apify + GPT sobre el cronometro basico se uso como referencia directa para definir la estructura: display principal, botones primarios y lista de laps. Aunque luego se reescribio con estilos avanzados, la idea de dividir display/controles/laps provenia casi sin cambios del snippet.

## Respuestas corregidas o descartadas
- La misma respuesta de Apify carecia de milisegundos visibles, estilos acordes al sitio original, botones adicionales (lap real, fullscreen) y gestion de sonido. Se descarto su JS de laps (no conectaba ningun boton) y se reimplemento el cronometro con `requestAnimationFrame`, estados mas precisos y mejoras de accesibilidad.

## Reflexion y mejoras futuras
- El primer prompt a Apify fue util pero muy generico. Si repitiera el ejercicio pediria explicitamente "incluye tambien la logica de laps con boton y formato mm:ss.cc" y "describe los estilos claves del display" para reducir reescritura.
- Tambien agregaria un prompt adicional a ChatGPT orientado a brainstorm de microinteracciones (animaciones, sonidos) antes de codificar, para acelerar la fase de diseno visual.

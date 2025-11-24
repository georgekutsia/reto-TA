# IA-USO

Registro del uso de inteligencia artificial durante el desarrollo del reto Teaching Assistant – Online Stopwatch.

---

## Modelos empleados

- **ChatGPT (Codex CLI · GPT‑4.1)**: asistente principal para idear, refactorizar y depurar la UI/UX del clon canvas y del cronómetro clásico.
- **Apify + GPT extractor (referencia inicial)**: usado al comienzo para obtener un snippet minimalista del DOM/CSS/JS del sitio original y así entender la estructura base del display y botones.

---

## Prompts / peticiones destacadas

1. **“vamos a empezar a crear el canvas… en la foto el canvas está en el centro…”**  
   - Resultado: estructura básica del `canvas-shell`, importación de imágenes de flechas y primer render con dos tarjetas (Stopwatch/Countdown).

2. **“ahora haz que aparezca cursor pointer cuando hago hover encima de las flechas…”**  
   - Resultado: mapeo de paneles y función `getHomePanels()` + listeners de `mousemove` para cambiar `canvas.style.cursor`.

3. **“ahora cuando pulso en la flecha de stopwatch quiero que el canvas parezca que rota…”**  
   - Resultado: animación inicial con rotación + transición; luego se simplificó a un deslizamiento horizontal cuando se solicitó quitar el giro.

4. **“cuando pulso en el botón start en esta nueva pantalla… que empiece una cuenta…”**  
   - Resultado: `state.timer` para la vista canvas con modos `idle/running/paused`, `handleStartButton`, `getTimerSnapshot`, botonera Start/Pause/Continue, etc.

5. **“el de Countdown… en la parte superior es el mismo display… y abajo hay números”**  
   - Resultado: keypad numérico, detección por teclado, `state.countdown` con `input/ready/running`, Set/Clear, animaciones inversas y reutilización del display.

6. **“cuando en Countdown aparecen los botones start… haz que también se convierta en cursor pointer”**  
   - Resultado: ajuste al handler de `mousemove` para compartir zonas interactivas entre Stopwatch y Countdown.

*(El resto de prompts fueron iteraciones más pequeñas: cambios de color, desplazamiento del texto, limpiar estado al volver con Back, etc.)*

---

## Cómo se usó la IA en el flujo

- **Ideación visual**: describí capturas del sitio original y pedí a la IA que propusiera la estructura HTML/CSS/Canvas. En varios casos (barras azules, keypad, transición horizontal) construyó el boceto que luego pulí manualmente.
- **Refactor / DRY**: solicité expresamente “usar el mismo código en ambos displays” y se generó el helper `drawTimerDisplay`, evitando duplicar la lógica de renderizado.
- **Depuración guiada**: cuando el cursor dejó de cambiar en Countdown, la IA señaló que el listener sólo revisaba `controlZones` en Stopwatch, indicando exactamente dónde extender la lógica.
- **Documentación**: recopilé los pasos y mandatos clave para redactar este `README` y `IA-USO.md`, asegurando que los entregables cumplan los criterios del reto.

---

## Reflexión personal

- **Qué ayudó**: usar la IA como compañero de “whiteboarding” en el canvas aceleró mucho las iteraciones visuales. Pedirle transiciones específicas o replicar un layout a partir de una captura redujo el tiempo de prueba/error. También fue útil para mantener consistencia (e.g., cuando señalé que los displays debían ser idénticos).
- **Qué no ayudó**: los prompts iniciales a Apify eran demasiado generales; el snippet carecía de laps, milisegundos y lógica real, así que tuve que reescribirlo completamente. Aprendí a pedir algo más concreto (“incluye botones, estilos, milisegundos”) para evitar retrabajo.
- **Aprendizajes**:
  - Mantener un estado explícito (`state.timer`, `state.countdown`) facilita pedirle a la IA cambios puntuales sin romper lo existente.
  - Conviene documentar desde el principio qué partes dependen de IA para luego rellenar `IA-USO.md` sin tener que revisar todo el chat.
  - Las animaciones y los detalles de UX (hover, cursor, transiciones) son un buen uso de IA, pero siempre deben validarse visualmente para asegurar que coinciden con la maqueta real.

En resumen, la IA funcionó como un pair-programmer enfocado en UI/UX y documentación, mientras que yo me encargué de validar funcionalidad, limpiar el código y ajustar los detalles que la maqueta necesitaba.

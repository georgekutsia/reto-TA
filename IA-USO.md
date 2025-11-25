# IA-USO


Registro del uso de inteligencia artificial durante el desarrollo del reto Teaching Assistant – Online Stopwatch. El documento funciona como bitácora: resume cómo se apoyó la IA para construir el canvas, el cronómetro clásico y la documentación final.

---

## Modelos empleados

- **ChatGPT (Codex CLI · GPT‑4.1 / GPT‑4.1‑mini)**  
  Asistente principal. Se utilizó para idear la estructura del canvas, proponer animaciones, sugerir refactors y redactar los entregables.
- **Apify + GPT extractor**  
  Referencia puntual del DOM/CSS del sitio original. El snippet resultó incompleto (sin laps ni milisegundos), así que el código se reescribió manualmente, pero sirvió para captar la jerarquía base.
- **NotebookLM (Google)**  
  Herramienta externa usada para generar borradores de texto (README, descripciones del proyecto) y para esbozar el guion del podcast/video antes de integrarlo en los popups.

---

## Prompts / hitos destacados

### 60 prompts en CODEX; 
### De ellos, ≈22 fueron “relevantes” (introdujeron o modificaron funcionalidad mayor: canvas, countdown lógico, popups, alarma, etc.) y 38 fueron ajustes menores (colores, bordes, tooltips, tamaño de botones…). 
### En cuanto al ámbito técnico, 18 peticiones centradas sólo en CSS, 9 sólo en HTML y 33 con efectos directos en JavaScript (animaciones, estado, audio/video, canvas).

### Pompts Destacados con CODEX

1. **Tras inicia el proyecto, le pasé el reto técnico a CODEX y le pedí lo siguiente:**  
   – Tengo esta prueba técnica que resolver. no estoy seguro de si me piden que haga solamente la parte de la pagina que simplemente empieza la cuenta y se para, o todo lo que hay en la página, que es muchisimo. SI puedes, revisa la página web. Por otro lado, necesito que me digas alguna IA que sirva de Web Scrapper para coger todo el código de la página web.
![Referencia](public\img-mg\Prompt1.png)
2. **Como no conseguí suficiente información con scarping, decidí hacerlo pasando imágenes y pidiendo poco a poco ajustar ciertos detalles a CODEX. Tras crear un primer intento de contador:**

![Referencia](public\img-mg\Prompt2.png)

3. **Le pedí crear botones para mostrar distintas partes o complejidades del proyecto.**
![Referencia](public\img-mg\Prompt3.png)

4. **Le pasé la imágen completa de la página para empezar con el proyecto. Tras eso estuvimos mucho tiempo ajustando, con prompts menores y modificaciones manuales**

![Referencia](public\img-mg\Prompt4.png)

5. **Empecé con la funcionalidad del Canvas que contendría el contador**

![Referencia](public\img-mg\Prompt5.png)
6. **Le pedí corregir su interpretación de la imágen y del código que le había pasado anteriormente de inspeccionar la web**

![Referencia](public\img-mg\Prompt6.png)

7. **Creamos un css nuevo para el canvas y empezamos ajustar tanto la lógica como el diseño**

![Referencia](public\img-mg\Prompt7.png)

8. **Le empecé a pasar imágenes y explicaciones de cómo hacer que cambie entre las opciones, de una pantalla a otra y la posición.**

![Referencia](public\img-mg\Prompt8.png)
![Referencia](public\img-mg\Prompt9.png)
![Referencia](public\img-mg\Prompt10.png)
![Referencia](public\img-mg\Prompt11.png)

9. **Tras hacer todos los ajustes pequeños entre medias, pasé a la funcionalidad de Stopwatch.**

![Referencia](public\img-mg\Prompt12.png)
![Referencia](public\img-mg\Prompt13.png)

10. **Entre otros prompts pequeños y probando que todo funciona, pasé a la parte de Countdown**

![Referencia](public\img-mg\Prompt14.png)
![Referencia](public\img-mg\Prompt15.png)
![Referencia](public\img-mg\Prompt16.png)
![Referencia](public\img-mg\Prompt17.png)
![Referencia](public\img-mg\Prompt18.png)

### Pompts Destacados con NotebookLM

1. **Primero le pasé un pdf de los requisitos para la prueba, para darle contexto y después fui guiándolo para que me devolviera un documento nuevo que pudiera usar tanto para generar el audio y el video como para hacer el README**

![Referencia](public\img-mg\Cod1.png)
![Referencia](public\img-mg\Cod2.png)
![Referencia](public\img-mg\Cod3.png)

2. **Le pasé todo lo recogido en NotebookLM a CODEX para hacer un README y IA-USO mejor estructurado que probé en readme.so"

*(Otros prompts cubrieron ajustes finos: tooltips personalizados, popups multimedia, animaciones premium, etc.)*

---

## Integración en el flujo

- **Ideación visual**: describí las capturas y la IA armó la base (barras azules, keypad, paneles). Después ajusté manualmente tamaños, colores y tipografías para que coincidieran con la referencia.
- **Refactor y consistencia**: al pedir “mismo código para ambos displays” surgió `drawTimerDisplay`, evitando duplicaciones en stopwatch/countdown.
- **Depuración guiada**: cuando el hover dejó de reaccionar en Countdown, la IA señaló que el listener sólo revisaba `controlZones` del Stopwatch, lo cual permitió corregirlo al momento.
- **Documentación**: la IA ayudó a condensar los requisitos en `README.md` e `IA-USO.md`, asegurando que los entregables cumplieran los criterios del reto.

---

## Reflexión personal

- **Qué ayudó**: tratar a la IA como “pair programmer” visual aceleró las iteraciones (transiciones, popups, animaciones). También mantuvo coherencia entre displays cuando se pidió explícitamente.
- **Qué no ayudó**: los primeros prompts a Apify eran demasiado generales; el snippet resultante no contenía la lógica necesaria. A partir de ahí solicité componentes concretos para evitar retrabajo.
- **Aprendizajes**:
  - Mantener un estado explícito (`state.timer`, `state.countdown`, flags de alarma) facilita pedir cambios incrementales sin romper otras partes.
  - Conviene desactivar overlays/tooltip globales cuando se trabaja con controles dentro del canvas.
  - Documentar cada intervención desde el inicio facilita componer este archivo sin revisar todo el historial.
  -Hacer commits cada poco para evitar que un prompt mal planteado resquebraje todo lo trabajado y no se pueda volver atrás

En resumen, la IA se comportó como un copiloto centrado en UI/UX y documentación, mientras yo validé la funcionalidad, limpié el código y aseguré que la réplica coincidiera visualmente con la maqueta real.
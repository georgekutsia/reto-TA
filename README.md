
# Reto Técnico para TA en LIDR

# Reto Técnico – Réplica completa de Online Stopwatch

Proyecto estático que recrea la experiencia de **online-stopwatch.com** usando exclusivamente _HTML + CSS + JavaScript_. El layout general, los popups de audio/video y el cronómetro clásico conviven con un canvas donde se dibuja todo el UI interactivo (flechas, paneles, keypad, botones animados, etc.).

---

## Qué incluye

- **Selector lateral de vistas** (Intento 1 · Réplica mínima · Réplica completa) con tooltips personalizados a la izquierda y botones extra de _Podcast_ y _Video_.
- **Intento 1**: cronómetro clásico con display LCD, botones Iniciar/Lap/Reiniciar/Pantalla completa/Limpiar y lista de laps. Los tooltips globales se desactivaron para estos controles para no bloquear el hover.
- **Répl. mínima**: modo “canvas only”; al cambiar, el `canvas` se desacopla del layout completo y se coloca centrado sobre fondo blanco en pantalla completa.
- **Répl. completa**:
  - Encabezado, navegación y premium cards con animaciones tipo _shine_ sincronizadas.
  - Canvas responsivo que replica los paneles _Stopwatch_ / _Countdown_, flechas con hover en toda la sección, transiciones horizontales, botón _Back_ integrado en la franja inferior y cursor pointer donde corresponde.
  - **Stopwatch canvas**: botones Start/Pause/Continue/Clear dentro del canvas y transición horizontal desde/ hacia el panel principal.
  - **Countdown canvas**:
    - Keypad numérico (5-9/0-4) con degradados y soporte de teclado (`0-9`, `Backspace`, `Enter`).
    - Botón **Set** para fijar la entrada y, al hacerlo, controles Start/Pause/Continue/Clear.
    - Cuando la cuenta llega a cero, el display parpadea cada 0.5 s entre rojo y el fondo original y suena `public/audio/alarm-sound.mp3`. Mientras la alarma está activa sólo permanece el botón rojo **Clear**.
- **Extras multimedia**:
  - Popup “Podcast” con audio `public/audio/Podcast.wav`: play/pause, stop, selector de velocidad y cierre sin tooltips invasivos.
  - Popup “Video” (`public/Video/Resume.mp4`) con barra de progreso, tiempos actual/duración, botón pantalla completa, selector de velocidad y alternancia “Aumentar/Reducir” que modifica el ancho del contenedor.

---

## Estructura del repositorio

```
index.html        # Vistas, switcher lateral, popups de audio/video
styles.css        # Estilos globales, tooltips, premium buttons, view switcher, etc.
canvas.css        # Layout del canvas y modo canvas-only
script.js         # Cronómetro clásico, escena canvas, lógica countdown, audio/video
IA-USO.md         # Historial de prompts y reflexión sobre el uso de IA
public/
  ├── audio/
  │     ├── Podcast.wav
  │     └── alarm-sound.mp3
  ├── Video/Resume.mp4
  └── arrow-up.png / arrow-down.png
```

---

## Cómo ejecutar

No hay build ni dependencias. Clona el repo y abre `index.html` en cualquier navegador moderno.

```bash
git clone https://github.com/<tu-usuario>/reto-TA.git
cd reto-TA

# Windows
start index.html

# macOS
open index.html

# Linux
xdg-open index.html
```

---

## Detalles técnicos relevantes

- Amplia paleta definida en `:root` (blancos, azules, dorados, verdes, etc.) para facilitar ajustes globales.
- `initViewSwitcher` mueve físicamente el canvas entre el host “full” o “minimal” y añade `body.canvas-only-mode` cuando procede.
- `script.js` gestiona:
  - Cronómetro clásico (`initAdvancedStopwatch`).
  - Escena canvas (`initCanvasStage`): animaciones, detección de hover/click, keypad, alarmas, etc.
  - Reproductores emergentes (`initPodcastPlayer`, `initVideoPlayer`) con controles personalizados y sin tooltips globales.
  - Alarma del countdown: parpadeo del display + audio loop hasta que el usuario presiona **Clear**.
- `canvas.css` contiene el layout del modo canvas-only y el dimensionado flexible para el canvas principal.

---



Con este README queda documentado lo que se describe en el archivo suministrado: estructura, estilos, animaciones y comportamiento general de la réplica. Sólo necesitas abrir `index.html` para probarla. ¡Listo! 🎯

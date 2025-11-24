# Reto Técnico – Stopwatch & Countdown

Replica funcional de la interfaz “Online Stopwatch” construida únicamente con **HTML + CSS + JavaScript**. Incluye el cronómetro clásico con laps y una pantalla tipo canvas que reproduce los modos *Stopwatch* y *Countdown* con transiciones animadas.

---

## Características

### Panel clásico
- Display LCD con horas/minutos/segundos/centésimas.
- Botón Start/Pause/Reset, fullscreen y registro de laps con diferencias acumuladas.
- Toggle para activar/desactivar el beep al iniciar/detener.

### Panel canvas (clon Online-Stopwatch)
- Canvas responsivo con animación entre tarjetas (Stopwatch ↔ Countdown).
- Stopwatch canvas: flechas animadas, transición horizontal, botones Start/Pause/Continue/Clear.
- Countdown canvas: keypad numérico + soporte de teclado (0‑9, Backspace, Enter), botón Set para fijar el tiempo y controles Start/Pause/Continue/Clear para la cuenta regresiva.
- Barra inferior con botón Back integrado y cursor *pointer* en todos los elementos interactivos.

---

## Requisitos

- Navegador moderno (Chromium, Firefox, Safari, Edge).
- No se requiere servidor ni dependencias adicionales.

---

## Instalación / Ejecución

1. Clona el repositorio.
   ```bash
   git clone https://github.com/<tu-usuario>/reto-TA.git
   cd reto-TA
   ```
2. Abre el proyecto:
   - Doble clic sobre `index.html`, **o**
   - Usa Live Server (VS Code) para recarga automática.

```
# Windows
start index.html

# macOS
open index.html

# Linux
xdg-open index.html
```

### Atajos útiles
- **Countdown**: teclas numéricas rellenan el display de derecha a izquierda; `Backspace/Delete` borra; `Enter` equivale al botón **Set**; una vez fijado el tiempo `Enter` inicia/pausa la cuenta.
- **Stopwatch canvas**: clic en flechas centrales → animación al modo correspondiente; Back vuelve e interrumpe cualquier conteo.

---

## Estructura del proyecto

```
index.html   # Layout principal y vistas
styles.css   # Estilos globales
canvas.css   # Estilos específicos para el canvas replica
script.js    # Lógica del cronómetro, canvas y countdown
IA-USO.md    # Uso de IA: prompts, explicación y reflexión
README.md    # Este documento
public/      # Recursos (flechas, etc.)
```

---

## Detalles para revisión

- El proyecto se sirve solo con archivos estáticos (HTML/CSS/JS).
- `script.js` separa claramente lógica DOM vs. canvas (`initAdvancedStopwatch`, `initCanvasStage`, etc.).
- `IA-USO.md` documenta los prompts, decisiones apoyadas en IA y aprendizajes.

---

## Próximos pasos sugeridos

- Añadir alarmas/sonidos configurables cuando termina el countdown.
- Persistir el último estado en `localStorage`.
- Desplegar en GitHub Pages para facilitar la demo pública.

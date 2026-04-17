# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Bodhitrí** — landing page de una sola página para un holding empresarial colombiano. Toda la UI vive en un único archivo HTML autocontenido sin frameworks ni herramientas de build.

Archivos:
- `index.html` — estructura HTML pura
- `style.css` — todos los estilos (fusión de los dos bloques `<style>` originales)
- `script.js` — todo el JS; cargado con `<script src>` al final del `<body>`

## Cómo desarrollar

Abrir directamente en el navegador — no requiere servidor. Doble clic al archivo o `file://` en la barra de dirección. No hay proceso de build, empaquetado ni dependencias npm.

## Design System

Variables CSS en `:root`:
- `--verde: #152D0C` — color primario (oscuro)
- `--verde-oscuro: #1A3A0F` — fondo hero/métricas
- `--arena: #C4956A` — acento dorado
- `--crema: #F9EDDC` — fondo claro / texto sobre oscuro

Tipografía: `Space Grotesk` (Google Fonts, pesos 300/400/500/600/700).  
Tamaños de fuente en `rem` pequeños (`.64rem`–`.95rem`) con `letter-spacing` y `text-transform:uppercase` frecuentes.

## Arquitectura del panel system

La página usa scroll de pantalla completa con **4 paneles** (`TOTAL=4`) gestionados por JS puro:

- `.stage` es el contenedor `position:fixed;inset:0`
- Cada `.panel` es `position:absolute;inset:0` con `transform:translateY`
- Estados: `.active` (visible), `.past` (arriba), sin clase (abajo)
- La función `goTo(idx, dir)` maneja transiciones con `cubic-bezier(.77,0,.18,1)` en 850 ms; bloquea inputs durante `scrolling=true` (950 ms total)
- Navegación: rueda del ratón, touch swipe, teclas ArrowUp/Down/PageUp/PageDown, dots laterales (`[data-target]`), links `[data-panel]`
- Inicialización: panel 0 recibe `.active`, todos los demás reciben `.past` (línea ~315)

Paneles en orden:
| idx | clase | fondo |
|-----|-------|-------|
| 0 | `.panel-hero` | `--verde-oscuro`, grid 2 columnas |
| 1 | `.panel-companies` | `--crema`, grid 3×2 cards |
| 2 | `.panel-philosophy` | `--arena`, grid 2 columnas |
| 3 | `.panel-metrics` | `--verde-oscuro`, grid 4 columnas |

## Canvas de anillos (panel 0)

`#ringCanvas` cubre todo el hero. El centro (`RCX`, `RCY`) se ancla al logo central (`#logoCenter`) tras su carga via `getBoundingClientRect()`. Si el logo aún no cargó, usa posición de respaldo (`W*0.75`, `H*0.5`).

- 7 anillos (`NUM_RINGS`) animados con `Math.sin` en el loop `requestAnimationFrame`
- Al hover sobre el canvas los anillos cercanos al cursor se amplifican (`targetAmp`, lerp de 0.06)
- Ripples automáticos cada ~3200 ms, animados en 2200 ms
- `lineWidth`: en reposo `1.6`, al interactuar hasta `~4`
- Color interpola de crema (`249,237,220`) a arena (`196,149,106`) según amplitud

## Sonido ambiental (Web Audio API)

Generado proceduralmente — sin archivos externos. Activado por `#forestBtn` (esquina inferior derecha). `forestNodes` se inicializa como array vacío y luego se sobreescribe con objeto `{master,wind,leaves,lfo}`.

Componentes:
- **Viento**: ruido marrón (buffer loop) → dos filtros lowpass (320 Hz, 180 Hz) → `windGain` modulado por LFO a 0.07 Hz
- **Hojas**: ruido blanco → filtro bandpass a 3200 Hz, `Q=0.4`, `gain=0.045`
- **Pájaros**: 3 osciladores `sine` con `setTimeout` recursivo y variación aleatoria ±40%

El nodo `master` hace fade in (3 s) / fade out (1.5 s) al toggle. Requiere interacción previa del usuario por políticas del navegador.

## Cursor personalizado

`cursor:none` en body. `#cursor` (punto 10px) y `#cursor-trail` (aro 32px con delay de 80 ms). La clase `.hov` en body agranda ambos al hacer hover sobre `button, a, .c-card, .val-item`.

## Contador animado (panel 3)

`animateCounters()` se dispara una sola vez (`countersRan`) al navegar al panel 3, con delay de 500 ms. Targets: `#mn0`=5, `#mn1`=360, `#mn2`=8. Anima en pasos de `Math.ceil(target/30)` cada 35 ms preservando el `<span>` de sufijo.

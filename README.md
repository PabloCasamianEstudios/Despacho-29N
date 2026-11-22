# Despacho 29-N

Juego de escritorio burocrático para las elecciones generales del 29 de noviembre de 2026. Te llegan propuestas reales de los programas de PP, PSOE, Vox y Frente Amplio, **sin logos ni remitente**: las apruebas o rechazas con un sello, trituras las que no tienes claras y, en los expedientes, eliges una sola opción entre varias. Al final descubres a qué partido se parece tu despacho y dónde caes en la brújula política.

No es una encuesta ni una recomendación de voto. Ningún partido participa ni patrocina el juego.

## Tecnología

- React 19 y TypeScript
- SCSS (parciales por zona de la mesa)
- Vite
- Web Audio API: todos los sonidos se sintetizan en tiempo real, sin archivos de audio

## Comandos

| Comando | Qué hace |
| --- | --- |
| `npm install` | Instala las dependencias |
| `npm run dev` | Servidor de desarrollo en `http://localhost:5196` |
| `npm run build` | Comprueba los tipos y genera la web en `dist/` |
| `npm run itch` | Compila y crea `despacho-29n-itch.zip`, listo para subir a itch.io como juego HTML |

## Estructura

```
src/
  data/         propuestas, expedientes y partidos
  game/         motor del juego, puntuación, brújula, sonido y tipos
  hooks/        useGame, useStageFit, useFullscreen, useGameInput, useLockScroll
  components/
    desk/       mesa: bandejas, calendario, papeles, sellos, lupa, trituradora
    screens/    portada, periódico de cada jornada e informe final
    overlays/   intro, tutorial y pausa
  styles/       SCSS
  dev/          atajos de prueba (solo en desarrollo, no entran en el build)
```

El estado vive en un pequeño store propio (`game/store.ts`) que los componentes leen con `useSyncExternalStore` a través de `useGame`.

## Modo de prueba

En desarrollo, `?demo=` salta a un momento concreto: `arrancar`, `tuto&step=N`, `mesa`, `triturar`, `expediente`, `periodico` o `final`.

## Créditos

- Un juego de The Penguin Pilots Devs
- Tipografías: Zilla Slab (Typotheque para Mozilla, SIL Open Font License) y Ultra (Astigmatic, Apache License 2.0). Las licencias van en `public/fonts/`.
- Código asistido por Claude, de Anthropic

# Despacho 29-N: ficha para pedir opinión

> Este documento sirve para pedir opinión a otros agentes o personas sobre el proyecto. Responde a las preguntas del final. Las respuestas concretas sirven más que los elogios.

## La idea en una frase
Un juego de escritorio con ratón, en la línea de *Papers, Please*, *Death and Taxes* o *Headliner*. Te llegan **propuestas reales de los programas electorales** de las generales españolas del **29 de noviembre de 2026**, pero **sin decir de qué partido son**. Las apruebas o las rechazas con un sello, y al final el juego te dice **a qué partido te pareces más**.

## Contexto
- Lo publicaremos gratis en **itch.io** antes del 29-N (quedan unos 9 días). Es HTML5, se juega en el navegador y no necesita servidor.
- Partidos: **PP, PSOE, Vox y Frente Amplio** (la coalición de Sumar, IU, Más Madrid y Comuns).
- No usamos **ningún recurso con copyright**: no hay imágenes, fuentes descargadas, música ni logos. El dibujo está hecho con CSS y los sonidos se sintetizan en el momento con WebAudio.
- No hay música, a propósito. Solo sonidos que se sienten bien: el golpe del sello, el papel, la trituradora, el timbre y el periódico.

## Cómo se juega
1. **Tutorial:** el día 1 siempre empieza con una «jefa de gabinete» que explica la mesa enfocando cada zona; no se puede saltar. El primer expediente trae su propia explicación al llegar.
   **Calendario de taco:** cada jornada empieza tirando con el ratón de la hoja del día anterior hasta arrancarla; hasta entonces no llega ningún papel. El café y la pluma se pueden mover por la mesa.
   **Menú de pausa** (engranaje o Esc): sonido, pantalla completa y volver al inicio. En la portada hay un botón de salir.
   **Intro:** pantalla en negro con un texto que aparece y se desvanece: «La política no debería separar al pueblo. No es algo de izquierda contra derecha, son los de arriba contra los de abajo.». Después se aclara el negro y aparece el juego.
2. **6 jornadas**, del lunes 23 al sábado 28 de noviembre. El sábado es la jornada de reflexión.
3. **Propuestas sueltas:** el papel sale por la bandeja de PENDIENTES. Coges el sello ✓ (aprobar) o ✗ (rechazar), lo sueltas encima del papel y lo llevas a DECIDIDAS. Si lo echas a la trituradora, cuenta como **«no lo tengo claro»** (voto en blanco) y no suma ni resta en el resultado.
   - **Lupa:** si la arrastras sobre un papel, le pega un pósit «DICHO FÁCIL» que explica la propuesta en lenguaje de calle (qué es el CGPJ, qué hace la Ley de Memoria Democrática, etc.). Con un toque se quita.
4. **Expedientes:** llegan 3 o 4 propuestas sobre el mismo tema (vivienda, impuestos, inmigración, energía, familia, trabajo), una de cada partido. Solo puede salir **una**, aprobada. Las demás tienen que acabar en la trituradora.
5. **Al acabar cada jornada** sale un periódico, «El Diario del Despacho», con titulares de lo que has aprobado.
6. **El 29-N** aparece el resultado: un porcentaje de afinidad con cada partido (propuestas suyas que aprobaste ÷ propuestas suyas que decidiste) y el botón «¿Quién proponía cada cosa?», que desvela el partido de cada papel.
7. **Brújula política:** un gráfico de dos ejes, el económico (izquierda / derecha) y el social (autoritario / libertario), con tu punto y el de cada partido.
   - Cada propuesta lleva en `data.js` un `eje: [económico, social]` de −1 a 1, que es **una clasificación orientativa nuestra**.
   - Tu punto: aprobar suma el vector de la propuesta, rechazar lo resta y triturar no cuenta. En un expediente, la opción que salvas suma y las trituradas restan un tercio cada una. El total se normaliza a una escala de −1 a 1.
   - El punto de cada partido es la media de sus propuestas que aparecen en el juego.

## Contenido
- `data.js`: 31 propuestas sueltas y 6 expedientes de 4 opciones (uno por partido). Hay propuestas compartidas: 5 de PP y Vox (sedición, burka/niqab, CGPJ, Memoria Democrática, indultos) y 2 de PSOE y Frente Amplio (voto a los 16, aborto en la Constitución).
- Los textos están parafraseados en un estilo neutro y uniforme, para que la forma de escribir no delate al partido.
- **Contrastado el 20/11/2026 con los PDF de los cuatro programas**: PP «La Reconstrucción Nacional» (pp.es), PSOE (copia del PDF oficial alojada en elindependiente.com, porque psoe.es bloquea las descargas automáticas), Vox «Es sentido común» y Frente Amplio «Un programa como una casa». Todas las medidas aparecen en su programa. Se corrigieron matices: la gratuidad de 0-3 del PP es «al acabar la legislatura», la ayuda dental del PSOE empieza por las rentas medias y bajas, y el mínimo del 15 % del FA es solo para grandes empresas. Se quitó del PSOE el límite de IA para menores de 16, que no está en su programa.
- El SMI al 60 % del salario medio lo proponen tanto el PSOE (salario bruto) como el FA (salario neto). Está en las opciones de los dos en el expediente de trabajo.

## Material promocional
- `promo/cover.html?v=1|2|3|banner`: portadas de 630×500 y banner de 1920×480 (se capturan con Edge en modo headless).
- `promo/trailer.html`: tráiler vertical de 1080×1920 que maneja el juego real (`index.html?demo=trailer`). Se graba con puppeteer-core y el sonido se sintetiza a partir de los eventos.
- `index.html?demo=mesa|tuto&step=N|expediente|periodico|final|final2|titulo|triturar`: escenas para hacer capturas.

## Archivos
- `index.html`, `style.css`, `game.js`, `data.js`: el juego entero, sin dependencias.
- Para probarlo en local: `python -m http.server 5195 --directory despacho-29n`.
- Para itch.io: comprimir en un zip el contenido de la carpeta, con `index.html` en la raíz. El tamaño de la ventana es 1280×720 y el juego se escala solo.

## Preguntas para quien revise
1. **Neutralidad:** ¿alguna redacción favorece o perjudica a un partido? ¿Hay palabras que delaten al autor, como «okupas», «remigración» o «fondos buitre»?
2. **Equilibrio:** ¿el reparto de propuestas por partido y por tema es justo? Las compartidas PP+Vox, ¿inflan la afinidad con la derecha? ¿Habría que repartir las coincidencias entre otros partidos?
3. **Brújula y explicaciones:** ¿la posición de cada propuesta en los ejes (`eje` en `data.js`) es razonable? ¿Las explicaciones del pósit (`claro`) son neutrales y correctas, o alguna empuja hacia una respuesta?
4. **Puntuación:** ¿el sistema (aprobadas ÷ vistas, y en los expedientes 1 de N) da resultados con sentido? ¿Debería pesar más el expediente? ¿Debería restar rechazar?
5. **La intro:** la frase de «los de arriba contra los de abajo» tiene carga política. ¿Choca con la idea de un juego neutral, o funciona como el tono del juego? ¿Hay otra frase que conserve la intención?
6. **Diversión:** ¿qué le falta para sentirse como *Papers, Please*? Algunas ideas: reloj o presión de tiempo, reglas que cambian cada día, consecuencias en el periódico, personajes que vienen a presionar o sobornar, y reglamentos contradictorios.
7. **Datos:** ¿hay algún error factual o alguna medida mal atribuida? ¿Faltan propuestas estrella de algún partido?
8. **Legal y ético:** ¿hay riesgo por usar los nombres de los partidos? ¿Hace falta algún aviso más, por ejemplo sobre la publicación de encuestas en la última semana de campaña?
9. **itch.io:** ¿algún consejo para el título, la portada, las etiquetas o el texto de la página para que llegue a gente antes del 29-N?

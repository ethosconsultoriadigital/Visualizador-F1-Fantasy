# 👀 Preview visual (sin desplegar)

Renderiza la app con datos *mock* (basados en la hoja real) para ver el diseño
en el navegador o generar capturas, **sin necesidad de desplegar en Apps Script**.

```bash
cd tools/preview
npm i puppeteer            # solo la primera vez (descarga Chromium)
node build.js             # genera preview.html a partir de src/
node shoot.js             # genera capturas 01..05 .png

# o simplemente abre el HTML en tu navegador:
node build.js && open preview.html      # macOS
# xdg-open preview.html                  # Linux
```

- `mock.js` — datos de ejemplo + un *stub* de `google.script.run`.
- `build.js` — ensambla `src/styles.html` + `src/app.html` + `src/index.html` en un HTML único.
- `shoot.js` — abre el preview con Chromium headless y captura cada pantalla.

> El preview NO toca Google Sheets ni el Form; es solo para validar el diseño.

# 🏁 F1 Fantasy 2026 — Web App

Visualizador **premium mobile-first** para el fantasy privado de F1, construido sobre
**Google Apps Script (HTML Service)** y conectado a la Google Sheet
`COMISIONADO F1 FANTASY AI 2026` como backend.

La app es **solo lectura**: no escribe en ninguna pestaña. Los picks se realizan a
través del **Google Form** existente (deep-link pre-rellenado con el nombre del
participante), y el round actual lo controla el dueño en la pestaña `Config`.

---

## ✨ Funcionalidades (Fases 1–3)

> **Fase 3 (pulido visual):** skeletons de carga, entrada escalonada de listas,
> podio que "crece", anillo de picks animado, countdown con dígitos suaves + punto
> *live*, y conteo animado de números. Respeta `prefers-reduced-motion`.


| Pantalla | Qué muestra | Pestaña origen |
|---|---|---|
| **Home** | Próxima carrera + countdown al deadline, líder, podio top-3, anillo de progreso de picks (X/total) y accesos rápidos | `Config`, `Calendar`, `Standings`, `STATUS_PICKS` |
| **Posiciones** | Podio + ranking completo ordenado por puntos | `Standings` |
| **Calendario** | 24 GPs con estado *pasado / actual / próximo*, banderas, circuito y fecha | `Calendar` |
| **Estado** | Picks por participante: `OK` / `Duplicado` / `Pendiente` / `Autopick`. El piloto se oculta hasta el deadline (lo controla la hoja) | `STATUS_PICKS` |
| **Pick** | Selector de participante → **pilotos disponibles** (titular) con aviso suave de los ya usados → botón que abre el Form pre-rellenado | `Drivers`, `Picks` + Google Form |

**Regla no-repetir (titular):** la app calcula desde `Picks` qué pilotos ya usó cada
participante como **titular** y los marca con un aviso (⚠️ + rondas). **No bloquea** —
solo notifica, tal como se acordó para las primeras rondas. El suplente puede repetirse.

---

## 🗂️ Estructura

```
src/
├─ appsscript.json     # manifiesto (TZ, web app: ANYONE_ANONYMOUS, ejecuta como dueño)
├─ Code.gs             # doGet(), include(), getInitialAppData(), getAvailableDrivers()
├─ ConfigService.gs    # lectura de Config + round actual + cálculo de deadline
├─ DataService.gs      # Standings / Calendar / Drivers / STATUS_PICKS / Picks / Participants + cache
├─ FormService.gs      # deep-link al Google Form
├─ index.html          # estructura (topbar + vista + nav inferior)
├─ styles.html         # tema "Pit Wall" (dark / rojo F1), mobile-first
└─ app.html            # lógica de cliente (router, render, countdown, pick)
.clasp.json            # config de clasp (pega tu scriptId)
```

---

## 🚀 Despliegue

> **Recomendado:** crea un **script INDEPENDIENTE (standalone) nuevo en la cuenta dueña
> de la hoja** (`...coppel@gmail.com`). Así no se toca ni se arriesga el script de
> automatización existente (autopick, puntajes, Form). Como es la misma cuenta dueña,
> tiene acceso total a la hoja **sin compartir nada**.
>
> El código ya viene configurado para esto: lee la hoja por ID
> (`APP.SPREADSHEET_ID` en `Code.gs`) con `openById()`.

### Opción A — script independiente + clasp (recomendada)

1. Inicia sesión en la cuenta **dueña de la hoja**.
2. Crea un proyecto nuevo en <https://script.google.com> (*Proyecto nuevo*) → copia su **Script ID** desde *⚙️ Configuración del proyecto → ID de secuencia de comandos*.
3. Pega ese ID en `.clasp.json` (reemplaza `<PEGA_AQUI_TU_SCRIPT_ID>`).
4. Sube el código: `npm i -g @google/clasp && clasp login && clasp push`.
5. Publica como Web App: *Implementar → Nueva implementación → Aplicación web*.
   - **Ejecutar como:** Yo (la cuenta dueña).
   - **Quién tiene acceso:** Cualquier usuario.
6. Autoriza los permisos la primera vez. Copia la URL `/exec` y compártela. ¡Listo en celular!

### Opción B — script independiente + copiar/pegar (sin clasp)

1. En la cuenta dueña, ve a <https://script.google.com> → *Proyecto nuevo*.
2. Crea los archivos `.gs` y `.html` con los mismos nombres que en `src/` y pega el contenido.
3. Publica como Web App (pasos 5–6 de arriba).

### (Alternativa) Script vinculado a la hoja

Si en lugar de un script independiente prefieres uno *vinculado* (desde *Extensiones →
Apps Script* dentro de la hoja), pon `SPREADSHEET_ID: ''` en `Code.gs` para que use
`getActiveSpreadsheet()`. **Ojo:** comparte ese proyecto con el de automatización
existente; cuida no duplicar funciones como `doGet`.

---

## ⚙️ Configuración relevante (pestaña `Config`)

| Clave | Uso en la app |
|---|---|
| `LOCK_ROUND` | **Round actual** que muestra la app (lo cambia el dueño cada semana) |
| `SEASON` | Año mostrado |
| `DEADLINE_DAY` / `DEADLINE_HOUR` | Cálculo del countdown (por defecto jueves 13:00) |
| `TZ` | Zona horaria (`America/Mexico_City`) |

El Form de picks y el `entry` del participante están en `Code.gs` (`APP.FORM_BASE_URL`,
`APP.FORM_PARTICIPANT_ENTRY`). Si en el futuro quieres pre-rellenar también titular y
suplente, agrega sus `entry IDs` y amplía `FormService` / `openForm`.

---

## 👀 Ver el diseño sin desplegar

Puedes previsualizar todas las pantallas con datos de ejemplo (sin tocar la hoja):

```bash
cd tools/preview && npm i && npm run shots   # genera capturas 01..05 .png
# o: node build.js && abre preview.html en tu navegador
```

Más detalle en [`tools/preview/README.md`](tools/preview/README.md).

## ✅ Checklist de producción (Fase 5)

- [ ] `clasp push` al proyecto independiente (Script ID ya en `.clasp.json`).
- [ ] Implementar como **Aplicación web**: *Ejecutar como: yo · Acceso: cualquiera*.
- [ ] Autorizar permisos la primera vez (la app pedirá acceso a Sheets).
- [ ] Verificar `LOCK_ROUND` en `Config` = round que quieres mostrar.
- [ ] Probar en celular: Home, Posiciones, Calendario, Estado, Pick.
- [ ] Confirmar que el botón "Hacer mi pick" abre el Form con el nombre pre-llenado.
- [ ] (Cada semana) cambiar `LOCK_ROUND` en `Config` al abrir nueva ronda.
- [ ] (Opcional) Reemplazar el deploy con *Gestionar implementaciones → editar* para
      conservar la **misma URL** al subir cambios.

## 📱 PWA — instalar como app (ícono + pantalla completa)

En `docs/` hay una **PWA "envoltura"** lista para **GitHub Pages**: muestra la Web App
de Apps Script a pantalla completa, con **ícono F1 (MZT 2026)** y arranque tipo app.

**Activar GitHub Pages:**
1. Repo en GitHub → **Settings → Pages**.
2. *Source:* **Deploy from a branch** → elige la rama (p. ej. `main`) y carpeta **`/docs`**.
3. Guarda. En ~1 min tendrás la URL corta:
   `https://ethosconsultoriadigital.github.io/Visualizador-F1-Fantasy/`
4. (Si el código está en una rama de trabajo, mézclalo a `main` o apunta Pages a esa rama.)

**Instalar en el celular:**
- **iPhone/iPad (Safari):** Compartir ⬆️ → *Agregar a inicio*.
- **Android (Chrome):** menú ⋮ → *Instalar app / Agregar a pantalla principal*.

> Si cambias la URL de la Web App (`/exec`), actualiza el `src` del iframe en
> `docs/index.html`.

## 🔔 Recordatorios por WhatsApp (vía Make)

La app expone un **endpoint JSON de solo lectura** para que Make consulte quién falta:

```
GET https://script.google.com/macros/s/<DEPLOY_ID>/exec?api=reminders&key=<API_KEY>
```
Respuesta:
```json
{ "ok": true, "round": 9, "race": "Barcelona Grand Prix",
  "deadlineISO": "2026-06-11T13:00:00-06:00",
  "total": 15, "submitted": 9, "pendingCount": 6,
  "pending": ["JAVIER NARES", "FER CARRILLO", "..."] }
```
- `API_KEY` se configura en `Code.gs` (`APP.API_KEY`, por defecto `mzt2026` — cámbialo).

**Escenario sugerido en Make:**
1. **Schedule** (p. ej. jueves 09:00 CDMX, antes del cierre 13:00).
2. **HTTP → Make a request** (GET) al endpoint de arriba → *Parse JSON*.
3. (Opcional) **Router/Filter**: continuar solo si `pendingCount > 0`.
4. **WhatsApp** (tu conexión actual): enviar al grupo un mensaje tipo:
   *"🏁 Faltan {{pendingCount}} picks para {{race}} (cierra hoy 13:00): {{join(pending; \", \")}}"*.

## ✅ Estado de despliegue (esta sesión)

- `clasp push` ✅ · Deployment Web App ✅ (`/exec`) · API `?api=reminders` ✅
- PWA en `docs/` ✅ (falta que actives GitHub Pages)
- Push al ícono (Web Push/VAPID): **service worker preparado** en `docs/sw.js`,
  pendiente de configurar (opcional).

## 🔒 Seguridad

- Los **códigos** de participante **nunca** salen al frontend (la validación del código
  ocurre dentro del Google Form). La app solo expone **nombres**.
- Lecturas acotadas + `CacheService` (≈90 s) para evitar saturar la hoja.
- La app no escribe nada: cero riesgo de romper fórmulas o tocar `TABLA_F1_FANTASY`.

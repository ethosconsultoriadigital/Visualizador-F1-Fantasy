# 🏁 F1 Fantasy 2026 — Web App

Visualizador **premium mobile-first** para el fantasy privado de F1, construido sobre
**Google Apps Script (HTML Service)** y conectado a la Google Sheet
`COMISIONADO F1 FANTASY AI 2026` como backend.

La app es **solo lectura**: no escribe en ninguna pestaña. Los picks se realizan a
través del **Google Form** existente (deep-link pre-rellenado con el nombre del
participante), y el round actual lo controla el dueño en la pestaña `Config`.

---

## ✨ Funcionalidades (Fases 1 y 2)

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

### Opción A — clasp (recomendada para versionar)

1. Instala clasp: `npm i -g @google/clasp` y `clasp login`.
2. Obtén el **Script ID**: abre la Sheet → *Extensiones → Apps Script → ⚙️ Configuración del proyecto → ID de secuencia de comandos*.
3. Pega ese ID en `.clasp.json` (reemplaza `<PEGA_AQUI_TU_SCRIPT_ID>`).
4. Sube el código:
   ```bash
   clasp push
   ```
5. Publica como Web App: editor de Apps Script → *Implementar → Nueva implementación → Aplicación web*.
   - **Ejecutar como:** Yo (el dueño de la hoja).
   - **Quién tiene acceso:** Cualquier usuario *(o cualquiera con la cuenta de Google, según prefieras)*.
6. Copia la URL `/exec` y compártela. ¡Listo en celular!

> ⚠️ El script debe estar **vinculado al contenedor** (la Sheet) para que
> `SpreadsheetApp.getActiveSpreadsheet()` apunte a la hoja correcta. Si tu proyecto
> Apps Script es *standalone*, cambia `getActiveSpreadsheet()` por
> `SpreadsheetApp.openById('<ID_DE_LA_HOJA>')` en `DataService.gs`.

### Opción B — copiar y pegar

1. Abre la Sheet → *Extensiones → Apps Script*.
2. Crea los archivos `.gs` y `.html` con los mismos nombres que en `src/` y pega el contenido.
3. Publica como Web App (pasos 5–6 de arriba).

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

## 🔒 Seguridad

- Los **códigos** de participante **nunca** salen al frontend (la validación del código
  ocurre dentro del Google Form). La app solo expone **nombres**.
- Lecturas acotadas + `CacheService` (≈90 s) para evitar saturar la hoja.
- La app no escribe nada: cero riesgo de romper fórmulas o tocar `TABLA_F1_FANTASY`.

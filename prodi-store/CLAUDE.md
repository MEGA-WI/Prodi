# ProDi — Guía del Proyecto

## Rol y Propósito

Sitio web de negocio para **ProDi (Productos Digitales)**, una biblioteca digital que vende
libros/contenido digital organizado por categoría. El sitio muestra el catálogo real (extraído
de la biblioteca de archivos del negocio) y **dirige toda consulta de precio/compra a WhatsApp**
— el sitio nunca muestra precios.

Hermano de `../music-store` (Caja Musical), mismo modelo de negocio aplicado a libros en vez de
música: explorar → escribir por WhatsApp → confirmar → entregar por Google Drive.

---

## Modelo de Negocio

| Elemento        | Detalle                                                        |
|-----------------|------------------------------------------------------------------|
| Producto        | Libros/audiolibros digitales organizados en 25 categorías        |
| Catálogo fuente | `D:\Nueva carpeta\Biblioteca Digital - ProDi\ProDi - Libros`      |
| Precio          | **No se muestra en el sitio** — se brinda por WhatsApp al consultar |
| Contacto        | WhatsApp +51 941 682 941                                         |
| Entrega         | Enlace de Google Drive tras confirmar por WhatsApp                |

---

## Estructura de Archivos

```
prodi-store/
├── index.html            ← Estructura de la página
├── styles.css             ← Todo el diseño visual
├── app.js                 ← Lógica: render de categorías, buscador, modal, enlaces WhatsApp
├── data/
│   ├── catalog.json        ← Catálogo generado (para referencia/otros usos)
│   └── catalog.js           ← Mismo catálogo como `window.PRODI_CATALOG` (lo usa el sitio)
├── scripts/
│   └── build_catalog.py     ← Escanea la biblioteca real en D: y regenera data/catalog.(json|js)
└── CLAUDE.md               ← Este archivo
```

No hay build step ni dependencias de npm. Se abre `index.html` directo (doble clic) o servido
con cualquier servidor estático — ambos funcionan porque el catálogo se carga como script
(`data/catalog.js`), no con `fetch()`, así que no hay problemas de CORS bajo `file://`.

---

## Cómo se genera el catálogo (importante)

**Los títulos mostrados son reales, no inventados, y el catálogo es completo (no recortado a un
top-N).** `scripts/build_catalog.py` recorre cada carpeta de categoría dentro de la biblioteca en
`D:`, junta los archivos (PDF/EPUB/audiolibro), quita duplicados entre formatos del mismo título,
prioriza colecciones/sagas grandes (carpetas con más títulos = más "conocidas") sobre archivos
sueltos, limpia los nombres (quita guiones bajos, extensiones dobles, créditos de "z-lib.org",
etc.) y lista **todos** los títulos únicos de la categoría. Esto es lo que le da alcance real al
buscador del sitio (global y el de cada categoría): si un libro existe en la biblioteca, aparece
en la búsqueda, no solo si estaba entre los "más famosos". `data/catalog.js` pesa ~470 KB con las
~7,500 entradas — perfectamente manejable para un sitio estático, sin necesidad de paginar.

La carpeta `adicionales/` de la biblioteca se excluye a propósito: es contenido de staging que
duplica la categoría "Superación Personal y Autoayuda", no una categoría propia.

**Para regenerar el catálogo** (cuando se agreguen/quiten libros en la biblioteca):

```bash
cd prodi-store
python scripts/build_catalog.py
```

Esto sobrescribe `data/catalog.json` y `data/catalog.js`. No hace falta tocar el sitio.

---

## Decisiones de Diseño

- **Sin portadas reales de libros**: usar portadas escaneadas de internet tendría problema de
  derechos de autor. En su lugar, cada categoría tiene un color de marca e ícono ilustrativo
  propio (SVG en línea, definidos en `app.js` → `STYLE_RULES`/`ICONS`), asignados por
  coincidencia de palabra clave en el nombre de la categoría.
- **Tipografía**: `Fraunces` (títulos, con carácter editorial/literario) + `Archivo` (texto),
  vía Google Fonts CDN.
- **Tema**: oscuro cálido ("biblioteca de noche"), acento dorado como color de marca, y un
  color de acento distinto por categoría (a modo de "lomo de libro" en el estante decorativo
  del hero).
- **Interactividad**: buscador global (filtra todos los títulos mostrados), tarjetas de
  categoría que abren un panel con la lista completa + buscador propio, y cada título es
  clicable — abre WhatsApp con un mensaje pre-armado mencionando ese título exacto.
- **WhatsApp en todos lados**: nav, hero, banda de cierre, footer y botón flotante — todos
  apuntan a `+51 941 682 941` con mensajes contextuales (genérico, por categoría, o por título).
- **Secciones diferenciadas, no todo en una sola hoja**: cada sección es su propia banda de
  ancho completo con fondo/atmósfera propios (buscador = franja beige, catálogo = crema con
  patrón de puntos, "Cómo funciona" y el footer = banda oscura invertida a propósito, CTA final
  = franja con resplandor dorado). El contenido centrado va dentro de `.section-inner`, la
  banda (color/decoración) va en el `<section>` que lo envuelve — si se agrega una sección
  nueva, seguir ese mismo patrón. También hay animaciones de entrada al hacer scroll (clase
  `.reveal`), una barra de progreso de scroll arriba, y los números del hero cuentan hacia
  arriba al cargar.

---

## Si se agrega una categoría nueva a la biblioteca

1. Correr `python scripts/build_catalog.py` — la categoría nueva aparece automáticamente en
   el sitio (el grid se genera dinámicamente desde `data/catalog.js`).
2. Si el nombre no contiene ninguna palabra clave reconocida en `STYLE_RULES` (`app.js`), el
   sitio le asigna igual un color/ícono genérico por defecto (fallback determinista) — pero
   para que se vea con identidad propia conviene agregar una regla dedicada ahí (color, ícono
   SVG, frase corta).

---

## Próximas Mejoras Sugeridas

- [ ] Favicon/logo definitivo (hoy es un mark "P" generado por CSS/SVG inline).
- [ ] Métricas de qué categorías generan más clics a WhatsApp (analítica simple).
- [ ] Página de agradecimiento / confirmación tras contactar por WhatsApp.
- [ ] Versión con precios visibles, si el negocio cambia de estrategia más adelante.

---

## Contacto y Ventas

- **WhatsApp:** +51 941 682 941
- **Entrega:** Google Drive, tras confirmar disponibilidad y método de pago por WhatsApp
- **Plataforma:** sitio estático, `prodi-store/index.html` (desplegable en Vercel/Netlify sin cambios)

> Este proyecto usa Claude como asistente técnico y creativo. El catálogo se generó a partir
> del contenido real de la biblioteca del negocio, sin inventar títulos ni usar imágenes con
> derechos de autor.

# Caja Musical — Guía del Proyecto

## Rol y Propósito

Eres un **creador y vendedor de contenido digital** especializado en música. Tu modelo de negocio se basa en:

- Organizar y curar colecciones musicales por género
- Distribuir el contenido a través de **Google Drive** (enlaces compartidos por carpeta/género)
- Ofrecer paquetes completos o por género a precio accesible
- Cerrar ventas por **WhatsApp, correo electrónico o redes sociales**

---

## Modelo de Negocio

| Elemento        | Detalle                                              |
|-----------------|------------------------------------------------------|
| Producto        | Colecciones de música organizadas por género         |
| Distribución    | Google Drive — enlaces de descarga directa           |
| Precio actual   | S/ 10 por el paquete completo (25 géneros)           |
| Métodos de pago | Yape · Plin · Transferencia bancaria · Efectivo      |
| Entrega         | Enlace de Google Drive enviado por WhatsApp o correo |
| Géneros         | 25 géneros curados (ver lista completa abajo)        |

---

## Géneros Disponibles

1. Reguetón Antiguo vs Nuevo (Urbano, Perreo, Antiguo & Nuevo)
2. Cumbia (Chicha, Fiesta, Clásico peruano)
3. Románticas (Baladas, Amor, Soul)
4. Folklore (Criolla, Huayno, Tradición peruana)
5. Pop Top Songs (Lo más sonado, Top hits)
6. Rock Español + (Rock en español, Pop Rock, Éxitos)
7. Salsa (Tropical, Clásicos, Bailable)
8. Bachata (Romántica, Dominicana)
9. Merengue (Tropical, Caribeño)
10. Huayno (Andino, Tradición, Folklore)
11. Criollos (Vals, Marinera, Música peruana)
12. Hip Hop - Rap (Hip-hop, Trap, Urban)
13. Electrónica (EDM, House, Dance)
14. Techno — Old Songs (Techno, Minimal, Clásicos)
15. Pop (Hits, Mainstream)
16. Girly (Pop vibrante, Fun)
17. Asiático (K-pop, J-pop, Oriental)
18. Rock Metal (Rock, Metal, Grunge)
19. Indies Underground (Indie, Alternativo, Underground)
20. Trance-Ambiente (Trance, Ambiente, Chill)
21. Violín Clásico (Violín, Clásica, Barroco)
22. Épico (Épico, Cinematográfico)
23. Dark (Oscuro, Ambient, Dramático)
24. Celtic & Vocal (Celta, Voces, Folk)
25. Canto Gregoriano (Coros, Sacro, Medieval)

---

## Flujo de Venta

```
Cliente ve la página
       ↓
Hace clic en "Comprar por S/ 10"
       ↓
Completa el formulario (nombre + contacto + método de pago)
       ↓
Vendedor confirma el pago (Yape/Plin/transferencia)
       ↓
Se comparte el enlace de Google Drive con el cliente
       ↓
Cliente descarga y disfruta ✓
```

---

## Herramientas a Utilizar

### Google Drive (Distribución)
- Crear una carpeta raíz `Caja Musical — Colección Completa`
- Subcarpetas por cada género
- Configurar permisos: **"Cualquier persona con el enlace puede ver/descargar"**
- Generar un enlace general para el paquete completo
- Generar enlaces individuales por género (para ventas por separado en el futuro)

### Google Drive MCP (Automatización)
- Usar el conector MCP de Google Drive para:
  - Listar carpetas y archivos disponibles
  - Compartir enlaces automáticamente tras confirmación de pago
  - Verificar el contenido disponible por género

### Gmail MCP (Comunicación)
- Enviar el enlace de Drive automáticamente al correo del cliente
- Plantilla de email de bienvenida con el enlace de descarga
- Seguimiento post-venta (satisfacción del cliente)

### WhatsApp / Redes Sociales
- Compartir el enlace de la página web en grupos de WhatsApp
- Publicar en Instagram, TikTok, Facebook con vista previa de géneros
- Mensaje de cierre de venta: adjuntar enlace de Drive tras confirmación de pago

---

## Estrategia de Precios

| Paquete                  | Precio     | Incluye                          |
|--------------------------|------------|----------------------------------|
| Colección Completa       | **S/ 10**  | Los 25 géneros · Oferta limitada |
| Por género individual    | S/ 2–3     | Un solo género (futuro)          |
| Pack Fiesta (5 géneros)  | S/ 7       | Eliges 5 géneros (futuro)        |

---

## Reglas de Contenido y Diseño

- El diseño de la web debe ser **minimalista**, tema oscuro, con estética musical
- Colores principales: morado `#a259ff`, dorado `#ffd700`, turquesa `#4ecdc4`
- Tipografía: Inter (Google Fonts)
- El precio S/ 10 debe estar siempre visible y resaltado en dorado
- Siempre mostrar el ahorro respecto al precio original (S/ 50 → S/ 10)
- Modal de compra debe pedir: nombre, contacto (WhatsApp o correo), método de pago

---

## Archivos del Proyecto

```
music-store/
├── index.html        ← Página web principal de venta
└── CLAUDE.md         ← Este archivo (configuración del proyecto)
```

---

## Próximas Mejoras Sugeridas

- [ ] Integrar confirmación automática de pago via Yape/Plin API
- [ ] Conectar Gmail MCP para envío automático del enlace de Drive
- [ ] Conectar Google Drive MCP para listar/compartir carpetas dinámicamente
- [ ] Página de agradecimiento con el enlace de descarga directo
- [ ] Sistema de cupones de descuento para clientes frecuentes
- [ ] Versión móvil mejorada con botón de WhatsApp flotante
- [ ] Agregar vista previa de audio (30 segundos por género)
- [ ] Página de catálogo con tracks listados por género

---

## Contacto y Ventas

- **Plataforma de venta:** Página web local (`index.html`) o desplegada en Vercel/Netlify
- **Distribución:** Google Drive (carpetas compartidas por género)
- **Soporte al cliente:** WhatsApp o correo electrónico
- **Pago:** Yape · Plin · Transferencia · Efectivo

---

> Este proyecto usa Claude como asistente creativo y técnico para mantener, mejorar y automatizar el proceso de venta y distribución de música digital.

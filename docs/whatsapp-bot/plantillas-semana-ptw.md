# Plantillas de WhatsApp — Semana de Perú Tech Week 2026

Set de plantillas **evergreen**: no dependen de cupos en tiempo real ni de datos que cambian. Cada día comunica un ángulo distinto, y el link de Luma de cada evento es la fuente de disponibilidad.

Para todas: categoría **Marketing**, idioma **Español (es)**, sin botones. Cada una cierra con una invitación a conversar. Cuando la persona responde, se abren 24 horas en las que el bot puede escribirle libremente.

## Lógica del set

Cada plantilla cumple una función distinta, sin superponerse con las demás:

| Función | Plantilla | Qué comunica | Envío sugerido |
|---|---|---|---|
| Apertura | `ptw26_presentacion_concierge` | Quién es el concierge y en qué puede ayudar (eventos, agenda, QR, dudas) | Lunes 12, al aprobarse |
| Descubrimiento | `ptw26_descubre_tu_agenda` | Ayuda para elegir eventos según intereses | Martes 13, 7:30 a. m. |
| Networking | `ptw26_networking_qr` | Cómo aprovechar los eventos para conectar; el concierge ayuda a crear el QR | Miércoles 14, 7:30 a. m. |
| Asistencia | `ptw26_lista_de_espera` | Qué hacer si un evento está lleno o si ya no puedes ir | Jueves 15, 7:30 a. m. |
| Descubrimiento (fin de semana) | `ptw26_fin_de_semana` | El fin de semana también hay agenda | Viernes 16, 12:00 p. m. |
| Visibilidad | `ptw26_comparte_tu_semana` | Compartir la experiencia en LinkedIn | Sábado 17, 10:00 a. m. |
| Cierre | `ptw26_cierre_feedback` | Agradecimiento y feedback | Domingo 18, 7:00 p. m. |
| Referidos (reserva) | `ptw26_invita_a_alguien` | Reenviar la agenda a alguien que debería estar | Cualquier día, solo a quien ya conversó |

**A quién**
- **Todos los registrados:** apertura, fin de semana y cierre.
- **Quienes ya respondieron alguna vez al bot:** además, el resto de plantillas, una por día.
- **Quienes nunca respondieron:** como máximo una plantilla más en la semana (la de networking del miércoles).

**Por qué segmentar así:** Meta limita cuántos mensajes de marketing recibe cada persona, sumando todas las empresas que le escriben (error 131049). Además, si muchas personas bloquean el número, baja su calificación de calidad. Quien conversa con el bot tolera y recibe más mensajes.

**Pie para todas:** Si prefieres no recibir más mensajes, avísanos aquí.

---

## 1 · Apertura — `ptw26_presentacion_concierge`

**Encabezado:** Tu concierge de Perú Tech Week

> Hola {{1}}, Perú Tech Week 2026 ya empezó: más de 100 eventos de tecnología e innovación hasta el domingo 18.
>
> Con tanta agenda, es fácil perderse. Por eso estoy aquí 🤖 Soy tu concierge en WhatsApp y puedo ayudarte a:
>
> 1. Encontrar los eventos que mejor encajan con lo que haces y lo que buscas.
> 2. Armar tu agenda de la semana sin cruces de horario.
> 3. Crear tu QR de networking, para compartir tu contacto y LinkedIn con un solo escaneo.
> 4. Resolver dudas sobre horarios, sedes y cómo inscribirte.
>
> Cuéntame a qué te dedicas y qué temas te interesan, y empezamos.

**Valor de ejemplo:** {{1}} = María

---

## 2 · Descubrimiento — `ptw26_descubre_tu_agenda`

**Encabezado:** Encuentra tus eventos de la semana

> Buenos días, {{1}} ☀️ Esta semana hay charlas, talleres, demo days y encuentros de IA, fintech, producto, salud, venture capital y mucho más en Perú Tech Week.
>
> Elegir bien hace la diferencia. Dime qué haces y qué te gustaría aprender o encontrar esta semana, y te sugiero los eventos que más valen tu tiempo.
>
> La agenda completa está en https://luma.com/Perutechweek2026

**Valor de ejemplo:** {{1}} = Carlos

---

## 3 · Networking — `ptw26_networking_qr`

**Encabezado:** Saca más provecho de cada evento

> Hola {{1}}, en Perú Tech Week las mejores oportunidades suelen aparecer en los pasillos, entre charla y charla.
>
> Tres ideas para conectar mejor:
> 1. Lleva un QR con tu contacto y LinkedIn como fondo de pantalla, para compartirlo en segundos.
> 2. Prepara una frase corta sobre qué haces y qué estás buscando.
> 3. Escribe a tus nuevos contactos el mismo día, mientras la conversación está fresca.
>
> Si aún no tienes tu QR, pídemelo y te ayudo a crearlo. También puedo sugerirte los eventos donde vas a encontrar a las personas que buscas.

**Valor de ejemplo:** {{1}} = Andrea

---

## 4 · Asistencia — `ptw26_lista_de_espera`

**Encabezado:** Si un evento está lleno, no te rindas

> Hola {{1}}, varios eventos de Perú Tech Week tienen alta demanda. Dos consejos para esta semana:
>
> Si un evento que te interesa aparece lleno en Luma, únete a la lista de espera. Muchas personas liberan su cupo a último momento.
>
> Y si ya no puedes asistir a un evento en el que te inscribiste, libera tu cupo en Luma para que otra persona lo aproveche.
>
> ¿Buscas alternativas para algún día en particular? Escríbeme y te propongo opciones.

**Valor de ejemplo:** {{1}} = Diego

---

## 5 · Descubrimiento (fin de semana) — `ptw26_fin_de_semana`

**Encabezado:** Perú Tech Week sigue este fin de semana

> Hola {{1}}, Perú Tech Week sigue este sábado y domingo 🚀
>
> Hay hackathons, conferencias, demo days, runs y encuentros al aire libre, muchos de ellos gratuitos.
>
> ¿Qué planes tienes para el fin de semana? Cuéntame qué te interesa y te recomiendo a dónde ir.

**Valor de ejemplo:** {{1}} = Lucía

---

## 6 · Visibilidad — `ptw26_comparte_tu_semana`

**Encabezado:** Cuéntale a tu red tu semana

> Hola {{1}}, ¿qué te llevas hasta ahora de Perú Tech Week? Una charla, una conexión nueva, una idea para tu proyecto.
>
> Compártelo en LinkedIn con #PeruTechWeek y etiqueta a las personas que conociste, para que tu red vea que fuiste parte de la semana.
>
> Y si todavía quieres aprovechar lo que queda de la semana, escríbeme y te sugiero eventos.

**Valor de ejemplo:** {{1}} = Javier

---

## 7 · Cierre — `ptw26_cierre_feedback`

**Encabezado:** Gracias por ser parte de Perú Tech Week

> Hola {{1}}, gracias por ser parte de Perú Tech Week 2026 🙌
>
> Queremos que la próxima edición sea aún mejor. ¿Cómo te fue? Cuéntanos qué fue lo mejor de tu semana y qué te gustaría que mejoremos.
>
> Y si te llevaste un buen momento, compártelo en LinkedIn con #PeruTechWeek.

**Valor de ejemplo:** {{1}} = Valeria

---

## 8 · Referidos (reserva) — `ptw26_invita_a_alguien`

**Encabezado:** ¿Conoces a alguien que debería estar?

> Hola {{1}}, Perú Tech Week sigue hasta el domingo y todavía hay eventos para todos los perfiles: founders, developers, estudiantes, corporativos e inversionistas.
>
> Si conoces a alguien de tu equipo o de tu red que debería estar, reenvíale la agenda: https://luma.com/Perutechweek2026
>
> Y si quieres ideas para tus próximos días, escríbeme y armamos tu agenda.

**Valor de ejemplo:** {{1}} = Sofía

---

## Lo que el bot debe saber (para Vale)

- **El bot no ve cupos en tiempo real.** Nunca debe afirmar que un evento "tiene cupos" ni que "está lleno". Recomienda según el perfil y siempre cierra así: "Revisa la disponibilidad en el link de Luma; si está lleno, únete a la lista de espera".
- **El catálogo se usa solo para contenido estable:** tema, fecha, hora, lugar, costo, tipo de acceso (abierto, con aprobación, por postulación).
- **Entender días en lenguaje natural:** "hoy", "esta noche", "mañana", "el sábado", a partir de `{{fecha_actual}}`. Nunca recomendar eventos que ya pasaron.
- **Respuestas al cierre:** agradecer, conversar sobre lo mejor y lo que se puede mejorar, y registrar el feedback.
- **Bajas:** si alguien pide no recibir más mensajes, con cualquier palabra, confirmar con amabilidad y marcarlo en la herramienta de envío.
- **QR de networking:** cuando alguien lo pida, compartir el link https://badges.getprisma.lat/ y explicar en una línea cómo usarlo (crearlo y ponerlo como fondo de pantalla). Presentarlo como una herramienta gratuita, sin mencionar a la marca del proveedor. Si la persona no lo pidió, ofrecerlo una sola vez por conversación, al cerrar una recomendación.
- **Escarapela:** no ofrecerla de forma proactiva. Si alguien la pide, compartir https://soy.techweek.pe/

## Cómo cumple el set con lo que evalúa Meta

| Regla de Meta | Cómo se cumple |
|---|---|
| Categoría coherente | Las 8 son promocionales, así que todas van como Marketing. Ninguna mezcla contenido de Utility. |
| Variables | Una sola variable (`{{1}}`) por plantilla, siempre después de "Hola" o "Buenos días". Nunca al inicio ni al final. |
| Proporción texto/variables | Mucho más texto fijo que el mínimo exigido (4 palabras para 1 variable). |
| Valores de ejemplo | Nombres reales. |
| Saltos de línea y espacios | Como máximo una línea en blanco seguida y sin espacios repetidos. |
| Límites de caracteres | Cuerpos bajo 1,024 caracteres. Encabezados y pie bajo 60. |
| Enlaces | Directos, sin acortadores ni wa.me. |
| Tono | Sin mayúsculas sostenidas ni urgencia artificial. Como máximo un emoji por plantilla. |
| Duplicados | Los 8 cuerpos son distintos entre sí y de plantillas anteriores. |
| Datos que cambian | Ninguna plantilla menciona cupos ni cifras del día. |

**Sin enlaces de terceros:** las plantillas no incluyen links a proveedores. El link del QR lo entrega el bot dentro de la conversación, solo cuando la persona lo pide. Esto evita que parezca publicidad de un proveedor y quita el riesgo de rechazo de Meta por dominios ajenos a PTW.

## Fuentes

- Meta — Per-user marketing template message limits: https://developers.facebook.com/documentation/business-messaging/whatsapp/templates/marketing-templates/per-user-limits/
- Meta — Template categorization: https://developers.facebook.com/documentation/business-messaging/whatsapp/templates/template-categorization
- AWS — Reasons why a template is rejected in WhatsApp: https://docs.aws.amazon.com/social-messaging/latest/userguide/managing-templates_rejection.html
- Chakra — WhatsApp template rejections: https://chakrahq.com/article/whatsapp-api-template-rejections-issues-guidelines-coexistence
- Lava IT Consulting — Why your WhatsApp template keeps getting rejected: https://lavaitconsulting.com/2026/10/02/whatsapp-template-rejected-reasons/

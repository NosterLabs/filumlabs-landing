import type { Metadata } from 'next';
import Link from 'next/link';
import { SHOP } from '@/lib/config';
import s from './legal.module.css';

export const metadata: Metadata = {
  title: 'Términos y condiciones · FilumLabs',
  description: 'Condiciones de uso de filumlabs.com y de los pedidos de impresión 3D: cotizaciones, archivos, entregas, fallas, cancelaciones y privacidad.',
  alternates: { canonical: '/terminos' },
};

// Modelled on nosterlabs.com/es/terms and /es/privacy, adapted to a print-on-demand service.
// Change the date whenever the text changes.
export default function TermsPage() {
  const mail = <a href={`mailto:${SHOP.email}`}>{SHOP.email}</a>;
  return (
    <main id="main" className={`wrap ${s.page}`}>
      <header className={s.head}>
        <p className={s.eyebrow}>Legal</p>
        <h1>Términos y condiciones</h1>
        <p className={s.date}>Última actualización: 11 de noviembre de 2026</p>
        <p>
          Estos términos regulan el uso de este sitio y los pedidos de impresión 3D que hacés con FilumLabs, un servicio de Noster Labs. Lo que acordemos por escrito para un pedido puntual, por WhatsApp o por correo, vale por encima de estos términos.
        </p>
      </header>

      <section>
        <h2>Uso del sitio</h2>
        <p>Podés navegarlo, usar el cotizador y escribirnos libremente. No está permitido usarlo para enviar contenido ilegal o spam, ni intentar dañar su funcionamiento.</p>
      </section>

      <section>
        <h2>Cotizaciones y precios</h2>
        <p>
          El cotizador calcula una estimación con la geometría de tu archivo y los ajustes que elegís. Los precios del sitio son orientativos y no son una oferta vinculante.
          {SHOP.demoCatalog && ' Mientras el catálogo diga que es de ejemplo, sus productos y precios son ilustrativos.'}
        </p>
        <p>Antes de imprimir te confirmamos por WhatsApp el precio final, el plazo y la forma de pago. El pedido queda firme cuando aceptás esa confirmación.</p>
      </section>

      <section>
        <h2>Tus archivos</h2>
        <p>
          Al mandarnos un archivo declarás que tenés derecho a imprimirlo: es tuyo, su licencia permite el uso comercial o tenés permiso de su autor. Podemos rechazar piezas que infrinjan derechos de terceros, que sean ilegales o que puedan usarse como armas.
        </p>
        <p>Usamos tu archivo solo para tu pedido: no lo publicamos, no lo vendemos y no lo compartimos. El cotizador lo lee en tu navegador y no lo sube a ningún servidor.</p>
      </section>

      <section>
        <h2>Cómo quedan las piezas</h2>
        <p>
          Imprimimos por deposición de filamento (FDM). Las piezas muestran líneas de capa y puede haber pequeñas diferencias de medida, color y terminación respecto de la vista 3D y de las fotos; los colores en pantalla son aproximados. Si tu pieza necesita medidas exactas o encastres, avisanos antes de imprimir.
        </p>
        <p>
          Las piezas de PLA y PETG no están pensadas para estar en contacto con alimentos, soportar cargas o calor fuerte, ni para usos de seguridad, salvo que lo acordemos por escrito. Usarlas así queda bajo tu responsabilidad.
        </p>
      </section>

      <section>
        <h2>Entregas</h2>
        <p>
          Entregamos en {SHOP.city} y la {SHOP.region}. El lugar, el día y el costo del envío se coordinan por WhatsApp. Los plazos que te damos son estimados: si algo los demora, te avisamos.
        </p>
      </section>

      <section>
        <h2>Fallas, cambios y cancelaciones</h2>
        <p>Si una pieza llega con una falla de impresión, avisanos dentro de los 10 días de recibirla y mandanos fotos: la reimprimimos sin cargo o te devolvemos lo que pagaste.</p>
        <p>
          Las piezas a medida se fabrican según tus especificaciones, por eso, una vez empezada la impresión, no se pueden cancelar ni devolver por arrepentimiento (artículo 1116 del Código Civil y Comercial). Para los productos del catálogo rige tu derecho a revocar la compra dentro de los 10 días corridos de recibirla (Ley 24.240 de Defensa del Consumidor).
        </p>
      </section>

      <section>
        <h2>Propiedad intelectual</h2>
        <p>Los textos, el diseño, la marca, el logo y los modelos del catálogo son de FilumLabs y Noster Labs. No podés copiarlos ni usarlos sin permiso escrito. Tus archivos siguen siendo tuyos.</p>
      </section>

      <section id="privacidad">
        <h2>Privacidad</h2>
        <p>
          Solo recibimos los datos que vos nos mandás: tu nombre, tu número de WhatsApp o tu correo, y lo que nos escribís. Los formularios del sitio no guardan nada en un servidor: arman el mensaje y lo abren en WhatsApp para que lo envíes vos, y desde ese momento también rigen las políticas de WhatsApp (Meta).
        </p>
        <p>
          Usamos esos datos para responderte, cotizar y seguir tu pedido. No los usamos para publicidad, no los vendemos y no los compartimos, salvo que la ley nos obligue. Los guardamos mientras dure la conversación o el pedido, y después solo lo necesario para cumplir obligaciones legales.
        </p>
        <p>
          El sitio no usa cookies de seguimiento ni herramientas de analítica. Tu carrito se guarda en tu navegador para que no se pierda al recargar la página.
        </p>
        <p>
          Podés pedir acceso, corrección o eliminación de tus datos escribiendo a {mail}. Respondemos dentro de los plazos de la Ley 25.326 de Protección de Datos Personales. La Agencia de Acceso a la Información Pública, órgano de control de esa ley, atiende las denuncias y reclamos de quienes vean afectados sus derechos.
        </p>
      </section>

      <section>
        <h2>Enlaces externos</h2>
        <p>El sitio enlaza a servicios de terceros, como WhatsApp. No controlamos esos servicios ni respondemos por su contenido o sus políticas.</p>
      </section>

      <section>
        <h2>Responsabilidad</h2>
        <p>
          Hacemos lo posible para que el sitio esté disponible y su información sea correcta, pero puede tener interrupciones o errores. No respondemos por daños derivados del uso del sitio, en la medida en que la ley lo permita.
        </p>
      </section>

      <section>
        <h2>Ley aplicable</h2>
        <p>Estos términos se rigen por las leyes de la República Argentina. Si los cambiamos, publicamos la nueva versión en esta página con su fecha.</p>
      </section>

      <section>
        <h2>Contacto</h2>
        <p>
          Para cualquier consulta sobre estos términos, escribinos a {mail} o desde el <Link href="/#contacto">formulario de consultas</Link>.
        </p>
      </section>
    </main>
  );
}

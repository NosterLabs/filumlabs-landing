'use client';

import { useId, useState } from 'react';
import Link from 'next/link';
import { SHOP } from '@/lib/config';
import { LIMITS, WA_PENDING, fitsWhatsApp, waLink } from '@/lib/whatsapp';
import Left from './Left';
import w from './Wholesale.module.css';
import s from './Contact.module.css';

const TOPICS = ['Una pieza', 'Un pedido', 'Otra consulta'] as const;

// A question that is not an order: like the rest of the site, the form keeps nothing,
// it writes the message and opens it in WhatsApp for the reader to send.
export default function Contact() {
  const id = useId();
  const [name, setName] = useState('');
  const [topic, setTopic] = useState<(typeof TOPICS)[number]>(TOPICS[0]);
  const [text, setText] = useState('');

  const message = [`Hola FilumLabs${name.trim() ? `, soy ${name.trim()}` : ''}. Tengo una consulta sobre ${topic.toLowerCase()}:`, '', text.trim()].join('\n');
  const fits = fitsWhatsApp(message);
  const mail = `mailto:${SHOP.email}?subject=${encodeURIComponent(`Consulta: ${topic.toLowerCase()}`)}&body=${encodeURIComponent(message)}`;

  return (
    <div className={s.layout}>
      <div className={s.copy}>
        <h2 id="contacto-title" data-reveal="rise">
          ¿Tenés una consulta?
        </h2>
        <p data-reveal="rise" style={{ '--d': '100ms' } as React.CSSProperties}>
          Sobre una pieza, un material, una entrega o algo que no ves en el sitio. Escribinos y te contestamos por WhatsApp.
        </p>
        <ul className={s.direct}>
          {!WA_PENDING && (
            <li>
              <span>WhatsApp</span>
              <a href={`https://wa.me/${SHOP.whatsapp}`} target="_blank" rel="noopener noreferrer">
                Abrir el chat
              </a>
            </li>
          )}
          <li>
            <span>Correo</span>
            <a href={`mailto:${SHOP.email}`}>{SHOP.email}</a>
          </li>
        </ul>
      </div>

      <form
        className={`${w.form} ${s.form}`}
        onSubmit={(e) => {
          e.preventDefault();
          if (fits) open(waLink(message), '_blank', 'noopener');
        }}
      >
        <div className={w.field}>
          <label htmlFor={`${id}-n`}>Tu nombre (opcional)</label>
          <input id={`${id}-n`} type="text" autoComplete="given-name" maxLength={LIMITS.name} value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className={w.field}>
          <span id={`${id}-t`}>Sobre qué</span>
          <div className={w.options} role="radiogroup" aria-labelledby={`${id}-t`}>
            {TOPICS.map((t) => (
              <button key={t} type="button" role="radio" aria-checked={topic === t} onClick={() => setTopic(t)}>
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className={w.field}>
          <label htmlFor={`${id}-m`}>Tu consulta</label>
          <textarea id={`${id}-m`} rows={4} required maxLength={LIMITS.text} placeholder="Por ejemplo, ¿pueden imprimir una pieza de 25 cm?" value={text} onChange={(e) => setText(e.target.value)} />
          <Left used={text.length} max={LIMITS.text} fits={fits} />
        </div>
        <div className={s.send}>
          <button type="submit" className="btn" disabled={!fits}>
            Enviar por WhatsApp
          </button>
          <a href={mail} className="link">
            Prefiero mandarlo por correo
          </a>
        </div>
        <p className="wa-note">
          Se abre WhatsApp con tu mensaje listo para enviar; acá no se guarda nada. {WA_PENDING && 'Número pendiente: elegís el contacto al abrirse. '}
          <Link href="/terminos#privacidad">Cómo tratamos tus datos</Link>.
        </p>
      </form>
    </div>
  );
}

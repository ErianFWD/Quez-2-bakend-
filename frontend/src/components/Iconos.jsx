// Íconos SVG propios (sin librerías externas).
const base = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' };

export function Logo({ className }) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true">
      <path d="M24 2 43 13v22L24 46 5 35V13z" fill="#8cc63f" />
      <path d="M19.5 11h9v3h-1.5v6l7 12a2.4 2.4 0 0 1-2 3.6H16a2.4 2.4 0 0 1-2-3.6l7-12v-6h-1.5z" fill="#fff" />
      <path d="M17.5 30c3-2.5 6-2.5 9 0s6 2.5 6.5 0l1.5 2.6a2.4 2.4 0 0 1-2 3.6H16a2.4 2.4 0 0 1-2-3.6z" fill="#5a9bd4" />
      <path d="M30 6c5 0 8 3 8 8-5 0-8-3-8-8z" fill="#2f6b1f" />
    </svg>
  );
}

export function IconoSellador(p) {
  return (
    <svg viewBox="0 0 48 48" {...base} {...p}>
      <rect x="15" y="16" width="18" height="26" rx="3" /><path d="M20 16v-6h8v6M24 10V5" /><path d="M18 26h12M18 31h12" />
    </svg>
  );
}
export function IconoAdhesivo(p) {
  return (
    <svg viewBox="0 0 48 48" {...base} {...p}>
      <rect x="8" y="18" width="14" height="22" rx="3" /><rect x="26" y="18" width="14" height="22" rx="3" /><path d="M12 18v-5h6v5M30 18v-5h6v5M22 29h4" />
    </svg>
  );
}
export function IconoImpermeabilizante(p) {
  return (
    <svg viewBox="0 0 48 48" {...base} {...p}>
      <path d="M10 16h28l-3 26H13z" /><path d="M8 12h32v4H8z" /><path d="M24 22c3 4 4 6 4 8a4 4 0 0 1-8 0c0-2 1-4 4-8z" />
    </svg>
  );
}
export function IconoAditivo(p) {
  return (
    <svg viewBox="0 0 48 48" {...base} {...p}>
      <path d="M19 6h10M21 6v12L11 36a3 3 0 0 0 2.6 4.5h20.8A3 3 0 0 0 37 36L27 18V6" /><path d="M15 30h18" /><circle cx="21" cy="35" r="1.2" /><circle cx="27" cy="33" r="1.2" />
    </svg>
  );
}
export function IconoMatraz(p) {
  return (
    <svg viewBox="0 0 48 48" {...base} {...p}>
      <path d="M19 6h10M21 6v12L11 36a3 3 0 0 0 2.6 4.5h20.8A3 3 0 0 0 37 36L27 18V6" />
    </svg>
  );
}
export function IconoReloj(p) {
  return <svg viewBox="0 0 48 48" {...base} {...p}><circle cx="24" cy="24" r="17" /><path d="M24 14v10l7 4" /></svg>;
}
export function IconoAlerta(p) {
  return <svg viewBox="0 0 48 48" {...base} {...p}><path d="M24 7 43 40H5z" /><path d="M24 19v10M24 34v.5" /></svg>;
}
export function IconoCaja(p) {
  return <svg viewBox="0 0 48 48" {...base} {...p}><path d="M6 15 24 6l18 9v18l-18 9-18-9z" /><path d="M6 15l18 9 18-9M24 24v18" /></svg>;
}
export function IconoRuta(p) {
  return <svg viewBox="0 0 48 48" {...base} {...p}><circle cx="11" cy="11" r="4" /><circle cx="37" cy="37" r="4" /><path d="M15 11h14a6 6 0 0 1 0 12H19a6 6 0 0 0 0 12h14" /></svg>;
}
export function IconoUbicacion(p) {
  return <svg viewBox="0 0 48 48" {...base} {...p}><path d="M24 43s14-13 14-24a14 14 0 0 0-28 0c0 11 14 24 14 24z" /><circle cx="24" cy="19" r="5" /></svg>;
}
export function IconoTelefono(p) {
  return <svg viewBox="0 0 48 48" {...base} {...p}><path d="M14 6h6l3 9-4 3a22 22 0 0 0 11 11l3-4 9 3v6a4 4 0 0 1-4 4C21 38 10 27 10 10a4 4 0 0 1 4-4z" /></svg>;
}
export function IconoCorreo(p) {
  return <svg viewBox="0 0 48 48" {...base} {...p}><rect x="6" y="11" width="36" height="26" rx="3" /><path d="m7 13 17 13 17-13" /></svg>;
}
export function IconoMas(p) {
  return <svg viewBox="0 0 48 48" {...base} strokeWidth={3} {...p}><path d="M24 12v24M12 24h24" /></svg>;
}
export function IconoEngrane(p) {
  return <svg viewBox="0 0 48 48" {...base} {...p}><circle cx="24" cy="24" r="6" /><path d="M24 5v6M24 37v6M5 24h6M37 24h6M10.6 10.6l4.2 4.2M33.2 33.2l4.2 4.2M10.6 37.4l4.2-4.2M33.2 14.8l4.2-4.2" /></svg>;
}

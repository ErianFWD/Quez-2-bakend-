import { ETIQUETAS } from '../utils/format.js';

// <Badge tipo="stock" valor="reordenar" />  o  <Badge tono="ok">Texto</Badge>
export default function Badge({ tipo, valor, tono, children }) {
  const info = tipo ? ETIQUETAS[tipo]?.[valor] : null;
  return <span className={`badge badge-${info?.tono ?? tono ?? 'neutral'}`}>{children ?? info?.texto ?? valor}</span>;
}

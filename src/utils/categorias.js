// Color e ícono de cada categoría de material (se usan en hexágonos y tarjetas).
import { IconoAdhesivo, IconoAditivo, IconoImpermeabilizante, IconoMatraz, IconoSellador } from '../components/Iconos.jsx';

export const CATEGORIAS = {
  Selladores: { color: '#7cb342', fondo: 'linear-gradient(135deg,#9ccc65,#558b2f)', Icono: IconoSellador, texto: 'Acrílicos, silicones y espumas' },
  Adhesivos: { color: '#5a9bd4', fondo: 'linear-gradient(135deg,#7fb3e0,#2f6fa8)', Icono: IconoAdhesivo, texto: 'Epóxicos y pegamentos cerámicos' },
  Impermeabilizantes: { color: '#e0a526', fondo: 'linear-gradient(135deg,#f3c45a,#c07f12)', Icono: IconoImpermeabilizante, texto: 'Asfálticos y membranas' },
  Aditivos: { color: '#26a69a', fondo: 'linear-gradient(135deg,#4db6ac,#00796b)', Icono: IconoAditivo, texto: 'Acelerantes y desmoldantes' },
};

export const infoCategoria = (nombre) =>
  CATEGORIAS[nombre] ?? { color: '#8a9690', fondo: 'linear-gradient(135deg,#b0bab5,#6b7570)', Icono: IconoMatraz, texto: '' };

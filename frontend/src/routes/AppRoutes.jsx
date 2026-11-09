import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import Dashboard from '../pages/Dashboard.jsx';
import Materiales from '../pages/Materiales.jsx';
import MaterialDetalle from '../pages/MaterialDetalle.jsx';
import Lotes from '../pages/Lotes.jsx';
import Movimientos from '../pages/Movimientos.jsx';
import Ordenes from '../pages/Ordenes.jsx';
import Alertas from '../pages/Alertas.jsx';
import Configuracion from '../pages/Configuracion.jsx';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/materiales" element={<Materiales />} />
        <Route path="/materiales/:id" element={<MaterialDetalle />} />
        <Route path="/lotes" element={<Lotes />} />
        <Route path="/movimientos" element={<Movimientos />} />
        <Route path="/ordenes" element={<Ordenes />} />
        <Route path="/alertas" element={<Alertas />} />
        <Route path="/configuracion" element={<Configuracion />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

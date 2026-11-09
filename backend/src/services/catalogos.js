import { Bodega, Proveedor } from '../models/index.js';
export async function listarBodegas(){return (await Bodega.findAll({order:[['id_bodega','ASC']]})).map(x=>({id:x.id_bodega,nombre:x.nombre,tipo:x.tipo}));}
export async function listarProveedores(){return (await Proveedor.findAll({order:[['id_proveedor','ASC']]})).map(x=>({id:x.id_proveedor,nombre:x.nombre}));}

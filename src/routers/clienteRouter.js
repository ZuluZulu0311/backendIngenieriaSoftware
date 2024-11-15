import express from "express";
import * as controller from "../controllers/clienteController.js";

const router = express.Router();



router.get('/listarUsuarios', controller.listarUsuarios);
router.get('/buscarUsuario/:usuarioId', controller.buscarUsuario);
router.get('/buscarUsuariosNickName/:nickName', controller.buscarUsuariosNickName);
router.post('/estadisticas', controller.obtenerEstadisticasCliente);
router.get('/mostrarCantUsuarios', controller.mostrarCantUsuarios);
router.delete('/eliminarUsuario/:usuarioId', controller.eliminarCliente);
router.get('/mostrarCantUsuarios', controller.mostrarCantUsuarios);

export default router;
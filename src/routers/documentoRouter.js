import express from "express";
import * as controller from "../controllers/documentoController.js"
import { verificarToken } from '../middlewares/auth.js';

const router = express.Router();


router.post('/crearDocumento', controller.crearDocumento);
router.post('/crearValoracion/:documentoId', controller.crearValoracion);

//router.post('/crearDocumentoArchivo', upload.single('archivo'), controller.crearDocumentoArchivo); 


router.post("/verDocumento/:documentoId", controller.buscarDocumentoID)
router.get('/listarDocumentosCategoria/:categoriaNombre', controller.listarDocumentosCategoria);
router.get('/verAutores/:documentoId', controller.verAutores);
router.get('/verOtrosDocumentos/:nickName', controller.visualizarOtrosDocumentos);
router.get('/verMisDocumentos/:nickName', controller.visualizarOtrosDocumentosMisDocumentos);
router.get('/documentoVisor/:documentoId', controller.mostrarDocumentoConPDFKit);
router.post('/descargar/:idArchivo', controller.descargarDocumento);
router.get('/ordenAlf/:flag', controller.ordenDocsAlfabeto);
router.get('/ordenFechaPub/:flag', controller.ordenFechaPub);
router.get('/promedio/:documentoId', controller.promedioValoraciones);
router.get('/total', controller.totalDocumentos);
router.get('/totalPorCategoria/:categoriaId', controller.cantDocumentosCategoria)
router.get('/documentosPaginados', controller.documentosPaginados);
router.get('/documentosMayorCantidadDescargas/:flag', controller.documentosPorCantidadDescargas);
router.get('/documentosMayorCantVisualizaciones/:flag', controller.documentosPorCantidadVisualizaciones);
router.get('/documentosAleatorios', controller.documentosAleatorios);
router.get('/documentosPorValoracion/:flag', controller.obtenerDocumentosPorMejorValoracion);
router.get('/mostrarCantDocs', controller.mostrarCantDocs);
router.get('/listarValoraciones/:documentoId', controller.listarValoraciones);

router.get('/buscar', controller.buscarDocumentosConFiltros);
router.patch('/actualizarInfoDoc/:documentoId', controller.actualizarDocumento);
router.patch('/editarValoracionDeDocumento/:documentoId/:idValoracion', controller.actualizarValoracion);


router.delete('/eliminarDoc/:documentoId', controller.eliminarDocumento);
router.delete('/eliminarValoracion/:documentoId/:idValoracion', controller.eliminarValoracionPorId);

router.post('/reportar', controller.reportar)


export default router;
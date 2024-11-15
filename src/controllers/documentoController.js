import express from "express";
import { documentoModel } from "../models/documento.js";
import * as clienteService from "../services/clienteService.js";
import * as categoriaService from "../services/categoriaService.js";
import * as documentoService from "../services/documentoService.js";
import mongoose from "mongoose";
import { decryptId } from "../libs/encryption.js";
import { sendEmail } from "../services/emailService.js";

//Manejo de propias excepciones
//Consultas mongo // En otras capas a parte.


//Crear documento
export async function crearDocumento(req, res) {
    try {
        // Asegurarse de que las propiedades sean arrays
        const categorias = Array.isArray(req.body.categoria) ? req.body.categoria : [];
        const infoAutores = Array.isArray(req.body.infoAutores) ? req.body.infoAutores : [];
        const valoraciones = Array.isArray(req.body.valoraciones) ? req.body.valoraciones : [];

        // Obtener los ids que se deben validar
        const categoriasIds = categorias.map(c => c.categoriaId); // Extraer categoriaId de cada categoría
        const autoresIds = infoAutores.filter(a => a.autorId).map(a => a.autorId); // Solo aquellos que tengan autorId
        const clientesIds = valoraciones.map(v => v.clienteId); // Extraer clienteId de valoraciones

        // Validar existencia de categorías, autores y clientes si hay IDs

        // Validar categorías
        const sonCategoriasValidas = await validarCategorias(categoriasIds);
        if (!sonCategoriasValidas) {
            return res.status(400).send("Una o más categorías no existen");
        }

        // Validar autores
        const sonAutoresValidos = await validarAutores(autoresIds);
        if (!sonAutoresValidos) {
            return res.status(400).send("Uno o más autores no existen");
        }

        // Validar clientes en valoraciones
        const sonClientesValidos = await validarClientesValoracion(clientesIds);
        if (!sonClientesValidos) {
            return res.status(400).send("Uno o más clientes de valoraciones no existen");
        }


        // Crear el documento si todas las validaciones pasaron
        const documento = await documentoService.crearDocumento(req.body);
        res.status(201).send(documento);
    } catch (e) {
        res.status(500).send({ error: e.message || "Error en el servidor" });
    }
}

//Crear documento archivo
export async function crearDocumentoArchivo(req, res) {
    try {
        const categorias = JSON.parse(req.body.categoria);
        const infoAutores = JSON.parse(req.body.infoAutores);
        const valoraciones = JSON.parse(req.body.valoraciones);

        const categoriasIds = categorias.map((cat) => cat.categoriaId);
        const autoresIds = infoAutores
            .filter((a) => a.autorId)
            .map((a) => a.autorId);
        const clientesIds = valoraciones.map((v) => v.clienteId);

        const sonCategoriasValidas = await validarCategorias(categoriasIds);
        if (!sonCategoriasValidas) {
            return res.status(400).send("Una o más categorías no existen");
        }

        const sonAutoresValidos = await validarAutores(autoresIds);
        if (!sonAutoresValidos) {
            return res.status(400).send("Uno o más autores no existen");
        }

        const sonClientesValidos = await validarClientesValoracion(clientesIds);
        if (!sonClientesValidos) {
            return res
                .status(400)
                .send("Uno o más clientes de valoraciones no existen");
        }

        if (!req.file) {
            return res.status(400).send("Error: No se ha subido ningún archivo");
        }

        const documento = new documentoModel({
            ...req.body,
            URL: req.body.URL,
            categoria: categorias,
            infoAutores: infoAutores,
            valoraciones: valoraciones,
        });

        const documentoGuardar = await documento.save();
        res.status(201).send(documentoGuardar);
    } catch (e) {
        res.status(500).send(e);
    }
}


const validarCategorias = async (categoriasIds) => {
    const categoriasValidas = await categoriaService.buscarCategorias(categoriasIds);
    return categoriasValidas.length === categoriasIds.length;
}

const validarAutores = async (autoresIds) => {
    const autoresValidos = await clienteService.buscarClientes(autoresIds);
    return autoresValidos.length === autoresIds.length;
};

const validarClientesValoracion = async (clientesIds) => {
    const clientesValidos = await clienteService.buscarClientes(clientesIds);
    return clientesValidos.length === clientesIds.length;
};


//Listar documentos
export async function documentosPaginados(req, res) {
    try {
        const { page, limit } = req.query;
        const result = await documentoService.traerDocumentoPaginados(page, limit);
        if (result.data.length == 0) {
            return res.status(404).send('No hay documentos visibles');
        }
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los documentos', error });
    }
}


export async function buscarDocumentoID(req, res) {
    const documentoIdBuscar = req.params.documentoId;
    const userId = req.body.userId
    try {
        const decryptedId = decryptId(documentoIdBuscar);
        const documento = await documentoService.buscarDocumentoPorId(decryptedId);
        if (!documento) {
            return res.status(404).send("No hay documentos visibles");
        }
        if (userId) {
            clienteService.documentoVisualizado(userId, decryptedId);
        }
        res.status(200).send(documento);
    } catch (e) {
        res
            .status(400)
            .send({ error: "Error al buscar el documento", detalle: e.message });
    }
}


//Listar Documentos por categoría (nombre)
export async function listarDocumentosCategoria(req, res) {
    try {
        const categoriaNombre = req.params.categoriaNombre;
        const { page, limit } = req.query;
        const categoriaPorNombre = await categoriaService.buscarCategoriasNombre(categoriaNombre);

        if (!categoriaPorNombre) {
            return res.status(404).send('No se ha encontrado la categoría buscada');
        }

        const categoriaPorNombreUsar = categoriaPorNombre[0];
        const catId = categoriaPorNombreUsar._id;

        const documentosFiltrados = await documentoService.buscarDocumentoPorCategoria(catId, page, limit);
        if (documentosFiltrados.data.length === 0) {
            return res.status(404).send('No se han creado documentos con la categoría buscada');
        }

        res.status(200).json(documentosFiltrados)
    } catch (e) {
        res.status(500).send({ error: e.message || "Error en el servidor" });
    }
}


// Ver información de los autores de los documentos:
export async function verAutores(req, res) {
    try {
        const documentoIdBuscar = req.params.documentoId;

        const documento = await documentoService.buscarDocumentoPorId(documentoIdBuscar);
        if (documento) {
            const informacionAutores = await documentoService.infoAutoresDeDocumento(documentoIdBuscar);

            const informacionAutoresMapeada = informacionAutores.map(info => {
                return `Nombre: ${info.Nombre}\n` +
                    `NickName: ${info.NickName}\n` +
                    `Número de Documentos Publicados: ${info['Numero documentos Publicados']}\n` +
                    `Documentos Publicados: ${info['Documentos Publicados'].join(', ') || 'Ninguno'}\n`;
            }).join("\n");

            res.status(200).send(informacionAutoresMapeada);

        } else {
            res.status(404).send('No se encontró el documento con el id ingresado');
        }
    } catch (e) {
        res.status(500).send({ error: "Error interno del servidor", detalle: e.message });
    }
}

export async function eliminarDocumento(req, res) {
    try {
        const idDocEliminar = req.params.documentoId;
        const docEliminar = await documentoService.buscarDocumentoPorId(idDocEliminar);
        if (!docEliminar) {
            return res.status(400).send("El documento que se desea eliminar no se encuentra en la base de datos");
        }
        await documentoService.buscarDocYEliminar(idDocEliminar);
        res.status(200).send('El documento ha sido eliminado correctamente');
    } catch (e) {
        res.status(500).send({ error: "Error interno del servidor", detalle: e.message });
    }
}

//Visualizar otros documentos del autor en específico
export async function visualizarOtrosDocumentos(req, res) {
    try {
        const nickName = req.params.nickName;
        const { page, limit } = req.query;
        const documentosDeEseAutor = await documentoService.DocsDeAutor(nickName, page, limit);
        if (documentosDeEseAutor.data.length === 0) {
            return res.status(404).send('No se han encontrado documentos para este autor');
        }

        res.status(200).json(documentosDeEseAutor)
    } catch (e) {
        res.status(500).send({ error: "Error interno del servidor", detalle: e.message });
    }
}


//Función para mostrar la metadata del documento (Una aproximación) 
export async function mostrarDocumentoConPDFKit(req, res) {
    try {
        const documentoId = mongoose.Types.ObjectId.createFromHexString(req.params.documentoId);
        const documento = await documentoModel.findOne({ _id: documentoId });

        if (!documento) {
            return res.status(404).send('Documento no encontrado');
        }

        // Establecer el tipo de contenido como PDF
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=documento.pdf');

        // Crear el PDF (ajustando el orden de los parámetros)
        buildPDF(
            chunk => res.write(chunk), // dataCallback para escribir cada chunk
            () => res.end(),           // endCallback para finalizar la respuesta
            documento                  // Objeto documento para usar en el PDF
        );

    } catch (e) {
        res.status(500).send({ error: "Error interno del servidor", detalle: e.message });
    }
}

//Actualizar documento 
export async function actualizarDocumento(req, res) {
    try {
        const idDocumento = req.params.documentoId;
        if (req.body.fechaPublicacion || req.body.fechaUltimaModificacion || req.body.numDescargas || req.body.valoraciones) {
            return res.status(400).send('No se pueden modificar algunos de los campos que desea');
        }

        const documentoActualizado = await documentoService.buscarYActualizarDoc(idDocumento, req.body);
        if (!documentoActualizado) {
            return res.status(404).send('Documento no encontrado')
        }
        res.status(201).send('Documento actualizado correctamente')

    } catch (e) {
        res.status(500).send({ error: "Error interno del servidor", detalle: e.message });
    }
}

//Descargar documento
export async function descargarDocumento(req, res) {
    try {
        const idArchivo = req.params.idArchivo;
        const userId = req.body.userId;

        await clienteService.documentoDescargado(userId, idArchivo);
        res.status(200).send("Descarga añadida")
    } catch (e) {
        res
            .status(500)
            .send({ error: "Error interno del servidor", detalle: e.message });
    }
}
//si se puede ordenar desde fronted pues ya está
//Igual dejo aquí el controller de esto :D

export async function ordenDocsAlfabeto(req, res) {
    try {
        const flag = req.params.flag === 'true';
        const { page, limit } = req.query;
        const documentosOrdenados = await documentoService.documentosOrdenAlfabetico(flag, page, limit);
        res.status(200).json(documentosOrdenados);
    } catch (e) {
        res.status(500).json({ error: "Error interno del servidor", detalle: e.message });
    }
}

export async function ordenFechaPub(req, res) {
    try {
        const flag = req.params.flag === 'true';
        const { page, limit } = req.query;
        const documentosOrdenados = await documentoService.documentoOrdenadosPorFechaPublicacion(flag, page, limit);
        res.status(200).json(documentosOrdenados);
    } catch (e) {
        res.status(500).json({ error: "Error interno del servidor", detalle: e.message });
    }
}


export async function documentosPorCantidadDescargas(req, res) {
    try {
        const { page, limit } = req.query;
        const flag = req.params.flag === 'true';
        const docs = await documentoService.docsPorMayorCantDescargas(flag, page, limit);
        res.status(200).json(docs);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los documentos', error });
    }
}

export async function documentosPorCantidadVisualizaciones(req, res) {
    try {
        const { page, limit } = req.query;
        const flag = req.params.flag === 'true';
        const docs = await documentoService.docsPorMayorVisualizaciones(flag, page, limit);
        res.status(200).json(docs);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los documentos', error });
    }
}

export async function documentosAleatorios(req, res) {
    try {
        const { limit } = req.query;
        const docs = await documentoService.docsAleatoriamente(limit);
        res.status(200).json(docs);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los documentos', error });
    }
}


export async function obtenerDocumentosPorMejorValoracion(req, res) {
    try {
        const flag = req.params.flag === 'true';
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        // Validación adicional
        if (isNaN(page) || page <= 0) {
            return res.status(400).json({ message: 'El parámetro "page" debe ser un entero positivo' });
        }
        if (isNaN(limit) || limit <= 0) {
            return res.status(400).json({ message: 'El parámetro "limit" debe ser un entero positivo' });
        }

        const documentos = await documentoService.docsPorMejorValoracion(flag, page, limit);

        res.status(200).json(documentos);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los documentos por mejor valoración', error });
    }
}

export async function promedioValoraciones(req, res) {
    try {
        let docId = req.params.documentoId;
        const promedio = await documentoService.promedioValoracion(docId);
        res.status(200).send(promedio);
    } catch (e) {
        res.status(500).send({ error: "Error interno del servidor", detalle: e.message });
    }
}

export async function totalDocumentos(req, res) {
    try {
        let cantidadTotal = await documentoService.cantTotalDocumentos();
        res.status(200).send(cantidadTotal)
    } catch (e) {
        res.status(500).send({ error: "Error interno del servidor", detalle: e.message });
    }
}

export async function cantDocumentosCategoria(req, res) {
    try {
        const categoriaId = req.params.categoriaId;
        const categoria = await categoriaService.buscarCategoriaId(categoriaId);
        if (!categoria) {
            return res.status(404).send('Categoria no encontrada');
        }
        const cantidad = await documentoService.cantDocumentoCategoria(categoriaId);
        res.status(200).send(cantidad);
    } catch (e) {
        res.status(500).send({ error: "Error interno del servidor", detalle: e.message });
    }
}



// funcion para mapear la salida de los documentos en postman
function mapearDocumento(doc) {
    return `    
        Documento:
        -----------------------
        Título: ${doc.titulo || "Sin título"}
        URL: ${doc.URL || "Sin URL"}
        Descripción: ${doc.descripcion || "Sin descripción"}

        Categoría(s):
        ${doc.categoria.length > 0
            ? doc.categoria.map(cat => `
                - Nombre: ${cat.categoriaNombre || "Sin nombre"}
                - Subcategoría: ${cat.subCategoriaNombre || "Sin subcategoría"}
            `).join("\n")
            : "Sin categorías"}

        Visibilidad: ${doc.visibilidad}
        Fecha de Publicación: ${new Date(doc.fechaPublicacion).toLocaleString()}
        Número de Descargas: ${doc.numDescargas}
        Última Modificación: ${new Date(doc.fechaUltimaModificacion).toLocaleString()}
        
        Autores:
        ${doc.infoAutores
            ? `
                - Nombre: ${doc.infoAutores.nombre || "Sin nombre"}
                - Tipo: ${doc.infoAutores.tipo || "Sin tipo"}
                - Registrado: ${doc.infoAutores.registrado ? 'Sí' : 'No'}
            `
            : "Sin autores"}
        
        Valoraciones:
        ${doc.valoraciones.length > 0
            ? doc.valoraciones.map(val => `
                - Cliente ID: ${val.clienteId || "Sin ID"}
                - Puntuación: ${val.puntuacion}
                - Comentario: ${val.comentario || "Sin comentario"}
                - Fecha: ${new Date(val.fecha).toLocaleString()}
            `).join("\n")
            : "No hay valoraciones disponibles"}
        
        Imagen de Portada: ${doc.imagenPortada || "Sin imagen"}
        
        -----------------------
    `;
}

export async function buscarDocumentosConFiltros(req, res) {
    try {
        const { page, limit, titulo, categoriaNombre, subCategoriaNombre, idioma, nombreAutor } = req.query;

        const filters = {
            titulo,
            categoriaNombre,
            subCategoriaNombre,
            idioma,
            nombreAutor
        };

        const documentos = await documentoService.buscarDocumentosConFiltros(filters, page, limit);

        res.status(200).json(documentos);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los documentos', error });
    }
}


export async function visualizarOtrosDocumentosMisDocumentos(req, res) {
    try {
        const nickName = req.params.nickName;
        const { page, limit } = req.query;
        const documentosDeEseAutor = await documentoService.DocsDeAutorMisDocumentos(nickName, page, limit);
        if (documentosDeEseAutor.data.length === 0) {
            return res.status(404).send('No se han encontrado documentos para este autor');
        }

        res.status(200).json(documentosDeEseAutor)
    } catch (e) {
        res.status(500).send({ error: "Error interno del servidor", detalle: e.message });
    }
}

export async function crearValoracion(req, res) {
    try {
        const documentoId = req.params.documentoId;
        //const decryptedDocumentoId = decryptId(documentoId);
        await documentoService.crearValoracion(documentoId, req.body);
        res.status(201).send("valoracion creada correctamente");
    } catch (Error) {
        res.status(500).send(Error.message);
    }
}

export async function actualizarValoracion(req, res) {
    const { documentoId, idValoracion } = req.params;
    const { comentario, puntuacion } = req.body;

    try {
        //const decryptedDocumentoId = decryptId(documentoId);

        const result = await documentoService.editarValoracionDeDocumento(
            documentoId, //decryptedDocumentoId
            idValoracion,
            comentario,
            puntuacion
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ message: 'No se encontró la valoración para actualizar.' });
        }

        res.status(200).json({ message: 'Valoración actualizada exitosamente.' });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar la valoración.', error });
    }
}

export async function eliminarValoracionPorId(req, res) {
    const documentoId = req.params.documentoId;
    const idValoracion = req.params.idValoracion;

    try {
        //const decryptedDocumentoId = decryptId(documentoId);

        await documentoService.eliminarValoracion(documentoId, idValoracion);
        res.status(200).send("Valoracion eliminada correctamente");
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar la valoración', error: error.message });
    }
}

export async function listarValoraciones(req, res) {
    const documentoId = req.params.documentoId
    //const decryptedDocumentoId = decryptId(documentoId);
    const valoraciones = await documentoService.listarValoraciones(documentoId);
    res.status(200).send(valoraciones)
}
export async function mostrarCantDocs(req, res) {
    try {
        const cantDocs = await documentoService.cantTotalDocumentos();
        res.status(200).send(cantDocs);
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar la valoración', error: error.message });
    }
}
export async function reportar(req, res) {
    const { documentoId, razon } = req.body
    const documento = await documentoService.buscarIdDocument(documentoId)

    try {
        await sendEmail({
            email: "juan_pab.zuluaga@uao.edu.co",
            type: "reportEmail",
            cuerpo: razon,
            titulo: documento.titulo

        });
        res.status(200).send(documento.infoAutores[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear el reporte', error: error.message });
    }


}
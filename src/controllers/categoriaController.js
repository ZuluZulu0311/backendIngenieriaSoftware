import express from "express";
import * as categoriaService from "../services/categoriaService.js";
import mongoose from "mongoose";

export async function CrearCategoria(req, res) {
    try {
        const subCategorias = req.body.subcategoria;

        if (subCategorias.length > 0) {
            const subCategoriasIds = subCategorias.map(x => x.categoriaId);

            const categoriasValidas = await validarSubCategoria(subCategoriasIds);

            if (!categoriasValidas) {
                return res.status(404).send('Una o más sub categorías ingresadas no existen en la base de datos');
            }
        }

        const categoriaCrear = await categoriaService.crearCategoria(req.body);
        res.status(201).send(categoriaCrear);
    } catch (e) {
        res.status(400).send(e)
    }
}

const validarSubCategoria = async (subCategoriaId) => {
    const subCategoriasValidas = await categoriaService.buscarCategorias(subCategoriaId);
    return subCategoriasValidas.length === subCategoriaId.length;
}

export async function eliminarCategoria(req, res) {
    try {
        const categoriaId = req.params.categoriaId;
        const categoriaEliminar = await categoriaService.buscarCategoriaId(categoriaId);

        if (!categoriaEliminar) {
            return res.status(404).send('La categoría a eliminar no existe en la base de datos');
        }

        await categoriaService.eliminarCategoriaId(categoriaId); // Llamada a la función del servicio que elimina la categoría y actualiza referencias
        res.status(200).send('La categoría ha sido eliminada con éxito y todas las referencias actualizadas.');
    } catch (error) {
        console.error("Error al eliminar la categoría:", error);
        res.status(500).send({ error: "Error interno del servidor", detalle: error.message });
    }
}

export async function eliminarSubcategoriasDeCategoria(req, res) {
    try {
        const { categoriaId, subCategoriaId } = req.params;
        const categoriaActualizada = await categoriaService.eliminarSubcategoriaDeCategoria(categoriaId, subCategoriaId);

        res.status(200).send({ categoriaActualizada });
    } catch (error) {
        res.status(500).send({ error: 'Error al eliminar la subcategoría', detalle: error.message });
    }
}

export async function actualizarCategoria(req, res) {
    try {
        const categoriaId = req.params.categoriaId;
        const categoriaActualizada = await categoriaService.actualizarCategoriaPorId(categoriaId, req.body);

        if (!categoriaActualizada) {
            return res.status(400).send({ error: 'La categoría a editar no existe en la base de datos' });
        }

        // Envía la categoría completa como respuesta
        res.status(200).send({ categoriaActualizada });

    } catch (e) {
        if (e.message === 'Una o más subcategorías ya existen en esta categoría.') {
            return res.status(400).send({ error: e.message });
        }
        res.status(500).send({ error: "Error interno del servidor", detalle: e.message });
    }
}

export async function listarCategorias(req, res) {
    try {
        const categorias = await categoriaService.listarCategorias();
        if (!categorias) {
            return res.status(404).send('No hay categorias para listar');
        }
        res.status(200).send(categorias);
    } catch (e) {
        res.status(500).send({ error: "Error interno del servidor", detalle: e.message });
    }
}

export async function buscarCategoriaNombre(req, res) {
    try {
        const categoriaNombre = req.params.categoriaNombre;
        const categorias = await categoriaService.buscarCategoriasNombre(categoriaNombre);
        if (!categorias) {
            return res.status(404).send('No hay categorias para listar con el nombre dado');
        }
        res.status(200).send(categorias);
    } catch (e) {
        res.status(500).send({ error: "Error interno del servidor", detalle: e.message });
    }
}

export async function subCatesDeCats(req, res) {
    try {
        const categoriaId = req.params.categoriaId;
        const subs = await categoriaService.subCategoriasDeCategorias(categoriaId);
        res.status(200).send(subs);
    } catch (error) {
        res.status(500).send({ error: "Error interno del servidor", detalle: error.message });
    }
}

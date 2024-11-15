import express from "express";
import { categoriaModel } from "../models/categoria.js";
import mongoose from "mongoose";

export const crearCategoria = async (info) => {
    const { subcategoria, ...categoriaInfo } = info;

    // Si hay subcategorías en la información proporcionada
    let subcategoriasConNombre = [];
    if (subcategoria && subcategoria.length > 0) {
        subcategoriasConNombre = await Promise.all(
            subcategoria.map(async (sub) => {
                const subcategoriaEncontrada = await categoriaModel.findById(sub.categoriaId);
                if (!subcategoriaEncontrada) {
                    throw new Error(`Subcategoría con ID ${sub.categoriaId} no encontrada.`);
                }
                return {
                    categoriaId: sub.categoriaId,
                    nombre: subcategoriaEncontrada.nombre
                };
            })
        );
    }

    // Crea la nueva categoría incluyendo las subcategorías con nombres
    const nuevaCategoria = new categoriaModel({
        ...categoriaInfo,
        subcategoria: subcategoriasConNombre
    });

    return await nuevaCategoria.save();
};


export const buscarCategorias = async (categoriasIds) => {
    let categorias = await categoriaModel.find({ _id: { $in: categoriasIds } })
    if (categorias.length == 0) {
        return categorias = [];
    }
    return categorias;
}

export const eliminarCategoriaId = async (categoriaId) => {
    try {
        // Verificar si la categoría existe antes de eliminarla
        const categoria = await categoriaModel.findById(categoriaId);
        if (!categoria) {
            throw new Error("La categoría no existe");
        }

        // Buscar todas las categorías que tienen a esta categoría como subcategoría
        const categoriasConSubcategoria = await categoriaModel.find({ "subcategoria.categoriaId": categoriaId });

        // Para cada categoría que contiene la subcategoría, eliminarla de su arreglo de subcategorías
        for (const cat of categoriasConSubcategoria) {
            await categoriaModel.findByIdAndUpdate(
                cat._id,
                { $pull: { subcategoria: { categoriaId: categoriaId } } },
                { new: true } // Devolver el documento actualizado
            );
        }

        // Finalmente, eliminar la categoría principal
        await categoriaModel.findByIdAndDelete(categoriaId);
    } catch (error) {
        console.error("Error al eliminar la categoría y sus referencias:", error);
        throw error;
    }
};



export const buscarCategoriaId = async (categoriaId) => {
    const categoria = await categoriaModel.findById(categoriaId);
    return categoria;
}

export const buscarCategoriaIdYEliminar = async (categoriaId) => {
    return await categoriaModel.findByIdAndDelete(categoriaId);
}

export const buscarCategoriaConSubCategoria = async (categoriaId, subcategoriaId) => {
    const categoria = await categoriaModel.find({ _id: categoriaId, "subcategoria.categoriaId": subcategoriaId })
    return categoria;
}

export const eliminarSubcategoriaDeCategoria = async (categoriaId, subcategoriaId) => {
    // Actualiza la categoría eliminando la subcategoría específica
    const categoriaActualizada = await categoriaModel.findByIdAndUpdate(
        categoriaId,
        { $pull: { subcategoria: { categoriaId: subcategoriaId } } },
        { new: true } // Retorna la categoría actualizada
    );

    if (!categoriaActualizada) {
        throw new Error('La categoría no existe.');
    }

    return categoriaActualizada; // Asegúrate de que la categoría completa sea devuelta, incluyendo las subcategorías restantes
};

export const actualizarCategoriaPorId = async (categoriaId, info) => {
    const { subcategoria, ...categoriaInfo } = info;

    // Actualiza la información de la categoría principal
    let categoriaActualizada = await categoriaModel.findByIdAndUpdate(
        categoriaId,
        { $set: categoriaInfo },
        { new: true, useFindAndModify: false }
    );

    // Verifica si hay subcategorías para agregar
    if (subcategoria && categoriaActualizada) {
        const subcategoriasConNombre = await Promise.all(
            subcategoria.map(async (sub) => {
                const subcategoriaEncontrada = await categoriaModel.findById(sub.categoriaId);
                if (!subcategoriaEncontrada) {
                    throw new Error(`Subcategoría con ID ${sub.categoriaId} no encontrada.`);
                }
                return {
                    categoriaId: sub.categoriaId,
                    nombre: subcategoriaEncontrada.nombre
                };
            })
        );

        // Filtra las subcategorías que ya existen en la categoría
        const subcategoriasExistentes = categoriaActualizada.subcategoria.map((sub) => sub.categoriaId.toString());
        const subcategoriasNuevas = subcategoriasConNombre.filter(
            (sub) => !subcategoriasExistentes.includes(sub.categoriaId)
        );

        // Agrega las subcategorías nuevas
        if (subcategoriasNuevas.length > 0) {
            categoriaActualizada = await categoriaModel.findByIdAndUpdate(
                categoriaId,
                { $push: { subcategoria: { $each: subcategoriasNuevas } } },
                { new: true, useFindAndModify: false }
            );
        }
    }

    // Retorna la categoría completa con todas las subcategorías
    return categoriaActualizada;
};



export const listarCategorias = async () => {
    const categorias = await categoriaModel.find({});
    return categorias;
}

export const buscarCategoriasNombre = async (categoriaNombre) => {
    const categorias = await categoriaModel.find({ nombre: { $regex: categoriaNombre, $options: 'i' } });
    return categorias;
}


export const subCategoriasDeCategorias = async (categoriaId) => {
    const categoria = await categoriaModel.findById(categoriaId);
    const subCategorias = categoria.subcategoria;
    return subCategorias;
}

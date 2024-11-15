import express from "express";
import "../src/db/conn.js";
import documentoRoutes from "../src/routers/documentoRouter.js"
import clienteRoutes from "../src/routers/clienteRouter.js"
import categoriaRoutes from "../src/routers/categoriaRouter.js"
import clienteAuthRoutes from "../src/routers/clienteRouterAutenticacion.js";
import uploadcareRoutes from "../src/routers/uploadcareRouter.js";
import cors from "cors";

const app = express();
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], // Métodos permitidos
    allowedHeaders: ['Content-Type', 'Authorization'] // Encabezados permitidos
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/documentos", documentoRoutes);
app.use("/clientes", clienteRoutes);
app.use("/clientesAuth", clienteAuthRoutes);
app.use("/categorias", categoriaRoutes);

app.use("/uploadPrueba", uploadcareRoutes);


app.listen(3000)
console.log('Server on port 3000')
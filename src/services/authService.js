import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { clienteModel } from '../models/clientes.js';
import * as documentoModel from "../models/documento.js";
import { Resend } from "resend";
import mongoose from 'mongoose';

const SALT_ROUNDS = 10;

export const crearCliente = async (datosCliente) => {
  const clienteExiste = await clienteModel.findOne({ "registro.correo": datosCliente.registro.correo });
  const clienteExiste2 = await clienteModel.findOne({ "nickName": datosCliente.nickName })
  if (clienteExiste) {
    throw new Error('Ya existe un usuario con el correo ingresado');
  }
  if (clienteExiste2) {
    throw new Error('Ya existe un usuario con el nickname que intenta ingresar');
  }
  const contraseniaHasheada = await bcrypt.hash(datosCliente.contrasenias[0].contrasenia, SALT_ROUNDS);
  datosCliente.contrasenias[0].contrasenia = contraseniaHasheada;

  const cliente = new clienteModel(datosCliente);
  return await cliente.save();
};


export const login = async (datosLogin) => {
  const cliente = await clienteModel.findOne({ 'registro.correo': datosLogin.registro.correo });
  if (!cliente) {
    throw new Error('Cliente no encontrado');
  }

  const contraseniaActiva = cliente.contrasenias.find(contrasenia => contrasenia.estado === "Activa");
  if (!contraseniaActiva) {
    throw new Error('No hay contraseñas activas para este cliente');
  }


  const contraseniaValida = await bcrypt.compare(datosLogin.registro.contrasenia, contraseniaActiva.contrasenia);
  if (!contraseniaValida) {
    throw new Error('Contraseña incorrecta');
  }

  const token = jwt.sign(
    { userId: cliente._id, nickName: cliente.nickName },
    process.env.JWT_KEY,
    { expiresIn: '1h' }
  );

  return { token, cliente };
};


export const recuperarContra = async (datosRespuesta) => {

  const cliente = await clienteModel.findOne({ 'registro.correo': datosRespuesta.correo });
  if (!cliente) {
    throw new Error('Cliente no encontrado.');
  }

  const respuestaCorrecta = cliente.registro.infoPregunta.respuesta;
  if (datosRespuesta.respuestaSeguridad !== respuestaCorrecta) {
    throw new Error('Respuesta de seguridad incorrecta.');
  }

  const contraseniaHasheada = await bcrypt.hash(datosRespuesta.nuevaContrasenia, SALT_ROUNDS);

  if (cliente.contrasenias.length > 0) {
    cliente.contrasenias[cliente.contrasenias.length - 1].estado = 'Inactiva';
  }

  cliente.contrasenias.push({ contrasenia: contraseniaHasheada, estado: 'Activa' });

  await cliente.save();

  return { message: 'Contraseña actualizada exitosamente.', nombre: cliente.nombreCompleto };
};

export const cambiarContrasenia = async (userId, contraseniaActual, nuevaContrasenia) => {
  // Recuperar el cliente con base en el userId
  const cliente = await clienteModel.findById(userId);
  if (!cliente) {
    throw new Error('Cliente no encontrado.');
  }

  // Buscar la contraseña activa
  const contraseniaActiva = cliente.contrasenias.find(contrasenia => contrasenia.estado === "Activa");
  if (!contraseniaActiva) {
    throw new Error('No se ha encontrado una contraseña activa.');
  }

  // Comparar la contraseña actual con la activa
  const contraseniaValida = await bcrypt.compare(contraseniaActual, contraseniaActiva.contrasenia);
  if (!contraseniaValida) {
    throw new Error('La contraseña actual es incorrecta.');
  }

  // Verificar que la nueva contraseña no sea igual a las anteriores
  const contraseniasAnteriores = cliente.contrasenias.filter(contrasenia => contrasenia.estado === "Inactiva");
  const contraseniaRepetida = contraseniasAnteriores.some(contrasenia =>
    bcrypt.compareSync(nuevaContrasenia, contrasenia.contrasenia)
  );

  if (contraseniaRepetida) {
    throw new Error('La nueva contraseña no puede ser la misma que alguna de las contraseñas anteriores.');
  }

  // Si todo es correcto, actualizar la contraseña
  const nuevaContraseniaHash = await bcrypt.hash(nuevaContrasenia, 10);

  // Se actualiza la contraseña
  contraseniaActiva.estado = 'Inactiva'; // Marcamos la anterior como inactiva
  cliente.contrasenias.push({
    contrasenia: nuevaContraseniaHash,
    estado: 'Activa',
    fecha: new Date(),
  });

  // Guardamos el cliente actualizado
  await cliente.save();
  return { message: 'Contraseña cambiada con éxito.', name: cliente.nombreCompleto, email: cliente.registro.correo };
};

export async function sendEmail(name, email) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    const response = await resend.emails.send({
      from: 'alfonso@appsfactory.com.co',
      to: email,
      subject: 'Recuperación de contraseña',
      html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" lang="en">

  <head>
    <link rel="preload" as="image" href="https://ucarecdn.com/94854455-bef1-479c-8ec5-a91eb85ea626/logo.png" />
    <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
    <meta name="x-apple-disable-message-reformatting" /><!--$-->
  </head>
 <div style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0">DocTic recupera tu contraseña<div></div>
  </div>

  <body style="background-color:#f6f9fc;padding:10px 0">
    <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="max-width:37.5em;background-color:#ffffff;border:1px solid #f0f0f0;padding:45px">
      <tbody>
        <tr style="width:100%">
          <td><img alt="DocTic" height="33" src="https://ucarecdn.com/94854455-bef1-479c-8ec5-a91eb85ea626/logo.png" style="display:block;outline:none;border:none;text-decoration:none" width="100" />
            <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation">
              <tbody>
                <tr>
                  <td>
                    <p style="font-size:16px;line-height:26px;margin:16px 0;font-family:&#x27;Open Sans&#x27;, &#x27;HelveticaNeue-Light&#x27;, &#x27;Helvetica Neue Light&#x27;, &#x27;Helvetica Neue&#x27;, Helvetica, Arial, &#x27;Lucida Grande&#x27;, sans-serif;font-weight:300;color:#404040">Hola <!-- -->${name}<!-- -->,</p>
                    <p style="font-size:16px;line-height:26px;margin:16px 0;font-family:&#x27;Open Sans&#x27;, &#x27;HelveticaNeue-Light&#x27;, &#x27;Helvetica Neue Light&#x27;, &#x27;Helvetica Neue&#x27;, Helvetica, Arial, &#x27;Lucida Grande&#x27;, sans-serif;font-weight:300;color:#404040">Alguien solicitó recientemente un cambio de contraseña para tu cuenta de DocTic. Si fuiste tú, puedes establecer una nueva contraseña aquí:</p><a href="http://localhost:5173/passwordReset?email=${email}" style="line-height:100%;text-decoration:none;display:block;max-width:100%;mso-padding-alt:0px;background-color:#4B3DE3;border-radius:4px;color:#fff;font-family:&#x27;Open Sans&#x27;, &#x27;Helvetica Neue&#x27;, Arial;font-size:15px;text-align:center;width:210px;padding:14px 7px 14px 7px" target="_blank"><span><!--[if mso]><i style="mso-font-width:350%;mso-text-raise:21" hidden>&#8202;</i><![endif]--></span><span style="max-width:100%;display:inline-block;line-height:120%;mso-padding-alt:0px;mso-text-raise:10.5px">Restablecer Contraseña</span><span><!--[if mso]><i style="mso-font-width:350%" hidden>&#8202;&#8203;</i><![endif]--></span></a>
                    <p style="font-size:16px;line-height:26px;margin:16px 0;font-family:&#x27;Open Sans&#x27;, &#x27;HelveticaNeue-Light&#x27;, &#x27;Helvetica Neue Light&#x27;, &#x27;Helvetica Neue&#x27;, Helvetica, Arial, &#x27;Lucida Grande&#x27;, sans-serif;font-weight:300;color:#404040">Si no deseas cambiar tu contraseña o no solicitaste esto, simplemente ignora y elimina este mensaje.</p>
                    <p style="font-size:16px;line-height:26px;margin:16px 0;font-family:&#x27;Open Sans&#x27;, &#x27;HelveticaNeue-Light&#x27;, &#x27;Helvetica Neue Light&#x27;, &#x27;Helvetica Neue&#x27;, Helvetica, Arial, &#x27;Lucida Grande&#x27;, sans-serif;font-weight:300;color:#404040">Para mantener tu cuenta segura, por favor no reenvíes este correo a nadie.<!-- -->
                    <p style="font-size:16px;line-height:26px;margin:16px 0;font-family:&#x27;Open Sans&#x27;, &#x27;HelveticaNeue-Light&#x27;, &#x27;Helvetica Neue Light&#x27;, &#x27;Helvetica Neue&#x27;, Helvetica, Arial, &#x27;Lucida Grande&#x27;, sans-serif;font-weight:300;color:#404040">¡Disfruta de DocTic!</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table><!--/$-->
  </body>

</html>`
    });
    return response;
  } catch (error) {
    throw new Error(`Failed to send email: ${error.message}`);
  }
}

export const primerPaso = async (emailCliente) => {
  const cliente = await clienteModel.findOne({ 'registro.correo': emailCliente });

  if (!cliente) {
    throw new Error('Cliente no encontrado.');
  }

  return {
    nombreCompleto: cliente.nombreCompleto,
    preguntaAutenticacion: cliente.registro.infoPregunta.preguntaAutenticacion,
    respuesta: cliente.registro.infoPregunta.respuesta
  };
};
export const cambiarPregunta = async (
  userId,
  nuevaPregunta,
  nuevaRespuesta
) => {
  // Encontrar el cliente por el id
  const cliente = await clienteModel.findById(userId);
  if (!cliente) {
    throw new Error("Cliente no encontrado");
  }

  cliente.registro.infoPregunta.preguntaAutenticacion = nuevaPregunta;
  cliente.registro.infoPregunta.respuesta = nuevaRespuesta;

  await cliente.save();

  return { message: "Pregunta de seguridad cambiada correctamente", name: cliente.nombreCompleto, email: cliente.registro.correo };
};
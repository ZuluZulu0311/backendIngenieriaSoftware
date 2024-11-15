import { Resend } from "resend"; // Asegúrate de que Resend esté importado correctamente

export async function sendEmail({ name, email, type, cuerpo, titulo }) {
  if (!email) {
    console.log(name)
    console.log(email)
    throw new Error("El nombre o el correo no son válidos");
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  const templates = {
    passwordReset: {
      subject: "Recuperación de contraseña",
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
                          <p style="font-size:16px;line-height:26px;margin:16px 0;font-family:&#x27;Open Sans&#x27;, &#x27;HelveticaNeue-Light&#x27;, &#x27;Helvetica Neue Light&#x27;, &#x27;Helvetica Neue&#x27;, Helvetica, Arial, &#x27;Lucida Grande&#x27;, sans-serif;font-weight:300;color:#404040">Hola ${name},</p>
                          <p style="font-size:16px;line-height:26px;margin:16px 0;font-family:&#x27;Open Sans&#x27;, &#x27;HelveticaNeue-Light&#x27;, &#x27;Helvetica Neue Light&#x27;, &#x27;Helvetica Neue&#x27;, Helvetica, Arial, &#x27;Lucida Grande&#x27;, sans-serif;font-weight:300;color:#404040">Alguien solicitó recientemente un cambio de contraseña para tu cuenta de DocTic. Si fuiste tú, puedes establecer una nueva contraseña aquí:</p><a href="http://localhost:5173/passwordReset?email=${email}" style="line-height:100%;text-decoration:none;display:block;max-width:100%;mso-padding-alt:0px;background-color:#4B3DE3;border-radius:4px;color:#fff;font-family:&#x27;Open Sans&#x27;, &#x27;Helvetica Neue&#x27;, Arial;font-size:15px;text-align:center;width:210px;padding:14px 7px 14px 7px" target="_blank"><span><!--[if mso]><i style="mso-font-width:350%;mso-text-raise:21" hidden>&#8202;</i><![endif]--></span><span style="max-width:100%;display:inline-block;line-height:120%;mso-padding-alt:0px;mso-text-raise:10.5px">Restablecer Contraseña</span><span><!--[if mso]><i style="mso-font-width:350%" hidden>&#8202;&#8203;</i><![endif]--></span></a>
                          <p style="font-size:16px;line-height:26px;margin:16px 0;font-family:&#x27;Open Sans&#x27;, &#x27;HelveticaNeue-Light&#x27;, &#x27;Helvetica Neue Light&#x27;, &#x27;Helvetica Neue&#x27;, Helvetica, Arial, &#x27;Lucida Grande&#x27;, sans-serif;font-weight:300;color:#404040">Si no deseas cambiar tu contraseña o no solicitaste esto, simplemente ignora y elimina este mensaje.</p>
                          <p style="font-size:16px;line-height:26px;margin:16px 0;font-family:&#x27;Open Sans&#x27;, &#x27;HelveticaNeue-Light&#x27;, &#x27;Helvetica Neue Light&#x27;, &#x27;Helvetica Neue&#x27;, Helvetica, Arial, &#x27;Lucida Grande&#x27;, sans-serif;font-weight:300;color:#404040">Para mantener tu cuenta segura, por favor no reenvíes este correo a nadie.</p>
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
    
        </html>,
      `,
    },
    passwordChanged: {
      subject: "Tu contraseña ha cambiado",
      html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" lang="en">

<head>
    <link rel="preload" as="image" href="https://ucarecdn.com/94854455-bef1-479c-8ec5-a91eb85ea626/logo.png" />
    <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
    <meta name="x-apple-disable-message-reformatting" />
</head>
<div style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0">DocTic - Tu contraseña ha sido cambiada</div>

<body style="background-color:#f6f9fc;padding:10px 0">
    <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="max-width:37.5em;background-color:#ffffff;border:1px solid #f0f0f0;padding:45px">
        <tbody>
            <tr style="width:100%">
                <td><img alt="DocTic" height="33" src="https://ucarecdn.com/94854455-bef1-479c-8ec5-a91eb85ea626/logo.png" style="display:block;outline:none;border:none;text-decoration:none" width="100" />
                    <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation">
                        <tbody>
                            <tr>
                                <td>
                                    <p style="font-size:16px;line-height:26px;margin:16px 0;font-family:'Open Sans', 'HelveticaNeue-Light', 'Helvetica Neue Light', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif;font-weight:300;color:#404040">Hola ${name},</p>
                                    <p style="font-size:16px;line-height:26px;margin:16px 0;font-family:'Open Sans', 'HelveticaNeue-Light', 'Helvetica Neue Light', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif;font-weight:300;color:#404040">Queremos informarte que tu contraseña de DocTic ha sido cambiada con éxito. Si realizaste este cambio, no necesitas realizar ninguna acción adicional.</p>
                                    <p style="font-size:16px;line-height:26px;margin:16px 0;font-family:'Open Sans', 'HelveticaNeue-Light', 'Helvetica Neue Light', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif;font-weight:300;color:#404040">Si no fuiste tú quien cambió la contraseña, por favor, restablece tu contraseña inmediatamente y revisa la seguridad de tu cuenta.</p>
                                    <p style="font-size:16px;line-height:26px;margin:16px 0;font-family:'Open Sans', 'HelveticaNeue-Light', 'Helvetica Neue Light', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif;font-weight:300;color:#404040">Para mantener tu cuenta segura, por favor no reenvíes este correo a nadie.</p>
                                    <p style="font-size:16px;line-height:26px;margin:16px 0;font-family:'Open Sans', 'HelveticaNeue-Light', 'Helvetica Neue Light', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif;font-weight:300;color:#404040">¡Gracias por usar DocTic!</p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </td>
            </tr>
        </tbody>
    </table>
</body>

</html>
      `,
    },
    welcome: {
      subject: "¡Bienvenido a DocTic, tu espacio de conocimiento digital!",
      html: `
      <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
      <html dir="ltr" lang="en">
        <head>
          <link rel="preload" as="image" href="https://ucarecdn.com/94854455-bef1-479c-8ec5-a91eb85ea626/logo.png" />
          <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
          <meta name="x-apple-disable-message-reformatting" />
        </head>
        <div style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0">
          Bienvenido a DocTic
        </div>
      
        <body style="background-color:#f6f9fc;padding:10px 0">
          <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="max-width:37.5em;background-color:#ffffff;border:1px solid #f0f0f0;padding:45px">
            <tbody>
              <tr style="width:100%">
                <td>
                  <img alt="DocTic" height="33" src="https://ucarecdn.com/94854455-bef1-479c-8ec5-a91eb85ea626/logo.png" style="display:block;outline:none;border:none;text-decoration:none" width="100" />
                  <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation">
                    <tbody>
                      <tr>
                        <td>
                          <p style="font-size:16px;line-height:26px;margin:16px 0;font-family:'Open Sans', 'HelveticaNeue-Light', 'Helvetica Neue Light', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif;font-weight:300;color:#404040">
                            Hola ${name},
                          </p>
                          <p style="font-size:16px;line-height:26px;margin:16px 0;font-family:'Open Sans', 'HelveticaNeue-Light', 'Helvetica Neue Light', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif;font-weight:300;color:#404040">
                            ¡Nos alegra darte la bienvenida a <strong>DocTic</strong>!
                          </p>
                          <p style="font-size:16px;line-height:26px;margin:16px 0;font-family:'Open Sans', 'HelveticaNeue-Light', 'Helvetica Neue Light', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif;font-weight:300;color:#404040">
                            Ahora puedes acceder a una amplia biblioteca digital donde podrás descubrir, leer y compartir conocimientos en diversos formatos. Aquí tienes algunos pasos para aprovechar al máximo DocTic:
                          </p>
                          <ul style="font-size:16px;line-height:26px;margin:16px 0;font-family:'Open Sans', 'HelveticaNeue-Light', 'Helvetica Neue Light', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif;font-weight:300;color:#404040;padding-left:20px;">
                            <li>Explora una amplia variedad de documentos en temas de tu interés.</li>
                            <li>Sube tus propios archivos y compártelos con la comunidad.</li>
                            <li>Guarda tus documentos favoritos para acceder fácilmente.</li>
                          </ul>
                          <p style="font-size:16px;line-height:26px;margin:16px 0;font-family:'Open Sans', 'HelveticaNeue-Light', 'Helvetica Neue Light', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif;font-weight:300;color:#404040">
                            Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos. Estamos aquí para apoyarte.
                          </p>
                          <p style="font-size:16px;line-height:26px;margin:16px 0;font-family:'Open Sans', 'HelveticaNeue-Light', 'Helvetica Neue Light', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif;font-weight:300;color:#404040">
                            ¡Gracias por unirte a DocTic, y disfruta de esta nueva experiencia!
                          </p>
                          <p style="font-size:16px;line-height:26px;margin:16px 0;font-family:'Open Sans', 'HelveticaNeue-Light', 'Helvetica Neue Light', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif;font-weight:300;color:#404040">
                            Saludos,<br />El equipo de DocTic
                          </p>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </body>
      </html>
      
      `,
    },
    securityQuestionChanges: {
      subject: "Tu pregunta de seguridad ha cambiado.",
      html: `
      <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
      <html dir="ltr" lang="en">
        <head>
          <link rel="preload" as="image" href="https://ucarecdn.com/94854455-bef1-479c-8ec5-a91eb85ea626/logo.png" />
          <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
          <meta name="x-apple-disable-message-reformatting" />
        </head>
        <div style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0">
          Cambio de pregunta de seguridad en DocTic
        </div>
      
        <body style="background-color:#f6f9fc;padding:10px 0">
          <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="max-width:37.5em;background-color:#ffffff;border:1px solid #f0f0f0;padding:45px">
            <tbody>
              <tr style="width:100%">
                <td>
                  <img alt="DocTic" height="33" src="https://ucarecdn.com/94854455-bef1-479c-8ec5-a91eb85ea626/logo.png" style="display:block;outline:none;border:none;text-decoration:none" width="100" />
                  <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation">
                    <tbody>
                      <tr>
                        <td>
                          <p style="font-size:16px;line-height:26px;margin:16px 0;font-family:'Open Sans', 'HelveticaNeue-Light', 'Helvetica Neue Light', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif;font-weight:300;color:#404040">
                            Hola ${name},
                          </p>
                          <p style="font-size:16px;line-height:26px;margin:16px 0;font-family:'Open Sans', 'HelveticaNeue-Light', 'Helvetica Neue Light', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif;font-weight:300;color:#404040">
                            Hemos recibido tu solicitud para cambiar la <strong>pregunta de seguridad</strong> en tu cuenta de DocTic.
                          </p>
                          <p style="font-size:16px;line-height:26px;margin:16px 0;font-family:'Open Sans', 'HelveticaNeue-Light', 'Helvetica Neue Light', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif;font-weight:300;color:#404040">
                            Si realizaste esta solicitud, puedes ignorar este mensaje, y la actualización se aplicará en breve.
                          </p>
                          <p style="font-size:16px;line-height:26px;margin:16px 0;font-family:'Open Sans', 'HelveticaNeue-Light', 'Helvetica Neue Light', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif;font-weight:300;color:#404040">
                            Sin embargo, si no solicitaste este cambio, por favor, comunícate con nuestro equipo de soporte <a href="mailto:soporte@doctic.com" style="color:#1a73e8;text-decoration:none">aquí</a> para asegurarnos de que tu cuenta esté segura.
                          </p>
                          <p style="font-size:16px;line-height:26px;margin:16px 0;font-family:'Open Sans', 'HelveticaNeue-Light', 'Helvetica Neue Light', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif;font-weight:300;color:#404040">
                            Gracias por tu atención y por ayudarnos a proteger la seguridad de tu cuenta.
                          </p>
                          <p style="font-size:16px;line-height:26px;margin:16px 0;font-family:'Open Sans', 'HelveticaNeue-Light', 'Helvetica Neue Light', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif;font-weight:300;color:#404040">
                            Saludos,<br />El equipo de DocTic
                          </p>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </body>
      </html>
      
        `,
    },
    profileChanges: {
      subject: "Tu información en el perfil ha cambiado.",
      html: `
      <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" lang="en">
  <head>
    <link rel="preload" as="image" href="https://ucarecdn.com/94854455-bef1-479c-8ec5-a91eb85ea626/logo.png" />
    <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
    <meta name="x-apple-disable-message-reformatting" />
  </head>
  <div style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0">
    Actualización de información de perfil en DocTic
  </div>

  <body style="background-color:#f6f9fc;padding:10px 0">
    <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="max-width:37.5em;background-color:#ffffff;border:1px solid #f0f0f0;padding:45px">
      <tbody>
        <tr style="width:100%">
          <td>
            <img alt="DocTic" height="33" src="https://ucarecdn.com/94854455-bef1-479c-8ec5-a91eb85ea626/logo.png" style="display:block;outline:none;border:none;text-decoration:none" width="100" />
            <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation">
              <tbody>
                <tr>
                  <td>
                    <p style="font-size:16px;line-height:26px;margin:16px 0;font-family:'Open Sans', 'HelveticaNeue-Light', 'Helvetica Neue Light', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif;font-weight:300;color:#404040">
                      Hola ${name},
                    </p>
                    <p style="font-size:16px;line-height:26px;margin:16px 0;font-family:'Open Sans', 'HelveticaNeue-Light', 'Helvetica Neue Light', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif;font-weight:300;color:#404040">
                      Queremos informarte que tu <strong>información de perfil</strong> ha sido actualizada correctamente en <strong>DocTic</strong>.
                    </p>
                    <p style="font-size:16px;line-height:26px;margin:16px 0;font-family:'Open Sans', 'HelveticaNeue-Light', 'Helvetica Neue Light', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif;font-weight:300;color:#404040">
                      Si no realizaste esta actualización, por favor contacta a nuestro equipo de soporte de inmediato para proteger tu cuenta. Puedes hacerlo <a href="mailto:soporte@doctic.com" style="color:#1a73e8;text-decoration:none">aquí</a>.
                    </p>
                    <p style="font-size:16px;line-height:26px;margin:16px 0;font-family:'Open Sans', 'HelveticaNeue-Light', 'Helvetica Neue Light', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif;font-weight:300;color:#404040">
                      Gracias por confiar en DocTic para gestionar tu información y documentos.
                    </p>
                    <p style="font-size:16px;line-height:26px;margin:16px 0;font-family:'Open Sans', 'HelveticaNeue-Light', 'Helvetica Neue Light', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif;font-weight:300;color:#404040">
                      Saludos,<br />El equipo de DocTic
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  </body>
</html>
        `,
    },
    accountDeleted: {
      subject: "Tu cuenta ha sido eliminada.",
      html: `
        <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" lang="en">
  <head>
    <link rel="preload" as="image" href="https://ucarecdn.com/94854455-bef1-479c-8ec5-a91eb85ea626/logo.png" />
    <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
    <meta name="x-apple-disable-message-reformatting" />
  </head>
  <div style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0">
    Confirmación de eliminación de cuenta en DocTic
  </div>

  <body style="background-color:#f6f9fc;padding:10px 0">
    <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation" style="max-width:37.5em;background-color:#ffffff;border:1px solid #f0f0f0;padding:45px">
      <tbody>
        <tr style="width:100%">
          <td>
            <img alt="DocTic" height="33" src="https://ucarecdn.com/94854455-bef1-479c-8ec5-a91eb85ea626/logo.png" style="display:block;outline:none;border:none;text-decoration:none" width="100" />
            <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" role="presentation">
              <tbody>
                <tr>
                  <td>
                    <p style="font-size:16px;line-height:26px;margin:16px 0;font-family:'Open Sans', 'HelveticaNeue-Light', 'Helvetica Neue Light', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif;font-weight:300;color:#404040">
                      Hola ${name},
                    </p>
                    <p style="font-size:16px;line-height:26px;margin:16px 0;font-family:'Open Sans', 'HelveticaNeue-Light', 'Helvetica Neue Light', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif;font-weight:300;color:#404040">
                      Te informamos que tu <strong>cuenta de DocTic</strong> ha sido eliminada correctamente. Esta acción es <strong>irreversible</strong>, y ya no podrás acceder a tus documentos ni a la información asociada a tu cuenta.
                    </p>
                    <p style="font-size:16px;line-height:26px;margin:16px 0;font-family:'Open Sans', 'HelveticaNeue-Light', 'Helvetica Neue Light', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif;font-weight:300;color:#404040">
                      Si en el futuro decides regresar a DocTic, serás bienvenido a crear una nueva cuenta para disfrutar de nuestros servicios y acceder a nuestra comunidad de conocimiento.
                    </p>
                    <p style="font-size:16px;line-height:26px;margin:16px 0;font-family:'Open Sans', 'HelveticaNeue-Light', 'Helvetica Neue Light', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif;font-weight:300;color:#404040">
                      Lamentamos verte partir y agradecemos el tiempo que fuiste parte de DocTic.
                    </p>
                    <p style="font-size:16px;line-height:26px;margin:16px 0;font-family:'Open Sans', 'HelveticaNeue-Light', 'Helvetica Neue Light', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif;font-weight:300;color:#404040">
                      Saludos,<br />El equipo de DocTic
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  </body>
</html>

          `,
    }, reportEmail: {
      subject: "Un reporte ha sido creado",
      html: `
      <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html dir="ltr" lang="en">

      <head>
        <link rel="preload" as="image" href="https://ucarecdn.com/94854455-bef1-479c-8ec5-a91eb85ea626/logo.png" />
        <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
        <meta name="x-apple-disable-message-reformatting" /><!--$-->
      </head>
      <div style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0">Reporte de documento por plagio<div></div>
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
                        <p style="font-size:16px;line-height:26px;margin:16px 0;font-family:&#x27;Open Sans&#x27;, &#x27;HelveticaNeue-Light&#x27;, &#x27;Helvetica Neue Light&#x27;, &#x27;Helvetica Neue&#x27;, Helvetica, Arial, &#x27;Lucida Grande&#x27;, sans-serif;font-weight:300;color:#404040">Hola Administrador.</p>
                        <p style="font-size:16px;line-height:26px;margin:16px 0;font-family:&#x27;Open Sans&#x27;, &#x27;HelveticaNeue-Light&#x27;, &#x27;Helvetica Neue Light&#x27;, &#x27;Helvetica Neue&#x27;, Helvetica, Arial, &#x27;Lucida Grande&#x27;, sans-serif;font-weight:300;color:#404040">Hemos recibido un reporte de plagio para el documento titulado <strong>${titulo} en DocTic. A continuación se muestra el argumento proporcionado:</p>
                        <blockquote style="font-size:16px;line-height:26px;margin:16px 0;font-family:&#x27;Open Sans&#x27;, &#x27;HelveticaNeue-Light&#x27;, &#x27;Helvetica Neue Light&#x27;, &#x27;Helvetica Neue&#x27;, Helvetica, Arial, &#x27;Lucida Grande&#x27;, sans-serif;font-weight:300;color:#404040;background-color:#f0f0f0;padding:15px;border-radius:4px;">
                          ${cuerpo}
                        </blockquote>
                        <p style="font-size:16px;line-height:26px;margin:16px 0;font-family:&#x27;Open Sans&#x27;, &#x27;HelveticaNeue-Light&#x27;, &#x27;Helvetica Neue Light&#x27;, &#x27;Helvetica Neue&#x27;, Helvetica, Arial, &#x27;Lucida Grande&#x27;, sans-serif;font-weight:300;color:#404040">Nuestro equipo revisará el contenido y tomará las medidas necesarias según las políticas de DocTic.</p>
                        <p style="font-size:16px;line-height:26px;margin:16px 0;font-family:&#x27;Open Sans&#x27;, &#x27;HelveticaNeue-Light&#x27;, &#x27;Helvetica Neue Light&#x27;, &#x27;Helvetica Neue&#x27;, Helvetica, Arial, &#x27;Lucida Grande&#x27;, sans-serif;font-weight:300;color:#404040">Gracias por ayudarnos a mantener una comunidad justa y respetuosa.</p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table><!--/$-->
      </body>
    
    </html>
      `
    }
  };

  const template = templates[type];
  if (!template) {
    throw new Error(`Tipo de correo "${type}" no soportado`);
  }

  try {
    // Registro en consola del tipo de correo que se va a enviar para depuración
    console.log(`Enviando correo tipo: ${type} a ${email}`);

    // Envío del correo a través de Resend
    const response = await resend.emails.send({
      from: "alfonso@appsfactory.com.co",
      to: email,
      subject: template.subject,
      html: template.html,
    });

    // Respuesta de la API
    console.log("Respuesta de Resend:", response);
    return response;
  } catch (error) {
    // Manejo de errores con más detalle
    console.error("Error al enviar correo:", error);
    throw new Error(`No se pudo enviar el correo: ${error.message}`);
  }
}

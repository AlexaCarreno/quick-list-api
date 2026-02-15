export const signupVerificationTemplate = (code: string) => {
    return `
        <!DOCTYPE html>
        <html lang="es">
        <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            /* Estilos inline-friendly para correos */
            body {
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
            font-family: Arial, sans-serif;
            }
            .email-container {
            max-width: 600px;
            margin: auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            }
            h1 {
            color: #333333;
            }
            p {
            font-size: 16px;
            color: #555555;
            }
            .code-box {
            font-size: 28px;
            font-weight: bold;
            letter-spacing: 8px;
            color: #2c3e50;
            background-color: #f0f0f0;
            padding: 15px 20px;
            border-radius: 6px;
            display: inline-block;
            margin: 20px 0;
            }
            .footer {
            margin-top: 30px;
            font-size: 12px;
            color: #999999;
            }

            @media only screen and (max-width: 600px) {
            .code-box {
                font-size: 24px;
                letter-spacing: 6px;
            }
            }
        </style>
        </head>
        <body>
        <div class="email-container">
            <h1>Tu código de verificación</h1>
            <p>Hola,</p>
            <p>Usa el siguiente código para verificar tu cuenta. El código expirará en 10 minutos.</p>
            <div class="code-box">${code}</div>
            <p>Si no solicitaste este código, puedes ignorar este mensaje.</p>
            <div class="footer">
            © 2025 Tu Empresa. Todos los derechos reservados.
            </div>
        </div>
        </body>
        </html>
    `;
};

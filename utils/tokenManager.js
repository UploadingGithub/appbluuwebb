/*
Genera el token JWT con la librería jsonwebtoken.
https://www.npmjs.com/package/jsonwebtoken

En la validación del token, si el token no es válido, jsonwebtoken genera un error,
por eso usamos el try-catch, para capturar ese error en el catch y ahí ver que el token no era válido.

*/


import jwt from 'jsonwebtoken';



// =================================================================================================================================
// GENERAR EL TOKEN DE AUTENTICACIÓN. (Access Token)
// =================================================================================================================================

/* 
Poniendo un JWT con un tiempo de expiración relativamente corto, nos aseguramos de que si un malware roba el token,
sólo lo pudiese usar unos momentos (en teoría ~15 minutos de hecho como máximo, normalmente menos),
ya que el servidor a los 15 minutos anulará ese token, y le enviará uno nuevo al cliente, dejando inservible el que robó el malware.

Tampoco se puede abusar de poner un tiempo de expiración muy corto, porque entonces se incrementaría la carga al servidor de generar nuevos tokens. 
Y para pocos usuarios no afectaría, pero para millones de ellos sí.
*/
const expiresIn = 60 * 15; // 15 minutos de vida para el JWT.

/* 
-------------------------------------------------------------------------------------------------------------------
Recibe como parámetro los DATOS (PAYLOAD) a meter en el JWT. (en este caso sólo el ID del usuario: uid = user ID)  

(aunque la librería jsonwebtoken añade por defecto además el campo iat: "issued at": fecha de creación/emisión):
("Generated jwts will include an iat (issued at) claim by default unless noTimestamp is specified.")
-------------------------------------------------------------------------------------------------------------------
*/
export const generateToken = (uid) => {
    try {
        // Synchronous Sign with default (HMAC SHA256)
        let token = jwt.sign({ uid }, process.env.JWT_SECRET, { expiresIn }); // jwt.sign({ uid: uid }, process.env.JWT_SECRET, { expiresIn: expiresIn });
        return { token, expiresIn };
    }
    catch (error) {
        console.log(error);
    }
}



// =================================================================================================================================
// GENERAR EL REFRESH TOKEN. (y mandárselo al cliente en una cookie)
// =================================================================================================================================

export const generateRefreshToken = (uid, res) => {
    // La expiración del refresh token es mayor.
    const expiresIn = (60 * 60 * 24 * 30) * 1000; // 30 días (en milisegundos)

    try {
        // Synchronous Sign with default (HMAC SHA256)
        let refreshToken = jwt.sign({ uid }, process.env.JWT_REFRESH, { expiresIn });

        // Devolver al cliente el Refresh Token en una cookie.
        // https://expressjs.com/en/4x/api.html#res.cookie
        res.cookie('refreshToken', refreshToken, { 
            httpOnly: true, 
            expires: new Date(Date.now() + expiresIn) // cookie will be removed after 30 days.
        });
    }
    catch (error) {
        console.log(error);
    }
}






import jwt from 'jsonwebtoken';


/* 
---------------------------------------------------------------------------------------------------------------------
Comprobar si existe el Refresh Token, y si existe verificar que es válido. 
---------------------------------------------------------------------------------------------------------------------
*/
export const requireRefreshToken = (req, res, next) => {
    try {
        // Intentamos extraer el Refresh Token de la cookie en la que viene.
        let refreshTokenCookie = req.cookies.refreshToken;

        // Si NO existe el Refresh Token en la cookie: error.
        if (!refreshTokenCookie) throw new Error('No existe el Refresh Token.');
        
        // Si SÍ existe el Refresh Token en la cookie: 
        
        // Comprobar si el Refresh Token es válido. (si no es válido: salta al catch)
        let { uid } = jwt.verify(refreshTokenCookie, process.env.JWT_REFRESH);

        // Incorporar una nueva propiedad al Request: uid. La creamos/añadimos en el Request.
        req.uid = uid;

        next();
    }
    catch (error) {
        console.log(error);
        res.status(401).json({ error }); // res.status(401).json({ error: error });
    }
}






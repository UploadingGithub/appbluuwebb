import jwt from 'jsonwebtoken';


/* 
---------------------------------------------------------------------------------------------------------------------
Verificar si el token JWT es válido. 
---------------------------------------------------------------------------------------------------------------------
*/
export const requireToken = (req, res, next) => {
    try {
        let token = req.headers.authorization;

        if (!token) throw new Error('No Bearer');

        token = token.split(" ")[1];

        /* 
        -----------------------
        Verificar el token JWT
        -----------------------
        Si el token es validado: verify devuelve la segunda parte del JWT: DATOS (PAYLOAD)
        Desestructuramos para sacar directamente el ID del usuario 
        (que fue el dato que el servidor metió en los DATOS (PAYLOAD) del JWT cuando lo creó) 
        */
        let { uid } = jwt.verify(token, process.env.JWT_SECRET); 

        // Añadir al req una nueva propiedad: el ID del usuario, para pasárselo al siguiente middleware con next().
        req.uid = uid;

        next();
    }
    /* 
    jsonwebtoken, en la función anterior verify, si determina que el JWT no es válido, genera un error, y salta aquí al catch.
    El error que genera, lo hace mediante un throw new Error(message), por eso aquí en el catch tenemos acceso a ese error.message.
    */
    catch (error) {
        console.log(error);
        res.status(401).json({ error: error.message });
    }
}






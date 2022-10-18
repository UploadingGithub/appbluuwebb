
import { Link } from '../models/Link.js';


/* 
-------------------------------------------
REDIRECCIONAMIENTO DEL LADO DEL SERVIDOR:
-------------------------------------------

--------
En el redireccionamento del lado del cliente, el controlador del servidor devolvía al cliente el campo longLink del documento.
Y era el cliente en el frontend el que redireccionaba la página a esa otra URL (longLink).

(Redireccionamento del lado del cliente, ver: \controllers\link.controller.js --> getLink)
--------

En el redireccionamento del lado del servidor, usamos: Redirect Express.
https://expressjs.com/es/api.html#res.redirect

*/
export const redirectLink = async (req, res) => {
    try {
        // Obtener el parámetro de la URL.
        let { nanoLink } = req.params;

        // Buscar el documento en la base de datos MongoDB Atlas, cuyo nanoLink sea el parámetro de la URL.
        let link = await Link.findOne({ nanoLink }); // ...findOne({ nanoLink: nanoLink });

        // Si existe el documento:

        /* 
        Redireccionar a la página indicada por el campo longLink del documento. 

        En el navevador, al introducir la URL raíz del servidor, 
        el servidor redireccionará al navevador a la página indicada en el campo longLink del documento,
        que en este ejemplo es: https://mongoosejs.com/

        ver: redireccionamiento.mp4
        */
        res.redirect(link.longLink);
    }
    catch (error) {
        console.log(error);
        // Ver en la consola del servidor el objeto error: uno de sus campos es messageFormat.
        if (error.messageFormat === undefined) res.status(404).json({ error: "No existe el documento" });
        else res.status(500).json({ error });
    }
}







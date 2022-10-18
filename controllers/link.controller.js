// =================================================================================================================
// Controladores para las rutas: /api/v1/links
// =================================================================================================================

// npm install --save nanoid
import { nanoid } from 'nanoid';

import { Link } from '../models/Link.js';



/* 
--------------------------------------------------------------------------------------------------------------------
Para estos controladores:

El ID del usuario viene del Request 
ver: 
    link.route.js --> router.get("/", requireToken, getLinks);

porque creamos/añadimos esa nueva propiedad uid en el req, en la función middleware requireToken (\middlewares\requireToken.js)
--------------------------------------------------------------------------------------------------------------------
*/








/* 
--------------------------------------------------------------------------------------------------------------------
Listar todos los links de un usuario. 
--------------------------------------------------------------------------------------------------------------------
*/
export const getLinks = async (req, res) => {
    try {
        let links = await Link.find({ uid: req.uid });

        res.json({ links }); // res.json({ links: links });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error }); // ...json({ error: error });
    }
}




/* 
------------------------------------------
REDIRECCIONAMIENTO DEL LADO DEL CLIENTE:
------------------------------------------

El cliente llama a la URL con el parámetro nanoLink (ver explicación debajo),
el servidor con ese nanoLink busca el documento correspondiente en la base de datos, y obtiene su campo longLink,
y le devuelve al cliente dicho campo longLink,
y el cliente hace la redirección a dicha página (longLink).

(Esto se verá cuando se haga la parte del frontend de este ejercicio)


--------------------------------------------------------------------------------------------------------------------
Redireccionamiento. 
--------------------------------------------------------------------------------------------------------------------
Devuelve el campo longLink.

--------------------------------------------------------------------------------------------------------------------
Para un documento de la colección links, por ejemplo:

{
    "_id":      "634adabc286fb1091f6c326d",
    "longLink": "https://mongoosejs.com/",
    "nanoLink": "cQZTq_",
    "uid":      "632f3229000fe6c3d621cbe0",
    "__v":      "0"
}

donde el dominio raíz (en desarrollo) es: http://localhost:5000 (en producción será otro)

la idea es que el usuario en el frontend/vista al ir a la URL: http://localhost:5000/cQZTq_

donde cQZTq_ es el valor del campo "nanoLink",

esa nueva URL http://localhost:5000/cQZTq_ le llevase a la URL que indica el campo "longLink", 
en este caso a: https://mongoosejs.com/
--------------------------------------------------------------------------------------------------------------------
*/
export const getLink = async (req, res) => {
    try {
        // Obtener el parámetro de la URL.
        let { nanoLink } = req.params;

        // Buscar el documento cuya clave nanoLink tenga el valor que vino en el parámetro de la URL.
        // Si no existe el documento --> salta al catch.
        let link = await Link.findOne({ nanoLink }); // ...findOne({ nanoLink: nanoLink });

        // Devolvemos a la vista/frontend el valor de la clave longLink, con el que podrá hacer el redireccionamiento.
        res.status(200).json({ longLink: link.longLink });
    }
    catch (error) {
        console.log(error);
        // Ver en la consola del servidor el objeto error: uno de sus campos es messageFormat.
        if (error.messageFormat === undefined) res.status(404).json({ error: "No existe el documento" });
        else res.status(500).json({ error });
    }
}


/* 
Esta es la versión anterior del controlador getLink.
Se usó en pruebas anteriores, no ahora.

--------------------------------------------------------------------------------------------------------------------
Listar un link de un usuario.
--------------------------------------------------------------------------------------------------------------------
El link queda definido por el parámetro id que se le pasa en la URL.

req.params:
https://expressjs.com/en/5x/api.html#req.params

Route parameters:
https://expressjs.com/en/guide/routing.html#route-parameters
--------------------------------------------------------------------------------------------------------------------
*/
export const getLink_OLD = async (req, res) => {
    try {
        /* 
        ------------------------------------------------------------------------------------------------------------
        req.params --> es un objeto que contiene como propiedades, los distintos parámetros de la ruta.

        Ejemplo:
            - si la ruta está definida:     /api/v1/links/:id
            - si la ruta es:                http://localhost:5000/api/v1/links/1
            - el req.params es:             { id: '1' }

            donde el nombre de la propiedad es id, porque id fue el nombre con el que se definió la ruta en: 
            \routes\link.route.js --> router.get("/:id", requireToken, getLink);

            Y el objeto req.params sólo tiene una única propiedad id, porque la ruta sólo tiene un único parámetro: id.
            
            Si la ruta tuviese más parámetros, entonces el objeto req.params tendría más propiedades.
            Ejemplo:
            - si la ruta está definida:     /users/:userId/books/:bookId
            - si la ruta es:                http://localhost:3000/users/34/books/8989
            - el req.params es:             { "userId": "34", "bookId": "8989" }
        ------------------------------------------------------------------------------------------------------------
        */
        // Obtener el parámetro de la URL.
        let { id } = req.params; 

        let link = await Link.findById(id);

        // En teoría, si no se encuentra el documento (link) (en la colección links), saltaría al catch.
        // Pero por si acaso tratamos también aquí el error:
        if (!link) return res.status(404).json({ error: "No existe el documento link con este ID." });

        // Si sí existe el documento, pero el usuario que lo pide es otro distinto a su dueño, entonces error:
        if (!link.uid.equals(req.uid)) return res.status(401).json({ error: "Este documento con este ID no es de este usuario." });

        res.status(200).json({ link })
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error });
    }
}



/* 
--------------------------------------------------------------------------------------------------------------------
Crear un link. 
-------------------------------------------------------------------------------------------------------------------- 
*/
export const createLink = async (req, res) => {
    try {
        // console.log(req.body);
        
        /* 
        ------------------------------------------------------------------------------------------------------------
        Hay que validar primero, que este link (longLink) que se recibe en el body, sea un link/enlace correcto válido. 

        Esta comprobación se hace en el middleware bodyLinkValidator, en: \middlewares\validatorManager.js

        Y a su vez, este middleware bodyLinkValidator, se pone/añade en la ruta: 
            router.post("/", requireToken, createLink);
        en: \routes\link.route.js
        ------------------------------------------------------------------------------------------------------------
        */
      
        let { longLink } = req.body;
        console.log(longLink);

        // Con el modelo, lo instanciamos, y creamos un nuevo documento.
        let link = new Link({ 
            longLink, 
            /* 
            Le pone que genere claves de 6 caracteres.
            
            Calculadora de NanoID para hallar la probabilidad aproximada de colisión en un ID generado:
            https://zelark.github.io/nano-id-cc/

            con 6 caracteres para el alfabeto por defecto es de: 
            ~2 days needed, in order to have a 1% probability of at least one collision.
            */
            nanoLink: nanoid(6),
            uid: req.uid   
        });
        // console.log(link);

        // Guardar el documento en la base de datos MongoDB Atlas.
        let newLink = await link.save();

        res.status(201).json({ newLink });
    }   
    catch (error) {
        console.log(error);
        res.status(500).json({ error });
    }
}




/* 
--------------------------------------------------------------------------------------------------------------------
Actualizar un link. 
-------------------------------------------------------------------------------------------------------------------- 
*/
export const updateLink = async (req, res) => {
    try {
        // Obtener el parámetro de la URL.
        let { id } = req.params;

        // Buscar el documento en la base de datos MongoDB Atlas.
        // Si no existe el documento --> salta al catch.
        let link = await Link.findById(id);

        // Si el documento link existe, rechazar borrarlo si no lo está borrando su propietario.
        if (!link.uid.equals(req.uid)) return res.status(401).json({ error: "Este documento con este ID no es de este usuario." });

        // Obtener el dato con el que actualizar: longLink
        let { longLink } = req.body;

        // Actualizar el documento en la base de datos MongoDB Atlas.
        link.longLink = longLink;
        await link.save();

        // Responder al cliente.
        res.status(200).json({ link });
    }
    catch (error) {
        console.log(error);
        // Ver en la consola del servidor el objeto error: uno de sus campos es messageFormat.
        if (error.messageFormat === undefined) res.status(404).json({ error: "No existe el documento" });
        else res.status(500).json({ error });
    }
}




/* 
--------------------------------------------------------------------------------------------------------------------
Borrar un link. 
-------------------------------------------------------------------------------------------------------------------- 
*/
export const deleteLink = async (req, res) => {
    try {
        // Obtener el parámetro de la URL.
        let { id } = req.params;

        // console.log(id)

        // Buscar el documento en la base de datos MongoDB Atlas.
        // Si no existe el documento --> salta al catch.
        let link = await Link.findById(id);

        // Si el documento link existe, rechazar borrarlo si no lo está borrando su propietario.
        if (!link.uid.equals(req.uid)) return res.status(401).json({ error: "Este documento con este ID no es de este usuario." });

        // Si el documento existe, y sí es de este usuario: borrarlo.
        await link.remove();

        // Responder al cliente.
        res.status(200).json({ link });
    }
    catch (error) {
        console.log(error);
        // Ver en la consola del servidor el objeto error: uno de sus campos es messageFormat.
        if (error.messageFormat === undefined) res.status(404).json({ error: "No existe el documento" });
        else res.status(500).json({ error });
    }
}
















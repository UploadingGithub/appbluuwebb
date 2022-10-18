// npm install cors

/* 
---------------------------------------------------------
Si se pone así como en la documentación, ¡no funciona! :

    import * as dotenv from 'dotenv';
    dotenv.config();
*/
// Entonces se pone así:
import 'dotenv/config'; // That's it: process.env now has the keys and values you defined in your .env file
// ------------------------------------------------------

import cookieParser from 'cookie-parser';

import express from 'express';

import cors from 'cors';

// Importar el fichero de conexión a la base de datos MongoDB Atlas, para que se ejecute la conexión.
import './database/connectdb.js';

import authRouter from './routes/auth.route.js';

import linkRouter from './routes/link.route.js';

import redirectRouter from './routes/redirect.route.js';



const app = express();

// Por defecto si no está definido el puerto: es el 5000. 
// Pero cuando subamos la aplicación a Heroku él usa otro puerto que hay que configurar en el fichero .env
const port = process.env.PORT || 5000;




// ===========================================================================================================
// CORS.
// ===========================================================================================================
// Ponerlo como el primer middleware, el prioritario, antes que todos los demás.


/* 
----------------------------------------------------------
Forma 1 (oficial)
----------------------------------------------------------
var whitelist = ['http://localhost:3001']

var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
} 
*/


// -------------------------------------------------------
// Forma 2 (el tío Bluuweb)
// -------------------------------------------------------
/* 
const whiteList = [process.env.ORIGIN1];

app.use(
    cors({
        origin: function(origin, callback) {
            if (whiteList.includes(origin)) {
                return callback(null, origin);
            }
            return callback("No autorizado por CORS");
        },
    })
); 
*/



// ---------------------------------------------------------
// ATENCION
// ---------------------------------------------------------
/*

---
1.
---
CORS configurado de esta manera: 

con la función para la propiedad origin, -------------------------------------------------------------------------------------------> (1)
hace que las peticiones de servidores no autorizados, NO entren/NO lleguen al código de los controladores del servidor, 
sino que sean rechazadas de inmediato nada más llegar al servidor.

Esto es MÁS: seguro, eficiente, ...

De esta manera también se evitan ataques como los CSRF.

Esta es la forma correcta.

---
2.
---
CORS configurado de otra manera:

por ejemplo, en lugar de usar la función, poner directamente en la propiedad origin la white list de servidores permitidos,
hace que las peticiones de servidores no autorizados, SÍ entren/SÍ lleguen al código de los controladores del servidor, 
aunque luego dichos controladores (imagino por CORS) rechacen el responder a esos clientes.

Esto es MENOS: seguro, eficiente, ...

De esta manera NO se evitan ataques como los CSRF.

Esta es la forma menos correcta.

*/



// "Qué dominios son los autorizados para consumir nuestro backend": "todos los dominios que queramos aceptar en nuestro servidor de backend"
const whiteList = [process.env.ORIGIN1];

/* 
(El módulo cors hace que):
La función (que define el origin) recibe 2 parámetros:

    - origin    --> El Origin Server que hace la petición. (Request Origin) (de dónde se está haciendo la solicitud)
    - callback  --> función callback de respuesta que recibe 2 parámetros:
                        - posible error:        err [object]  
                        - permiso de acceso:    allow [bool]
*/
app.use(
    cors({
        // Configures the Access-Control-Allow-Origin CORS header.
        // Set origin to a function implementing some custom logic.
        // https://www.npmjs.com/package/cors#configuration-options
        origin: function(origin, callback) { // <------------------------------------------------------------------------------------ (1)

            // Si el Origin Server que hace la petición, SÍ está en nuestra lista blanca de servidores permitidos:
            // Enable CORS for this request.
            if (whiteList.indexOf(origin) !== -1) callback(null, true);

            // Si el Origin Server que hace la petición, NO está en nuestra lista blanca de servidores permitidos:
            // Disable CORS for this request.
            else callback(new Error("No autorizado por CORS"));

        }
    })
);


// ===========================================================================================================




// -----------------------------------------------------------------------------------------------------------
/*
El habilitar sólo la comunicación entre cliente y servidor con JSON, es otra pequeña medida de seguridad,
porque se evita el que el cliente pueda mandar otro tipo de datos como: en formato "HTML URL Encoding", ...
que pueden ser susceptibles de recibir código maliciosos.

No es que con JSON no se puedan recibir ataques, sino que el reducir la comunicación cliente-servidor a sólo JSON, 
elimina las otras fuentes de posibles ataques que se pueden dar en otros formatos: "HTML URL Encoding", ...

Además: ¿para qué habilitar otros formatos: "HTML URL Encoding", ..., si nuestra API REST no va a usar esos formatos?
(ya que sólo usa JSON)
*/

// La comunicación, cómo viajan los datos, entre el frontend y nuestro backend API REST, es en formato JSON.  

// Habilitar que Express pueda leer las request (req) en formato JSON. // For parsing application/json.
// Si no se pone este middleware aquí, entonces en el req del controlador (en auth.controller.js, etc): el req.body estaría undefined.
app.use(express.json());

// -----------------------------------------------------------------------------------------------------------



// -----------------------------------------------------------------------------------------------------------

// Para el manejo de cookies a través de Express.js es necesario utilizar el middleware cookie-parser.
// cookie-parser ubica en el objeto req, bajo req.cookies, con un objeto que identifica las cookies por un nombre, un string.
app.use(cookieParser());

// -----------------------------------------------------------------------------------------------------------






/* 
----------------------------------------------------------------------------------------------------------------
Hace estos middleware de rutas, según el apartado: "express.Router", en: 
(abajo de la página):
https://expressjs.com/es/guide/routing.html
----------------------------------------------------------------------------------------------------------------

Esta ruta inicial "/api/v1", digamos que pasa a ser la raíz de las rutas de las API REST de nuestro servidor Express.
Ejemplo:
si en auth.route.js tenemos: 
- router.get("/", ...)          -> su ruta completa será: /api/v1/
- router.get("/login", ...)     -> su ruta completa será: /api/v1/login
- router.post("/register", ...) -> su ruta completa será: /api/v1/register

El sentido de poner esta raíz inicial "/api/v1" es porque al ser un conjunto de API REST, éstas tendrán una versión.
Y en este caso se indica que la versión de nuestra API REST es la v1.

Si en el futuro actualizamos a una nueva versión, bastaría con añadir aquí otra ruta inicial/raíz, y poner: "/api/v2",
añadienndo las versiones nuevas de las API (en este caso) en el auth.route.js, poniendo las nuevas versiones de: "/login", "/register",
y de esta manera el usuario/programador que llame a las nuevas rutas: "api/v2/login", "api/v2/register", 
sabe que está utilizando las API REST versión 2.

Ejemplo real: https://pokeapi.co/
su API comienza en: https://pokeapi.co/api/v2/
indicando que son de su versión 2.

*/

// Authentication.
app.use("/api/v1/auth", authRouter);

// Links.
app.use("/api/v1/links", linkRouter);

// Redirect.
app.use("/", redirectRouter);



/* 
Habilitar la carpeta public.
Toda la carpeta public será la expuesta para que sea accedida desde un cliente (normalmente frontend, navegador)
This is a built-in middleware function in Express. It serves static files. 
Se pone después de todos los demás middleware.

7.bmp: La carpeta public no es una ruta, sino una carpeta:

No significa que hay una carpeta en la ruta(url) /public: no.
Sino que esta carpeta public, es donde se alojan los ficheros que podrán ser accedidos desde el cliente.
Y el cliente al acceder a ellos, accede desde la ruta raíz: http://localhost:5000/index.html
NO: http://localhost:5000/public/index.html

Lo ponemos ahora como ejemplo de un frontend (navegador que use los ficheros de la carpeta public) que conecta con el servidor.
Lo hacemos para analizar/ver el envío/recepción del token JWT.
*/
app.use(express.static('public'));



// Inicializar/Activar el servidor Express.
app.listen(port, () => {
    console.log(`Servidor Express activo en puerto ${port} 🔥🔥🔥`);
});





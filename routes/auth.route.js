
// ========================================================================================================================
// RUTAS AUTENTICADAS --> DE AUTENTICACION
// ========================================================================================================================


import { Router } from 'express';

import { login, register, infoUser, refreshToken, logout } from '../controllers/auth.controller.js';

import { bodyRegisterValidator, bodyLoginValidator } from '../middlewares/validatorManager.js';

import { requireRefreshToken } from '../middlewares/requireRefreshToken.js';

import { requireToken } from '../middlewares/requireToken.js';

/* 
-------------------------------------------------------------------------------------------------------------------------------------
express-validator
-------------------------------------------------------------------------------------------------------------------------------------
It is a set of express.js middlewares that wraps validator.js validator and sanitizer functions.

Es un módulo para que el backend/servidor valide la información/los campos que le llegan del frontend.
Esta acción es necesaria antes de guardar dicha información en la base de datos (MongoDB).
Si dicha validación no se hace con este módulo (o con otro), entonces habría que usar Vanilla JS (que es más tedioso, etc).

https://express-validator.github.io/docs/
https://www.npmjs.com/package/express-validator

*/
// import { body } from 'express-validator';



const router = Router();


/* 
----------------------------------------------------------------------------------------------------------------
El frontend tiene que mandar al servidor los datos de registro del usuario (email y password) en formato JSON.
Y este JSON es el que le llega al controlador register.
- Si esa información (JSON) sí es correcta -> es procesada.
- Si esa información (JSON) no es correcta -> es rechazada.

"Esta es la gracia del API REST: separar el backend del frontend":
al backend le da igual cómo sea/esté hecho el frontend: React, Angular, Vue, Vanilla JS, Postman, ...
----------------------------------------------------------------------------------------------------------------
*/

/* 
----------------------------------------------------------------------------------------------------------------
El JSON que manda el frontend (en este caso con Postman), es del tipo:
    {
        "email": "daadsa@gmail.com",
        "password": "123123",
        "repassword": "123123"
    }

En realidad sólo los dos primeros campos (email y password) son necesarios para el backend.

El campo repassword es otro campo que almacena la segunda introducción de la password, para comprobar que realmente coincidan.
Pero en un caso real el campo repassword no se maneja, y menos se almacena, en el backend,
sino que el campo repassword es una simple comprobación que se hace en el frontend, en algún input,
y una vez que el frontend comprueba que ambos input para la password son el mismo, 
entonces manda al backend sólo el campo password, no el repassword. 
(en este caso mandaría el JSON con 2 campos: email y password)

Pero en este ejercicio, el tío va a usar el módulo "express-validator",
para que el servidor valide los campos que le llegan en el JSON.
Y entonces mete también este campo repassword en el JSON para simplemente hacer más pruebas con el módulo "express-validator" a modo de ejercicio.
----------------------------------------------------------------------------------------------------------------
*/

/* 
-------------------------------------------------------------------------------------------------------------------------------------
Apartado "Manejadores de rutas":
https://expressjs.com/es/guide/routing.html

En este ejemplo los manejadores/controladores para la ruta "/api/v1/register" son, y se ejecutan en este orden:
    - manejador/controlador 1 -> body('username')
    - manejador/controlador 2 -> body('password')
    - manejador/controlador 3 -> register

Antes de pasar el control al manejador/controlador 3 -> register, que es donde ya introducimos los datos en la base de datos MongoDB,
validamos que los datos que nos han llegado del frontend sean correctos: manejador/controlador 1 , y, manejador/controlador 2.

(Después del primer parámetro: la ruta), el listado de manejadores/controladores se puede poner:
    - separado por comas 
    o 
    - metidos en un array []


Validation middlewares:
https://express-validator.github.io/docs/check-api.html

Validators:
https://github.com/validatorjs/validator.js#validators

Sanitizers:
https://github.com/validatorjs/validator.js#sanitizers


El JSON que manda el frontend (en este caso con Postman), es del tipo:
    {
        "email": "daadsa@gmail.com",
        "password": "123123",
        "repassword": "123123"
    }
-------------------------------------------------------------------------------------------------------------------------------------
*/

/* 
-------------------------------------------------------------------------------------------------------------------------------------
body:
------
https://express-validator.github.io/docs/check-api.html#bodyfields-message 

Comprueba/chequea el req.body

body(campo, mensaje)
    - campo     (obligatorio)   -> campo a validar que llega del frontend 
    - mensaje   (opcional)      -> string definiendo el posible error, que se mostrará en la respuesta de error que devuelva el servidor al frontend.

-------------------------------------------------------------------------------------------------------------------------------------
custom:
--------
https://express-validator.github.io/docs/validation-chain-api.html#customvalidator

Es una validación personalizada.

custom(function)
    - function: (value, { req }) => { ... }
            - Recibe 2 parámetros:
                    - value -> el valor del primer parámetro: campo, del body (al que está encadenado custom) (en este ejemplo: password) ------------------> (1) (ver: validatorManager.js)
                    - req   -> el request que llega del frontend

-------------------------------------------------------------------------------------------------------------------------------------
*/


// =============================================================================================================================
// El controlador register sólo se ejecuta si el middleware bodyLoginValidator lo aprueba.
router.post(
    "/register",
    
    // Hacer las validaciones de los datos recibidos desde el cliente. Comprobar si las validaciones dieron algún error.
    bodyRegisterValidator, // Si dieron error: no pasar el control a register, y devolver error.

    // Si las validaciones no dieron ningún error -> si los datos introducidos son correctos -> se registra el usuario.
    register
);
// =============================================================================================================================



// =============================================================================================================================
router.post(
    "/login", 

    // Hacer las validaciones de los datos recibidos desde el cliente. Comprobar si las validaciones dieron algún error.
    bodyLoginValidator, // Si dieron error: no pasar el control a login, y devolver error.

    // Si las validaciones no dieron ningún error -> si los datos introducidos son correctos -> se hace login al usuario.
    login
);
// =============================================================================================================================



// =============================================================================================================================
/* 
Le llama RUTA PROTEGIDA:
a una ruta (en este caso "/protected", por llamarlo más gráficamente) (pero la ruta se llama de cualquier manera), 
en la que antes de mandar la ejecución a su controlador (en este caso infoUser),
la ejecución se manda antes a un middleware que va a hacer unas comprobaciones,
y sólo se mandará después la ejecución al controlador en cuestión (en este caso infoUser),
si ese middleware lo aprueba, porque esas comprobaciones hayan dado todo correcto.

Ejemplo:
En este caso, sólo se mandará la ejecución al controlador infoUser, 
si el middleware requireToken, que comprueba el token JWT recibido del cliente, 
ha verificado que es un token correcto.
Si no es correcto dicho token, se devuelve error, y no se permite/no se manda la ejecución al controlador infoUser, 
que es el que devolvería al cliente la información del usuario.

El controlador infoUser sólo se ejecuta si el middleware requireToken lo aprueba.
*/

router.get("/protected", requireToken, infoUser);

// =============================================================================================================================



// =============================================================================================================================
// Ruta para que el cliente obtenga un nuevo Token de Autenticación (Access Token), mandando al servidor el Refresh Token.

// El controlador refreshToken sólo se ejecuta si el middleware requireRefreshToken lo aprueba.
router.get("/refresh", requireRefreshToken, refreshToken);

// =============================================================================================================================



// =============================================================================================================================
// Ruta para finalizar la sesión. (En realidad no hay propiamente sesión: es eliminar la cookie que contiene el Refresh Token)
router.get("/logout", logout);

// =============================================================================================================================









// Al ser exportado por default, al importarlo se puede importar con el nombre que se quiera. (ver: index.js)
export default router;



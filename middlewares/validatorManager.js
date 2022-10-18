/* 
Para comprobar si un link/enlace es verdadero, utilizaremos AXIOS.
¿Por qué en lugar de AXIOS no utilizar fetch?
Porque esto es código javascript de SERVIDOR, y en servidor no existe el fetch.
El fetch (al menos de momento) es para CLIENTE.


Instalar AXIOS:
    https://www.npmjs.com/package/axios

    npm install axios

*/




/* 
------------------------------------------------------------------------------------------------------------------
Comprobación (validationResult) de si hay errores o no tras las validaciones.
------------------------------------------------------------------------------------------------------------------

El JSON que manda el frontend (en este caso con Postman), es del tipo:
    {
        "email": "daadsa@gmail.com",
        "password": "123123",
        "repassword": "123123"
    }

por eso los dos campos a comprobar en la función/middleware body son: email y password.
------------------------------------------------------------------------------------------------------------------
*/

import axios from 'axios';

import { validationResult, body, param } from 'express-validator';



// ---------------------------------------------------------------------------------------------------------------
export const ValidationResultExpress = (req, res, next) => {
    const errors = validationResult(req);

    // Si los datos NO han pasado las validaciones hechas -> devolver al cliente (un JSON de) error.
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    // Si los datos SÍ han pasado las validaciones hechas -> pasar el control al siguiente controlador.
    next();
}
// ---------------------------------------------------------------------------------------------------------------



// ---------------------------------------------------------------------------------------------------------------
// Ahora pongo la cadena de manejadores/controladores/middlewares entre [] (como elementos de un array)
// (también se pueden poner separados con ,)
export const bodyRegisterValidator = [

    // -------------------------------------------------------------------------------------
    // Hacer las validaciones de los datos recibidos desde el cliente.
    // -------------------------------------------------------------------------------------

    // Valida el campo email.
    body('email', 'Formato de email incorrecto.').trim().isEmail().normalizeEmail(), 
    
    // Valida el campo password.
    body('password', 'Formato de password incorrecto.') // <------------------------------------------------------------------------------------------------- (1) (ver: auth.route.js)
    .trim()                                             // Quitar posibles espacios.
    .isLength({ min: 6, max: 12 })                      // Permitir sólo longitud mínima-máxima de la password.
    .custom((value, { req }) => {                       // (value = password) Comprobar que las 2 password introducidas son la misma. Si no lo son: error.
        if (value !== req.body.repassword) throw new Error('No coinciden las passwords.');
        return value;
        // O sólamente:
        // value === req.body.repassword;                  
    }), 

    // -------------------------------------------------------------------------------------
    // Comprobar si las validaciones dieron algún error.
    // -------------------------------------------------------------------------------------

    // Si dieron error: no pasar el control al siguiente controlador (auth.route.js: register), y devolver error.
    ValidationResultExpress 

];
// ---------------------------------------------------------------------------------------------------------------



// ---------------------------------------------------------------------------------------------------------------
// Ahora pongo la cadena de manejadores/controladores/middlewares entre [] (como elementos de un array)
// (también se pueden poner separados con ,)
export const bodyLoginValidator = [

    // -------------------------------------------------------------------------------------
    // Hacer las validaciones de los datos recibidos desde el cliente.
    // -------------------------------------------------------------------------------------

    // Valida el campo email.
    body('email', 'Formato de email incorrecto.')
    .trim()
    .isEmail()
    .normalizeEmail(),

    // Valida el campo password.
    body('password', 'Formato de password incorrecto.')
    .trim()
    .isLength({ min: 6, max: 12 }),
   
    // -------------------------------------------------------------------------------------
    // Comprobar si las validaciones dieron algún error.
    // -------------------------------------------------------------------------------------

    // Si dieron error: no pasar el control al siguiente controlador (auth.route.js: login), y devolver error.
    ValidationResultExpress 

];
// ---------------------------------------------------------------------------------------------------------------



// ---------------------------------------------------------------------------------------------------------------
export const bodyLinkValidator = [

    // -------------------------------------------------------------------------------------
    // Hacer las validaciones de los datos recibidos desde el cliente.
    // -------------------------------------------------------------------------------------

    body('longLink', 'Formato de link incorrecto.')
    .trim()
    .notEmpty()
    /* 
    Comprobar con AXIOS que el link es una URL verdadera/que existe. 
    - Si la URL SÍ es válida/existe     --> el try evalúa a true.
    - Si la URL NO es válida/existe     --> salta al catch. 
                                            Y en el catch HAY QUE LANZAR UN ERROR,
                                            porque si no terminaría el catch y evaluaría igualmente a true.  
    */
    // Primera comprobación: que sea una URL válida, que exista.
    .custom(async value => {
        try {
            let response = await axios.get(value);
            (response.status === 200); 
        }
        catch (error) {
            console.log(error);
            throw new Error("El link no es una URL válida.");
        }
    }),
    
    // -------------------------------------------------------------------------------------
    // Comprobar si las validaciones dieron algún error.
    // -------------------------------------------------------------------------------------

    // Si dieron error: no pasar el control al siguiente controlador (link.route.js: createLink), y devolver error.
    ValidationResultExpress 

];
// ---------------------------------------------------------------------------------------------------------------



// ---------------------------------------------------------------------------------------------------------------
// Validar el req.params 
// ---------------------------------------------------------------------------------------------------------------
/* 
- pueden ser datos erróneos
- también aquí podrían meter scripts maliciosos 

https://express-validator.github.io/docs/check-api.html#paramfields-message
*/
export const paramLinkValidator = [

    // -------------------------------------------------------------------------------------
    // Hacer las validaciones de los datos recibidos desde el cliente.
    // -------------------------------------------------------------------------------------

    // El parámetro de la URL para distintas peticiones.
    param('id', 'Parámetro ID no válido')
    .trim()
    .notEmpty()
    /* 
    HTML escaping: for cross site scripting XSS prevention.

    escape() --> replace <, >, &, ', " and / with HTML entities.

    https://github.com/validatorjs/validator.js#sanitizers
    https://express-validator.github.io/docs/sanitization.html

    Por ejemplo si en el parámetro un cliente malicioso metiera un script: <script>...</script>
    esas etiquetas <script> (y puede que algunas partes más) las convierte a HTML entities.

    Ejemplo:
    - carácter:         <
    =
    - HTML entities:    &lt; 
                        o también 
                        &#60;

    https://www.w3schools.com/html/html_entities.asp

    Si por ejemplo el parámetro que se pasase en la URL fuera:      <script>6346e41ff1f04f737cd40b40
    donde 6346e41ff1f04f737cd40b40 es el ID,
    esta validación del escape() no echaría atrás la petición dando error,
    sino que modificaría ese parámetro convirtiéndolo a:            &lt;script&gt;6346e41ff1f04f737cd40b40

    Luego el controlador que fuese, por ejemplo: deleteLink, 
    al recibir la URL con ese parámetro:                            &lt;script&gt;6346e41ff1f04f737cd40b40, 
    simplemente daría error al no encontrar el documento con ese ID.

    Pero lo importante es que se evita con escape() el paso de posibles scripts etcs maliciosos.

    */
    .escape(),

    // -------------------------------------------------------------------------------------
    // Comprobar si las validaciones dieron algún error.
    // -------------------------------------------------------------------------------------

    // Si dieron error: no pasar el control al siguiente controlador (), y devolver error.
    ValidationResultExpress 

];










// ---------------------------------------------------------------------------------------------------------------














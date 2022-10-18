
// ========================================================================================================================
// RUTAS DE LINKS
// ========================================================================================================================

/* 
GET         /api/v1/links               --> obtener todos los links     (get all)
GET         /api/v1/links/:nanoLink     --> obtener el campo longLink   (get one)
POST        /api/v1/links               --> crear un link               (create)
PATCH/PUT   /api/v1/links/:id           --> modificar un link           (update)
DELETE      /api/v1/links/:id           --> borrar un link              (delete)

Ya no se usa, se usó en pruebas anteriores:
GET         /api/v1/links/:id           --> obtener un único link       (get one)


Aunque se puede utilizar PUT para los 2 casos, pero la diferencia es:
    - PATCH   --> para modificar UN campo del schema/esquema
    - PUT     --> para modificar TODOS los campos del schema/esquema

*/


import { Router } from 'express';

import { getLinks, getLink, createLink, updateLink, deleteLink } from '../controllers/link.controller.js';

import { requireToken } from '../middlewares/requireToken.js';

import { bodyLinkValidator, paramLinkValidator } from '../middlewares/validatorManager.js';


const router = Router();





// ================================================================================================================
// RUTAS NO PROTEGIDAS = NO necesitan autenticación por parte del cliente
// ================================================================================================================

// Redireccionamiento.
router.get("/:nanoLink", getLink);









// ================================================================================================================
// RUTAS PROTEGIDAS = NECESITAN AUTENTICACION POR PARTE DEL CLIENTE
// ================================================================================================================
// Autenticación mediante el middleware requireToken.


// ----------------------------------------------------------------------------------------------------------------
// Obtener todos los links de un usuario.
// ----------------------------------------------------------------------------------------------------------------
/* 
Sólo se ejecuta la petición (getLinks), si: 
    - el middleware requireToken lo aprueba (que verifique como válido el token JWT) 
*/
router.get("/", requireToken, getLinks);


// ----------------------------------------------------------------------------------------------------------------
// Obtener un único link de un usuario.
// ----------------------------------------------------------------------------------------------------------------
/* 
Sólo se ejecuta la petición (getLink), si: 
    - el middleware requireToken lo aprueba (que verifique como válido el token JWT)
    y
    - el middleware paramLinkValidator lo aprueba (que verifique como válido el campo ID de param)
*/
// router.get("/:id", requireToken, paramLinkValidator, getLink);


// ----------------------------------------------------------------------------------------------------------------
// Crear link.
// ----------------------------------------------------------------------------------------------------------------
/* 
Sólo se ejecuta la petición (createLink), si: 
    - el middleware requireToken lo aprueba (que verifique como válido el token JWT)
    y
    - el middleware bodyLinkValidator lo aprueba (que verifique como válido el campo longLink de body)
*/
router.post("/", requireToken, bodyLinkValidator, createLink);


// ----------------------------------------------------------------------------------------------------------------
// Actualizar un link. 
// ----------------------------------------------------------------------------------------------------------------
/* 
Sólo se ejecuta la petición (updateLink), si: 
    - el middleware requireToken lo aprueba (que verifique como válido el token JWT)
    y
    - el middleware paramLinkValidator lo aprueba (que verifique como válido el campo ID de param)
    y
    - el middleware bodyLinkValidator lo aprueba (que verifique como válido el campo longLink de body)
*/
router.patch("/:id", requireToken, paramLinkValidator, bodyLinkValidator, updateLink);


// ----------------------------------------------------------------------------------------------------------------
// Borrar un link. 
// ----------------------------------------------------------------------------------------------------------------
/* 
Sólo se ejecuta la petición (deleteLink), si: 
    - el middleware requireToken lo aprueba (que verifique como válido el token JWT)
    y
    - el middleware paramLinkValidator lo aprueba (que verifique como válido el campo ID de param)
*/
router.delete("/:id", requireToken, paramLinkValidator, deleteLink);



// Al ser exportado por default, al importarlo se puede importar con el nombre que se quiera. (ver: index.js)
export default router;



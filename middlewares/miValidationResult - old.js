/* 
Un Middleware nuestro personalizado. 

Para contener la comprobación (validationResult) de si hay errores o no tras las validaciones.
*/

import { validationResult } from 'express-validator';


export const miValidationResult = (req, res, next) => {
    const errors = validationResult(req);

    // Si los datos NO han pasado las validaciones hechas (ver: auth.route.js) -> devolver al cliente (un JSON de) error.
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    // Si los datos SÍ han pasado las validaciones hechas (ver: auth.route.js) -> pasar el control al siguiente controlador.
    next();
}






 













// -----------------------------------------------------------------------------------------------------------------
// Controladores para las rutas: /api/v1/auth
// -----------------------------------------------------------------------------------------------------------------

// Model.prototype.save():
// https://mongoosejs.com/docs/api/model.html#model_Model-save


import { User } from '../models/User.js';

import { generateToken, generateRefreshToken } from '../utils/tokenManager.js';

// MongoDB Error: {code: 11000,name: DuplicateKey,extra: DuplicateKeyErrorInfo}
const DUPLICATE_KEY_ERROR = 11000;


// -----------------------------------------------------------------------------------------------------------------
export const register = async (req, res) => {
    try {
        let { email, password } = req.body;

        // Comprobar si el email (el usuario) ya existe en la base de datos MongoDB.
        let user = await User.findOne({ email }); // User.findOne({ email: email });
        // Si el email ya existe -> el usuario ya se registró con ese email: generar un error.
        if (user) throw { error_code: DUPLICATE_KEY_ERROR }; // Salta al catch.


        // Si el email no existe -> registrar el usuario.
        // Con el modelo, lo instanciamos, y creamos un nuevo documento.
        user = new User({ email, password }); // new User({ email: email, password: password });
        // Guardamos el documento en la base de datos MongoDB.
        await user.save();    

        // Aquí se puede hacer antes el proceso de mandar un email para confirmación.

        // Generar el Token de Autenticación (Access Token) y el Refresh Token.
        let { token, expiresIn } = generateToken(user.id);
        generateRefreshToken(user.id, res);

        // Responder al cliente.
        res.status(201).json({ token, expiresIn });
    }
    catch (error) {
        // Información del error en la consola del servidor.
        console.log(error);

        // Responder al cliente:
        // con el error de email duplicado,
        if (error.error_code === DUPLICATE_KEY_ERROR) res.status(400).json({ 
            error: "Ya existe este email en la base de datos.", 
            error_code: DUPLICATE_KEY_ERROR 
        });
        // o si no con un error genérico.
        res.status(500).json({ error: "Error del servidor." });  
    }
}
// -----------------------------------------------------------------------------------------------------------------



// -----------------------------------------------------------------------------------------------------------------
export const login = async (req, res) => {
    try {
        let { email, password } = req.body;

        // Comprobar si el email (el usuario) ya existe en la base de datos MongoDB.
        let user = await User.findOne({ email }); // User.findOne({ email: email });

        /* 
        Como medida de seguridad, en algunos casos como este, es mejor no devolver al frontend información específica, sino más genérica.
        - más seguro    -> "Las credenciales no son correctas", ...
        - menos seguro  -> "No existe ese email", "La password es incorrecta", ...

        Al no especificar qué dato era el erróneo: para un posible atacante es más difícil determinar si lo erróneo era el email o la password.
        */

        // Si el email NO existe (no existe el usuario) -> generar un error.
        if (!user) res.status(403).json({ error: "No existe ese email (usuario)." }); 
        // Si el email SÍ existe (existe el usuario) ->
        else {
            // Comprobar si la password que ha mandado el cliente (frontend) es la misma que la almacenada en la base de datos MongoDB.
            // Usamos el método personalizado "comparePassword" del schema/esquema userSchema: ver User.js

            // Si NO coinciden las password: generar un error.
            if (! await user.comparePassword(password)) res.status(403).json({ error: "Password incorrecta." });
            // Sí SÍ coinciden las password: 
            else {
                // ------------------------
                // REFRESH TOKEN
                // ------------------------
                // Generar el Refresh Token, y responder al cliente (navegador) mandándoselo dentro de una cookie.
                generateRefreshToken(user.id, res);

                // ------------------------
                // TOKEN DE AUTENTICACIÓN
                // ------------------------
                // Generar el token JWT.
                let { token, expiresIn } = generateToken(user.id);            
                // Responder al cliente (navegador), mandándole el token JWT.
                res.status(200).json({ token, expiresIn });
            }
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error del servidor." });
    }
}
// -----------------------------------------------------------------------------------------------------------------



// -----------------------------------------------------------------------------------------------------------------
export const infoUser =  async (req, res) => {
    try {
        /* 
        Se puede hacer:
            let user = await User.findById(req.uid);
        
        y de esta manera Mongoose devuelve el objeto user enriquecido = con todos sus métodos, etc.
        
        Pero llamando además a la función lean(), Mongoose devuelve el objeto ya simple:  
        "Documents returned from queries with the lean option enabled are plain javascript objects, not Mongoose Documents. 
        They have no save method, getters/setters, virtuals, or other Mongoose features."  
        
        lean() hace también que la consulta sea más rápida (sobre todo en millones de consultas/usuarios)
        */
        // Buscar el usuario en la base de datos MongoDB Atlas.
        let user = await User.findById(req.uid).lean();

        // Borrar la password de la variable que contiene el usuario buscado, antes de devolver la información del usuario al cliente.
        delete user.password;        

        // Responder al cliente, devolviéndole la información del usuario.
        res.status(200).json(user);
    }
    catch (error) {
        res.status(500).json({ error });
    }
}
// -----------------------------------------------------------------------------------------------------------------



// -----------------------------------------------------------------------------------------------------------------
export const refreshToken = (req, res) => {
    try {  
        // Generar un nuevo Token de Autenticación (Access Token), con el ID del cliente en los DATOS (PAYLOAD) del JWT.
        let { token, expiresIn } = generateToken(req.uid); // (uid añadido en middleware requireRefreshToken)

        // Mandar al cliente (navegador) el token y su expiración.
        res.json({ token, expiresIn });
    }
    catch (error) {
        console.log(error);
    }
}
// -----------------------------------------------------------------------------------------------------------------



// -----------------------------------------------------------------------------------------------------------------
export const logout = (req, res) => {
    /* 
    clearCookie: 
    
    (abajo de todo en la página)
    https://ull-esit-pl-1617.github.io/estudiar-cookies-y-sessions-en-expressjs-victor-pamela-jesus/cookies/chapter5.html

    https://www.neoguias.com/express-cookies/

    https://www.tutorialspoint.com/expressjs/expressjs_cookies.htm 
    */
    res.clearCookie('refreshToken');

    res.json({ ok: true });
}
// -----------------------------------------------------------------------------------------------------------------






/* 
=========================================
bcrypt.js:
=========================================
https://www.npmjs.com/package/bcryptjs

Esta librería para generar hashes de passwords, vale para este ejercicio.
Pero posiblemente sea un hash algo débil, y en un proyecto del mundo real habría que utilizar otra librería de hash más fuerte.


-----------------------------------------
Salt: salar, salpicar, echar sal.
-----------------------------------------
https://es.wikipedia.org/wiki/Sal_(criptograf%C3%ADa)

En criptografía, la sal (en inglés, salt) son 
bits aleatorios que se usan como una de las entradas en una función derivadora de claves (función hash). 
La otra entrada es habitualmente una contraseña.

contraseña -----> \
                    -----> función hash ---> HASH
salt -----------> /


Los datos con sal complican los ataques de diccionario que cifran cada una de las entradas del mismo: 
cada bit de sal duplica la cantidad de almacenamiento y computación requeridas.

El beneficio aportado por usar una contraseña con sal es 
que un ataque simple de diccionario contra los valores cifrados es impracticable si la sal es lo suficientemente larga.

*/


import { Schema, model } from 'mongoose';

import bcrypt from 'bcryptjs';


// Esquema
const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        trim: true,                 // Elimina los espacios en blanco en ambos extremos del string.
        unique: true,               // Si un usuario intenta registrarse con un email que ya existe: da error.
        lowercase: true,
        index: { unique: true }     // Indexación para hacer las búsquedas más rápidas. // Con índice único.
    },
    // Se hará hash de cada password.
    // Aunque distintos usuarios hayan puesto por casualidad la misma password, sus hash serán distintos.
    password: {
        type: String,
        required: true
    }
});



// ----------------------------------------------------------------------------------------------------
// Middleware ⁡⁣⁣⁢pre - ⁡⁢⁡⁢⁣⁣Hash de password⁡
// ----------------------------------------------------------------------------------------------------
// Antes de ejecutar la operación de guardar el documento, hacer el hash de la password.
// this -> hace referencia al esquema.

// Se puede hacer con callback functions, como pone la documentación: 
// https://www.npmjs.com/package/bcryptjs#usage---async
// pero también usando async-await.
// ----------------------------------------------------------------------------------------------------
userSchema.pre("save", async function(next) {

    // Si la password no ha sido modificada, entonces no hacer su hash. 
    // (Porque el "save" también se ejecutará cuando haya una actualización de otros campos, aunque en este caso sólo podría ser del email: improbable)
    if (!this.isModified('password')) next();
    
    try {
        // Generar el salt para esta password.
        let salt = await bcrypt.genSalt(10);
        // Crear el hash de la password con su salt anterior, y sobreescribir con él la propia password.
        this.password = await bcrypt.hash(this.password, salt);
        // Pasamos la ejecución al siguiente middleware/manejador. (normalmente es "save" en este caso)
        next();
    }
    catch (error) {
        console.log(error);
        throw new Error("Error al generar el hash de la password.");
    }    
});
// ----------------------------------------------------------------------------------------------------



// ----------------------------------------------------------------------------------------------------
// ⁡⁣⁢⁣Método personalizado⁡ "comparePassword", para el esquema userSchema.
// ----------------------------------------------------------------------------------------------------
// Este método pasa a estar disponible para cualquier documento que se cree, del tipo de este schema/esquema userSchema.
// Compara la password que mandó el cliente desde el frontend (frontendPassword), con la password (el hash) almacenada en la base de datos.
userSchema.methods.comparePassword = async function(frontendPassword) {
    return await bcrypt.compare(frontendPassword, this.password);
}





// Modelo.
export const User = model("User", userSchema);



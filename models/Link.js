import { Schema, model } from 'mongoose';

/* 
El esquema/schema linkSchema tiene que hacer una referencia al usuario.
Porque cada vez que se cree una nueva url/link tenemos que decirle quién fue el usuario que lo creó.
Para por ejemplo, cuando se liste ese usuario, se puedan ver sus links.


*/


// Esquema
const linkSchema = new Schema({
    // Link original.
    longLink: {
        type: String,
        required: true,
        trim: true                                      // Elimina los espacios en blanco en ambos extremos del string.
    },
    // Lo que nosotros vamos a generar como url corta.
    nanoLink: {
        type: String,
        required: true, 
        unique: true,
        trim: true
    },
    // Referencia al usuario que creó el link.
    uid: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User"
    }
});



// Modelo
export const Link = model("Link", linkSchema);




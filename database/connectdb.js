import mongoose from 'mongoose';

// dotenv está importado en el raíz: index.js (que es el fichero raíz del proyecto y que se ejecutará/cargará en primer lugar: ver package.json)


// Como estamos trabajando con Node.js, podemos usar el await sin necesidad de encerrarlo en una función async.
try {
    await mongoose.connect(process.env.URI_MONGO);
    console.log("Conexión OK a la base de datos MongoDB Atlas. ❤️");
}
catch (error) {
    console.log("Error en la conexión a la base de datos MongoDB Atlas. ⛔: " + error);
}











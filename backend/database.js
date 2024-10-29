// database.js
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost', 
  user: 'root',
  password: 'Juli43449100',
  database: 'bdsoderia',
});

// Intenta conectarte a la base de datos
connection.connect((err) => {
  if (err) {

    console.error('-----Error al conectar a la base de datos:----------------------------------------------------------');
    console.error('', err);
    console.error('----------------------------------------------------------------------------------------------------');
   // console.error('Error al conectar a la base de datos:', err);
    // Puedes tomar medidas adicionales aquí, como registrar el error o intentar reconectar.
  } else {
    console.log('Conexión exitosa a la base de datos MySQL');
    // Ahora puedes ejecutar consultas SQL o realizar operaciones en la base de datos
  }
});


module.exports = connection.promise();

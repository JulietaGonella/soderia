const express = require('express');
const app = express();
const db = require('./database');
const cors = require('cors');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);

// Habilitar CORS para todas las rutas
app.use(cors({
  origin: 'http://127.0.0.1:5500', // Cambia esto por el origen de tu frontend
  credentials: true // Permite el uso de credenciales (cookies, cabeceras de autenticación)
}));

// Middleware para parsear JSON y URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Inicializa el almacenamiento de sesiones
const sessionStore = new MySQLStore({}, db); // Asegúrate de que `db` esté correctamente importado

app.use(session({
  secret: process.env.SESSION_SECRET || 'tu_secreto',
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    secure: false, // Cambia a true si usas HTTPS
    maxAge: 1000 * 60 * 60 * 24, // La sesión durará un día
    sameSite: 'lax'  // Asegúrate de que las cookies se envían entre dominios
  }
}, (err) => {
  if (err) console.error('Error al configurar sesiones:', err);
}));

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('Datos recibidos para login:', req.body); // Log para depuración

  try {
    const [users] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    console.log('Usuario encontrado:', users);

    if (users.length === 0) {
      return res.json({ success: false, message: 'Usuario no encontrado' });
    }

    const user = users[0];

    // Asegúrate de que la contraseña esté correctamente comparada
    const validPassword = password === user.contraseña; // Reemplaza esto si usas hash

    if (!validPassword) {
      return res.json({ success: false, message: 'Contraseña incorrecta' });
    }

    // Verificar si ya existe una sesión activa para el usuario
    const [activeSession] = await db.query('SELECT * FROM sesiones WHERE IDusuario = ? AND fecha_hora_fin IS NULL', [user.ID]);

    if (activeSession.length > 0) {
      // Si hay una sesión activa, solo actualiza la fecha de fin de la sesión anterior
      await db.query('UPDATE sesiones SET fecha_hora_fin = NOW(), IDestado_sesion = ? WHERE IDusuario = ? AND fecha_hora_fin IS NULL',
        [2, user.ID]);
      console.log('Sesión anterior actualizada para el usuario:', user.ID);
    }

    // Ahora, inicia una nueva sesión
    req.session.userID = user.ID; // Almacena el ID del usuario en la sesión
    console.log('Sesión guardada:', req.session.userID); // Verifica que el ID se esté guardando

    // Almacena la nueva sesión en la tabla sesiones
    await db.query('INSERT INTO sesiones (IDusuario, fecha_hora_inicio, IDestado_sesion) VALUES (?, NOW(), ?)',
      [user.ID, 1]); // Almacena en la tabla sesiones

    res.json({ success: true });
  } catch (err) {
    console.error('Error en el inicio de sesión:', err);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

app.post('/logout', async (req, res) => {
  // ID del usuario que quieres que siempre cierre sesión
  const userIdToLogout = 1;

  try {
    // Actualiza la fecha de fin de la sesión actual para el usuario específico
    await db.query('UPDATE sesiones SET fecha_hora_fin = NOW() WHERE IDusuario = ? AND fecha_hora_fin IS NULL',
      [userIdToLogout]);

    req.session.destroy(err => {
      if (err) {
        console.error('Error al destruir la sesión:', err);
        return res.status(500).json({ message: 'Error al cerrar sesión' });
      }
      console.log('Sesión destruida correctamente');  // <-- Agrega este log
      res.json({ success: true });
    });
  } catch (err) {
    console.error('Error al cerrar sesión:', err);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

//GET
app.get('/provincias', async (req, res) => {
  try {
    // Verificamos si se solicita solo provincias eliminadas
    const eliminado = req.query.eliminado === 'true';
    const [results] = await db.query('SELECT * FROM provincias WHERE eliminado = ?', [eliminado ? 1 : 0]);
    res.json(results);
  } catch (err) {
    console.error('Error al obtener provincias:', err);
    res.status(500).send('Error en el servidor');
  }
});

app.get('/localidades', async (req, res) => {
  try {
    // Verificamos si se solicita solo localidades eliminadas
    const eliminado = req.query.eliminado === 'true';
    const [results] = await db.query(`
          SELECT l.ID, l.nombre AS localidad, p.nombre AS provincia
          FROM localidades l
          JOIN provincias p ON l.IDprovincia = p.ID
          WHERE l.eliminado = ?
      `, [eliminado ? 1 : 0]); // Filtramos por el estado de eliminado
    res.json(results);
  } catch (err) {
    console.error('Error al obtener localidades:', err);
    res.status(500).send('Error en el servidor');
  }
});

app.get('/barrios', async (req, res) => {
  try {
    const eliminado = req.query.eliminado === 'true';
    const idLocalidad = req.query.IDlocalidad; // Obtener el ID de localidad de los parámetros de consulta

    // Construir la consulta base
    let query = `
            SELECT b.ID, b.nombre AS barrio, l.nombre AS localidad
            FROM barrios b
            JOIN localidades l ON b.IDlocalidad = l.ID
            WHERE b.eliminado = ?
        `;
    const params = [eliminado ? 1 : 0];

    // Si se proporciona el IDlocalidad, agregar el filtro correspondiente
    if (idLocalidad) {
      query += ' AND b.IDlocalidad = ?';
      params.push(idLocalidad);
    }

    const [results] = await db.query(query, params); // Ejecutar la consulta con los parámetros
    res.json(results);
  } catch (err) {
    console.error('Error al obtener barrios:', err);
    res.status(500).send('Error en el servidor');
  }
});

//GET para categorías
app.get('/categorias', async (req, res) => {
  try {
    const eliminado = req.query.eliminado === 'true' ? 1 : 0;
    const [results] = await db.query('SELECT * FROM categorias WHERE eliminado = ?', [eliminado]);
    res.json(results);
  } catch (err) {
    console.error('Error al obtener categorías:', err);
    res.status(500).send('Error en el servidor');
  }
});

app.get('/productos', async (req, res) => {
  try {
    // Verificamos si se solicita solo productos eliminados
    const eliminado = req.query.eliminado === 'true';
    const [results] = await db.query(`
          SELECT p.ID, p.nombre AS producto, c.nombre AS categoria, p.precio, p.stock
          FROM productos p
          JOIN categorias c ON p.IDcategoria = c.ID
          WHERE p.eliminado = ?
      `, [eliminado ? 1 : 0]); // Filtramos por el estado de eliminado
    res.json(results);
  } catch (err) {
    console.error('Error al obtener productos:', err);
    res.status(500).send('Error en el servidor');
  }
});

// Ruta para obtener usuarios
app.get('/usuarios', async (req, res) => {
  try {
    // Verificamos si se solicita solo usuarios eliminados
    const eliminado = req.query.eliminado === 'true';
    const [results] = await db.query(`
      SELECT u.*, r.nombre AS rol
      FROM usuarios u
      JOIN roles r ON u.IDrol = r.ID
      WHERE u.eliminado = ?
    `, [eliminado ? 1 : 0]); // Filtramos por el estado de eliminado
    res.json(results);
  } catch (err) {
    console.error('Error al obtener usuarios:', err);
    res.status(500).send('Error en el servidor');
  }
});


app.get('/roles', async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM roles');
    res.json(results);
  } catch (err) {
    console.error('Error al obtener roles:', err);
    res.status(500).send('Error en el servidor');
  }
});

app.get('/cliente', async (req, res) => {
  try {
    // Verificamos si se solicita solo clientes eliminados
    const eliminado = req.query.eliminado === 'true';  // Comprueba el parámetro de consulta
    const [results] = await db.query(
      `SELECT c.ID, c.nombre, c.telefono, l.nombre AS localidad, b.nombre AS barrio, c.direccion
           FROM cliente c
           JOIN barrios b ON c.IDbarrio = b.ID
           JOIN localidades l ON b.IDlocalidad = l.ID
           WHERE c.eliminado = ?`, [eliminado ? 1 : 0]); // Filtramos por el estado de eliminado
    res.json(results);
  } catch (err) {
    console.error('Error al obtener clientes:', err);
    res.status(500).send('Error en el servidor');
  }
});

// GET días
app.get('/dias', async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM dias');
    res.json(results);
  } catch (err) {
    console.error('Error al obtener días:', err);
    res.status(500).send('Error en el servidor');
  }
});

app.get('/pedidos', async (req, res) => {
  try {
    const dardebaja = req.query.dardebaja === 'true'; // Comprueba el parámetro de consulta para dardebaja
    const cancelado = req.query.cancelado === 'true'; // Comprueba el parámetro de consulta para cancelados
    const completado = req.query.completado === 'true'; // Comprueba el parámetro de consulta para completado

    const [results] = await db.query(`
      SELECT 
          p.ID AS IDPedido, 
          p.IDcliente AS IDcliente,  -- Incluimos el ID del cliente
          c.nombre AS Cliente, 
          c.direccion AS Direccion, 
          tp.descripcion AS TipoPedido, 
          p.fecha_creacion AS FechaCreacion,
          dp.fecha_entrega AS FechaEntrega,  -- Incluimos la fecha de entrega
          dp.IDdias AS IDdias, 
          d.nombre AS DiaNombre,
          pb.fecha_inicio AS FechaBaja, -- Fecha de baja desde periodos_baja
          pb.fecha_fin AS FechaAlta, -- Fecha de alta desde periodos_baja
          dp.fechacancelado AS fechaCancelado,
          dp.completado AS Completado, -- Incluimos el campo completado
          dp.IDestado AS IDestado, 
          e.descripcion AS EstadoDescripcion, -- Incluimos la descripción del estado
          GROUP_CONCAT(tp.descripcion) AS TiposPedidos
      FROM pedidos p
      JOIN cliente c ON p.IDcliente = c.ID
      JOIN detallepedido dp ON p.ID = dp.IDpedido
      JOIN dias d ON dp.IDdias = d.ID
      JOIN tipos_pedido tp ON p.IDtipo_pedido = tp.ID
      LEFT JOIN periodos_baja pb ON dp.ID = pb.IDdetallepedido
      LEFT JOIN estados e ON dp.IDestado = e.ID -- Hacemos el JOIN con la tabla estado
      WHERE dp.dardebaja = ? AND dp.cancelado = ? AND dp.completado = ?
      GROUP BY 
          p.ID, 
          p.IDcliente,  -- Asegúrate de agrupar por IDcliente
          c.nombre, 
          c.direccion, 
          p.fecha_creacion, 
          dp.fecha_entrega, -- Asegúrate de agrupar por fecha_entrega
          dp.IDdias, 
          d.nombre, 
          pb.fecha_inicio, 
          pb.fecha_fin,
          dp.fechacancelado,
          dp.completado,
          dp.IDestado -- Aseguramos que también se agrupe por IDestado
    `, [dardebaja ? 1 : 0, cancelado ? 1 : 0, completado ? 1 : 0]);

    // Asegúrate de que los resultados no están vacíos
    if (results.length === 0) {
      return res.status(404).send('No se encontraron pedidos que coincidan con los criterios especificados.');
    }

    res.json(results);
  } catch (err) {
    console.error('Error al obtener pedidos:', err);
    res.status(500).send('Error en el servidor');
  }
});

app.get('/tipos_pedido', async (req, res) => {
  try {
    const [results] = await db.query('SELECT ID, descripcion FROM tipos_pedido');
    res.json(results);
  } catch (err) {
    console.error('Error al obtener tipos de pedido:', err);
    res.status(500).send('Error en el servidor');
  }
});

// Endpoint para obtener todos los periodos de baja
app.get('/periodos_baja', async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM periodos_baja');
    res.json(results);
  } catch (err) {
    console.error('Error al obtener los periodos de baja:', err);
    res.status(500).send('Error en el servidor');
  }
});


//POST
app.post('/provincias', async (req, res) => {
  const { nombre } = req.body;

  if (!nombre) {
    return res.status(400).send('El nombre de la provincia es obligatorio');
  }

  try {
    const result = await db.query('INSERT INTO provincias (nombre) VALUES (?)', [nombre]);
    res.status(201).json({ id: result.insertId, nombre });
  } catch (err) {
    console.error('Error al agregar provincia:', err);
    res.status(500).send('Error en el servidor');
  }
});

app.post('/localidades', async (req, res) => {
  const { nombre, idProvincia } = req.body;

  if (!nombre || !idProvincia) {
    return res.status(400).send('Nombre y provincia son requeridos');
  }

  try {
    const result = await db.query('INSERT INTO localidades (nombre, IDprovincia) VALUES (?, ?)', [nombre, idProvincia]);
    res.status(201).json({ id: result.insertId, nombre, idProvincia });
  } catch (err) {
    console.error('Error al agregar localidad:', err);
    res.status(500).send('Error en el servidor');
  }
});


app.post('/barrios', async (req, res) => {
  const { nombre, idLocalidad } = req.body;
  try {
    const query = 'INSERT INTO barrios (nombre, IDlocalidad) VALUES (?, ?)';
    await db.query(query, [nombre, idLocalidad]);
    // Cambia esta línea
    res.status(201).json({ message: 'Barrio agregado' });
  } catch (err) {
    console.error('Error al agregar barrio:', err);
    res.status(500).send('Error en el servidor');
  }
});

// Ruta para agregar una nueva categoría
app.post('/categorias', async (req, res) => {
  const { nombre } = req.body;

  if (!nombre) {
    return res.status(400).send('El nombre de la categoría es obligatorio');
  }

  try {
    const result = await db.query('INSERT INTO categorias (nombre) VALUES (?)', [nombre]);
    res.status(201).json({ id: result.insertId, nombre });
  } catch (err) {
    console.error('Error al agregar categoría:', err);
    res.status(500).send('Error en el servidor');
  }
});

app.post('/productos', async (req, res) => {
  const { nombre, idCategoria, precio, stock } = req.body;

  // Verificación de campos obligatorios
  if (!nombre || !idCategoria || !precio || !stock) {
    return res.status(400).send('Nombre, categoría, precio y stock son requeridos');
  }

  try {
    // Insertar el nuevo producto en la base de datos
    const result = await db.query('INSERT INTO productos (nombre, IDcategoria, precio, stock) VALUES (?, ?, ?, ?)', [nombre, idCategoria, precio, stock]);

    // Responder con el ID del nuevo producto creado
    res.status(201).json({ id: result.insertId, nombre, idCategoria, precio, stock });
  } catch (err) {
    console.error('Error al agregar el producto:', err);
    res.status(500).send('Error en el servidor');
  }
});

app.post('/cliente', async (req, res) => {
  const { nombre, telefono, IDbarrio, direccion } = req.body;

  // Verifica que se hayan proporcionado todos los campos obligatorios
  if (!nombre || !telefono || !IDbarrio || !direccion) {
    return res.status(400).send('Todos los campos son requeridos');
  }

  try {
    // Obtener el IDlocalidad desde la tabla barrios usando el IDbarrio
    const barrioResult = await db.query('SELECT IDlocalidad FROM barrios WHERE ID = ?', [IDbarrio]);

    // Verifica si se encontró el barrio
    if (barrioResult.length === 0) {
      return res.status(404).send('Barrio no encontrado');
    }

    // Inserta el nuevo cliente en la tabla clientes usando IDbarrio y la dirección
    const result = await db.query('INSERT INTO cliente (nombre, telefono, IDbarrio, direccion) VALUES (?, ?, ?, ?)', [nombre, telefono, IDbarrio, direccion]);

    // Responde con el ID del nuevo cliente creado
    res.status(201).json({ id: result.insertId, nombre, telefono, IDbarrio, direccion });
  } catch (err) {
    console.error('Error al agregar el cliente:', err);
    res.status(500).send('Error en el servidor');
  }
});

app.post('/usuarios', async (req, res) => {
  const { nombre, email, contraseña, rol } = req.body;

  // Verifica si todos los campos son proporcionados
  if (!nombre || !email || !contraseña || !rol) {
    return res.status(400).send('Todos los campos son obligatorios');
  }

  try {
    // Insertar el nuevo usuario
    const result = await db.query(
      'INSERT INTO usuarios (nombre, email, contraseña, IDrol) VALUES (?, ?, ?, ?)',
      [nombre, email, contraseña, rol]
    );

    res.status(201).json({ id: result.insertId, nombre, email, rol });
  } catch (err) {
    console.error('Error al registrar usuario:', err);
    res.status(500).send('Error en el servidor');
  }
});


app.post('/pedidos', async (req, res) => {
  const { clienteID, tipoPedidoID, fechaCreacion, detalles } = req.body;
  const estadoID = 1;  // Estado fijo para el nuevo pedido
  const recorridoID = 1; // Recorrido fijo por ahora

  try {
    // Crear un nuevo pedido
    const queryPedido = `
          INSERT INTO pedidos (IDcliente, IDtipo_pedido, IDestado, IDrecorrido, fecha_creacion) 
          VALUES (?, ?, ?, ?, ?)`;
    const [result] = await db.query(queryPedido, [clienteID, tipoPedidoID, estadoID, recorridoID, fechaCreacion]);

    // Obtener el ID del nuevo pedido usando LAST_INSERT_ID()
    const [lastInsertResult] = await db.query('SELECT LAST_INSERT_ID() as nuevoPedidoID');
    const nuevoPedidoID = lastInsertResult[0].nuevoPedidoID; // Obtener el ID del nuevo pedido

    // Verificar si hay detalles
    if (detalles.length === 0) {
      return res.status(400).send('No hay detalles para insertar.');
    }

    // Crear detalles del pedido
    const queryDetalle = `
          INSERT INTO detallepedido (IDpedido, IDdias, IDproducto, cantidad, preciototal, IDestado) 
          VALUES (?, ?, ?, ?, ?, ?)`;

    for (const detalle of detalles) {
      try {
        const [producto] = await db.query('SELECT precio FROM productos WHERE ID = ?', [detalle.productoID]);

        if (producto.length > 0) {
          const preciototal = producto[0].precio * detalle.cantidad; // Calcular el precio total
          // Insertar el detalle en la tabla detallepedido
          await db.query(queryDetalle, [
            nuevoPedidoID,  // Usar el nuevoPedidoID aquí
            detalle.diaID,
            detalle.productoID,
            detalle.cantidad,
            preciototal,   // Precio total calculado
            estadoID       // Estado fijo para cada detalle
          ]);
        }
      } catch (detalleError) {
        console.error('Error al insertar detalle del pedido:', detalleError);  // Puedes eliminar este console.error si no quieres que aparezca.
      }
    }

    res.status(201).send({ id: nuevoPedidoID });
  } catch (error) {
    console.error("Error al crear el pedido:", error);  // Puedes eliminar este console.error si no quieres que aparezca.
    res.status(500).send("Error al crear el pedido");
  }
});


app.post('/periodos_baja', async (req, res) => {
  const { idpedido, iddia, bajaIndefinida, fechaInicio, fechaFin, detalles } = req.body; // Asegúrate de incluir detalles

  // Formatear las fechas a YYYY-MM-DD
  const fechaInicioFormateada = new Date(fechaInicio).toISOString().split('T')[0]; // Formato YYYY-MM-DD
  const fechaFinFormateada = bajaIndefinida ? null : (fechaFin ? new Date(fechaFin).toISOString().split('T')[0] : null); // Fecha fin es null si bajaIndefinida

  try {
    // Asegúrate de que detalles esté definido y sea un array
    if (!Array.isArray(detalles) || detalles.length === 0) {
      return res.status(400).send('No se proporcionaron detalles válidos.');
    }

    const valores = detalles.map(det =>
      [det.ID, idpedido, iddia, bajaIndefinida ? 1 : 0, fechaInicioFormateada, fechaFinFormateada]
    );

    // Registrar la baja en la tabla periodos_baja
    const query = `
      INSERT INTO periodos_baja (IDdetallepedido, IDpedido, IDdias, baja_indefinida, fecha_inicio, fecha_fin) 
      VALUES ?`; // Usar `VALUES ?` para múltiples valores.

    await db.query(query, [valores]);

    // Si se da de baja indefinidamente o si la fecha de inicio es hoy, actualizar dardebaja
    const hoy = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD

    if (bajaIndefinida || fechaInicioFormateada === hoy) {
      await db.query(`
        UPDATE detallepedido 
        SET dardebaja = 1 
        WHERE IDpedido = ? AND IDdias = ?`,
        [idpedido, iddia]
      );
    }

    res.status(200).send('Baja registrada correctamente.');
  } catch (err) {
    console.error('Error al registrar baja:', err);
    res.status(500).send('Error en el servidor.');
  }
});

app.post('/restaurar-pedido/:id/:diaId', async (req, res) => {
  const idPedido = req.params.id;
  const diaId = req.params.diaId;

  try {
    // Verificar si el pedido existe y obtener su estado
    const [result] = await db.query(`SELECT * FROM detallepedido WHERE IDpedido = ? AND IDdias = ?`, [idPedido, diaId]);
    const pedido = result[0];

    if (!pedido) {
      return res.status(404).send('Pedido no encontrado');
    }

    if (pedido.cancelado) {
      // Si el pedido está cancelado, restaurarlo
      await db.query(`UPDATE detallepedido SET cancelado = 0, fechacancelado = NULL WHERE IDpedido = ? AND IDdias = ?`, [idPedido, diaId]);
      return res.status(200).send('Pedido restaurado correctamente');
    } else {
      // Si no está cancelado, restaurar dardebaja y eliminar registros de periodos_baja
      await db.query(`UPDATE detallepedido SET dardebaja = 0 WHERE IDpedido = ? AND IDdias = ?`, [idPedido, diaId]);
      await db.query(`DELETE FROM periodos_baja WHERE IDpedido = ? AND IDdias = ?`, [idPedido, diaId]);
      return res.status(200).send('Pedido restaurado correctamente');
    }
  } catch (err) {
    console.error('Error al restaurar el pedido:', err);
    res.status(500).send('Error en el servidor');
  }
});

app.post('/entregarpedido', async (req, res) => {
  const { pedidoID, diaId, fechaEntrega } = req.body;

  // Formatear la fecha de entrega a formato YYYY-MM-DD
  const fechaEntregaFormateada = new Date(fechaEntrega).toISOString().split('T')[0];

  try {
    // Iniciar la transacción
    await db.beginTransaction();

    // Actualizar la tabla detallepedido
    const queryDetalle = `
      UPDATE detallepedido
      SET completado = 1, fecha_entrega = ?, IDestado = 2
      WHERE IDpedido = ? AND IDdias = ?`;

    await db.query(queryDetalle, [fechaEntregaFormateada, pedidoID, diaId]);

    // Verificar si todos los detalles del pedido están completados
    const queryVerificar = `
      SELECT COUNT(*) AS pendientes 
      FROM detallepedido 
      WHERE IDpedido = ? AND completado = 0`;

    const [result] = await db.query(queryVerificar, [pedidoID]);

    if (result[0].pendientes === 0) {
      // Si no hay detalles pendientes, actualizar el estado del pedido a 2
      const queryActualizarPedido = `
        UPDATE pedidos
        SET fecha_ultimo_envio = ?, IDestado = 2
        WHERE ID = ?`;

      await db.query(queryActualizarPedido, [fechaEntregaFormateada, pedidoID]);
    } else {
      // Actualizar solo la fecha del último envío si aún hay detalles pendientes
      const queryActualizarFecha = `
        UPDATE pedidos
        SET fecha_ultimo_envio = ?
        WHERE ID = ?`;

      await db.query(queryActualizarFecha, [fechaEntregaFormateada, pedidoID]);
    }

    // Hacer commit de la transacción
    await db.commit();

    res.status(200).send('Pedido actualizado correctamente.');
  } catch (err) {
    console.error('Error al actualizar el pedido:', err);

    // En caso de error, hacer rollback
    await db.rollback();
    res.status(500).send('Error en el servidor.');
  }
});

app.post('/restaurarpedido', async (req, res) => {
  const { pedidoID } = req.body;

  try {
    // Iniciar la transacción
    await db.beginTransaction();

    // Actualizar la tabla detallepedido
    const queryDetalle = `
      UPDATE detallepedido
      SET completado = 0, fecha_entrega = NULL, IDestado = 1
      WHERE IDpedido = ?`;

    await db.query(queryDetalle, [pedidoID]);

    // Actualizar la tabla pedidos
    const queryPedido = `
      UPDATE pedidos
      SET IDestado = 1
      WHERE ID = ?`;

    await db.query(queryPedido, [pedidoID]);

    // Hacer commit de la transacción
    await db.commit();

    res.status(200).send('Pedido restaurado correctamente.');
  } catch (err) {
    console.error('Error al restaurar el pedido:', err);

    // En caso de error, hacer rollback
    await db.rollback();
    res.status(500).send('Error en el servidor.');
  }
});

//PUT
app.get('/provincias/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [results] = await db.query('SELECT * FROM provincias WHERE ID = ?', [id]);
    if (results.length > 0) {
      res.json(results[0]);
    } else {
      res.status(404).send('Provincia no encontrada');
    }
  } catch (err) {
    console.error('Error al obtener la provincia:', err);
    res.status(500).send('Error en el servidor');
  }
});

// Actualizar una provincia
app.put('/provincias/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, eliminado } = req.body; // Obtenemos ambos campos del body

  // Verificamos si al menos uno de los dos campos está presente
  if (!nombre && eliminado === undefined) {
    return res.status(400).send('Debe proporcionar al menos el nombre o el estado eliminado');
  }

  // Preparar las consultas dinámicas dependiendo de los valores proporcionados
  let fieldsToUpdate = [];
  let valuesToUpdate = [];

  if (nombre) {
    fieldsToUpdate.push('nombre = ?');
    valuesToUpdate.push(nombre);
  }

  if (eliminado !== undefined) {
    fieldsToUpdate.push('eliminado = ?');
    valuesToUpdate.push(eliminado);
  }

  valuesToUpdate.push(id); // El ID siempre será parte de la actualización

  const query = `UPDATE provincias SET ${fieldsToUpdate.join(', ')} WHERE ID = ?`;

  try {
    // Ejecutamos la consulta con los campos dinámicos
    await db.query(query, valuesToUpdate);
    res.send('Provincia actualizada');
  } catch (err) {
    console.error('Error al actualizar la provincia:', err);
    res.status(500).send('Error en el servidor');
  }
});

app.get('/localidades/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [results] = await db.query('SELECT * FROM localidades WHERE ID = ?', [id]);
    if (results.length > 0) {
      res.json(results[0]);
    } else {
      res.status(404).send('Localidad no encontrada');
    }
  } catch (err) {
    console.error('Error al obtener la localidad:', err);
    res.status(500).send('Error en el servidor');
  }
});

// Actualizar una localidad
app.put('/localidades/:id', async (req, res) => {
  const { id } = req.params; // El ID de la localidad
  const { nombre, idProvincia, eliminado } = req.body; // Los campos a actualizar, incluyendo 'eliminado'

  // Inicializamos una lista para los campos a actualizar dinámicamente
  const updates = [];
  const params = [];

  // Verificamos si se proporcionó un nuevo nombre
  if (nombre) {
    updates.push('nombre = ?'); // Añadimos la actualización de nombre
    params.push(nombre); // Añadimos el valor a los parámetros
  }

  // Verificamos si se proporcionó una nueva provincia
  if (idProvincia) {
    updates.push('IDprovincia = ?'); // Añadimos la actualización de provincia
    params.push(idProvincia); // Añadimos el valor a los parámetros
  }

  // Verificamos si se proporcionó el campo 'eliminado'
  if (eliminado !== undefined) {
    updates.push('eliminado = ?'); // Añadimos la actualización de eliminado
    params.push(eliminado); // Añadimos el valor a los parámetros
  }

  // Si no hay nada que actualizar, devolvemos un error
  if (updates.length === 0) {
    return res.status(400).send('No hay campos para actualizar');
  }

  // Añadir el ID al final de los parámetros (para la cláusula WHERE)
  params.push(id);

  try {
    // Realizamos la actualización solo en los campos que cambiaron
    const query = `UPDATE localidades SET ${updates.join(', ')} WHERE ID = ?`; // Generamos la consulta
    await db.query(query, params); // Ejecutamos la consulta con los parámetros

    // Respuesta exitosa si todo salió bien
    res.send('Localidad actualizada');
  } catch (err) {
    console.error('Error al actualizar la localidad:', err);
    // Respuesta en caso de error en el servidor
    res.status(500).send('Error en el servidor');
  }
});

app.get('/barrios/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [results] = await db.query('SELECT * FROM barrios WHERE ID = ?', [id]);
    if (results.length > 0) {
      res.json(results[0]);
    } else {
      res.status(404).send('Barrio no encontrado');
    }
  } catch (err) {
    console.error('Error al obtener el barrio:', err);
    res.status(500).send('Error en el servidor');
  }
});

// Actualizar un barrio
app.put('/barrios/:id', async (req, res) => {
  const { id } = req.params; // El ID del barrio
  const { nombre, IDlocalidad, eliminado } = req.body; // Los campos a actualizar

  // Inicializamos una lista para los campos a actualizar dinámicamente
  const updates = [];
  const params = [];

  // Verificamos si se proporcionó un nuevo nombre
  if (nombre) {
    updates.push('nombre = ?'); // Añadimos la actualización de nombre
    params.push(nombre); // Añadimos el valor a los parámetros
  }

  // Verificamos si se proporcionó una nueva localidad
  if (IDlocalidad) {
    updates.push('IDlocalidad = ?'); // Añadimos la actualización de localidad
    params.push(IDlocalidad); // Añadimos el valor a los parámetros
  }

  // Verificamos si se proporciona el estado de eliminado
  if (eliminado !== undefined) {
    updates.push('eliminado = ?'); // Añadimos la actualización de eliminado
    params.push(eliminado ? 1 : 0); // Añadimos el valor (1 para eliminado, 0 para no eliminado)
  }

  // Si no hay nada que actualizar, devolvemos un error
  if (updates.length === 0) {
    return res.status(400).send('No hay campos para actualizar');
  }

  // Añadir el ID al final de los parámetros (para la cláusula WHERE)
  params.push(id);

  try {
    // Realizamos la actualización solo en los campos que cambiaron
    const query = `UPDATE barrios SET ${updates.join(', ')} WHERE ID = ?`; // Generamos la consulta
    await db.query(query, params); // Ejecutamos la consulta con los parámetros

    // Respuesta exitosa si todo salió bien
    res.send('Barrio actualizado');
  } catch (err) {
    console.error('Error al actualizar el barrio:', err);
    res.status(500).send('Error en el servidor');
  }
});
// Ruta para obtener una categoría por ID
app.get('/categorias/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [results] = await db.query('SELECT * FROM categorias WHERE ID = ?', [id]);
    if (results.length > 0) {
      res.json(results[0]);
    } else {
      res.status(404).send('Categoría no encontrada');
    }
  } catch (err) {
    console.error('Error al obtener la categoría:', err);
    res.status(500).send('Error en el servidor');
  }
});

// Ruta para actualizar una categoría
app.put('/categorias/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, eliminado } = req.body; // Obtenemos ambos campos del body

  // Verificamos si al menos uno de los dos campos está presente
  if (!nombre && eliminado === undefined) {
    return res.status(400).send('Debe proporcionar al menos el nombre o el estado eliminado');
  }

  // Preparar las consultas dinámicas dependiendo de los valores proporcionados
  let fieldsToUpdate = [];
  let valuesToUpdate = [];

  if (nombre) {
    fieldsToUpdate.push('nombre = ?');
    valuesToUpdate.push(nombre);
  }

  if (eliminado !== undefined) {
    fieldsToUpdate.push('eliminado = ?');
    valuesToUpdate.push(eliminado);
  }

  valuesToUpdate.push(id); // El ID siempre será parte de la actualización

  const query = `UPDATE categorias SET ${fieldsToUpdate.join(', ')} WHERE ID = ?`;

  try {
    // Ejecutamos la consulta con los campos dinámicos
    await db.query(query, valuesToUpdate);
    res.send('Categoría actualizada');
  } catch (err) {
    console.error('Error al actualizar la categoría:', err);
    res.status(500).send('Error en el servidor');
  }
});

// Obtener un producto por ID
app.get('/productos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [results] = await db.query('SELECT * FROM productos WHERE ID = ?', [id]);
    if (results.length > 0) {
      res.json(results[0]);
    } else {
      res.status(404).send('Producto no encontrado');
    }
  } catch (err) {
    console.error('Error al obtener el producto:', err);
    res.status(500).send('Error en el servidor');
  }
});

// Actualizar un producto
app.put('/productos/:id', async (req, res) => {
  const { id } = req.params; // El ID del producto
  const { nombre, idCategoria, precio, stock, eliminado } = req.body; // Los campos a actualizar

  // Inicializamos una lista para los campos a actualizar dinámicamente
  const updates = [];
  const params = [];

  // Verificamos si se proporcionó un nuevo nombre
  if (nombre) {
    updates.push('nombre = ?');
    params.push(nombre);
  }

  // Verificamos si se proporcionó una nueva categoría
  if (idCategoria) {
    updates.push('IDcategoria = ?');
    params.push(idCategoria);
  }

  // Verificamos si se proporcionó un nuevo precio
  if (precio !== undefined) {
    updates.push('precio = ?');
    params.push(precio);
  }

  // Verificamos si se proporcionó un nuevo stock
  if (stock !== undefined) {
    updates.push('stock = ?');
    params.push(stock);
  }

  // Verificamos si se proporciona el estado de eliminado
  if (eliminado !== undefined) {
    updates.push('eliminado = ?');
    params.push(eliminado ? 1 : 0); // 1 para eliminado, 0 para no eliminado
  }

  // Si no hay nada que actualizar, devolvemos un error
  if (updates.length === 0) {
    return res.status(400).send('No hay campos para actualizar');
  }

  // Añadir el ID al final de los parámetros (para la cláusula WHERE)
  params.push(id);

  try {
    // Realizamos la actualización solo en los campos que cambiaron
    const query = `UPDATE productos SET ${updates.join(', ')} WHERE ID = ?`;
    await db.query(query, params);
    res.send('Producto actualizado');
  } catch (err) {
    console.error('Error al actualizar el producto:', err);
    res.status(500).send('Error en el servidor');
  }
});

// Ruta para obtener un usuario específico
app.get('/usuarios/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [results] = await db.query(`SELECT u.*, r.nombre AS rol, u.contraseña FROM usuarios u JOIN roles r ON u.IDrol = r.ID WHERE u.ID = ?`, [id]);
    if (results.length > 0) {
      res.json(results[0]);
    } else {
      res.status(404).send('Usuario no encontrado');
    }
  } catch (err) {
    console.error('Error al obtener el usuario:', err);
    res.status(500).send('Error en el servidor');
  }
});

// Ruta para actualizar un usuario
app.put('/usuarios/:id', async (req, res) => {
  const { id } = req.params; // El ID del usuario
  const { nombre, email, contraseña, rol, eliminado } = req.body; // Los campos a actualizar

  // Inicializamos una lista para los campos a actualizar dinámicamente
  const updates = [];
  const params = [];

  // Verificamos si se proporcionó un nuevo nombre
  if (nombre) {
    updates.push('nombre = ?');
    params.push(nombre);
  }

  // Verificamos si se proporcionó un nuevo email
  if (email) {
    updates.push('email = ?');
    params.push(email);
  }

  // Verificamos si se proporcionó una nueva contraseña
  if (contraseña) {
    updates.push('contraseña = ?');
    params.push(contraseña);
  }

  // Verificamos si se proporcionó un nuevo rol
  if (rol) {
    updates.push('IDrol = ?');
    params.push(rol);
  }

  // Verificamos si se proporciona el estado de eliminado
  if (eliminado !== undefined) {
    updates.push('eliminado = ?');
    params.push(eliminado ? 1 : 0); // 1 para eliminado, 0 para no eliminado
  }

  // Si no hay nada que actualizar, devolvemos un error
  if (updates.length === 0) {
    return res.status(400).send('No hay campos para actualizar');
  }

  // Añadir el ID al final de los parámetros (para la cláusula WHERE)
  params.push(id);

  try {
    // Realizamos la actualización solo en los campos que cambiaron
    const query = `UPDATE usuarios SET ${updates.join(', ')} WHERE ID = ?`;
    await db.query(query, params);
    res.send('Usuario actualizado correctamente');
  } catch (err) {
    console.error('Error al actualizar el usuario:', err);
    res.status(500).send('Error en el servidor');
  }
});

app.get('/cliente/:id', async (req, res) => {
  const id = req.params.id; // Obtener el ID del cliente desde los parámetros de la URL

  try {
    // Consulta modificada para traer solo IDs
    const query = `
          SELECT 
              c.ID AS IDCliente, 
              c.nombre, 
              c.telefono, 
              c.direccion,
              b.ID AS IDbarrio, 
              l.ID AS IDlocalidad
          FROM cliente c
          JOIN barrios b ON c.IDbarrio = b.ID
          JOIN localidades l ON b.IDlocalidad = l.ID
          WHERE c.ID = ?
      `;
    const [rows] = await db.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).send('Cliente no encontrado');
    }

    res.status(200).json(rows[0]); // Devuelve los datos del cliente en formato JSON
  } catch (err) {
    console.error('Error al obtener el cliente:', err);
    res.status(500).send('Error en el servidor');
  }
});

app.put('/cliente/:id', async (req, res) => {
  const { id } = req.params; // ID del cliente a actualizar
  const { nombre, telefono, IDbarrio, direccion, eliminado } = req.body; // Datos del cliente desde el formulario

  // Crea un array para los valores y un array para las condiciones
  const values = [];
  const conditions = [];

  // Agrega los campos que están presentes en el cuerpo de la solicitud
  if (nombre) {
    values.push(nombre);
    conditions.push('nombre = ?');
  }
  if (telefono) {
    values.push(telefono);
    conditions.push('telefono = ?');
  }
  if (IDbarrio) {
    values.push(IDbarrio);
    conditions.push('IDbarrio = ?');
  }
  if (direccion) {
    values.push(direccion);
    conditions.push('direccion = ?');
  }

  // Verificamos si se proporciona el estado de eliminado
  if (eliminado !== undefined) {
    values.push(eliminado ? 1 : 0); // 1 para eliminado, 0 para no eliminado
    conditions.push('eliminado = ?');
  }

  // Verifica que al menos un campo se haya proporcionado
  if (conditions.length === 0) {
    return res.status(400).send('Al menos un campo debe ser proporcionado para la actualización');
  }

  // Agrega el ID del cliente a los valores
  values.push(id);

  // Crea la consulta dinámica
  const query = `UPDATE cliente SET ${conditions.join(', ')} WHERE ID = ?`;

  try {
    // Actualiza el cliente en la base de datos
    await db.query(query, values);

    res.status(200).send('Cliente actualizado correctamente');
  } catch (err) {
    console.error('Error al actualizar el cliente:', err);
    res.status(500).send('Error en el servidor');
  }
});

app.get('/pedidos/:id/:diaId', async (req, res) => {
  const id = req.params.id; // Obtener el ID del pedido
  const diaId = req.params.diaId; // Obtener el ID del día

  try {
    // Consulta para obtener detalles del pedido para un día específico
    const query = `
      SELECT 
        dp.ID AS IDDetalle, 
        p.ID AS IDPedido, 
        c.nombre AS Cliente,
        p.IDcliente AS IDCliente,
        c.direccion AS Direccion, 
        d.ID AS IDDias, 
        d.nombre AS DiaEntrega,
        tp.descripcion AS TipoPedido, 
        p.IDtipo_pedido AS TipoPedidoID,
        dp.cantidad, 
        pr.nombre AS Producto, 
        dp.IDproducto AS IDProducto, 
        dp.preciototal AS preciototal,  
        e.descripcion AS Estado, 
        dp.fecha_entrega AS FechaEntrega,
        p.fecha_creacion AS FechaCreacion,  -- Añadir la fecha de creación
       pb.fecha_inicio AS FechaInicio,
       dp.fechacancelado AS fechaCancelado 
      FROM detallepedido dp
      JOIN pedidos p ON dp.IDpedido = p.ID
      JOIN cliente c ON p.IDcliente = c.ID
      JOIN dias d ON dp.IDdias = d.ID 
      JOIN productos pr ON dp.IDproducto = pr.ID
      JOIN estados e ON dp.IDestado = e.ID
      JOIN tipos_pedido tp ON p.IDtipo_pedido = tp.ID
      LEFT JOIN periodos_baja pb ON dp.ID = pb.IDdetallepedido
      WHERE p.ID = ? AND dp.IDdias = ?;  -- Filtra por el ID del día
    `;

    const [rows] = await db.query(query, [id, diaId]);

    if (rows.length === 0) {
      return res.status(404).send('Pedido no encontrado');
    }

    res.status(200).json(rows);
  } catch (err) {
    console.error('Error al obtener detalles del pedido:', err);
    res.status(500).send('Error en el servidor');
  }
});

app.put('/pedidos/:id', async (req, res) => {
  const idPedido = req.params.id; // ID del pedido a actualizar
  const { tipoPedido, productos } = req.body; // Obtenemos el tipo de pedido y los productos

  if (!productos || productos.length === 0) {
    return res.status(400).json({ error: 'No se proporcionaron productos a actualizar.' });
  }

  try {
    // Actualiza el tipo de pedido
    if (tipoPedido !== undefined) {
      const sqlTipo = 'UPDATE pedidos SET IDtipo_pedido = ? WHERE ID = ?';
      await db.query(sqlTipo, [tipoPedido, idPedido]);
    }

    for (const producto of productos) {
      const { idDetalle, idProducto, cantidad } = producto;

      if (!idDetalle) {
        return res.status(400).json({ error: 'ID del detalle del producto es requerido.' });
      }

      const sqlCheck = 'SELECT * FROM detallepedido WHERE ID = ? AND IDpedido = ?';
      const [detalle] = await db.query(sqlCheck, [idDetalle, idPedido]); // Asegúrate de incluir diaEntrega


      if (detalle.length === 0) {
        return res.status(400).json({ error: 'El detalle del producto no pertenece al pedido especificado.' });
      }

      // Crear un array para los valores que se actualizarán y una lista de asignaciones
      const updates = [];
      const values = [];

      if (idProducto !== undefined) {
        updates.push('IDproducto = ?');
        values.push(idProducto);
      }
      if (cantidad !== undefined) {
        updates.push('cantidad = ?');
        values.push(cantidad);
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'No se proporcionaron campos válidos para actualizar.' });
      }

      // Agregar el ID del detalle a los valores
      values.push(idDetalle);

      // Construir la consulta SQL
      const sql = `
              UPDATE detallepedido 
              SET ${updates.join(', ')} 
              WHERE ID = ?
          `;
      await db.query(sql, values);
    }

    res.status(200).json({ message: 'Pedido actualizado correctamente.' });
  } catch (error) {
    console.error('Error al actualizar el pedido:', error);
    res.status(500).json({ error: 'Error al actualizar el pedido: ' + error.message });
  }
});

app.get('/periodos_baja/:id', async (req, res) => {
  const { id } = req.params; // Desestructurando el id desde params
  try {
    const [results] = await db.query('SELECT * FROM periodos_baja WHERE IDpedido = ? AND fecha_inicio <= CURDATE() AND fecha_fin >= CURDATE()', [id]);

    if (results.length > 0) {
      res.json(results[0]); // Devuelve el primer resultado si existe
    } else {
      res.status(404).send('Periodo de baja no encontrado'); // Respuesta si no hay resultados
    }
  } catch (err) {
    console.error('Error al obtener el periodo de baja:', err); // Log del error
    res.status(500).send('Error en el servidor'); // Respuesta de error
  }
});

// Ruta para dar de baja un detalle del pedido  
app.put('/detallepedido/:id/:diaId', async (req, res) => {
  const idPedido = req.params.id; // Obtener el ID del pedido
  const diaId = req.params.diaId; // Obtener el ID del día
  const { dardebaja, cancelado, fechacancelado } = req.body; // Obtener el estado desde el cuerpo de la solicitud

  try {
    // Actualizar estado según lo que se reciba
    if (dardebaja) {
      await db.query(`
              UPDATE detallepedido 
              SET dardebaja = 1 
              WHERE IDpedido = ? AND IDdias = ?`, [idPedido, diaId]);
      return res.status(200).send('Pedido dado de baja.');
    }

    // Manejar el estado de cancelación
    if (cancelado !== undefined) { // Verificar si se especificó 'cancelado'
      await db.query(`
      UPDATE detallepedido 
      SET cancelado = ?, fechacancelado = ? 
      WHERE IDpedido = ? AND IDdias = ?`, [cancelado ? 1 : 0, fechacancelado, idPedido, diaId]);
      return res.status(200).send(`Pedido ${cancelado ? 'cancelado.' : 'reactivado.'}`);
    }

    // Si no se especifica una acción
    return res.status(400).send('No se ha especificado ninguna acción.');
  } catch (err) {
    console.error('Error al actualizar el estado del pedido:', err);
    return res.status(500).send('Error en el servidor.');
  }
});

// Puerto para escuchar las peticiones
const port = 3000;
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});

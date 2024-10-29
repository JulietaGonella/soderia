$(document).ready(function () {
    // Cargar pedidos dados de baja
    function cargarPedidosBaja() {
        $.get('http://localhost:3000/pedidos?dardebaja=true', function (data) {
            let tableBody = $('#tablebajapedidosbody');
            tableBody.empty(); // Limpia el contenido de la tabla

            if (data.length > 0) {
                data.forEach(function (pedido) {
                    // Formateo de la fecha de baja
                    let fechaBajaFormateada = pedido.FechaBaja ?
                        (() => {
                            let fecha = new Date(pedido.FechaBaja);
                            let dia = String(fecha.getDate()).padStart(2, '0');
                            let mes = String(fecha.getMonth() + 1).padStart(2, '0');
                            let anio = fecha.getFullYear();
                            return `${dia}/${mes}/${anio}`;
                        })() : 'indefinida';

                    // Formateo de la fecha de alta
                    let fechaAltaFormateada = 'indefinida'; // Por defecto indefinido
                    if (pedido.TiposPedidos === "Unico") {
                        // Si es único, fecha alta es indefinida
                        fechaAltaFormateada = 'indefinida';
                    } else if (pedido.FechaAlta) {
                        // Si no es único, formateamos la fecha
                        let fecha = new Date(pedido.FechaAlta);
                        let dia = String(fecha.getDate()).padStart(2, '0');
                        let mes = String(fecha.getMonth() + 1).padStart(2, '0');
                        let anio = fecha.getFullYear();
                        fechaAltaFormateada = `${dia}/${mes}/${anio}`;
                    }

                    tableBody.append(`
                        <tr>
                            <th scope="row">${pedido.IDPedido}</th>
                            <td>${pedido.Cliente}</td>
                            <td class="text-center">${pedido.TipoPedido}</td>
                            <td class="text-center">${fechaBajaFormateada}</td>
                            <td class="text-center">${fechaAltaFormateada}</td>
                            <td class="text-center">
                                <button type="button" class="btn btn-danger btn-sm" 
                                onclick="restaurarPedido(${pedido.IDPedido}, ${pedido.IDdias}, true)">Restaurar</button>
                            </td>
                        </tr>
                    `);
                });
            }

            // Inicializa DataTables si no está ya inicializado
            if (!$.fn.DataTable.isDataTable('#table_baja_id')) {
                $('#table_baja_id').DataTable({
                    "pageLength": 5,
                    lengthMenu: [
                        [5, 10, 25, 50],
                        [5, 10, 25, 50]
                    ],
                    "language": {
                        "url": "https://cdn.datatables.net/plug-ins/1.13.1/i18n/es-ES.json"
                    }
                });
            }
        }).fail(function () {
            console.error('Error al cargar los datos de los pedidos dados de baja');
        });
    }

    function cargarPedidosCancelados() {
        $.get('http://localhost:3000/pedidos?cancelado=true', function (data) {
            let tableBody = $('#tablecanceladosbody');
            tableBody.empty(); // Limpia el contenido de la tabla

            if (data.length > 0) {
                data.forEach(function (pedido) {
                    // Formateo de la fecha de cancelación
                    let fechaCancelacionFormateada = pedido.fechaCancelado
                        ? (() => {
                            let fecha = new Date(pedido.fechaCancelado);
                            let dia = String(fecha.getDate()).padStart(2, '0');
                            let mes = String(fecha.getMonth() + 1).padStart(2, '0');
                            let anio = fecha.getFullYear();
                            return `${dia}/${mes}/${anio}`;
                        })()
                        : 'indefinida';

                    // Calcular la fecha de alta
                    let fechaAltaFormateada = '';

                    // Se maneja el caso de pedido único y regular
                    if (pedido.TipoPedido === "Unico") {
                        // Si el tipo de pedido es único, la fecha de alta es 'indefinida'
                        fechaAltaFormateada = 'indefinida';
                    } else {
                        // Si el tipo de pedido no es único, calculamos la fecha de alta
                        if (pedido.fechaCancelado) {
                            // Sumar 1 día a la fecha de cancelación para la fecha de alta
                            let fechaCancelacion = new Date(pedido.fechaCancelado);
                            fechaCancelacion.setDate(fechaCancelacion.getDate() + 1); // Sumar un día a la fecha de cancelación
                            let diaAlta = String(fechaCancelacion.getDate()).padStart(2, '0');
                            let mesAlta = String(fechaCancelacion.getMonth() + 1).padStart(2, '0');
                            let anioAlta = fechaCancelacion.getFullYear();
                            fechaAltaFormateada = `${diaAlta}/${mesAlta}/${anioAlta}`;
                        } else {
                            // Si no hay fecha de cancelación, puedes definir un valor predeterminado
                            fechaAltaFormateada = 'Fecha no disponible';
                        }
                    }

                    tableBody.append(`
                        <tr>
                            <th scope="row">${pedido.IDPedido}</th>
                            <td>${pedido.Cliente}</td>
                            <td class="text-center">${pedido.TipoPedido}</td>
                            <td class="text-center">${fechaCancelacionFormateada}</td>
                            <td class="text-center">${fechaAltaFormateada}</td>
                            <td class="text-center">
                                <button type="button" class="btn btn-danger btn-sm" 
                                onclick="restaurarPedido(${pedido.IDPedido}, ${pedido.IDdias}, true)">Restaurar</button>
                            </td>
                        </tr>
                    `);
                });
            }

            // Inicializa DataTables si no está ya inicializado
            if (!$.fn.DataTable.isDataTable('#table_cancelados_id')) {
                $('#table_cancelados_id').DataTable({
                    "pageLength": 5,
                    lengthMenu: [
                        [5, 10, 25, 50],
                        [5, 10, 25, 50]
                    ],
                    "language": {
                        "url": "https://cdn.datatables.net/plug-ins/1.13.1/i18n/es-ES.json"
                    }
                });
            }
        }).fail(function () {
            console.error('Error al cargar los datos de los pedidos cancelados');
        });
    }

    cargarPedidosBaja(); // Cargar los pedidos dados de baja inicialmente
    cargarPedidosCancelados(); // Cargar los pedidos cancelados inicialmente

    // Llamar a la función de restauración automática
    restaurarAutomaticamente();
});

function restaurarAutomaticamente() {
    const hoy = new Date();
    const diaHoy = String(hoy.getDate()).padStart(2, '0');
    const mesHoy = String(hoy.getMonth() + 1).padStart(2, '0');
    const anioHoy = hoy.getFullYear();
    const fechaHoy = `${anioHoy}-${mesHoy}-${diaHoy}`; // Formato YYYY-MM-DD

    // Comprobar si la hora actual es igual o mayor a las 00:00
    if (hoy.getHours() >= 0) {
        // Verificar pedidos dados de baja
        $.get('http://localhost:3000/pedidos?dardebaja=true', function (data) {
            data.forEach(function (pedido) {
                // Comprobar si la FechaAlta es hoy
                if (pedido.FechaAlta && pedido.FechaAlta.split('T')[0] === fechaHoy) {
                    restaurarPedido(pedido.IDPedido, pedido.IDdias, false); // Restaurar sin mostrar la alerta
                }
            });
        }).fail(function () {
            console.error('Error al cargar los datos de los pedidos dados de baja');
        });

        // Verificar pedidos cancelados
        $.get('http://localhost:3000/pedidos?cancelado=true', function (data) {
            data.forEach(function (pedido) {
                // Comprobar si la fecha de alta es hoy
                if (pedido.fechaCancelado) {
                    let fechaCancelacion = new Date(pedido.fechaCancelado);
                    fechaCancelacion.setDate(fechaCancelacion.getDate() + 1); // Sumar un día
                    let diaAlta = String(fechaCancelacion.getDate()).padStart(2, '0');
                    let mesAlta = String(fechaCancelacion.getMonth() + 1).padStart(2, '0');
                    let anioAlta = fechaCancelacion.getFullYear();
                    let fechaAlta = `${anioAlta}-${mesAlta}-${diaAlta}`; // Formato YYYY-MM-DD

                    if (fechaAlta === fechaHoy) {
                        restaurarPedido(pedido.IDPedido, pedido.IDdias, false); // Restaurar sin mostrar la alerta
                    }
                }
            });
        }).fail(function () {
            console.error('Error al cargar los datos de los pedidos cancelados');
        });
    }
}


// Función para restaurar un pedido
function restaurarPedido(pedidoID, diaID, mostrarAlerta) {
    console.log('ID Pedido:', pedidoID, 'Día ID:', diaID);

    if (mostrarAlerta) {
        // Mostrar la alerta si mostrarAlerta es true
        Swal.fire({
            title: 'Confirmar Restauración',
            text: "¿Estás seguro de que deseas restaurar este pedido?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, restaurar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                enviarRestauracion(pedidoID, diaID);
            }
        });
    } else {
        // Si no se requiere la alerta, simplemente restaurar
        enviarRestauracion(pedidoID, diaID);

    }
}

// Función para enviar la restauración al servidor
function enviarRestauracion(pedidoID, diaID) {
    $.ajax({
        url: `http://localhost:3000/restaurar-pedido/${pedidoID}/${diaID}`, // URL correcta
        method: 'POST',
        success: function (response) {
            console.log('Pedido restaurado:', response);
            Swal.fire({
                title: 'Restauración Exitosa',
                text: 'El pedido ha sido restaurado.',
                icon: 'success',
                confirmButtonText: 'Aceptar'
            }).then(() => {
                location.reload(); // Recargar la página
                // Recargar la tabla después de restaurar
                $('#tablebajapedidosbody').empty(); // Limpiar la tabla
                cargarPedidosBaja(); // Volver a cargar los pedidos dados de baja
                cargarPedidosCancelados();
            });
        },
        error: function (error) {
            console.error('Error al restaurar el pedido:', error);
            Swal.fire({
                title: 'Error',
                text: 'No se pudo restaurar el pedido. Intenta nuevamente.',
                icon: 'error',
                confirmButtonText: 'Aceptar'
            });
        }
    });
}

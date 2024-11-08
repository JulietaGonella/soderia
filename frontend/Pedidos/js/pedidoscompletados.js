$(document).ready(function () {  
    // Cargar todos los pedidos (regulares y únicos)
    $.get('http://localhost:3000/pedidos?completado=true', function (data) {
        let tableBody = $('#tablepedidosbody');
        tableBody.empty(); // Limpia el contenido de la tabla

        if (data.length > 0) {
            data.forEach(function (pedido) {
                let fechaCreacion = new Date(pedido.FechaCreacion);
                let fechaEntrega = new Date(pedido.FechaEntrega);

                let fechaFormateadaCreacion = `${fechaCreacion.getDate().toString().padStart(2, '0')}/${(fechaCreacion.getMonth() + 1).toString().padStart(2, '0')}/${fechaCreacion.getFullYear()}`;
                let fechaFormateadaEntrega = `${fechaEntrega.getDate().toString().padStart(2, '0')}/${(fechaEntrega.getMonth() + 1).toString().padStart(2, '0')}/${fechaEntrega.getFullYear()}`;

                tableBody.append(
                    `<tr>
                        <th scope="row" class="text-center">${pedido.IDPedido}</th>
                        <td class="text-center">${pedido.Cliente}</td>
                        <td class="text-center">${pedido.Direccion}</td>
                        <td class="text-center">${pedido.Barrio}</td> <!-- Barrio -->
                        <td class="text-center">${pedido.Localidad}</td> <!-- Localidad -->
                        <td class="text-center">${pedido.TipoPedido}</td>
                        <td class="text-center">${fechaFormateadaCreacion}</td>
                        <td class="text-center">${fechaFormateadaEntrega}</td>
                        <td class="text-center">${pedido.EstadoDescripcion}</td>
                    </tr>`
                );
            });
        }

        $('#table_id').DataTable({
            "pageLength": 5,
            lengthMenu: [[5, 10, 25, 50], [5, 10, 25, 50]],
            "language": { "url": "https://cdn.datatables.net/plug-ins/1.13.1/i18n/es-ES.json" },
            // Configuración para hacer que el buscador solo busque en la columna del nombre del cliente
            "columnDefs": [
                {
                    "targets": 1, // El índice de la columna de "Cliente" (asumiendo que es la segunda columna)
                    "searchable": true // Habilita la búsqueda solo en esta columna
                },
                {
                    "targets": "_all", // Deshabilita la búsqueda en todas las demás columnas
                    "searchable": false
                }
            ]
        });
    }).fail(function () {
        console.error('Error al cargar los datos de los pedidos completados');
    });

    // Llamar a la función de restauración automática de pedidos regulares al día siguiente
    restaurarPedidosRegulares();
});

// pedidoscompletados.js: Automatización para restaurar pedidos regulares
function restaurarPedidosRegulares() {
    const hoy = new Date();
    const diaHoy = String(hoy.getDate()).padStart(2, '0');
    const mesHoy = String(hoy.getMonth() + 1).padStart(2, '0');
    const anioHoy = hoy.getFullYear();
    const fechaHoy = `${anioHoy}-${mesHoy}-${diaHoy}`; // Formato YYYY-MM-DD

    // Comprobar pedidos completados diariamente para restaurar pedidos regulares al día siguiente de su entrega
    if (hoy.getHours() >= 0) {
        $.get('http://localhost:3000/pedidos?completado=true', function (data) {
            data.forEach(function (pedido) {
                if (pedido.TipoPedido === 'Regular') {
                    let fechaEntrega = new Date(pedido.FechaEntrega);
                    fechaEntrega.setDate(fechaEntrega.getDate() + 1); // Agregar un día para restauración al día siguiente
                    let diaEntrega = String(fechaEntrega.getDate()).padStart(2, '0');
                    let mesEntrega = String(fechaEntrega.getMonth() + 1).padStart(2, '0');
                    let anioEntrega = fechaEntrega.getFullYear();
                    let fechaEntregaStr = `${anioEntrega}-${mesEntrega}-${diaEntrega}`; // Formato YYYY-MM-DD

                    if (fechaEntregaStr === fechaHoy) {
                        restaurarPedido(pedido.IDPedido, pedido.IDdias, false); // Restaurar sin mostrar la alerta
                    }
                }
            });
        }).fail(function () {
            console.error('Error al cargar los datos de los pedidos regulares');
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
        url: `http://localhost:3000/restaurar-pedido/${pedidoID}/${diaID}`,
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

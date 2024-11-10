$(document).ready(function () {
    // Cargar todos los pedidos (regulares y únicos)
    $.get('http://localhost:3000/pedidos?completado=true', function (data) {
        let tableBody = $('#tablepedidosbody');
        tableBody.empty();

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
                        <td class="text-center">${pedido.Barrio}</td>
                        <td class="text-center">${pedido.Localidad}</td>
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
            "columnDefs": [
                { "targets": 1, "searchable": true },
                { "targets": "_all", "searchable": false }
            ]
        });
    }).fail(function () {
        console.error('Error al cargar los datos de los pedidos completados');
    });

    // Llamada a restauración si no se ha realizado hoy
    restaurarPedidosRegulares();
});

// Función que verifica y restaura los pedidos regulares si la fecha de entrega + 1 es igual a la fecha de hoy
function restaurarPedidosRegulares() {
    const hoy = new Date();
    const diaHoy = String(hoy.getDate()).padStart(2, '0');
    const mesHoy = String(hoy.getMonth() + 1).padStart(2, '0');
    const anioHoy = hoy.getFullYear();
    const fechaHoy = `${anioHoy}-${mesHoy}-${diaHoy}`; // Formato YYYY-MM-DD

    
    // Verificar pedidos regulares completados
    $.get('http://localhost:3000/pedidos?completado=true', function (data) {
        data.forEach(function (pedido) {
            if (pedido.TipoPedido === 'Regular') {
                let fechaEntrega = new Date(pedido.FechaEntrega);
                
                // Sumar un día a la fecha de entrega
                fechaEntrega.setDate(fechaEntrega.getDate() + 1);

                let diaEntrega = String(fechaEntrega.getDate()).padStart(2, '0');
                let mesEntrega = String(fechaEntrega.getMonth() + 1).padStart(2, '0');
                let anioEntrega = fechaEntrega.getFullYear();
                let fechaEntregaStr = `${anioEntrega}-${mesEntrega}-${diaEntrega}`; // Formato YYYY-MM-DD

                // Comparar si la fecha de hoy es igual a la fecha de entrega + 1
                if (fechaEntregaStr === fechaHoy) {
                    restaurarPedido(pedido.IDPedido, pedido.IDdias, false); // Restaurar sin mostrar la alerta
                }
            }
        });

        // Almacenar la fecha de restauración en el localStorage para evitar repetirla
        localStorage.setItem('fechaRestauracion', fechaHoy);
    }).fail(function () {
        console.error('Error al cargar los datos de los pedidos regulares');
    });
}

// Función que maneja la restauración de un pedido
function restaurarPedido(pedidoID, diaID, mostrarAlerta) {
    if (mostrarAlerta) {
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
        enviarRestauracion(pedidoID, diaID);
    }
}

// Enviar solicitud al backend para restaurar el pedido
function enviarRestauracion(pedidoID, diaID) {
    $.ajax({
        url: `http://localhost:3000/restaurarpedido`,
        method: 'POST',
        data: JSON.stringify({ pedidoID }), // Enviar el ID del pedido
        contentType: 'application/json',
        success: function (response) {
            console.log('Pedido restaurado:', response);
            Swal.fire({
                title: 'Restauración Exitosa',
                text: 'El pedido ha sido restaurado.',
                icon: 'success',
                confirmButtonText: 'Aceptar'
            }).then(() => {
                location.reload(); // Recargar la página para reflejar los cambios
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

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

                // Mostrar todos los pedidos, tanto regulares como únicos
                tableBody.append(
                    `<tr>
                        <th scope="row" class="text-center">${pedido.IDPedido}</th>
                        <td class="text-center">${pedido.Cliente}</td>
                        <td class="text-center">${pedido.Direccion}</td>
                        <td class="text-center">${pedido.TipoPedido}</td>
                        <td class="text-center">${fechaFormateadaCreacion}</td>
                        <td class="text-center">${fechaFormateadaEntrega}</td>
                        <td class="text-center">${pedido.EstadoDescripcion}</td>
                    </tr>`
                );
            });
        }

        // Inicializa DataTables después de llenar la tabla
        $('#table_id').DataTable({
            "pageLength": 5,
            lengthMenu: [
                [5, 10, 25, 50],
                [5, 10, 25, 50]
            ],
            "language": {
                "url": "https://cdn.datatables.net/plug-ins/1.13.1/i18n/es-ES.json"
            }
        });
    }).fail(function () {
        console.error('Error al cargar los datos de los pedidos completados');
    });

    // Automatizar la restauración de pedidos regulares al día siguiente de la fecha de entrega
    setInterval(function () {
        $.get('http://localhost:3000/pedidos?completado=true', function (data) {
            data.forEach(function (pedido) {
                let fechaEntrega = new Date(pedido.FechaEntrega);
                let hoy = new Date();

                // Verificar si el pedido es regular y si ha pasado un día desde la entrega
                if (pedido.TipoPedido === 'Regular' && hoy > fechaEntrega) {
                    let diferencia = Math.floor((hoy - fechaEntrega) / (1000 * 60 * 60 * 24));

                    if (diferencia >= 1) {
                        restaurarPedido(pedido.IDPedido, pedido.IDdias);
                    }
                }
            });
        });
    }, 24 * 60 * 60 * 1000); // Revisa una vez al día
});

function restaurarPedido(pedidoID, diaId) {
    $.ajax({
        url: `http://localhost:3000/restaurarpedido`,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            pedidoID: pedidoID,
            diaId: diaId
        }),
        success: function(response) {
            console.log(`Pedido ${pedidoID} restaurado correctamente`);
        },
        error: function(error) {
            console.error('Error al restaurar el pedido:', error);
        }
    });
}

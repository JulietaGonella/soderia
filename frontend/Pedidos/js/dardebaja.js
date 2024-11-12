$(document).ready(function () { 
    // Obtiene los parámetros de la URL, como idPedido y diaId, y los almacena en constantes
    const urlParams = new URLSearchParams(window.location.search);
    const idPedido = urlParams.get('id'); // ID del pedido
    const diaId = urlParams.get('diaId'); // ID del día

    // Establece el valor de idPedido en el campo de entrada con ID "idpedido"
    $('#idpedido').val(idPedido);
    let pedidoData = null; // Inicializa la variable para almacenar datos del pedido

    // Realiza una solicitud AJAX para obtener los detalles del pedido basado en idPedido y diaId
    $.ajax({
        url: `http://localhost:3000/pedidos/${idPedido}/${diaId}`, // URL de la API
        method: 'GET', // Método de solicitud HTTP
        success: function (data) {
            if (data.length > 0) {
                pedidoData = data; // Asigna los datos del pedido a la variable pedidoData
                let detallesIds = data.map(detalle => detalle.IDDetalle).join(', '); // Crea una lista de IDs de detalle
                $('#iddetallepedido').val(detallesIds); // Asigna estos IDs al campo de entrada

                // Muestra el selector de opción para baja
                $('#opcion-baja').show();
                $('#fechas-baja').hide(); // Oculta campos de fechas al inicio
                $('#labefechafin').hide();
                $('#fecha-inicio').hide();
                $('#fecha-fin').hide();

                // Verifica el tipo de pedido y ajusta el campo de fecha según el tipo
                switch (data[0].TipoPedido) {
                    case 'Unico':
                        $('#fecha-inicio').show(); // Muestra solo el campo de fecha de inicio
                        break;
                    case 'Indefinido':
                        $('#fecha-inicio').val(new Date().toISOString().split('T')[0]); // Fecha actual por defecto
                        break;
                    case 'Regular':
                    case 'Por Fechas':
                        $('#fecha-inicio').show(); // Muestra el campo de fecha de inicio
                        break;
                }
            } else {
                console.log('No se encontraron detalles para este pedido.');
            }
        },
        error: function (error) {
            console.error('Error al obtener detalles del pedido:', error);
        }
    });

    // Controla el cambio de opción de baja y ajusta la visibilidad de los campos de fecha
    $('#opcion-baja').change(function () {
        const opcionBaja = $(this).val();
        if (opcionBaja === 'por-fecha') {
            $('#fechas-baja').show(); // Muestra los campos de fecha
            const tipoPedido = pedidoData && pedidoData.length > 0 ? pedidoData[0].TipoPedido : '';

            if (tipoPedido === 'Unico') {
                $('#fecha-fin').hide(); // Oculta el campo de fecha fin si el tipo es 'Unico'
                $('#labefechafin').hide();
            } else {
                $('#fecha-fin').show(); // Muestra el campo de fecha fin
                $('#labefechafin').show();
            }
        } else {
            $('#fechas-baja').hide(); // Oculta los campos de fecha
            $('#fecha-inicio').val(''); // Limpia el campo de fecha de inicio
            $('#fecha-fin').val('');    // Limpia el campo de fecha de fin
            $('#labefechafin').hide();
        }
    });

    // Inicializa los campos de fechas de baja y establece la fecha mínima como la fecha actual
    $('#fechas-baja').hide();
    const hoy = new Date();
    const dd = String(hoy.getDate()).padStart(2, '0');
    const mm = String(hoy.getMonth() + 1).padStart(2, '0'); // Enero es 0
    const yyyy = hoy.getFullYear();
    const fechaMinima = `${yyyy}-${mm}-${dd}`; // Fecha mínima en formato 'YYYY-MM-DD'
    $('#fecha-inicio').attr('min', fechaMinima);
    $('#fecha-fin').attr('min', fechaMinima);

    // Manejo del envío del formulario para dar de baja el pedido
    $('#form-dar-baja').submit(function (event) {
        event.preventDefault(); // Previene el comportamiento predeterminado de enviar el formulario

        const opcionBaja = $('#opcion-baja').val(); // Obtiene la opción de baja seleccionada
        let bajaIndefinida = 0;
        let fechaInicio = null;
        let fechaFin = null;

        if (opcionBaja === 'indefinido') {
            bajaIndefinida = 1; // Marca la baja como indefinida
            fechaInicio = new Date(); // Establece la fecha actual
        } else if (opcionBaja === 'por-fecha') {
            // Valida y obtiene las fechas de inicio y fin
            fechaInicio = $('#fecha-inicio').val() ? new Date($('#fecha-inicio').val()) : null;
            fechaFin = $('#fecha-fin').val() ? new Date($('#fecha-fin').val()) : null;

            if (!fechaInicio || isNaN(fechaInicio.getTime())) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Por favor, ingrese una fecha de inicio válida para la baja.',
                    confirmButtonText: 'Aceptar'
                });
                return;
            } else if (fechaFin && fechaInicio >= fechaFin) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'La fecha de inicio debe ser anterior a la fecha de fin.',
                    confirmButtonText: 'Aceptar'
                });
                return;
            }
        }

        // Crea el objeto con los datos que se enviarán a la API
        let datosAEnviar = {
            idpedido: idPedido,
            iddia: diaId,
            bajaIndefinida: bajaIndefinida,
            fechaInicio: fechaInicio ? fechaInicio.toISOString().split('T')[0] : null,
            fechaFin: bajaIndefinida ? null : (fechaFin ? fechaFin.toISOString().split('T')[0] : null),
            detalles: $('#iddetallepedido').val().split(',').map(id => ({ ID: id.trim() }))
        };

        // Enviar datos a la API para registrar la baja del pedido
        $.ajax({
            url: 'http://localhost:3000/periodos_baja', // URL de la API
            method: 'POST', // Método de solicitud HTTP
            contentType: 'application/json', // Tipo de contenido
            data: JSON.stringify(datosAEnviar), // Datos en formato JSON
            success: function (response) {
                Swal.fire({
                    icon: 'success',
                    title: 'Éxito',
                    text: 'Pedido dado de baja correctamente.',
                    confirmButtonText: 'Aceptar'
                }).then(() => {
                    window.location.href = 'pedidos.html'; // Redirige a la página de pedidos
                });
            },
            error: function (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error al registrar la baja. Inténtalo de nuevo.',
                    confirmButtonText: 'Aceptar'
                });
            }
        });
    });
});

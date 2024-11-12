// Ejecuta el código una vez que el documento esté completamente cargado.
$(document).ready(function () {  
    // Obtiene el parámetro 'id' de la URL para identificar al cliente.
    const urlParams = new URLSearchParams(window.location.search);
    const clienteId = urlParams.get('id'); // Extrae el ID del cliente desde la URL

    // Variables para almacenar la localidad y el barrio original del cliente.
    let originalIdbarrio;
    let originalIdlocalidad;

    // Realiza llamadas para cargar las listas de localidades y barrios al inicio.
    $.when(
        $.get('http://localhost:3000/localidades'), // Solicita la lista de localidades.
        $.get('http://localhost:3000/barrios') // Solicita la lista de barrios.
    ).done(function (localidadList, barrioList) {
        // Carga las localidades en el menú desplegable.
        localidadList[0].forEach(localidad => {
            $('#localidad').append(new Option(localidad.localidad, localidad.ID)); // Usa 'localidad' como etiqueta.
        });

        // Carga los barrios en el menú desplegable.
        barrioList[0].forEach(barrio => {
            $('#barrio').append(new Option(barrio.barrio, barrio.ID)); // Usa 'barrio' como etiqueta.
        });

        // Si se proporciona un ID de cliente, carga los datos de ese cliente.
        if (clienteId) {
            $.get(`http://localhost:3000/cliente/${clienteId}`, function (cliente) {
                console.log("Datos del cliente recibidos:", cliente);

                // Almacena la localidad y el barrio originales del cliente.
                originalIdbarrio = cliente.IDbarrio;
                originalIdlocalidad = cliente.IDlocalidad;

                // Rellena el formulario con los datos del cliente.
                $('#id').val(cliente.IDCliente); // Asume que 'IDCliente' es un campo devuelto.
                $('#nombreyapellido').val(cliente.nombre);
                $('#telefono').val(cliente.telefono);
                $('#direccion').val(cliente.direccion);

                // Establece la localidad seleccionada.
                $('#localidad').val(originalIdlocalidad); 

                // Filtra los barrios según la localidad seleccionada.
                cargarBarriosPorLocalidad(originalIdlocalidad, originalIdbarrio);
            }).fail(function (jqXHR, textStatus, errorThrown) {
                console.error("Error al cargar los datos del cliente:", textStatus, errorThrown);
                Swal.fire('Error', 'No se pudo cargar el cliente.', 'error');
            });
        } else {
            console.log("No se proporcionó un ID de cliente en la URL.");
        }
    }).fail(function () {
        console.error('Error al cargar las localidades o barrios.');
        Swal.fire('Error', 'No se pudieron cargar las localidades o barrios.', 'error');
    });

    // Función para cargar barrios específicos según la localidad seleccionada.
    function cargarBarriosPorLocalidad(localidadId, idBarrio) {
        // Filtra los barrios por la localidad especificada.
        $.get(`http://localhost:3000/barrios?IDlocalidad=${localidadId}`, function(barrioList) {
            $('#barrio').empty().append(new Option("Seleccione un barrio", "", true, true)); // Opción predeterminada.

            barrioList.forEach(barrio => {
                $('#barrio').append(new Option(barrio.barrio, barrio.ID)); // Agrega barrios al menú.

                // Selecciona el barrio correspondiente al cliente si existe.
                if (barrio.ID === idBarrio) {
                    $('#barrio').val(idBarrio); // Selecciona el barrio.
                }
            });
        }).fail(function(jqXHR, textStatus, errorThrown) {
            console.error("Error al cargar los barrios:", textStatus, errorThrown);
            Swal.fire('Error', 'No se pudieron cargar los barrios.', 'error');
        });
    }

    // Maneja el cambio en la localidad para actualizar la lista de barrios.
    $('#localidad').change(function() {
        const localidadId = $(this).val(); // Obtiene el ID de la localidad seleccionada.
        cargarBarriosPorLocalidad(localidadId); // Llama a la función para actualizar barrios.
    });

    // Maneja el envío del formulario para actualizar los datos del cliente.
    $('#clienteEditForm').on('submit', function(event) {
        event.preventDefault(); // Previene el envío predeterminado del formulario.

        const clienteData = {
            nombre: $('#nombreyapellido').val(),
            telefono: $('#telefono').val(),
            IDbarrio: $('#barrio').val(),
            direccion: $('#direccion').val()
        };

        // Envía los datos actualizados del cliente al servidor.
        $.ajax({
            url: `http://localhost:3000/cliente/${clienteId}`,
            type: 'PUT', // Método PUT para actualizar.
            contentType: 'application/json',
            data: JSON.stringify(clienteData),
            success: function(response) {
                Swal.fire('Éxito', 'Cliente actualizado correctamente.', 'success').then(() => {
                    // Redirige a la página de clientes después de la confirmación.
                    window.location.href = 'clientes.html';
                });
            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.error("Error al actualizar el cliente:", textStatus, errorThrown);
                Swal.fire('Error', 'No se pudo actualizar el cliente.', 'error');
            }
        });
    });
});

$(document).ready(function() {
    // Obtener el ID del barrio desde la URL
    const urlParams = new URLSearchParams(window.location.search);
    const barrioId = urlParams.get('id'); // Asegúrate de que el ID esté en la URL como ?id=valor

    let originalNombre;
    let originalIdLocalidad; // Variable para almacenar el ID de la localidad original

    // Cargar localidades en el dropdown
    $.get('http://localhost:3000/localidades', function(data) {
        data.forEach(localidad => {
            $('#localidad').append(new Option(localidad.localidad, localidad.ID));
        });

        // Cargar datos del barrio si se proporciona el ID
        if (barrioId) {
            $.get(`http://localhost:3000/barrios/${barrioId}`, function(data) {
                console.log("Datos del barrio recibidos:", data);

                originalNombre = data.nombre;
                originalIdLocalidad = data.IDlocalidad; // Almacena el ID de la localidad original

                $('#idbarrio').val(data.ID);
                $('#nombrebarrio').val(originalNombre);
                $('#localidad').val(originalIdLocalidad); // Selecciona la localidad correcta
            }).fail(function(jqXHR, textStatus, errorThrown) {
                console.error("Error en la solicitud para cargar los datos del barrio:", textStatus, errorThrown);
                Swal.fire('Error', 'No se pudo cargar los datos del barrio.', 'error');
            });
        } else {
            console.log("No se proporcionó un ID de barrio en la URL.");
        }
    }).fail(function() {
        console.error('Error al cargar las localidades.');
        Swal.fire('Error', 'No se pudieron cargar las localidades.', 'error');
    });

    // Maneja el envío del formulario para actualizar el barrio
    $('#barrioForm').submit(function(event) {
        event.preventDefault(); // Evita el envío tradicional del formulario

        const nombre = $('#nombrebarrio').val();
        const idLocalidad = $('#localidad').val(); // Obtiene el ID de la localidad seleccionada

        // Prepara los datos a actualizar
        let dataToUpdate = {};

        // Verifica si hay un cambio en el nombre o en la localidad
        if (nombre && nombre !== originalNombre) {
            dataToUpdate.nombre = nombre; // Solo actualiza el nombre
        }
        if (idLocalidad && idLocalidad !== originalIdLocalidad) {
            dataToUpdate.IDlocalidad = idLocalidad; // Actualiza el ID de la localidad
        }

        // Debug: Verifica los datos que se están enviando
        console.log("Datos a actualizar:", dataToUpdate);

        // Realiza la solicitud de actualización solo si hay cambios
        if (Object.keys(dataToUpdate).length > 0) {
            $.ajax({
                url: `http://localhost:3000/barrios/${barrioId}`,
                type: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify(dataToUpdate),
                success: function(response) {
                    console.log('Barrio actualizado con éxito.', response);
                    // Mostrar alerta de éxito
                    Swal.fire('Éxito', 'Barrio actualizado con éxito.', 'success').then(() => {
                        // Redirigir a lugares.html después de la actualización
                        window.location.href = 'lugares.html';
                    });
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    console.error("Error al actualizar el barrio:", textStatus, errorThrown);
                    Swal.fire('Error', 'No se pudo actualizar el barrio.', 'error');
                }
            });
        } else {
            console.log("No se detectaron cambios en el nombre o en la localidad.");
            Swal.fire('Aviso', 'No se detectaron cambios en el nombre o en la localidad.', 'info');
        }
    });
});

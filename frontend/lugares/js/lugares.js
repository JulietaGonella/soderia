$(document).ready(function () {
    // Llama a la API para obtener provincias (solo no eliminadas)
    $.get('http://localhost:3000/provincias?eliminado=false', function (data) {
        let tableBody = $('#provinciasTableBody');
        tableBody.empty(); // Limpia el contenido de la tabla
        data.forEach(function (provincia) {
            tableBody.append(
                `<tr>
                    <td>${provincia.ID}</td>
                    <td>${provincia.nombre}</td>
                    <td class="text-center">
                        <a href="editarprovincias.html?id=${provincia.ID}" class="btn btn-sm me-2 modificar">Modificar</a>
                        <button type="button" class="btn btn-danger btn-sm" data-id="${provincia.ID}" onclick="eliminarProvincia(this)">Eliminar</button>
                    </td>
                </tr>`
            );
        });

        // Inicializa DataTables después de llenar la tabla
        $('#tableprovicias').DataTable({
            "pageLength": 5,
            lengthMenu: [
                [5, 10, 25, 50],
                [5, 10, 25, 50]
            ],
            "language": {
                "url": "https://cdn.datatables.net/plug-ins/1.13.1/i18n/es-ES.json"
            }
        });
    });

    // Llama a la API para obtener localidades (solo no eliminadas)
    $.get('http://localhost:3000/localidades?eliminado=false', function (data) {
        let tableBody = $('#localidadesTableBody');
        tableBody.empty(); // Limpia el contenido de la tabla
        data.forEach(function (localidad) {
            tableBody.append(
                `<tr>
                    <td>${localidad.ID}</td>
                    <td>${localidad.localidad}</td>
                    <td>${localidad.provincia}</td>
                    <td class="text-center">
                        <a href="editarlocalidades.html?id=${localidad.ID}" class="btn btn-sm me-2 modificar">Modificar</a>
                        <button type="button" class="btn btn-danger btn-sm" data-id="${localidad.ID}" onclick="eliminarLocalidad(this)">Eliminar</button>
                    </td>
                </tr>`
            );
        });

        // Inicializa DataTables después de llenar la tabla
        $('#tablelocalidades').DataTable({
            "pageLength": 5,
            lengthMenu: [
                [5, 10, 25, 50],
                [5, 10, 25, 50]
            ],
            "language": {
                "url": "https://cdn.datatables.net/plug-ins/1.13.1/i18n/es-ES.json"
            }
        });
    });

    // Llama a la API para obtener barrios
    $.get('http://localhost:3000/barrios?eliminado=false', function (data) {
        let tableBody = $('#barriosTableBody');
        tableBody.empty(); // Limpia el contenido de la tabla
        data.forEach(function (barrio) {
            tableBody.append(
                `<tr>
                <td>${barrio.ID}</td>
                <td>${barrio.barrio}</td>
                <td>${barrio.localidad}</td>
                <td class="text-center">
                    <a href="editarbarrio.html?id=${barrio.ID}" class="btn btn-sm me-2 modificar">Modificar</a>
                    <button type="button" class="btn btn-danger btn-sm" data-id="${barrio.ID}" onclick="eliminarBarrio(this)">Eliminar</button>
                </td>
            </tr>`
            );
        });

        // Inicializa DataTables después de llenar la tabla
        $('#tablebarrios').DataTable({
            "pageLength": 5,
            lengthMenu: [
                [5, 10, 25, 50],
                [5, 10, 25, 50]
            ],
            "language": {
                "url": "https://cdn.datatables.net/plug-ins/1.13.1/i18n/es-ES.json"
            }
        });
    });

});

function eliminarProvincia(button) {
    const id = $(button).data('id');

    // Usar SweetAlert para confirmar la eliminación
    Swal.fire({
        title: '¿Estás seguro?',
        text: "Esta provincia será marcada como eliminada, pero podrás recuperarla más tarde.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            // Realizar la solicitud AJAX para eliminar la provincia
            $.ajax({
                url: `http://localhost:3000/provincias/${id}`,
                type: 'PUT',
                data: JSON.stringify({ eliminado: true }), // Cambiando el estado a eliminado
                contentType: 'application/json',
                success: function (response) {
                    // Mostrar mensaje de éxito y recargar la tabla
                    Swal.fire(
                        'Eliminado!',
                        'La provincia ha sido marcada como eliminada.',
                        'success'
                    ).then(() => {
                        location.reload(); // Recargar la página o volver a cargar los datos
                    });
                },
                error: function (xhr) {
                    Swal.fire(
                        'Error!',
                        'Error al eliminar la provincia: ' + xhr.responseText,
                        'error'
                    );
                }
            });
        }
    });
}

function eliminarLocalidad(button) {
    const id = $(button).data('id');

    // Usar SweetAlert para confirmar la eliminación
    Swal.fire({
        title: '¿Estás seguro?',
        text: "Esta localidad será marcada como eliminada, pero podrás recuperarla más tarde.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            // Realizar la solicitud AJAX para eliminar la localidad
            $.ajax({
                url: `http://localhost:3000/localidades/${id}`,
                type: 'PUT',
                data: JSON.stringify({ eliminado: true }), // Cambiando el estado a eliminado
                contentType: 'application/json',
                success: function (response) {
                    // Mostrar mensaje de éxito y recargar la tabla
                    Swal.fire(
                        'Eliminado!',
                        'La localidad ha sido marcada como eliminada.',
                        'success'
                    ).then(() => {
                        location.reload(); // Recargar la página o volver a cargar los datos
                    });
                },
                error: function (xhr) {
                    Swal.fire(
                        'Error!',
                        'Error al eliminar la localidad: ' + xhr.responseText,
                        'error'
                    );
                }
            });
        }
    });
}

function eliminarBarrio(button) {
    const id = $(button).data('id');

    // Usar SweetAlert para confirmar la eliminación
    Swal.fire({
        title: '¿Estás seguro?',
        text: "Este barrio será marcado como eliminado, pero podrás recuperarlo más tarde.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            // Realizar la solicitud AJAX para eliminar el barrio
            $.ajax({
                url: `http://localhost:3000/barrios/${id}`,
                type: 'PUT',
                data: JSON.stringify({ eliminado: true }), // Cambiando el estado a eliminado
                contentType: 'application/json',
                success: function (response) {
                    // Mostrar mensaje de éxito y recargar la tabla
                    Swal.fire(
                        'Eliminado!',
                        'El barrio ha sido marcado como eliminado.',
                        'success'
                    ).then(() => {
                        location.reload(); // Recargar la página o volver a cargar los datos
                    });
                },
                error: function (xhr) {
                    Swal.fire(
                        'Error!',
                        'Error al eliminar el barrio: ' + xhr.responseText,
                        'error'
                    );
                }
            });
        }
    });
}

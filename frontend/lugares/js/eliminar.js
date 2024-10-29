$(document).ready(function () {
    // Cargar las provincias eliminadas
    $.get('http://localhost:3000/provincias?eliminado=true', function (data) {
        let tableBody = $('#provinciasTableBody');
        tableBody.empty(); // Limpia el contenido de la tabla

        // Verifica si hay datos y crea las filas de la tabla
        if (data.length > 0) {
            data.forEach(function (provincia) {
                tableBody.append(
                    `<tr>
                        <td>${provincia.ID}</td>
                        <td>${provincia.nombre}</td>
                        <td class="text-center">
                            <button type="button" class="btn btn-danger btn-sm" data-id="${provincia.ID}" onclick="restaurarProvincia(this)">Restaurar</button>
                        </td>
                    </tr>`
                );
            });
        }

        // Inicializa DataTables después de llenar la tabla de provincias
        $('#tableprovinciase').DataTable({
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

    // Cargar las localidades eliminadas
    $.get('http://localhost:3000/localidades?eliminado=true', function (data) {
        const tbody = $('#localidadesTableBody');
        tbody.empty(); // Limpia el cuerpo de la tabla

        // Verifica si hay datos y crea las filas de la tabla
        if (data.length > 0) {
            data.forEach(function (localidad) {
                tbody.append(
                    `<tr>
                        <td>${localidad.ID}</td>
                        <td>${localidad.localidad}</td>
                        <td>${localidad.provincia}</td>
                        <td class="text-center">
                            <button type="button" class="btn btn-danger btn-sm" data-id="${localidad.ID}" onclick="restaurarLocalidad(this)">Restaurar</button>
                        </td>
                    </tr>`
                );
            });
        }

        // Inicializa DataTables después de llenar la tabla de localidades
        $('#tablelocalidadeseliminadas').DataTable({
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

    // Carga los barrios eliminados
    $.get('http://localhost:3000/barrios?eliminado=true', function (data) {
        let tableBody = $('#eliminadosBarriosTableBody');
        tableBody.empty(); // Limpia el contenido de la tabla
        if (data.length > 0) {
            data.forEach(function (barrio) {
                tableBody.append(
                    `<tr>
                        <td>${barrio.ID}</td>
                        <td>${barrio.barrio}</td>
                        <td>${barrio.localidad}</td>
                        <td class="text-center">
                            <button type="button" class="btn btn-danger btn-sm" data-id="${barrio.ID}" onclick="restaurarBarrio(this)">Restaurar</button>
                        </td>
                    </tr>`
                );
            });
        }

        // Inicializa DataTables después de llenar la tabla de barrios
        $('#tablebarrioseliminados').DataTable({
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

// Funciones de restauración (sin cambios)
function restaurarProvincia(button) {
    const id = $(button).data('id');
    Swal.fire({
        title: '¿Estás seguro?',
        text: "Esta provincia será restaurada y ya no estará eliminada.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, restaurar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: `http://localhost:3000/provincias/${id}`,
                type: 'PUT',
                data: JSON.stringify({ eliminado: false }),
                contentType: 'application/json',
                success: function (response) {
                    Swal.fire('Restaurado!', 'La provincia ha sido restaurada.', 'success').then(() => {
                        location.reload();
                    });
                },
                error: function (xhr) {
                    Swal.fire('Error!', 'Error al restaurar la provincia: ' + xhr.responseText, 'error');
                }
            });
        }
    });
}

function restaurarLocalidad(button) {
    const id = $(button).data('id');
    Swal.fire({
        title: '¿Estás seguro?',
        text: "Esta localidad será restaurada y ya no estará eliminada.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, restaurar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: `http://localhost:3000/localidades/${id}`,
                type: 'PUT',
                data: JSON.stringify({ eliminado: false }),
                contentType: 'application/json',
                success: function (response) {
                    Swal.fire('Restaurada!', 'La localidad ha sido restaurada.', 'success').then(() => {
                        location.reload();
                    });
                },
                error: function (xhr) {
                    Swal.fire('Error!', 'Error al restaurar la localidad: ' + xhr.responseText, 'error');
                }
            });
        }
    });
}

function restaurarBarrio(button) {
    const id = $(button).data('id');
    Swal.fire({
        title: '¿Estás seguro?',
        text: "Este barrio será restaurado.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, restaurar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: `http://localhost:3000/barrios/${id}`,
                type: 'PUT',
                data: JSON.stringify({ eliminado: false }),
                contentType: 'application/json',
                success: function (response) {
                    Swal.fire('Restaurado!', 'El barrio ha sido restaurado.', 'success').then(() => {
                        location.reload();
                    });
                },
                error: function (xhr) {
                    Swal.fire('Error!', 'Error al restaurar el barrio: ' + xhr.responseText, 'error');
                }
            });
        }
    });
}

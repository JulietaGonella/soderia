document.addEventListener('DOMContentLoaded', () => {  
    const form = document.getElementById('registro-form');

    // Restablecer el formulario para que todos los campos estén vacíos
    form.reset();

    // Asegurarse de que los campos de email y contraseña estén vacíos
    document.getElementById('email').value = '';
    document.getElementById('contraseña').value = '';

    // Llamada para obtener los roles
    fetch('http://localhost:3000/roles')
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la respuesta de la red');
            }
            return response.json();
        })
        .then(data => {
            const rolSelect = document.getElementById('rol');
            data.forEach(rol => {
                const option = document.createElement('option');
                option.value = rol.ID; // Asegúrate de que el ID es el campo correcto
                option.textContent = rol.nombre; // El nombre del rol
                rolSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error al obtener roles:', error);
            Swal.fire('Error', 'No se pudieron cargar los roles', 'error');
        });

    // Manejar el envío del formulario
    form.addEventListener('submit', async (event) => {
        event.preventDefault(); // Evitar el comportamiento predeterminado del formulario

        const nombre = document.getElementById('nombre').value;
        const email = document.getElementById('email').value;
        const contraseña = document.getElementById('contraseña').value;
        const rol = document.getElementById('rol').value;

        // Verificar si todos los campos son válidos
        if (!nombre || !email || !contraseña || !rol) {
            Swal.fire('Error', 'Todos los campos son obligatorios.', 'error');
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/usuarios', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ nombre, email, contraseña, rol }),
            });

            if (response.ok) {
                Swal.fire('Éxito', 'Usuario registrado exitosamente', 'success').then(() => {
                    form.reset(); // Limpiar campos del formulario después del registro
                    window.location.href = 'usuario.html'; // Redirigir a la página de usuarios
                });
            } else {
                Swal.fire('Error', 'Error al registrar el usuario', 'error');
            }
        } catch (error) {
            console.error('Error al registrar usuario:', error);
            Swal.fire('Error', 'Error en la comunicación con el servidor.', 'error');
        }
    });
});

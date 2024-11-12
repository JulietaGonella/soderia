// Agrega un evento 'click' al botón con id 'entrarButton'
// para iniciar el proceso de autenticación cuando el usuario hace clic.
document.getElementById('entrarButton').addEventListener('click', async function() {  
    // Obtiene el valor ingresado en el campo de correo electrónico.
    const email = document.getElementById('exampleInputEmail1').value;
    // Obtiene el valor ingresado en el campo de contraseña.
    const password = document.getElementById('exampleInputPassword1').value;
    // Selecciona el elemento que muestra los mensajes de error.
    const errorMessage = document.getElementById('error-message');
    
    // Limpiar el mensaje de error antes de intentar iniciar sesión.
    errorMessage.textContent = '';

    try {
        // Realiza una solicitud de inicio de sesión al servidor.
        const response = await fetch('http://localhost:3000/login', {
            method: 'POST', // Configura el método HTTP como POST.
            headers: {
                'Content-Type': 'application/json', // Define el tipo de contenido como JSON.
            },
            body: JSON.stringify({ email, password }), // Envia los datos de correo y contraseña.
            credentials: 'include' // Asegura que las cookies de sesión se envíen.
        });
        
        // Convierte la respuesta en formato JSON.
        const data = await response.json();

        if (data.success) {
            // Si el inicio de sesión es exitoso, redirige al usuario al panel de control.
            window.location.href = '../PaneldeControl/Panelcontrol.html';
        } else {
            // Si el inicio de sesión falla, muestra un mensaje de error.
            errorMessage.textContent = 'Correo o contraseña incorrectos';
        }
    } catch (error) {
        // Si ocurre un error durante el proceso de inicio de sesión, lo muestra en consola
        // y presenta un mensaje de error al usuario.
        console.error('Error en el inicio de sesión:', error);
        errorMessage.textContent = 'Error en el servidor. Intente más tarde.';
    }
});

document.addEventListener('DOMContentLoaded', function () {
    //Estructura para almacenar mensajes por usuario
    const mensajesPorUsuario = {
        'Usuario 1': [],
        'Usuario 2': [],
        'Grupo 1': [],
        'Grupo 2': []
    };

    //Estructura para almacenar miembros de grupos
    const miembrosDeGrupo = {
        'Grupo 1': ['Miembro 1', 'Miembro 2'],
        'Grupo 2': ['Miembro 2', 'Miembro 1']
    };

    const usuarios = document.querySelectorAll('.nav-link');
    let usuarioActual = null; 

    const enviarFormulario = document.getElementById('enviarMsj');
    const inputMensaje = document.getElementById('mensaje');
    const btnEnviar = document.getElementById('btnEnviar');
    const contenedorChat = document.getElementById('chatContainer');
    const btnSubirImagen = document.querySelector('button[data-bs-toggle="modal"]');

    //Deshabilitar input, enviar y foto hasta que seleccione un usuario
    inputMensaje.disabled = true;
    btnEnviar.disabled = true;
    btnSubirImagen.disabled = true;

    //Para actualizar un chat cuando se selecciona nuevo usuario
    function actualizarChat(nombre, imagenUrl) {
        usuarioActual = nombre;

        const usuarioActualElemento = document.getElementById('usuarioActual');
        const miembrosHTML = miembrosDeGrupo[nombre] ? mostrarMiembros(miembrosDeGrupo[nombre]) : '';

        usuarioActualElemento.innerHTML = `
            <img src="${imagenUrl}" alt="" width="32" height="32" class="rounded-circle me-2">
            <strong class="text-white">${nombre}</strong> ${miembrosHTML}
        `;

        //Borra contenido del chat para que no aparezcan los msj de otro chat
        contenedorChat.innerHTML = '';

        //Mostrar los mensajes del nuevo usuario/grupo
        mensajesPorUsuario[nombre].forEach(mensaje => {
            const mensajeElemento = crearMensajeElemento(mensaje);
            contenedorChat.appendChild(mensajeElemento);
        });

        contenedorChat.scrollTop = contenedorChat.scrollHeight; //Scroll automático 
    }

    //Mostrar miembros en una sola línea
    function mostrarMiembros(miembros) {
        let miembrosHTML = '<ul class="list-inline mb-0 text-white">';
        miembros.forEach((miembro, index) => {
            if (index !== 0) {
                miembrosHTML += ', ';
            }
            miembrosHTML += `<li class="list-inline-item text-white">${miembro}</li>`;
        });
        miembrosHTML += '</ul>';
        return miembrosHTML;
    }

    //Crear mensaje
    function crearMensajeElemento(mensaje) {
        const mensajeElemento = document.createElement('div');
        if (mensaje.remitente === 'Usuario Actual') {
            mensajeElemento.classList.add('chat-message', 'user-message');
        } else {
            mensajeElemento.classList.add('chat-message', 'other-message');
        }

        if (mensaje.esImagen) {
            mensajeElemento.innerHTML = `
                <img src="https://github.com/mdo.png" alt="" width="32" height="32" class="rounded-circle me-2">
                <img src="${mensaje.mensaje}" alt="Imagen subida" style="max-width: 200px;">
            `;
        } else {
            mensajeElemento.innerHTML = `
                <img src="https://github.com/mdo.png" alt="" width="32" height="32" class="rounded-circle me-2">
                ${mensaje.mensaje}
            `;
        }

        return mensajeElemento;
    }

    //Evento de click para los usuarios y grupos
    usuarios.forEach(usuario => {
        usuario.addEventListener('click', function (e) {
            e.preventDefault();

            //Remover la clase activa de todos los usuarios
            usuarios.forEach(u => u.classList.remove('active'));

            //Agregar la clase activa al usuario seleccionado
            this.classList.add('active');

            const nombre = this.getAttribute('data-usuario');
            const imagenUrl = this.getAttribute('data-imagen');

            actualizarChat(nombre, imagenUrl);

            //Habilitar input, botón y foto
            inputMensaje.disabled = false;
            btnEnviar.disabled = false;
            btnSubirImagen.disabled = false;
        });
    });

    //Evento para enviar mensaje
    enviarFormulario.addEventListener('submit', function (e) {
        e.preventDefault(); //Evitar que el formulario se envíe y recargue la página

        if (!usuarioActual) {
            alert('Selecciona un usuario o grupo para enviar mensajes.');
            return;
        }

        let mensaje = inputMensaje.value.trim();
        if (mensaje !== '') {
            agregarMensaje('Usuario Actual', usuarioActual, mensaje); //'Usuario Actual' es el remitente
            inputMensaje.value = ''; //Limpiar el input después de enviar el mensaje
        }
    });

    //Evento para subir la imagen
    const formularioSubida = document.querySelector('#cargarModal form');
    formularioSubida.addEventListener('submit', function (e) {
        e.preventDefault();

        const inputArchivo = document.getElementById('formFileSm');
        if (inputArchivo.files.length === 0) {
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Por favor selecciona una imagen para subir."
            });
            return;
        }

        const formData = new FormData(formularioSubida);
        const imagenUrl = URL.createObjectURL(formData.get('image'));

        agregarMensaje('Usuario Actual', usuarioActual, imagenUrl, true);

        //Cerrar el modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('cargarModal'));
        modal.hide();

        //Limpiar input 
        inputArchivo.value = '';
    });

    //Agregar un mensaje al contenedor de chat y almacenarlo en la estructura de datos
    function agregarMensaje(usuarioRemitente, usuarioDestinatario, mensaje, esImagen = false) {
        mensajesPorUsuario[usuarioDestinatario].push({ remitente: usuarioRemitente, mensaje, esImagen });

        if (usuarioDestinatario === usuarioActual) {
            const mensajeElemento = crearMensajeElemento({ remitente: usuarioRemitente, mensaje, esImagen });
            contenedorChat.appendChild(mensajeElemento);
            contenedorChat.scrollTop = contenedorChat.scrollHeight; //Scroll automático hacia abajo
        }
    }
});

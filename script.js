function onSubmitCaptcha(token) {
    document.getElementById('h-captcha-response').value = token;
}

document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("form");
    const container = document.querySelector(".container");
    const errorMessage = document.getElementById("errorMessage");
    const validationCodeInput = document.getElementById("validationCode");
    const attentionDateInput = document.getElementById("attentionDate");
    const captchaResponseInput = document.getElementById("h-captcha-response");
    const submitButton = form.querySelector("button[type=submit]");

    //let URL_FETCH = 'https://stage-telemedicina.ms.gba.gov.ar/api/validador-documentos/validate-codigo-documento';
    let URL_FETCH = 'http://localhost:8610/api/validador-documentos/validate-codigo-documento';
    let URL_CALLBACK = 'https://josezapana.github.io/telemedicina-landing/landingMiSaludDigital.html';
    // SE AGREGA LINK DE DESCARGA DE DOCUMENTO
    let URL_DOWNLOAD_DOCUMENT = 'http://localhost:8610/api/pdf/v1/certificado-ciudadano';
    // ---------------------------------------
    function validateForm() {
        const isValidationCodeFilled = validationCodeInput.value.trim() !== "";
        const isAttentionDateFilled = attentionDateInput.value.trim() !== "";
        const isCaptchaCompleted = captchaResponseInput.value.trim() !== "";

        submitButton.disabled = !(isValidationCodeFilled && isAttentionDateFilled && isCaptchaCompleted);
    }

    validationCodeInput.addEventListener("input", validateForm);
    attentionDateInput.addEventListener("input", validateForm);

    window.onSubmitCaptcha = function (token) {
        captchaResponseInput.value = token;
        validateForm();
    };

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        errorMessage.classList.add("d-none");
        errorMessage.textContent = "";

        const validationCode = document.getElementById("validationCode").value;
        const attentionDate = document.getElementById("attentionDate").value;
        const captchaResponse = document.getElementById("h-captcha-response").value;

        try {
            const response = await fetch(URL_FETCH + `?validationCode=${validationCode}&attentionDate=${attentionDate}&captchaResponse=${captchaResponse}`, {
                method: "GET",
                headers: {
                    'Sec-Fetch-Site': 'same-site'  // El encabezado es generado por el navegador.
                  },
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            const result = await response.json();

            form.style.display = "none";
            if (result.estado === "SUCCESS") {
                const infoDiv = document.createElement("div");
                infoDiv.className = "container-valido";

                infoDiv.innerHTML = `
                    <h1 class="titulo-valido">Documento válido</h1>
                    <p class="texto">El documento es válido</p>
                    <div class="informacion-valido">
                        <p>${result.descripcion}</p>
                        <p>Tipo: DNI ${result.dniPaciente}</p>
                        <p>${result.tipoDocumento}</p>
                        <p>Profesional: ${result.nombreApellidoMedico}</p>
                        <p>Matrícula: ${result.matriculaProfesional}</p>
                    </div>
                    // SE AGREGA ENLACE PARA DESCARGA DE DOCUMENTO
                    <p class="link-descarga my-2" id="linkDownloadDocument">Descargar documento</p>
                    // -------------------------------------------
                    <a class="text-decoration-none text-white btn btn-aceptar mt-1" href=${URL_CALLBACK}>Aceptar</a>
                    <a class="color-link mt-1" href=${URL_CALLBACK}>Volver atrás</a>
                    `;

                container.appendChild(infoDiv);

                // LLAMADO A LA FUNCION DE DESCARGA
                document.getElementById("linkDownloadDocument").addEventListener("click", () => {
                  fetch(URL_DOWNLOAD_DOCUMENT, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ idDocumentoEnviado: result.idDocumento })
                  })
                  .then(response => response.blob())
                  .then(blob => {
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "documento.pdf";
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    window.URL.revokeObjectURL(url);
                  })
                  .catch(err => {
                    console.error("Error al descargar documento:", err);
                  });
                });
            } else {
                const errorDiv = `
                    <div class="container-invalido">
                        <h1 class="titulo-invalido">Documento no válido.</h1>
                        <p class="texto">El código ingresado no corresponde a un documento válido.</p>
                            <a class="text-decoration-none text-white btn btn-aceptar" href=${URL_CALLBACK}>Aceptar</a>
                            <a class="color-link mt-1" href=${URL_CALLBACK}>Volver atrás</a>
                    </div>`;

                container.insertAdjacentHTML("beforeend", errorDiv);
            }
        } catch (err) {
            errorMessage.textContent = "Hubo un problema en el servidor. Inténtalo nuevamente más tarde.";
            errorMessage.classList.remove("d-none");
            console.error(err);
        }
    });
});

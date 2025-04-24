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

    let URL_FETCH = 'https://sistemas-desa.ms.gba.gov.ar/api/validador-documentos/validate-codigo-documento';
    let URL_CALLBACK = 'https://josezapana.github.io/telemedicina-landing/landingMiSaludDigital.html';
    let URL_DOWNLOAD_DOCUMENT = 'https://sistemas-desa.ms.gba.gov.ar/api/validador-pdf/v1/validador-certificado-ciudadano';
    
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
                    'Sec-Fetch-Site': 'same-site'
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

                    <a href="#" class="link-descarga my-2" id="linkDownloadDocument">Descargar documento</a>
                    <a class="text-decoration-none text-white btn btn-aceptar mt-1" href=${URL_CALLBACK}>Aceptar</a>
                    <a class="color-link mt-1" href=${URL_CALLBACK}>Volver atrás</a>
                    `;

                container.appendChild(infoDiv);

                const linkDownload = document.getElementById("linkDownloadDocument");
                linkDownload.addEventListener("click", (e) => {
                    e.preventDefault();
                    const downloadUrl = `${URL_DOWNLOAD_DOCUMENT}?idDocumentoEnviado=${result.idDocumento}`;
                
                    const link = document.createElement("a");
                    link.href = downloadUrl;
                    link.download = "";
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
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

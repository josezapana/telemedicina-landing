document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("form");
    const container = document.querySelector(".container");

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const formData = new FormData(form);

        try {
            const response = await fetch("http://localhost:8702/api/validador-documentos/validate-codigo-documento", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            const result = await response.json();

            form.style.display = "none";
            if (result.estado === "SUCCESS") {
                const infoDiv = document.createElement("div");
                infoDiv.className = "alert alert-success mt-3";

                infoDiv.innerHTML = `
                    <h1>Documento válido</h1>
                    <p>El documento es válido</p>
                    <p>${result.descripcion}</p>
                    <p><strong>Tipo:</strong> ${result.dniPaciente}</p>
                    <p>${result.tipoDocumento}</p>
                    <p><strong>Profesional:</strong> ${result.nombreApellidoMedico}</p>
                    <p><strong>Matrícula:</strong> ${result.matriculaProfesional}</p>

                    <a class="text-decoration-none text-white btn btn-primary" href="https://josezapana.github.io/telemedicina-landing/landingMiSaludDigital.html">Aceptar</a>
                    `;

                container.appendChild(infoDiv);
            } else {
                const errorDiv = `
                    <div class="alert alert-danger mt-3">
                        <h1>Documento no válido.</h1>
                        <p>El código ingresado no corresponde a un documento válido.</p>
                            <a class="text-decoration-none text-white btn btn-primary" href="https://josezapana.github.io/telemedicina-landing/landingMiSaludDigital.html">Aceptar</a>
                    </div>`;

                container.insertAdjacentHTML("beforeend", errorDiv);
            }
        } catch (err) {
            console.error(err);
        }
    });
});

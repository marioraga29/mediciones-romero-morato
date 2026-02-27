const datosPartidas = {
    "Pladur": ["12 mm", "15 mm", "Techo Continuo", "Trasdosado", "Tabiquería"],
    "Yeso": ["Proyectado", "A buena vista", "Maestreado", "Guarnecido"],
    "Perlita": ["Acabado Blanco", "Acabado Gris", "Fino"],
    "Mortero": ["M-5 Graneado", "Hidrófugo", "Monocapa", "Enlucido"],
    "Limpieza": ["General Obra", "Retirada Escombros"]
};

window.onload = () => {
    document.getElementById('fecha').value = new Date().toISOString().split('T')[0];
    agregarFila(); // Primera fila inicial
};

function agregarFila() {
    const tabla = document.getElementById('filas-medicion');
    const nuevaFila = tabla.insertRow();

    let opcionesTipo = '<option value="">Tipo...</option>';
    for (let tipo in datosPartidas) {
        opcionesTipo += `<option value="${tipo}">${tipo}</option>`;
    }

    nuevaFila.innerHTML = `
        <td>
            <select class="tipo-material" onchange="actualizarSubtipos(this)">${opcionesTipo}</select>
            <select class="subtipo-material" disabled style="margin-top:5px; font-size:0.85rem;"><option value="">Subtipo...</option></select>
        </td>
        <td><input type="number" class="ancho" step="0.01" placeholder="0.00" oninput="calcularFila(this)"></td>
        <td style="text-align:center; font-weight:bold; color:#ccc;">x</td>
        <td><input type="number" class="alto" step="0.01" placeholder="0.00" oninput="calcularFila(this)"></td>
        <td class="total-fila">0.00</td>
        <td style="text-align:center;"><button type="button" class="btn-delete" onclick="eliminarFila(this)">×</button></td>
    `;
}

function eliminarFila(btn) {
    const filas = document.querySelectorAll('#filas-medicion tr');
    if (filas.length > 1) {
        btn.closest('tr').remove();
    } else {
        alert("Debe haber al menos una partida en la medición.");
    }
}

function actualizarSubtipos(selectTipo) {
    const fila = selectTipo.closest('tr');
    const selectSubtipo = fila.querySelector('.subtipo-material');
    const tipo = selectTipo.value;

    if (tipo && datosPartidas[tipo]) {
        selectSubtipo.disabled = false;
        let html = '<option value="">Selecciona...</option>';
        datosPartidas[tipo].forEach(s => html += `<option value="${s}">${s}</option>`);
        selectSubtipo.innerHTML = html;
    } else {
        selectSubtipo.disabled = true;
        selectSubtipo.innerHTML = '<option value="">Subtipo...</option>';
    }
}

function calcularFila(input) {
    const fila = input.closest('tr');
    const ancho = parseFloat(fila.querySelector('.ancho').value) || 0;
    const alto = parseFloat(fila.querySelector('.alto').value) || 0;
    fila.querySelector('.total-fila').innerText = (ancho * alto).toFixed(2);
}

// Función auxiliar para cargar la imagen y devolver una Promesa
function cargarImagen(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = url;
        img.onload = () => resolve(img);
        img.onerror = (e) => reject(e);
    });
}

async function generarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    try {
        // --- ESPERAR CARGA DEL LOGO ---
        const logo = await cargarImagen('logo.png');

        const obra = document.getElementById('obra').value || "SIN NOMBRE";
        const trabajador = document.getElementById('trabajador').value || "NO ESPECIFICADO";
        const fecha = document.getElementById('fecha').value;

        // --- CABECERA ---
        doc.setDrawColor(0); 
        doc.setLineWidth(0.6); // Línea de cabecera un poco más gruesa
        doc.line(14, 40, 196, 40); 

        doc.setTextColor(0);
        doc.setFontSize(20);
        doc.setFont(undefined, 'bold');
        doc.text("ROMERO MORATO", 14, 20);
        
        doc.setFontSize(8);
        doc.setFont(undefined, 'normal');
        doc.text("REVESTIMIENTOS Y SOLUCIONES ROMERO, S.L.U.", 14, 27);
        doc.setTextColor(80); 
        doc.text("C/ CHAPARRAL Nº 2, PUERTO SERRANO (CÁDIZ) | C.P.: 11659", 14, 32);
        doc.text("C.I.F.: B-72378631 | TEL.: 656 978 003", 14, 36);

        // --- LOGO ---
        doc.addImage(logo, 'PNG', 150, 5, 45, 30);

        // --- DATOS PROYECTO ---
        doc.setTextColor(0);
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.text("DATOS DE LA MEDICIÓN", 14, 50);
        
        doc.setFont(undefined, 'normal');
        doc.text(`OBRA:`, 14, 58);
        doc.setFont(undefined, 'bold');
        doc.text(`${obra.toUpperCase()}`, 35, 58);
        
        doc.setFont(undefined, 'normal');
        doc.text(`TRABAJADOR:`, 14, 64);
        doc.text(`${trabajador.toUpperCase()}`, 45, 64);
        
        doc.text(`FECHA:`, 150, 58);
        doc.text(`${fecha}`, 165, 58);

        const filasPDF = [];
        document.querySelectorAll('#filas-medicion tr').forEach(fila => {
            const t = fila.querySelector('.tipo-material').value;
            const s = fila.querySelector('.subtipo-material').value;
            const anc = parseFloat(fila.querySelector('.ancho').value) || 0;
            const alt = parseFloat(fila.querySelector('.alto').value) || 0;
            const tot = anc * alt;

            if (t && s) {
                filasPDF.push([
                    `${t.toUpperCase()} \n${s}`,
                    anc.toFixed(2), 
                    "x", 
                    alt.toFixed(2), 
                    `${tot.toFixed(2)} m²`
                ]);
            }
        });

        if (filasPDF.length === 0) {
            alert("Por favor, rellena al menos una partida completa.");
            return;
        }

        // --- TABLA CON BORDES MÁS VISIBLES ---
        doc.autoTable({
            startY: 75,
            head: [['CONCEPTO / PARTIDA', 'ANCHO', '', 'ALTO', 'TOTAL']],
            body: filasPDF,
            theme: 'grid', 
            headStyles: { 
                fillColor: [255, 255, 255],
                textColor: [0, 0, 0],
                lineColor: [0, 0, 0], // Bordes de cabecera negros
                lineWidth: 0.3,
                fontStyle: 'bold',
                halign: 'center'
            },
            styles: {
                lineColor: [120, 120, 120], // Gris más oscuro para que se vea mejor
                lineWidth: 0.2,            // Grosor de línea aumentado
                textColor: [0, 0, 0],
                fontSize: 9,
                cellPadding: 3
            },
            columnStyles: {
                0: { cellWidth: 80 },
                1: { halign: 'center' },
                2: { halign: 'center', textColor: [120, 120, 120] }, // 'x' en el mismo gris que los bordes
                3: { halign: 'center' },
                4: { halign: 'right', fontStyle: 'bold' }
            },
            margin: { top: 75 }
        });

        const pageCount = doc.internal.getNumberOfPages();
        for(let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(120);
            doc.text(`Página ${i} de ${pageCount}`, 196, 285, { align: 'right' });
        }

        doc.save(`Medicion_${obra}.pdf`);

    } catch (error) {
        console.error("Error:", error);
        alert("Error al generar el PDF. Revisa el logo.");
    }
}
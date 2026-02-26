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

function generarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const obra = document.getElementById('obra').value || "SIN NOMBRE";
    const trabajador = document.getElementById('trabajador').value || "NO ESPECIFICADO";
    const fecha = document.getElementById('fecha').value;

    // --- CABECERA PROFESIONAL ---
    doc.setFillColor(44, 62, 80);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.setFont(undefined, 'bold');
    doc.text("ROMERO MORATO", 14, 20);
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.text("REVESTIMIENTOS Y SOLUCIONES ROMERO, S.L.U.", 14, 28);
    doc.text("C/ CHAPARRAL Nº 2, PUERTO SERRANO (CÁDIZ) | 656 978 003", 14, 33);

    // --- DATOS PROYECTO ---
    doc.setTextColor(40);
    doc.setFontSize(11);
    doc.text(`OBRA: ${obra.toUpperCase()}`, 14, 50);
    doc.text(`TRABAJADOR: ${trabajador.toUpperCase()}`, 14, 57);
    doc.text(`FECHA: ${fecha}`, 150, 50);

    const filasPDF = [];
    let sumaTotal = 0;

    document.querySelectorAll('#filas-medicion tr').forEach(fila => {
        const t = fila.querySelector('.tipo-material').value;
        const s = fila.querySelector('.subtipo-material').value;
        const anc = parseFloat(fila.querySelector('.ancho').value) || 0;
        const alt = parseFloat(fila.querySelector('.alto').value) || 0;
        const tot = anc * alt;
        
        if (t && s) {
            sumaTotal += tot;
            filasPDF.push([`${t} - ${s}`, anc.toFixed(2), "x", alt.toFixed(2), `${tot.toFixed(2)} m²`]);
        }
    });

    if (filasPDF.length === 0) {
        alert("Por favor, rellena al menos una partida completa.");
        return;
    }

    doc.autoTable({
        startY: 65,
        head: [['CONCEPTO / PARTIDA', 'ANCHO', '', 'ALTO', 'TOTAL']],
        body: filasPDF,
        theme: 'striped',
        headStyles: { fillColor: [44, 62, 80], halign: 'center' },
        columnStyles: { 
            0: { cellWidth: 80 }, 
            1: { halign: 'center' }, 
            2: { halign: 'center', textColor: [150, 150, 150] }, 
            3: { halign: 'center' }, 
            4: { halign: 'right', fontStyle: 'bold' } 
        }
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');

    doc.save(`Medicion_${obra}.pdf`);
}
const datosPartidas = {
    "Pladur": ["12 mm", "15 mm", "Techo Continuo", "Trasdosado", "Tabiquería"],
    "Yeso": ["Proyectado", "A buena vista", "Maestreado", "Guarnecido"],
    "Perlita": ["Acabado Blanco", "Acabado Gris", "Fino"],
    "Mortero": ["M-5 Graneado", "Hidrófugo", "Monocapa", "Enlucido"],
    "Limpieza": ["General Obra", "Retirada Escombros"]
};

let mostrarCostes = false;

window.onload = () => {
    document.getElementById('fecha').value = new Date().toISOString().split('T')[0];
    agregarFila(); 
};

function agregarFila() {
    const tabla = document.getElementById('filas-medicion');
    const nuevaFila = tabla.insertRow();
    let opcionesTipo = '<option value="">Tipo...</option>';
    for (let tipo in datosPartidas) {
        opcionesTipo += `<option value="${tipo}">${tipo}</option>`;
    }
    
    const displayStyle = mostrarCostes ? 'table-cell' : 'none';

    nuevaFila.innerHTML = `
        <td>
            <select class="tipo-material" onchange="actualizarSubtipos(this)">${opcionesTipo}</select>
            <select class="subtipo-material" disabled style="margin-top:5px; font-size:0.85rem;"><option value="">Subtipo...</option></select>
        </td>
        <td style="text-align:center;"><input type="number" class="ancho" step="0.01" placeholder="0.00" oninput="calcularFila(this)" style="width:70px;"></td>
        
        <td style="text-align:center; font-weight:bold; color:#ccc; width: 30px; min-width: 30px;">x</td>
        
        <td style="text-align:center;"><input type="number" class="alto" step="0.01" placeholder="0.00" oninput="calcularFila(this)" style="width:70px;"></td>
        
        <td class="total-fila" style="text-align:right; font-weight:bold; padding-right:10px;">0.00</td>
        <td class="col-costes" style="display:${displayStyle}; text-align:right;">
            <input type="number" class="precio-unitario" step="0.01" placeholder="0.00" oninput="calcularFila(this)" style="width:70px; text-align:right;">
        </td>
        <td class="col-costes importe-fila" style="display:${displayStyle}; text-align:right; font-weight:bold; padding-right:10px;">0.00</td>
        <td style="text-align:center;"><button type="button" class="btn-delete" onclick="eliminarFila(this)">x</button></td>
    `;
}

function activarCostes() {
    mostrarCostes = !mostrarCostes;
    const columnas = document.querySelectorAll('.col-costes');
    const footer = document.getElementById('footer-costes');
    const btn = document.getElementById('btnActivarCostes');

    columnas.forEach(col => col.style.display = mostrarCostes ? 'table-cell' : 'none');
    footer.style.display = mostrarCostes ? 'table-footer-group' : 'none';
    
    btn.innerHTML = mostrarCostes ? "❌ QUITAR PRECIOS" : "💰 AÑADIR COSTES";
    btn.style.background = mostrarCostes ? "#e74c3c" : "#27ae60";

    actualizarTotalGeneral();
}

function eliminarFila(btn) {
    const filas = document.querySelectorAll('#filas-medicion tr');
    if (filas.length > 1) {
        btn.closest('tr').remove();
        actualizarTotalGeneral();
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
    const totalM2 = ancho * alto;
    fila.querySelector('.total-fila').innerText = totalM2.toFixed(2);

    if (mostrarCostes) {
        const precio = parseFloat(fila.querySelector('.precio-unitario').value) || 0;
        const importe = totalM2 * precio;
        fila.querySelector('.importe-fila').innerText = importe.toFixed(2);
        actualizarTotalGeneral();
    }
}

function actualizarTotalGeneral() {
    let total = 0;
    if (mostrarCostes) {
        document.querySelectorAll('.importe-fila').forEach(celda => {
            total += parseFloat(celda.innerText) || 0;
        });
    }
    document.getElementById('total-dinero').innerText = total.toFixed(2) + " €";
}

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
        const logo = await cargarImagen('logo.png');

        const numDoc = document.getElementById('numDocumento').value || "---";
        const obra = document.getElementById('obra').value || "SIN NOMBRE";
        const trabajador = document.getElementById('trabajador').value || "NO ESPECIFICADO";
        const fecha = document.getElementById('fecha').value;
        const notas = document.getElementById('notas').value;

        // --- CABECERA (ROMERO MORATO) ---
        doc.setDrawColor(0); 
        doc.setLineWidth(0.6);
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

        doc.addImage(logo, 'PNG', 150, 5, 45, 30);

        // --- DATOS PROYECTO ---
        doc.setTextColor(0);
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.text("DATOS DE LA MEDICIÓN", 14, 48);
        
        doc.setFont(undefined, 'normal');
        doc.text(`Nº PRESUPUESTO / ALBARÁN: ${numDoc}`, 14, 54);
        doc.text(`OBRA:`, 14, 60);
        doc.setFont(undefined, 'bold');
        doc.text(`${obra.toUpperCase()}`, 30, 60);
        
        doc.setFont(undefined, 'normal');
        doc.text(`TRABAJADOR: ${trabajador.toUpperCase()}`, 14, 66);
        doc.text(`FECHA: ${fecha}`, 150, 54);

        const filasPDF = [];
        let totalGeneralDinero = 0;

        document.querySelectorAll('#filas-medicion tr').forEach(fila => {
            const t = fila.querySelector('.tipo-material').value;
            const s = fila.querySelector('.subtipo-material').value;
            const anc = parseFloat(fila.querySelector('.ancho').value) || 0;
            const alt = parseFloat(fila.querySelector('.alto').value) || 0;
            const totM2 = anc * alt;

            if (t && s) {
                let filaDatos = [`${t.toUpperCase()} \n${s}`, anc.toFixed(2), "x", alt.toFixed(2), `${totM2.toFixed(2)} m²`];
                
                if (mostrarCostes) {
                    const pUnit = parseFloat(fila.querySelector('.precio-unitario').value) || 0;
                    const subtotal = totM2 * pUnit;
                    totalGeneralDinero += subtotal;
                    filaDatos.push(`${pUnit.toFixed(2)} €`, `${subtotal.toFixed(2)} €`);
                }
                filasPDF.push(filaDatos);
            }
        });

        if (filasPDF.length === 0) {
            alert("Por favor, rellena al menos una partida completa.");
            return;
        }

        // Configuración dinámica de columnas
        let encabezados = [['CONCEPTO / PARTIDA', 'ANCHO', '', 'ALTO', 'TOTAL']];
        let estilosColumnas = {
            0: { cellWidth: mostrarCostes ? 60 : 80 },
            1: { halign: 'center' },
            2: { halign: 'center', textColor: [120, 120, 120] },
            3: { halign: 'center' },
            4: { halign: 'right', fontStyle: 'bold' }
        };

        if (mostrarCostes) {
            encabezados[0].push('€/m²', 'IMPORTE');
            estilosColumnas[5] = { halign: 'right' };
            estilosColumnas[6] = { halign: 'right', fontStyle: 'bold' };
        }

        doc.autoTable({
            startY: 72,
            head: encabezados,
            body: filasPDF,
            theme: 'grid', 
            headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], lineColor: [0, 0, 0], lineWidth: 0.3, fontStyle: 'bold', halign: 'center' },
            styles: { lineColor: [120, 120, 120], lineWidth: 0.2, textColor: [0, 0, 0], fontSize: 9, cellPadding: 3 },
            columnStyles: estilosColumnas,
            margin: { top: 72 }
        });

        let finalY = doc.lastAutoTable.finalY;

        // --- TOTAL DINERO EN PDF ---
        if (mostrarCostes) {
            doc.setFontSize(11);
            doc.setFont(undefined, 'bold');
            doc.text(`TOTAL GENERAL: ${totalGeneralDinero.toFixed(2)} €`, 196, finalY + 10, { align: 'right' });
            finalY += 15;
        }

        // --- OBSERVACIONES ---
        if (notas.trim() !== "") {
            const posNotas = finalY + 10;
            doc.setFontSize(10);
            doc.setFont(undefined, 'bold');
            doc.text("OBSERVACIONES:", 14, posNotas);
            doc.setFont(undefined, 'normal');
            doc.setFontSize(9);
            const splitNotas = doc.splitTextToSize(notas, 180);
            doc.text(splitNotas, 14, posNotas + 5);
        }

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
        alert("Error al generar el PDF.");
    }
}
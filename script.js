// --- CONFIGURACIÓN SUPABASE ---
const supabaseUrl = 'https://dfcjsnfjetypsnvvbbeg.supabase.co';
const supabaseKey = 'sb_publishable_AiDH1cvaTp2XZy0Bb7aQ-g_XGH-hUph';
const _supabase = supabase.createClient(supabaseUrl, supabaseKey);

const datosPartidas = {
    "Escayola": ["Tabica escayola dos caras","Tabica escayola tres caras",
        "Tabica escayola una cara","Techo de escayola"
    ],
    "Mortero": [
        "Mortero a dos capas","Mortero maestreado","Tabica mortero dos caras",
        "Tabica mortero tres caras","Tabica mortero una cara","Techo mortero"
    ],
    "Perlita": [
        "Perliyeso maestreado","Perliyeso semimaestreado","Tabica perliyeso dos caras",
        "Tabica perliyeso tres caras","Tabica perliyeso una cara","Techo perliyeso"
    ],
    "Pladur": [
        "Dif en placa hidrofuga en 13","Dif en placa hidrofuga en 15","Fosa de pladur de 5 x 5 hidrofuga",
        "Fosas de pladur de 5 x 5","Lana mineral vidrio 50 mm","Refuerzo de rejilla + apertura + colocación",
        "Refuerzo de rejilla + apertura + colocación + encintado","Refuerzo DM","Registro 20 x 20","Registro 40 x 40",
        "Registro 60 x 60","Registro de 1,20 x 60","Tabica aquapanel cementosa","Tabica de placa glasroc",
        "Tabica dos caras","Tabica tres caras","Tabica una cara","Tabique (13 + 48 + 13) MOD 400",
        "Tabique (13 + 48 + 13) MOD 600","Tabique (13 + 70 + 13) MOD 400","Tabique (15 + 48 + 15) MOD 400",
        "Tabique (15 + 48 + 15) MOD 600","Tabique (15 + 70 + 15) MOD 400","Tabique (15 + 70 + 15) MOD 600",
        "Tabique (2 x 13 + 48 + 2 x 13) MOD 400","Tabique (2 x 13 + 48 + 2 x 13) MOD 600",
        "Tabique (2 x 13 + 70 + 2 x 13) MOD 400","Tabique (2 x 13 + 70 + 2 x 13) MOD 600",
        "Tabique (2 x 15 + 48 + 2 x 15) MOD 400","Tabique (2 x 15 + 48 + 2 x 15) MOD 600",
        "Tabique (2 x 15 + 70 + 2 x 15) MOD 400","Tabique (2 x 15 + 70 + 2 x 15) MOD 600",
        "Tapetas metros lineales","Techo aquapanel cementosa","Techo de placa glasroc",
        "Techo desmontable placa de vinilo","Techo desmontable placa escayola lisa",
        "Techo pladur en 13 mm","Techo pladur placa hidrófuga en 13 mm","Trasdosado (48 + 13) MOD 400",
        "Trasdosado (48 + 13) MOD 600","Trasdosado (48 + 15) MOD 400","Trasdosado (48 + 15) MOD 600",
        "Trasdosado (48 + 2 x 13) MOD 400","Trasdosado (48 + 2 x 13) MOD 600","Trasdosado (48 + 2 x 15) MOD 400",
        "Trasdosado (48 + 2 x 15) MOD 600","Trasdosado (70 + 13) MOD 400","Trasdosado (70 + 13) MOD 600",
        "Trasdosado (70 + 2 x 13) MOD 400","Trasdosado (70 + 2 x 13) MOD 600",
        "Trasdosado con omega MOD 400 con placa de 15","Trasdosado con omega MOD 600 con placa de 15"
    ],
    "Puente de unión": [
        "Puente de unión"
    ],
    "Otro": []
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
            <select class="subtipo-material" disabled style="margin-top:5px; font-size:0.85rem;" onchange="verificarManual(this)">
                <option value="">Subtipo...</option>
            </select>
            <input type="text" class="subtipo-manual" placeholder="✍️ Escriba el concepto aquí..." style="display:none; margin-top:5px; width:100%; font-size:0.85rem; border: 1px solid #ddd; padding: 10px; border-radius: 6px;">
        </td>
        <td style="text-align:center;"><input type="number" class="ancho" step="0.01" placeholder="0.00" oninput="calcularFila(this)" style="width:65px;"></td>
        <td style="text-align:center; font-weight:bold; color:#ccc;">x</td>
        <td style="text-align:center;"><input type="number" class="alto" step="0.01" placeholder="0.00" oninput="calcularFila(this)" style="width:65px;"></td>
        <td style="text-align:center; font-weight:bold; color:#ccc;">x</td>
        <td style="text-align:center;"><input type="number" class="largo" step="0.01" value="1.00" oninput="calcularFila(this)" style="width:65px;"></td>
        
        <td class="total-fila" style="text-align:right; font-weight:bold; padding-right:10px;">0.00</td>
        <td class="col-costes" style="display:${displayStyle}; text-align:right;">
            <input type="number" class="precio-unitario" step="0.01" placeholder="0.00" oninput="calcularFila(this)" style="width:70px; text-align:right;">
        </td>
        <td class="col-costes importe-fila" style="display:${displayStyle}; text-align:right; font-weight:bold; padding-right:10px;">0.00</td>
        <td style="text-align:center;"><button type="button" class="btn-delete" onclick="eliminarFila(this)">x</button></td>
    `;
}

function actualizarSubtipos(selectTipo) {
    const fila = selectTipo.closest('tr');
    const selectSubtipo = fila.querySelector('.subtipo-material');
    const inputManual = fila.querySelector('.subtipo-manual');
    const tipo = selectTipo.value;

    inputManual.style.display = 'none';
    inputManual.value = '';

    if (tipo && datosPartidas[tipo]) {
        selectSubtipo.disabled = false;
        let html = '<option value="">Selecciona...</option>';
        datosPartidas[tipo].forEach(s => html += `<option value="${s}">${s}</option>`);
        html += '<option value="MANUAL" style="color:orange; font-weight:bold;">+ OTRO (Escribir...)</option>';
        selectSubtipo.innerHTML = html;
    } else {
        selectSubtipo.disabled = true;
        selectSubtipo.innerHTML = '<option value="">Subtipo...</option>';
    }
}

function verificarManual(select) {
    const fila = select.closest('tr');
    const inputManual = fila.querySelector('.subtipo-manual');
    if (select.value === "MANUAL") {
        inputManual.style.display = 'block';
        inputManual.focus();
    } else {
        inputManual.style.display = 'none';
        inputManual.value = '';
    }
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

function calcularFila(input) {
    const fila = input.closest('tr');
    const ancho = parseFloat(fila.querySelector('.ancho').value) || 0;
    const alto = parseFloat(fila.querySelector('.alto').value) || 0;
    const largo = parseFloat(fila.querySelector('.largo').value) || 0;
    
    const totalM2 = ancho * alto * largo;
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
        
        const fechaRaw = document.getElementById('fecha').value;
        const fecha = fechaRaw.split('-').reverse().join('/'); 
        
        const notas = document.getElementById('notas').value;

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

        const partidasPorTipo = {};
        let totalGeneralDinero = 0;

        document.querySelectorAll('#filas-medicion tr').forEach(fila => {
            const t = fila.querySelector('.tipo-material').value;
            const selectS = fila.querySelector('.subtipo-material');
            const manualS = fila.querySelector('.subtipo-manual').value;
            
            let s = (selectS.value === "MANUAL") ? manualS : selectS.value;

            const anc = parseFloat(fila.querySelector('.ancho').value) || 0;
            const alt = parseFloat(fila.querySelector('.alto').value) || 0;
            const lar = parseFloat(fila.querySelector('.largo').value) || 1;
            const totM2 = anc * alt * lar;

            if (t && s) {
                if (!partidasPorTipo[t]) {
                    partidasPorTipo[t] = [];
                }
                let filaDatos = [s, anc.toFixed(2), alt.toFixed(2), lar.toFixed(2), `${totM2.toFixed(2)} m²`];
                
                if (mostrarCostes) {
                    const pUnit = parseFloat(fila.querySelector('.precio-unitario').value) || 0;
                    const subtotal = totM2 * pUnit;
                    totalGeneralDinero += subtotal;
                    filaDatos.push(`${pUnit.toFixed(2)} €`, `${subtotal.toFixed(2)} €`);
                }
                partidasPorTipo[t].push(filaDatos);
            }
        });

        const filasFinalesPDF = [];
        for (const tipo in partidasPorTipo) {
            let totalM2Tipo = 0; // Calculamos el total de m2 de este bloque
            const numColumnas = mostrarCostes ? 7 : 5;
            
            // Fila de Encabezado de Tipo
            const filaTipo = [];
            for (let i = 0; i < numColumnas; i++) {
                filaTipo.push({
                    content: (i === 0) ? tipo.toUpperCase() : "", 
                    styles: { fillColor: [245, 245, 245], fontStyle: 'bold', textColor: [0, 0, 0], halign: 'left' }
                });
            }
            filasFinalesPDF.push(filaTipo);

            // Añadir partidas y sumar m2
            partidasPorTipo[tipo].forEach(partida => { 
                filasFinalesPDF.push(partida); 
                const m2Valor = parseFloat(partida[4].split(' ')[0]) || 0;
                totalM2Tipo += m2Valor;
            });

            // Fila de Subtotal del Tipo (NUEVA)
            const filaSubtotal = [];
            for (let i = 0; i < numColumnas; i++) {
                filaSubtotal.push({
                    content: (i === 0) ? `TOTAL ${tipo.toUpperCase()}:` : (i === 4) ? `${totalM2Tipo.toFixed(2)} m²` : "",
                    styles: { 
                        fillColor: [255, 255, 255], 
                        fontStyle: 'bold', 
                        textColor: [0, 0, 0], 
                        halign: (i === 4) ? 'right' : 'left',
                        fontSize: 9
                    }
                });
            }
            filasFinalesPDF.push(filaSubtotal);
        }

        if (filasFinalesPDF.length === 0) {
            alert("Por favor, rellena al menos una partida completa.");
            return;
        }

        let encabezados = [['CONCEPTO / PARTIDA', 'ANCHO', 'ALTO', 'LARGO', 'TOTAL']];
        let estilosColumnas = {
            0: { cellWidth: mostrarCostes ? 60 : 80 },
            1: { halign: 'center' },
            2: { halign: 'center' },
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
            body: filasFinalesPDF,
            theme: 'grid', 
            headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], lineColor: [0, 0, 0], lineWidth: 0.3, fontStyle: 'bold', halign: 'center' },
            styles: { lineColor: [120, 120, 120], lineWidth: 0.2, textColor: [0, 0, 0], fontSize: 9, cellPadding: 3 },
            columnStyles: estilosColumnas,
            margin: { top: 72 }
        });

        let finalY = doc.lastAutoTable.finalY;

        if (mostrarCostes) {
            doc.setFontSize(11);
            doc.setFont(undefined, 'bold');
            doc.text(`TOTAL GENERAL: ${totalGeneralDinero.toFixed(2)} €`, 196, finalY + 10, { align: 'right' });
            finalY += 15;
        }

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

// --- FUNCIÓN PARA GUARDAR EL FORMULARIO ---
async function guardarEnNube() {
    const nombreObra = document.getElementById('obra').value.trim();
    
    if (!nombreObra) {
        alert("⚠️ Por favor, escribe un nombre en el campo 'OBRA' para poder guardar.");
        return;
    }

    const btn = document.getElementById('btnGuardar');
    const textoOriginal = btn.innerHTML;
    btn.innerHTML = "⏳ GUARDANDO...";
    btn.disabled = true;

    // Capturamos todo el estado actual del formulario
    const estadoFormulario = {
        numDocumento: document.getElementById('numDocumento').value,
        obra: nombreObra,
        trabajador: document.getElementById('trabajador').value,
        fecha: document.getElementById('fecha').value,
        notas: document.getElementById('notas').value,
        mostrarCostes: mostrarCostes, // Variable global de tu código
        filas: []
    };

    // Recorremos las filas de la tabla para guardar cada partida
    document.querySelectorAll('#filas-medicion tr').forEach(fila => {
        estadoFormulario.filas.push({
            tipo: fila.querySelector('.tipo-material').value,
            subtipo: fila.querySelector('.subtipo-material').value,
            subtipoManual: fila.querySelector('.subtipo-manual').value,
            ancho: fila.querySelector('.ancho').value,
            alto: fila.querySelector('.alto').value,
            largo: fila.querySelector('.largo').value,
            precio: fila.querySelector('.precio-unitario') ? fila.querySelector('.precio-unitario').value : ""
        });
    });

    // Enviamos a la tabla 'lista-partidas' de Supabase
    const { data, error } = await _supabase
        .from('lista-partidas')
        .insert([{ 
            nombre_obra: nombreObra, 
            datos: estadoFormulario 
        }]);

    if (error) {
        alert("❌ Error al guardar: " + error.message);
    } else {
        alert("✅ Obra '" + nombreObra + "' guardada correctamente.");
    }
    
    btn.innerHTML = textoOriginal;
    btn.disabled = false;
}

// --- FUNCIÓN PARA BUSCAR Y CARGAR POR NOMBRE ---
async function cargarObraPorNombre() {
    // 1. Pedimos el nombre de la obra con una ventana emergente
    const nombreABuscar = prompt("🔍 Introduce el NOMBRE DE LA OBRA que deseas cargar:");

    // Si el usuario cancela o deja vacío, no hacemos nada
    if (nombreABuscar === null || nombreABuscar.trim() === "") {
        return; 
    }

    const btn = document.getElementById('btnCargar');
    const textoOriginal = btn.innerHTML;
    btn.innerHTML = "⏳ BUSCANDO...";
    btn.disabled = true;

    // 2. Buscamos en Supabase (asegúrate que el nombre de tabla sea lista-partidas)
    const { data, error } = await _supabase
        .from('lista-partidas') 
        .select('*')
        .eq('nombre_obra', nombreABuscar.trim()) 
        .order('created_at', { ascending: false }) 
        .limit(1);

    if (error) {
        alert("❌ Error en la base de datos: " + error.message);
    } else if (!data || data.length === 0) {
        alert("❓ No se encontró la obra: '" + nombreABuscar + "'\n\nRevisa si el nombre es correcto.");
    } else {
        // 3. Si existe, cargamos los datos
        const guardado = data[0].datos;
        
        // Limpiamos la tabla para que no se mezclen datos antiguos
        document.getElementById('filas-medicion').innerHTML = "";

        // Rellenamos la cabecera (incluyendo el nombre de la obra que acabamos de traer)
        document.getElementById('obra').value = guardado.obra || nombreABuscar;
        document.getElementById('numDocumento').value = guardado.numDocumento || "";
        document.getElementById('trabajador').value = guardado.trabajador || "";
        document.getElementById('fecha').value = guardado.fecha || "";
        document.getElementById('notas').value = guardado.notas || "";

        // Ajustamos la vista de costes según se guardó
        if (guardado.mostrarCostes !== mostrarCostes) {
            activarCostes();
        }

        // Reconstruimos todas las filas
        guardado.filas.forEach(f => {
            agregarFila();
            const filas = document.querySelectorAll('#filas-medicion tr');
            const ultimaFila = filas[filas.length - 1];

            ultimaFila.querySelector('.tipo-material').value = f.tipo;
            actualizarSubtipos(ultimaFila.querySelector('.tipo-material'));
            ultimaFila.querySelector('.subtipo-material').value = f.subtipo;
            
            if (f.subtipo === "MANUAL") {
                const manual = ultimaFila.querySelector('.subtipo-manual');
                manual.style.display = 'block';
                manual.value = f.subtipoManual;
            }

            ultimaFila.querySelector('.ancho').value = f.ancho;
            ultimaFila.querySelector('.alto').value = f.alto;
            ultimaFila.querySelector('.largo').value = f.largo;
            
            const pUnit = ultimaFila.querySelector('.precio-unitario');
            if (pUnit) pUnit.value = f.precio;
            
            calcularFila(ultimaFila.querySelector('.ancho'));
        });

        alert("✅ Obra '" + nombreABuscar + "' cargada con éxito.");
    }

    btn.innerHTML = textoOriginal;
    btn.disabled = false;
}
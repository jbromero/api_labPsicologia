const { db } = require('../firebase');


const createQuestionAndAnswer = async (req, res) => {
    try {
        const { pregunta, calificacion, opciones, personajePregunta, respuestas } = req.body;

        // Creamos la pregunta en la colección "gesell_preguntas"
        const questionRef = await db.collection('gesell_preguntas').add({
            pregunta,
            calificacion,
            opciones,
            personajePregunta,
            tieneDialogo: false // Por defecto, no tiene diálogo
        });

        // Creamos las respuestas en la subcolección "respuestas" de la pregunta recién creada
        const promises = respuestas.map(async (respuesta) => {
            await db.collection('gesell_preguntas').doc(questionRef.id).collection('respuestas').add({
                respuesta: respuesta.respuesta,
                esCorrecta: respuesta.esCorrecta,
                retroalimentacion: respuesta.retroalimentacion
            });
        });
        await Promise.all(promises);

        res.status(201).send(`Pregunta y respuestas creadas con ID de pregunta: ${questionRef.id}`);
    } catch (error) {
        console.error("Error al crear la pregunta y respuestas:", error);
        res.status(500).send("Error al crear la pregunta y respuestas.");
    }
}
const createDialogo = async (req, res) => {
    try {
        const { orden, contenido, tienePregunta,esImportante, preguntaId, personaje, caso,fase } = req.body;

        // Objeto para almacenar los campos comunes del diálogo
        const dialogoData = {
            orden,
            contenido,
            tienePregunta,
            personaje,
            caso,
            fase,
            esImportante
        };

        // Si tienePregunta es true y preguntaId es proporcionado, 
        if (tienePregunta && preguntaId) {
            const preguntaRef = db.collection('gesell_preguntas').doc(preguntaId);
            // Verifica si el documento al que hace referencia preguntaId realmente existe
            const preguntaSnapshot = await preguntaRef.get();
            if (!preguntaSnapshot.exists) {
                return res.status(400).send('La pregunta especificada no existe.');
            }
            // Si la pregunta existe, asigna la referencia del documento a preguntaId
            dialogoData.preguntaId = preguntaRef;
        }

        // Creamos el diálogo en la colección "gesell_dialogos"
        const dialogRef = await db.collection('gesell_dialogos').add(dialogoData);

        res.status(201).send(`Diálogo creado con ID: ${dialogRef.id}`);
    } catch (error) {
        console.error("Error al crear el diálogo:", error);
        res.status(500).send("Error al crear el diálogo.");
    }
}

const getDialogosOrdenados = async (req, res) => {
    try {
        const caso = parseInt(req.query.caso, 10); // Asegurarse de que 'caso' es un número
        const fase = req.query.fase; // Obtener el parámetro 'fase' de la solicitud

        if (isNaN(caso)) {
            return res.status(400).send("El parámetro 'caso' es requerido y debe ser un número.");
        }

        if (!fase) {
            return res.status(400).send("El parámetro 'fase' es requerido.");
        }

        console.log("Caso recibido:", caso);
        console.log("Fase recibida:", fase);

        // Obtenemos los diálogos que coinciden con el caso y la fase, y los ordenamos por el campo "orden"
        const dialogosSnapshot = await db.collection('gesell_dialogos')
                                         .where('caso', '==', caso)
                                         .where('fase', '==', fase)
                                         .orderBy('orden')
                                         .get();
        
        if (dialogosSnapshot.empty) {
            return res.status(200).send([]);
        }

        const dialogosOrdenados = [];
        
        dialogosSnapshot.forEach(doc => {
            const dialogoData = doc.data();
            if (dialogoData.preguntaId) {
                dialogoData.preguntaId = doc.data().preguntaId._path.segments[1];
            }
            dialogosOrdenados.push({
                id: doc.id,
                ...dialogoData
            });
        });

        res.status(200).send(dialogosOrdenados);
    } catch (error) {
        console.error("Error al obtener los diálogos ordenados:", error);
        res.status(500).send("Error al obtener los diálogos ordenados.");
    }
};


const getPreguntaById = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Obtenemos la pregunta por ID
        const preguntaDoc = await db.collection("gesell_preguntas").doc(id).get();
        
        if (!preguntaDoc.exists) {
            return res.status(404).json({ message: "Pregunta no encontrada" });
        }

        const preguntaData = preguntaDoc.data();
        preguntaData.id=id;

        // Cbtenemos las respuestas asociadas a la pregunta
        const respuestasSnapshot = await db.collection("gesell_preguntas").doc(id).collection("respuestas").get();
        const respuestasData = respuestasSnapshot.docs.map(doc => doc.data());

        // Agregamos las respuestas al objeto de datos de la pregunta
        preguntaData.respuestas = respuestasData;

        res.status(200).json(preguntaData);
    } catch (error) {
        console.error("Error al obtener la pregunta y respuestas:", error);
        res.status(500).json({ message: "Error al obtener la pregunta y respuestas." });
    }
}
//Servicio unicamente para faciliatar ñadir campo (opcional)
const agregarCampoFase = async (req, res) => {
    try {
        const dialogosRef = db.collection('gesell_dialogos');
        const snapshot = await dialogosRef.get();

        if (snapshot.empty) {
            return res.status(404).send("No se encontraron documentos en la colección gesell_dialogos.");
        }

        const batch = db.batch();

        snapshot.forEach(doc => {
            const docRef = dialogosRef.doc(doc.id);
            batch.update(docRef, { fase: 'Inicial' });
        });

        await batch.commit();

        res.status(200).send("Campo 'fase' agregado a todos los documentos en la colección gesell_dialogos.");
    } catch (error) {
        console.error("Error al agregar el campo 'fase':", error);
        res.status(500).json({ message: "Error al agregar el campo 'fase'." });
    }
};
const agregarCampoEsImportante = async (req, res) => {
    console.log("LLame")
    try {
        const dialogosRef = db.collection('gesell_dialogos');
        const snapshot = await dialogosRef.get();

        if (snapshot.empty) {
            return res.status(404).send("No se encontraron documentos en la colección gesell_dialogos.");
        }

        const batch = db.batch();

        snapshot.forEach(doc => {
            const docRef = dialogosRef.doc(doc.id);
            batch.update(docRef, { esImportante: false }); // Añadir el campo esImportante con valor false
        });

        await batch.commit();

        res.status(200).send("Campo 'esImportante' agregado a todos los documentos en la colección gesell_dialogos.");
    } catch (error) {
        console.error("Error al agregar el campo 'esImportante':", error);
        res.status(500).json({ message: "Error al agregar el campo 'esImportante'." });
    }
};






module.exports = { createQuestionAndAnswer, createDialogo, getDialogosOrdenados,getPreguntaById,agregarCampoFase,agregarCampoEsImportante  };

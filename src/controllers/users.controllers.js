const { db } = require('../firebase');

//Metodo para recuperar todos los usuarios de la base 
const getAllUser = async (req, res) => {
    try {
        const querySnapshot = await db.collection('gessell_usuarios').get();
        const users = querySnapshot.docs.map(doc => {
            const data = doc.data();
            const timestamp = data.fecha;
            let userData = {
                id: doc.id,
                ...data
            };
            if (timestamp != null) {
                const date = new Date(timestamp._seconds * 1000 + timestamp._nanoseconds / 1000000);
                userData.fecha = date;
            }
            console.log(userData);
            return userData;
        });
        res.status(200).send(users);
    } catch (error) {
        console.error("Error al obtener usuarios:", error);
        res.status(500).send("Error al obtener usuarios.");
    }
}
const createUser = async (req, res) => {
    let { nombre_completo, username, email } = req.body;

    // Obtener la fecha actual y formatearla a ISO 8601
    const fechaFormateada = new Date().toISOString();

    // Estructurar el objeto que se guardará en Firebase
    const nuevoUsuario = {
        nombre_completo,
        email,
        fecha: fechaFormateada,
        username
    };

    try {
        // Utilizar el username como ID de la colección
        await db.collection("gessell_usuarios").doc(username).set(nuevoUsuario);
        res.send('Nuevo usuario creado');
    } catch (error) {
        res.status(500).send('Error al crear el usuario: ' + error.message);
    }
};

const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        // Recuperamos campos de avancePartida
        const { fechaModificacion,faseCasoEstudio,partidaCasoUsuario } = req.body;

        const avancePartida={
            fechaModificacion,
            faseCasoEstudio,
            partidaCasoUsuario
        }
        console.log(avancePartida);
        // agregamso  fecha de modificación en base al sistema
       avancePartida.fechaModificacion = new Date().toISOString();;

        // Agregamos el documento a la subcolección "gessell_avance_partida" del usuario
        const docRef= await db.collection("gessell_usuarios").doc(id).collection("gessell_avance_partida").add(avancePartida);
        // Retornamos el ID del documento creado
        res.status(200).send({ message: 'Se actualizo el avance de partida correctamente', id: docRef.id });
    } catch (error) {
        console.error("Error al actualizar usuario:", error);
        res.status(500).send("Error al actualizar usuario.");
    }
}
const updateUserIntentEntry = async (req, res) => {
    try {
        const { idUser, idPartida } = req.params;
        // Recuperamos campos de avancePartida
        const { fecha_hora_inicio,progreso,puntaje } = req.body;
        const intentoPartida={
            fecha_hora_inicio,
            progreso,
            puntaje
        }

        // agregamso  fecha de modificación en base al sistema
        intentoPartida.fecha_hora_fin = new Date();
        //Recuperamos la coleccion hasta el avance partgida
        // Agregamos el documento a la subcolección "gessell_avance_partida" del usuario
        await db.collection("gessell_usuarios").doc(idUser).collection("gessell_avance_partida").doc(idPartida).collection("gesell_intentos_partida").add(intentoPartida);
        res.status(200).send('Intento de partida actulizado correctamente');
    } catch (error) {
        console.error("Error al actualizar el intento de partida:", error);
        res.status(500).send("Error al actualizar el intento de partida.");
    }
}
const getOneUser = async (req, res) => {
    try {
        const { id } = req.params;
        // Obtener datos del usuario
        const userDoc = await db.collection("gessell_usuarios").doc(id).get();
        const userData = {
            id: userDoc.id,
            ...userDoc.data()
        };
        // Convertir la fecha del usuario a un formato legible
        if (userData.fecha) {
            const timestamp = userData.fecha;
            userData.fecha = new Date(timestamp._seconds * 1000 + timestamp._nanoseconds / 1000000);
        }
        // Obtener los documentos de la subcolección "gessell_avance_partida"
        const avancePartidaSnapshot = await db.collection("gessell_usuarios").doc(id).collection("gessell_avance_partida").get();
        const avancePartidaDocs = await Promise.all(avancePartidaSnapshot.docs.map(async doc => {
            const avancePartidaData = {
                id: doc.id,
                ...doc.data()
            };
            // Convertir la fechaHoraModificacion a un formato legible para el usuario
            if (avancePartidaData.fechaModificacion) {
                const timestamp = avancePartidaData.fechaModificacion;
                avancePartidaData.fechaModificacion = new Date(timestamp._seconds * 1000 + timestamp._nanoseconds / 1000000);
            }
            // Obtener los documentos de la subcolección "gesell_intentos_partida" dentro de "gessell_avance_partida"
            const intentosPartidaSnapshot = await db.collection("gessell_usuarios").doc(id).collection("gessell_avance_partida").doc(doc.id).collection("gesell_intentos_partida").get();
            const intentosPartidaDocs = await Promise.all(intentosPartidaSnapshot.docs.map(async intentosDoc => {
                const intentosPartidaData = {
                    id: intentosDoc.id,
                    ...intentosDoc.data()
                };
                // Convertir la fecha_hora_fin a un formato legible para el usuario
                if (intentosPartidaData.fecha_hora_fin) {
                    const timestamp = intentosPartidaData.fecha_hora_fin;
                    intentosPartidaData.fecha_hora_fin = new Date(timestamp._seconds * 1000 + timestamp._nanoseconds / 1000000);
                }
                return intentosPartidaData;
            }));
            // Agregar los documentos de "gesell_intentos_partida" al objeto de datos de "avancePartidaData"
            avancePartidaData.intentosPartida = intentosPartidaDocs;
            return avancePartidaData;
        }));
        // Agregar los datos de "gessell_avance_partida" al objeto de datos del usuario
        userData.avancePartida = avancePartidaDocs;
        res.send(userData);
    } catch (error) {
        res.status(500).send("Error al obtener la información del usuario.", error);
    }
}

    

const getUserHistory = async (req, res) => {
    try {
        const { id } = req.params;

        // Obtener los documentos de la subcolección "gessell_avance_partida"
        const avancePartidaSnapshot = await db.collection("gessell_usuarios").doc(id).collection("gessell_avance_partida").get();
        const historial = [];

        for (const doc of avancePartidaSnapshot.docs) {
            const avancePartidaData = {
                faseCasoEstudio: doc.data().faseCasoEstudio,
            };

            // Obtener los documentos de la subcolección "gesell_intentos_partida" dentro de "gessell_avance_partida"
            const intentosPartidaSnapshot = await db.collection("gessell_usuarios").doc(id).collection("gessell_avance_partida").doc(doc.id).collection("gesell_intentos_partida").get();

            for (const intentosDoc of intentosPartidaSnapshot.docs) {
                const intentosPartidaData = {
                    progreso: intentosDoc.data().progreso,
                    fecha_hora_fin: intentosDoc.data().fecha_hora_fin.toDate()
                };

                // Añadir los datos al historial
                historial.push({
                    fase: avancePartidaData.faseCasoEstudio,
                    progreso: intentosPartidaData.progreso,
                    fecha: intentosPartidaData.fecha_hora_fin
                });
            }
        }

        res.status(200).send(historial);
    } catch (error) {
        console.error("Error al obtener el historial del usuario:", error);
        res.status(500).send("Error al obtener el historial del usuario.");
    }
}

module.exports = { getAllUser, createUser, updateUser, getOneUser, updateUserIntentEntry, getUserHistory }




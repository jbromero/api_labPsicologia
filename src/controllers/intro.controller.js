const { db } = require('../firebase');

const getIntroduccionByCaso  = async (req, res) => {
    try {
        const { caso } = parseInt(req.query.caso, 10);
        if (isNaN(caso)) {
            return res.status(400).send("El parámetro 'caso' es requerido y debe ser un número.");
        }

        console.log("Caso recibido:", caso);

        // Obtenemos la introduccion  en base al caso
        const querySnapshot = await db.collection('gesell_introduccion')
                                         .where('caso', '==', caso)                                  
                                         .get();
        
        if (querySnapshot.empty) {
            
            return res.status(200).send([]);
        }

       
        
        dialogosSnapshot.forEach(doc => {
            const introData = doc.data();
        
            
        });

        

        res.status(200).send(dialogosSnapshot);
        res.status(200).json(dialogosSnapshot);
    } catch (error) {
        console.error("Error al obtener la introduccion:", error);
        res.status(500).json({ message: "Error al obtener la introduccion." });
    }
}
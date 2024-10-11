const {Router} = require('express')

const {getAllUser,createUser, updateUser, getOneUser,updateUserIntentEntry, getUserHistory}= require('../controllers/users.controllers')

const { createQuestionAndAnswer, createDialogo, getDialogosOrdenados, getPreguntaById, agregarCampoFase, agregarCampoEsImportante } = require('../controllers/questions.controller');
const router =Router();
//Asignamos la el contralador la ruta
router.get('/users',getAllUser );
router.get('/get-user/:id',getOneUser );
router.post('/create-user',createUser );
router.put('/update-user/:id',updateUser );
router.put('/update-user-intent/:idUser/:idPartida',updateUserIntentEntry)
router.get('/get-user-history/:id',getUserHistory );

router.post('/create-questions',createQuestionAndAnswer );
router.post('/create-dialogos',createDialogo );

router.get('/get-dialogos',getDialogosOrdenados );
router.get('/get-questionsId/:id',getPreguntaById );
// Ruta para agregar el campo "fase" a todos los documentos en la colección gesell_dialogos
router.post('/agregar-fase', agregarCampoFase);
//Ruta para agregar el campo esImportante 
router.post('/agregar-esImportante',agregarCampoEsImportante)
 module.exports=router;
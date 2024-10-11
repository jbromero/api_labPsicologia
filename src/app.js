const express = require('express');
const morgan = require('morgan')
const app = express();
const cors = require('cors');
//Configuracion de la app
app.use(morgan('dev'))
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:false}));

//Solicitamos las rutas
app.use("/api",require("./routes/index"))
module.exports = app;

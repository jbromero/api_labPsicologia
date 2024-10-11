const app =require('./app');
require('./firebase')
/**
 * Establecemos el puerto
 * 
 */
const port = process.env.PORT || 3000;
app.listen(port, ()=>{
    console.log("Server on runnig in port "+port)
});

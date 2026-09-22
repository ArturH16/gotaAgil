const express = require("express")
const app = express()
const PORT = 3000
const {engine} = require("express-handlebars")
const path = require("path")
const cadastroRouter = require("./routes/cadastro")
//Configurações Padrões
    //Template Engine
    app.engine("handlebars",engine())
    app.set("view engine","handlebars")
    app.set("views",path.join(__dirname,"views"))
    

//Rotas
    app.use("/cadastro",cadastroRouter)



    app.listen(PORT,()=> {
        console.log(`Servidor rodando na porta ${PORT}!`)
    })

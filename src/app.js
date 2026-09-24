const express = require("express")
const app = express()
const PORT = 3000
const {engine} = require("express-handlebars")
const path = require("path")
const cadastroRouter = require("./routes/cadastro")
const loginRouter = require("./routes/login")
const homeRouter = require("./routes/home")
//Configurações Padrões
    //Template Engine
    app.engine("handlebars",engine({defaultLayout: "main",
        layoutsDir: path.join(__dirname, "views/layouts"),
        partialsDir: path.join(__dirname, "views/partials")
    }))
    app.set("view engine","handlebars")
    app.set("views",path.join(__dirname,"views"))
app.use("/images",express.static(path.join(__dirname,"..","images")))
app.use(express.static("public"))
    

//Rotas
    app.use("/cadastro",cadastroRouter)
    app.use("/login",loginRouter)
    app.use("/home",homeRouter)


    app.listen(PORT,()=> {
        console.log(`Servidor rodando na porta ${PORT}!`)
    })

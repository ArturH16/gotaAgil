require("dotenv").config()

const express = require("express")
const app = express()
const PORT = 3000
const {engine} = require("express-handlebars")
const path = require("path")
const session = require("express-session")
const pgSession = require("connect-pg-simple")(session)
const pool = require("../db")
const cadastroRouter = require("./routes/cadastro")
const loginRouter = require("./routes/login")
const homeRouter = require("./routes/home")
const usuarioRouter = require("./routes/usuario")
const hemocentroRouter = require("./routes/hemocentro")
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
app.use(express.urlencoded({extended: true}))
    
//Configuração de sessão dos usuários
app.use(session({
    store: new pgSession({
        pool: pool,
        tableName: 'session'
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000*60*60*24*7,
        httpOnly: true,
        secure: false
    }
}))


//Rotas
    app.use("/cadastro",cadastroRouter)
    app.use("/login",loginRouter)
    app.use("/home",homeRouter)
    app.use("/usuario",usuarioRouter)
    app.use("/hemocentro",hemocentroRouter)


    app.listen(PORT,()=> {
        console.log(`Servidor rodando na porta ${PORT}!`)
    })

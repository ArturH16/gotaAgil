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
const { exigeLogin } = require("./middlewares/auth")
const loginController = require("./controllers/loginController")
//Configurações Padrões
    //Template Engine
    app.engine("handlebars",engine({defaultLayout: "main",
        layoutsDir: path.join(__dirname, "views/layouts"),
        partialsDir: path.join(__dirname, "views/partials"),
        helpers: {
            selecionado: (atual,valor) => (atual === valor ? "selected": "")
        }
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
//logout
app.post("/logout", loginController.logout)
app.use((req, res, next) => {
    res.locals.userName = req.session.userName
    res.locals.loggedInDoador = req.session.userType === "doador"
    res.locals.loggedInHemocentro = req.session.userType === "hemocentro"
    res.locals.bloqueadoBotoes = ["pendente", "recusado"].includes(req.session.statusHemocentro)
    res.locals.loggedInAdmin = req.session.userType === "admin"
    res.locals.flash = req.session.flash
    delete req.session.flash
    next()
})

app.use((req, res, next) => {
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");
    next();
});


//Rotas
    app.use("/cadastro",cadastroRouter)
    app.use("/login",loginRouter)
    app.use("/home",homeRouter)
    app.use("/usuario",exigeLogin("doador"),usuarioRouter)
    app.use("/hemocentro",exigeLogin("hemocentro"),hemocentroRouter)


    app.listen(PORT,()=> {
        console.log(`Servidor rodando na porta ${PORT}!`)
    })

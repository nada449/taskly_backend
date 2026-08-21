//Importation bibliotheque
var createError = require('http-errors');//Importation du module http-errors pour gérer les erreurs HTTP 
var express = require('express');// Importation du module express pour créer une application web
var path = require('path');//Importation du module path pour gérer les chemins de fichiers et de répertoires
var cookieParser = require('cookie-parser');//Impportation du module cookie-parser pour parser les cookies dans les requêtes HTTP
var logger = require('morgan');//Importation du module morgan pour logger les requêtes HTTP dans la console

const http = require('http'); //Importation du module HTTP pour créer un serveur HTTP

require('dotenv').config(); //Importation du module dotenv pour charger les variables d'environnement depuis un fichier .env

const {connectToMongoDB} = require('./config/mongo.connection'); //Importation de la fonction connectToMongoDB depuis le fichier config/mongo.connection.js

//Importation des routes
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
 
//Creation d'application express 
var app = express();


app.use(logger('dev')); // Middleware pour le logging des requêtes HTTP(200,404,500, etc.)
app.use(express.json()); //Middleware pour parser le corps des requêtes en JSON {"key": "value"}
app.use(express.urlencoded({ extended: false })); //Middleware pour parser le corps des requêtes en URL-encoded (formulaire HTML)
app.use(cookieParser());//Middleware pour parser les cookies
app.use(express.static(path.join(__dirname, 'public')));//Middleware pour servir les fichiers statiques (CSS, JS, images) depuis le dossier 'public'


//Définition des routes
app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

//Création d'un serveur HTTP avec l'application Express
const server = http.createServer(app); 

//Démarrage du serveur sur le port 5000
server.listen(process.env.port , () => {
  connectToMongoDB(); //Appel de la fonction connectToMongoDB pour se connecter à la base de données MongoDB
  console.log(`Serveur démarré sur le port ${process.env.port}`);
}); 
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
//const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');

/*
mongoose.connect('mongodb://localhost/DuckMommyDB', {
    useNewUrlParser: true
});
*/

//Need to make changes to the node-mailer module.
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();

// View engine setup
//app.engine('handlebars', exphbs());
//app.set('view engine', 'handlebars');

// Static folder
app.use('/public', express.static(path.join(__dirname, 'public')));

// Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.render('views');
});

app.post('/send', (req, res) => {
  const output = `
    <p>You have a new contact request</p>
    <h3>Contact Details</h3>
    <ul>  
      <li>FirstName: ${req.body.firstname}</li>
      <li>LastName: ${req.body.lastname}</li>
      <li>Email: ${req.body.email}</li>
      <li>Email: ${req.body.phoneNumber}</li>
      <li>Password: ${req.body.pasword}</li>
      <li>ConfirmPassword: ${req.body.confirmpasword}</li>
    </ul>
    <h3>Message</h3>
    <p>${req.body.message}</p>
  `;

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: 'noreplyduckmommy@gmail.com', // generated ethereal user
        pass: 'noreplyduckmommy1234!'  // generated ethereal password
    },
    tls:{
      rejectUnauthorized:false
    }
  });

  // setup email data with unicode symbols
  let mailOptions = {
      from: '"Nodemailer Contact" <noreplyduckmommy@gmail.com>', // sender address
      to: 'RECEIVEREMAILS', // list of receivers
      subject: 'Node Contact Request', // Subject line
      text: 'Test Mail for SSW-690', // plain text body
      html: output // html body
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
          return console.log(error);
      }
      console.log('Message sent: %s', info.messageId);   
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

      res.render('views', {msg:'Email has been sent. This is a succesful verification mail.'});
  });
  });

//--------------------------------------------------------------------------------------------------------------------------------------------------//



//Using Nexmo service to send SMS.
const Nexmo = require('nexmo');
const nexmo = new Nexmo({
  apiKey: YOUR_API_KEY, //Need to input API created from Nexmo!
  apiSecret: YOUR_API_SECRET //Input the secret_API key.
});

nexmo.message.sendSms(
    YOUR_VIRTUAL_NUMBER, '15105551234', 'yo', //Replace the virtual number an the body of the message. 
      (err, responseData) => {
        if (err) {
          console.log(err);
        } else {
          console.dir(responseData);
        }
      }
   );


app.post('/send', (req, res) =>; {
// Send SMS
nexmo.message.sendSms(
    config.number, req.body.toNumber, req.body.message, {type: 'unicode'},
    (err, responseData) => {if (responseData) {console.log(responseData)}}
);
});

//--------------------------------------------------------------------------------------------------------------------------------------------------//

const config = require('./config/database');
mongoose.connect(config.database, {
    useNewUrlParser: true
});

let db = mongoose.connection;

// Check DB connection
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// Check for DB errors
db.on('error', (err) => {
    console.log(err)
});

// Init App
const app = express();

// Load View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
    extended: false
}))

// parse application/json
app.use(bodyParser.json())


// Express Session Middleware
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
}));

// Express Messages Middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

// Validator
app.use(expressValidator());

// Passport Config
require('./config/passport')(passport);
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', (req, res, next) => {
    res.locals.user = req.user || null;
    next();
})

// Routes
let indexRouter = require('./routes/index');
let accountRouter = require('./routes/account');
let homeworkRouter = require('./routes/homework');
let ical = require('./routes/ical');

app.use('/', indexRouter);
app.use('/account', accountRouter);
app.use('/homework', homeworkRouter);
app.use('/ical', ical);




// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Duck server started on port ${PORT}!`));

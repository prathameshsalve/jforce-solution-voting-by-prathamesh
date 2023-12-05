const  express = require('express')
const app = express()
const port = 5002; // Change the port number
//app.listen(port, () => {
  //console.log(`Server is running on port ${port}`);
//});


app.get('/', (req, res) => res.render("index.ejs"))


app.get('/login', (req, res) => res.render("login.ejs"))
app.get('/signup', (req, res) => res.render("signup.ejs"))
app.get('/vote', (req, res) => res.render("vote.ejs"))
app.get('/admin', (req, res) => res.render("admin.ejs"))
app.get('/count', (req, res) => res.render("count.ejs"))

app.listen(port, () => console.log(`Example app listening on port ${port}!`))


const mysql = require('mysql');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');





const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root123',
  database: 'mynode'
});


db.connect((err) => {
  if (err) throw err;
  console.log('MySQL connected');
});


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.post('/signup', (req, res) => {
  const { username, password, phone, email } = req.body;

  
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, (err, hash) => {
      if (err) throw err;

     
      const newUser = {
        username,
        password: hash, 
        phone,
        email
      };

      db.query('INSERT INTO test SET ?', newUser, (err, result) => {
        if (err) {
          res.status(500).json({ error: 'Error registering user' });
        } else {
          res.redirect('/login');
          

        }
      });
    });
  });
});

const session = require('express-session');
app.use(session({
  secret: 'your_secret_key',
  resave: true,
  saveUninitialized: true
}));






function authenticate(req, res, next) {
  if (req.session && req.session.login) {
    next();
  } else {
    res.status(401).send('Voted successfully.');
  }
}



app.post('/vote', authenticate, (req, res) => {
  const { username, password } = req.body;

 
  if (req.session.voted) {
    res.send('You have already voted.');
  } else {
  
    db.query(
      'SELECT is_voted FROM test WHERE userid = ? AND password = ?',
      [username, password],
      (err, result) => {
        if (err) {
          res.status(500).send('Error occurred while checking voting status');
        } else {
    
          if (result.length > 0 && result[0].is_voted !== 'Y') {
       
            db.query(
              'UPDATE test SET is_voted = ? WHERE userid = ? AND password = ?',
              ['Y', username, password],
              (err, updateResult) => {
                if (err) {
                  res.status(500).send('Error updating vote status');
                } else {
                  req.session.voted = true; 
                  res.send('Voted successfully');
                }
              }
            );
          } else {
            res.send('Already voted');
          }
        }
      }
    );
  }
});



app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.send('Error logging out.');
    } else {
      res.redirect('/login'); 
    }
  
  });
});








app.post('/login', (req, res) => {
  const { username, password } = req.body;

  
  db.query('SELECT * FROM test WHERE username = ?', username, (err, result) => {
    if (err) {
      res.status(500).json({ error: 'Server error' });
    } else if (result.length === 0) {
      res.status(401).json({ error: 'User not found' });
    } else {
      const hashedPassword = result[0].password;

      
      bcrypt.compare(password, hashedPassword, (err, isMatch) => {
        if (err || !isMatch) {
          res.status(401).json({ error: 'Invalid password' });
        } else {
          res.redirect('/Vote');
        }
      });
    }
      
      const voteCounts = [
        { name: 'Candidate A', votes: 25 },
        { name: 'Candidate B', votes: 30 },
        { name: 'Candidate C', votes: 20 },
        { name: 'Candidate D', votes: 35 },
       
      ];
      
  
      app.post('/admin', (req, res) => {
        const { username, password } = req.body;
      
     
        if (username === 'admin' && password === 'password') {
          res.render('count', { voteCounts });
        } else {
          res.send('Invalid credentials');
        }
      });



  });
});





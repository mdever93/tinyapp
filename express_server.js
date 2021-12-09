const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080
app.use(cookieParser())

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {};

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


const generateRandomString = (data) => {
  let output = ''
  let characters = 'abcdefghijklmnopqrstuvwxyz'
  for (let i = 0; i < 6; i++) {
    if (Math.random() > Math.random()) {
      output += Math.floor(Math.random() * 9);
    } else {
      output += characters[Math.floor(Math.random() * characters.length)]
    }
  }
  if (data[output]) {
    output = generateRandomString();
  }
  return output;
}

const blankEmailOrPassword = (email, password) => {
  if (!email || !password) {
    return true;
  }
  return false;
}

const checkEmail = (email) => {
  let keys = Object.keys(users);
  for (const key of keys) {
    if (users[key]['email'] === email) {
      return users[key];
    }
  }
  return false;
}

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  let longURL = req.body.longURL;
  let shortURL = generateRandomString(urlDatabase);
  urlDatabase[shortURL] = longURL;
  console.log(urlDatabase);
  res.redirect('/urls/' + shortURL);
  // res.send("Ok");         // Respond with 'Ok' (we will replace this)
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/urls/new", (req, res) => {
  const userId = req.cookies['user_id'];
  const templateVars = {userId: users[userId]};
  
  res.render("urls_new", templateVars);
});

app.get("/urls", (req, res) => {
  const userId = req.cookies['user_id'];
  const templateVars = {
    urls: urlDatabase,
    userId: users[userId]};
    console.log(userId);
  res.render("urls_index", templateVars);
});

app.get("/urls/:id", (req, res) => {
  let shortURL = req.params.id;
  let longURL = urlDatabase[shortURL];
  const userId = req.cookies['user_id'];
  const templateVars = {
    shortURL, 
    longURL,
    userId: users[userId]};
  res.render("urls_show", templateVars);
});

app.get('/urls/:id', (req, res) => {
  const shortURL = req.params.id;
  const longURL  = urlDatabase[shortURL];
  const userId = req.cookies['user_id'];
  const templateVars = {
    shortURL: longURL,
    userId: users[userId]};
  res.render('urls_show', templateVars)
})

app.post('/urls/:id', (req, res) => {
  const shortURL = req.params.id;
  const newURL = req.body.url;
  urlDatabase[shortURL] = newURL;
  res.redirect('/urls');
  console.log(shortURL, newURL);
})

app.post('/urls/:id/delete', (req, res) => {
  const shortURL = req.params.id;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
})

app.get('/register', (req, res) => {
  const userId = req.cookies['user_id'];
  const templateVars = {userId: users[userId]};

  res.render('register', templateVars);
})

app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (blankEmailOrPassword(email, password)) {
    res.status(400).send("Email and password cannot be left blank");
    res.end();
  } else if (checkEmail(email)) {
    res.status(400).send("There is already an account registered to this email");
    res.end();
  } else {
  const id = generateRandomString(users);
  users[id] = {
    id,
    email,
    password
  };
  console.log(users);
  res.cookie('user_id', id);
  res.redirect('/urls');
  }
})

app.get('/login', (req, res) => {
  const userId = req.cookies['user_id'];
  const templateVars = {userId: users[userId]};
  res.render('login', templateVars);
})

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!checkEmail(email)) {
    res.status(403).send("Email does not match any registeres users");
  } else {
    let user = checkEmail(email);
    if (user.password !== password) {
      res.status(403).send("Incorrect password");
    } else {
      res.cookie('user_id', user.id);
      // const templateVars = {
      //   username: req.cookies['username']
      // }
      res.redirect('/urls')

    }
  }
})

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls')
})

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

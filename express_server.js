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

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


function generateRandomString() {
  let output = ''
  let characters = 'abcdefghijklmnopqrstuvwxyz'
  for (let i = 0; i < 6; i++) {
    if (Math.random() > Math.random()) {
      output += Math.floor(Math.random() * 9);
    } else {
      output += characters[Math.floor(Math.random() * characters.length)]
    }
  }
  return output;
}



app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  let longURL = req.body.longURL;
  let shortURL = generateRandomString();
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
  const templateVars = {username: req.cookies["username"]};
  
  res.render("urls_new", templateVars);
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies['username']};
  res.render("urls_index", templateVars);
});

app.get("/urls/:id", (req, res) => {
  let shortURL = req.params.id;
  let longURL = urlDatabase[shortURL];
  const templateVars = {
    shortURL, 
    longURL,
    username: req.cookies['username']};
  res.render("urls_show", templateVars);
});

app.get('/urls/:id', (req, res) => {
  const shortURL = req.params.id;
  const longURL  = urlDatabase[shortURL];
  const templateVars = {
    shortURL: longURL,
    username: req.cookies['username']};
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

app.post('/login', (req, res) => {
  const username = req.body.username
  res.cookie('username', username);
  // const templateVars = {
  //   username: req.cookies['username']
  // }
  res.redirect('/urls')
})

app.post('/logout', (req, res) => {
  res.clearCookie('username');
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

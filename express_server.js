const { getUserByEmail } = require('./helpers');

const express = require("express");
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const app = express();
const PORT = 8080;
app.use(cookieSession({
  name: 'session',
  keys: ['B62261B5-44EA-4AFD-9B84-AC6E025FCCDA', 'B26C1923-F568-4F38-BC0B-39B469126487'],
}));

app.set("view engine", "ejs");

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userId: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userId: "aJ48lW"
  }
};

const users = {};

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

const getURLs = (id) => {
  const urls = {};
  const keys = Object.keys(urlDatabase);
  for (const key of keys) {
    if (urlDatabase[key]['userId'] === id) {
      urls[key] = urlDatabase[key]['longURL'];
    }
  }
  if (Object.keys(urls).length === 0) {
    return false;
  }
  return urls;
};

const generateRandomString = (data) => {
  let output = '';
  let characters = 'abcdefghijklmnopqrstuvwxyz';
  for (let i = 0; i < 6; i++) {
    if (Math.random() > Math.random()) {
      output += Math.floor(Math.random() * 9);
    } else {
      output += characters[Math.floor(Math.random() * characters.length)];
    }
  }
  if (data[output]) {
    output = generateRandomString();
  }
  return output;
};

const blankEmailOrPassword = (email, password) => {
  if (!email || !password) {
    return true;
  }
  return false;
};

app.get('/register', (req, res) => {  // Shows registration page
  const userId = req.session.user_id;
  if (users[userId]) {
    res.redirect('/urls');
  }
  const templateVars = { userId: users[userId] };

  res.render('register', templateVars);
});

app.post('/register', (req, res) => { // Checks that email is not already in database, hashes password and adds user to users database
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  if (blankEmailOrPassword(email, password)) {
    res.status(400).send("Email and password cannot be left blank");
    res.end();
  } else if (getUserByEmail(email, users)) {
    res.status(400).send("There is already an account registered to this email");
    res.end();
  } else {
    const userId = generateRandomString(users);
    users[userId] = {
      userId,
      email,
      hashedPassword
    };
    req.session.user_id = userId;
    res.redirect('/urls');
  }
});

app.get('/login', (req, res) => { // Shows login page
  const userId = req.session.user_id;
  if (users[userId]) {
    res.redirect('/urls');
  }
  const templateVars = { userId: users[userId] };
  res.render('login', templateVars);
});

app.post('/login', (req, res) => { // Checks email and password and logs user in
  const email = req.body.email;
  const password = req.body.password;
  if (blankEmailOrPassword(email, password)) {
    res.status(400).send("Email and password cannot be left blank");
    res.end();
  } else if (!getUserByEmail(email, users)) {
    res.status(403).send("Email does not match any registered users");
  } else {
    const user = getUserByEmail(email, users);
    const hashedPassword = user.hashedPassword;
    if (bcrypt.compareSync(password, hashedPassword)) {
      const userId = user['userId'];
      req.session.user_id = userId;
      res.redirect('/urls');
    } else {
      res.status(403).send("Incorrect password");

    }
  }
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

app.get("/urls/new", (req, res) => {  // Shows page where user can create new URLs
  const userId = req.session.user_id;
  if (!users[userId]) {
    res.redirect('/login');
  }
  const templateVars = { userId: users[userId] };

  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => { // Creates new short URL
  const userId = req.session.user_id;
  if (!users[userId]) {
    res.status(403).send('Error: log in to create short URLs');
    return;
  }

  let longURL = req.body.longURL;
  let shortURL = generateRandomString(urlDatabase);
  urlDatabase[shortURL] = { longURL, userId };
  res.redirect('/urls/' + shortURL);
});

app.get("/urls/:id", (req, res) => {  // Shows URL and short URL when user creates short URL or wants to edit a short URL
  const userId = req.session.user_id;
  const urlObject = urlDatabase[req.params.id];
  if (!userId) {
    res.status(403).send('Error: log in to update short URLs');
    return;
  }
  if (!urlObject) {
    res.status(404).send("Page not found");
    return;
  }
  if (userId !== urlObject['userId']) {
    res.status(403).send('Error: this short URL belongs to another account');
    return;
  }

  let shortURL = req.params.id;
  let longURL = urlDatabase[shortURL]['longURL'];
  const templateVars = {
    shortURL,
    longURL,
    userId: users[userId]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => { // Redirects user to URL associated with short URL
  if (!urlDatabase[req.params.id]) {
    res.status(404).send("Page not found");
    return;
  }
  const longURL = urlDatabase[req.params.id]['longURL'];
  res.redirect(longURL);
});

app.get("/urls", (req, res) => {  // Shows list of URLs user has created
  const userId = req.session.user_id;
  const urls = getURLs(userId);
  const templateVars = {
    urls,
    userId: users[userId]
  };
  res.render("urls_index", templateVars);
});

app.post('/urls/:id', (req, res) => { // Edits Existing URL
  const userId = req.session.user_id;
  if (!users[userId]) {
    res.status(403).send('Error: log in to update short URLs');
    return;
  }
  const shortURL = req.params.id;
  const longURL = req.body.url;
  urlDatabase[shortURL] = { longURL, userId };
  res.redirect('/urls');
});

app.post('/urls/:id/delete', (req, res) => {  // Deletes short URL
  const userId = req.session.user_id;
  if (!users[userId]) {
    res.status(403).send('Error: log in to delete short URLs');
    return;
  }
  const shortURL = req.params.id;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/users.json", (req, res) => {
  res.json(users);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

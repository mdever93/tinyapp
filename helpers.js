const getUserByEmail = (email, database) => {
  let keys = Object.keys(database);
  for (const key of keys) {
    if (database[key]['email'] === email) {
      const user = database[key];
      return user;
    }
  }
}

module.exports = {getUserByEmail}
const User = require('../model/User');

class UserService {
  constructor() {
    this.users = [];
    const user1 = new User('raju', 'password123', 'raju@example.com');
    this.users.push(user1);
  }

  addUser(user) {
    this.users.push(user);
    return user;
  }

  getUserByUsername(username) {
    return this.users.find((user) => user.username === username);
  }

  getUserByEmail(email) {
    return this.users.find((user) => user.email === email);
  }

  getAllUsers() {
    return this.users;
  }
}

module.exports = UserService;

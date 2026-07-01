const crypto = require("crypto");

const fallbackUsers = new Map();

const createFallbackUser = ({ name, username, email, password }) => {
  const id = crypto.randomUUID();
  const user = {
    _id: id,
    name,
    username,
    email,
    password,
    createdAt: new Date().toISOString(),
    toSafeObject() {
      return {
        _id: this._id,
        name: this.name,
        username: this.username,
        email: this.email,
        createdAt: this.createdAt,
      };
    },
    async matchPassword(candidatePassword) {
      return this.password === candidatePassword;
    },
  };

  fallbackUsers.set(id, user);
  return user;
};

const findFallbackUserByEmailOrUsername = (value) => {
  const normalized = value?.toLowerCase();

  return Array.from(fallbackUsers.values()).find((user) => {
    return (
      user.email?.toLowerCase() === normalized ||
      user.username?.toLowerCase() === normalized
    );
  });
};

const findFallbackUserById = (id) => fallbackUsers.get(id) || null;

module.exports = {
  createFallbackUser,
  findFallbackUserByEmailOrUsername,
  findFallbackUserById,
};

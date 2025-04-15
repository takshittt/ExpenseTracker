const userModel = require("../models/user.model");

module.exports.createUser = async ({ name, email, password }) => {
  if (!name || !email || !password) {
    throw new Error("Please provide all fields");
  }
  const user = await userModel.create({
    name,
    email,
    password,
  });
  return user;
};

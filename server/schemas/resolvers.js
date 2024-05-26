const { User, Book } = require("../models");
const { countDocuments } = require("../models/User");
const { signToken, AuthenticationError } = require("../utils/auth");

const resolvers = {
  Query: {
    // In this, we need to try and pass parent, args before we can get to context because of how qraphql is set up. Also need to make sure to populate the array savedBooks in order to get the information needed to be called.
    me: async (parent, { _id, username, email }) => {
      const user = await User.findOne({
        $or: [{ _id: _id }, { username: username }, { email: email }],
      }).populate("savedBooks");
      if (!user) {
        throw AuthenticationError;
      }
      return user;
    },
  },

  Mutation: {
    addUser: async (parent, { username, email, password }) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user);
      return { token, user };
    },
    // This goes through and makes sure to find the user email first before looking for a corresponding password and verify it.
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user) {
        throw AuthenticationError;
      }
      const isPassword = await user.isCorrectPassword(password);
      if (!isPassword) {
        throw AuthenticationError;
      }
      const token = signToken(user);
      return { token, user };
    },
    // Here we are getting the book information (being pulled form API) and updating the User to add this book to their savedBooks array
    saveBook: async (parent, { authors, description, title, bookId, image, link }, context) => {
      if (context.user) {
        const book = { authors, description, title, bookId, image, link };
        const readingUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet: { savedBooks: book } },
          { new: true }
        ).populate("savedBooks");
        return readingUser;
      }
      throw AuthenticationError;
    },
    // Romoving a book form a user savedBook array using the bookId
    removeBook: async (parent, { bookId }, context) => {
      if (context.user) {
        const overwhelmedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId } } },
          { new: true }
        ).populate("savedBooks");
        return overwhelmedUser;
      }
      throw AuthenticationError;
    },
  },
};

module.exports = resolvers;

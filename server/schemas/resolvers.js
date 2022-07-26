// Setting up file requirements
const { AuthenticationError } = require("apollo-server-express");
const { User } = require("../models");
const { signToken } = require("../utils/auth");

const resolvers = {

    Query: {
        /* Must pass parent, args, context, without them included this will not work.

        parent is the return value of the resolver for this field's parent.
        For resolvers of top-level fields with no parent (like Query, which we are using here),
        this value is obtained from the rootValue function passed to Apollo Server's constructor.

        args is an object that contains all GraphQL arguments that were provided for the field
        by the GraphQL operation, for example doing query{ user(id: "4") } the args passed into
        user resolver would be { "id": "4" }

        context is an object shared across all resolvers that are executing for a particular operation
        */
        me: async (parent, args, context) => {
            /* If there is a context.user, set userData to the User model,
            findOne id which matches the context.user id value,
            then selects everything while excluding the __v and password fields,
            then populates books, then returns the userData for the specific user
            */
            if (context.user) {

                const userData = await User
                    .findOne({ _id: context.user._id })
                    .select("-__v -password")
                    .populate("books")

                return userData;
            };

            // If there is no context.user then throw an error letting the user know they need to login
            throw new AuthenticationError("You need to be logged in to view your books");
        },
    },

    Mutation: {
        // login mutation, this handles the login functionality
        // Passing in parent and an args object containing the email and password
        login: async (parent, { email, password }) => {

            /* Defining user with the User model, finding a user with a matching email
            of what is passed in
            */
            const user = await User.findOne({ email });

            /* If there is no matching email, then throw an error letting the user know
            that their email or password information is incorrect
            */
            if (!user) {
                throw new AuthenticationError("Incorrect email and/or password");
            };

            /* Defining userPassword to the passed in password, runs the isCorrectPassword
            on the password passed in to check if its valid and matches the bcrypt hash
            */
            const userPassword = await user.isCorrectPassword(password);

            /* If there is no matching password, then throw an error letting the user know
            that their email or password information is incorrect
            */
            if (!userPassword) {
                throw new AuthenticationError("Incorrect email and/or password");
            };

            /* Assigning token to the specified user, passing it into signToken to
            add it to the data values for the signed json web token
            */
            const token = signToken(user);

            // Returning the token and the user as an object
            return { token, user };

        },
        
        // addUser mutation, this handles the creating a new user functionality
        // Passing in parent and args
        addUser: async (parent, args) => {
            /* Defining user to the User model and then creating a User based
            on the args which are passed in
            */
            const user = await User.create(args);

            /* Assigning token to the specified user, passing it into signToken to
            add it to the data values for the signed json web token
            */
            const token = signToken(user);

            // Returning the token and the user as an object
            return { token, user };
        },

        // saveBook mutation, this handles saving book functionality
        // Passing in parent, a bookData object for args, and context
        saveBook: async (parent, { bookData }, context) => {
            /* If there is a context.user, then it will assign updatedUser to the
            User model and find a specific user based on a matching id,
            then it will add the passed in bookData into the savedBooks field for the user,
            then setting new to true so that it updates the database with the new User data
            */
            if (context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $addToSet: { savedBooks: bookData } },
                    { new: true },
                )
                // Populating books
                .populate("books");

                // Returning the updatedUser, now containing the saved book
                return updatedUser;
            };

            /* If there is no context.user, then it will throw an error letting
            the user know that they need to login to save books
            */
            throw new AuthenticationError("You need to be logged in to save books");
        },

        // removeBook mutation, this handles removing book functionality
        // Passing in parent, a BookId object for args, and context
        removeBook: async (parent, { bookId }, context) => {
            /* If there is a context.user, then it will assign updatedUser to the
            User model and find a specific user based on a matching id,
            then it will remove the passed in bookId from the savedBooks field for the user,
            then setting new to true so that it updates the database with the new User data
            */
            if (context.user) {
                const updatedUser = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: { bookId } } },
                    { new: true },
                )

                // Returning the updatedUser, now without the specified book
                return updatedUser;
            };

            /* If there is no context.user, then it will throw an error letting
            the user know that they need to login to delete books
            */
            throw new AuthenticationError("You need to be logged in to delete books");

        },
    },
};

// Exporting module so it can be used in other files
module.exports = resolvers;
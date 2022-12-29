const Author = require("../models/Author");
const Book = require("../models/Book");
const { PubSub } = require("graphql-subscriptions");
const { GraphQLError } = require("graphql");

const pubsub = new PubSub();

const resolvers = {
  // QUERY
  Query: {
    books: async (parent, args, context) => {
      return await context.mongoDataMethods.getAllBooks();
    },

    book: async (parent, args, context) =>
      await context.mongoDataMethods.getBookById(args.id),

    authors: async (parent, args, { mongoDataMethods }) =>
      await mongoDataMethods.getAllAuthors(),

    author: async (parent, { id }, { mongoDataMethods }) => {
      const author = await mongoDataMethods.getAuthorById(id);
      if (author) {
        return author;
      } else {
        throw new GraphQLError("There is not author with id " + id, {
          extensions: {
            code: "AUTHOR_NOT_FOUND",
          },
        });
      }
    },

    search: async (_, { contains }, { mongoDataMethods }, info) => {
      console.log("Object: ", contains);
      console.log("Info: ", info);
      const books = await mongoDataMethods.searchBookByGenre({
        genre: contains,
      });
      const authors = await mongoDataMethods.searchAuthorByName({
        name: contains,
      });
      return [...books, ...authors];
    },
  },

  Book: {
    author: async ({ authorId }, args, { mongoDataMethods, authorLoader }) => {
      const authors = await authorLoader.load(authorId);
      return authors;
    },
  },

  Author: {
    books: async (parent, args, { mongoDataMethods }) =>
      await mongoDataMethods.getBooksOfAuthor(parent.id),
  },

  Mutation: {
    createAuthor: async (parent, args, context) => {
      return await context.mongoDataMethods.createAuthor(args);
    },

    createBook: async (parent, args, { mongoDataMethods }) => {
      pubsub.publish("BOOK_CREATED", {
        createdBook: args,
      });
      return await mongoDataMethods.createBook(args);
    },

    updateBookName: async (parent, args, { mongoDataMethods }) => {
      return await mongoDataMethods.updateBookName(args);
    },

    deleteBook: async (parent, args, { mongoDataMethods }) => {
      return await mongoDataMethods.deleteBook(args);
    },
  },

  Subscription: {
    createdBook: {
      subscribe: () => pubsub.asyncIterator(["BOOK_CREATED"]),
    },
  },

  SearchResult: {
    // SearchResult chính là tên của union type
    __resolveType: (obj) => {
      console.log("Object1: ", obj);
      if (obj instanceof Book) return "Book";

      if (obj instanceof Author) return "Author";
      return null;
    },
  },
};

module.exports = resolvers;

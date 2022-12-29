const Book = require("../models/Book");
const Author = require("../models/Author");

const mongoDataMethods = {
  getAllBooks: async () => await Book.find(),

  getBookById: async (id) => await Book.findById(id),

  getAllAuthors: async () => await Author.find(),

  getAuthorById: async (id) => {
    console.log("DB id: ", id);
    const author = await Author.findById(id);
    return author;
  },

  getBooksOfAuthor: async (idAuthor) => await Book.find({ authorId: idAuthor }),

  createBook: async (args) => {
    const newBook = new Book(args);
    return await newBook.save();
  },

  createAuthor: async (args) => {
    const newAuthor = new Author(args);
    return await newAuthor.save();
  },

  updateBookName: async (args) => {
    const book = await Book.findOneAndUpdate(
      { _id: args.id },
      { name: args.name }
    );
    return {
      code: 200,
      success: true,
      message: "Updated book name successfully",
      book,
    };
  },

  deleteBook: async (args) => {
    const book = await Book.findOneAndDelete({ _id: args.id });
    return book;
  },

  searchBookByGenre: async (args) => {
    const books = await Book.find({ genre: args.genre });
    return books;
  },

  searchAuthorByName: async (args) => {
    const authors = await Author.find({ name: args.name });
    return authors;
  },
};

module.exports = mongoDataMethods;

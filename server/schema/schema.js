const { gql } = require("@apollo/server");

const typeDefs = `#graphql
  interface MutationResponse {
    code: String!
    success: Boolean!
    message: String!
  }

  type Book {
    id: ID
    name: String
    genre: String
    author: Author
  }

  type UpdateBookMutationResponse implements MutationResponse {
    code: String!
    success: Boolean!
    message: String!
    book: Book
  }

  type Author {
    id: ID!
    name: String
    age: Int
    books: [Book]
  }

  union SearchResult = Book | Author

  # ROOT TYPE
  type Query {
    books: [Book]
    book(id: ID!): Book
    authors: [Author]
    author(id: ID!): Author

    search(contains: String): [SearchResult!]
  }

  type Mutation {
    createAuthor(name: String, age: Int): Author
    createBook(name: String, genre: String, authorId: ID): Book

    updateBookName(id: ID!, name: String): UpdateBookMutationResponse
    deleteBook(id: ID!): Book
  }

  type Subscription {
    createdBook: Book
  }
`;

module.exports = typeDefs;

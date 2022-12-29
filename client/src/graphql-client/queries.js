import { gql } from "@apollo/client";

const getBooks = gql`
  query getBooksQuery {
    books {
      id
      name
    }
  }
`;

const getSingleBooks = gql`
  query getSingleBooksQuery($id: ID!) {
    book(id: $id) {
      id
      name
      genre
      author {
        id
        name
        age
        books {
          id
          name
        }
      }
    }
  }
`;

const getAuthors = gql`
  query getAuthorsQuery {
    authors {
      id
      name
    }
  }
`;

export { getBooks, getSingleBooks, getAuthors };

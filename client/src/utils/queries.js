// Setting up file requirements
import { gql } from "@apollo/client";

// Exporting module so it can be used in other files
export const QUERY_ME = gql`
    {
        me {
            _id
            username
            email
            bookCount
            savedBooks {
                bookId
                authors
                title
                description
                image
                link
            }
        }
    }
`;
import React, { useState, useEffect } from 'react';
import { Jumbotron, Container, CardColumns, Card, Button } from 'react-bootstrap';

import { useQuery, useMutation } from "@apollo/client";
import { QUERY_ME } from "../utils/queries";
import { REMOVE_BOOK } from "../utils/mutations";
import Auth from "../utils/auth";
import { removeBookId } from "../utils/localStorage";

const SavedBooks = () => {
  
  /* Assigning an object containing loading and data, loading will occur if query is still
  retrieving data, data will equaL the data gathered from the QUERY_ME
  */
  const { loading, data } = useQuery(QUERY_ME);
  /* Assigning an array containing the removeBook resolver and an error object,
  removeBook will use the REMOVE_BOOK mutation, and error will log errors that occur
  */
  const [removeBook, { error }] = useMutation(REMOVE_BOOK);
  // If data exists, assign userData to the data.me or an empty object
  const userData = data?.me || {};


  // create function that accepts the book's mongo _id value as param and deletes the book from the database
  const handleDeleteBook = async (bookId) => {
    const token = Auth.loggedIn() ? Auth.getToken() : null;

    // If there is no token, stop the function from executing
    if (!token) {
      return false;
    }

    try {
      console.log("Made it inside try")
      console.log( { bookId })
      
      // Makes the data use the removeBook mutation to update data value
      const { data } = await removeBook({
        variables:{ bookId:bookId }
      });
      console.log("Test")
      console.log("Data is " + { data });
      // upon success, remove book's id from localStorage
      removeBookId(bookId);
      console.log("Is this showing up?")
    } catch (err) {
      // If theres an error, log an error
      console.error(err);
    }
  };

  // if data isn't here yet, say so
  if (loading) {
    return <h2>LOADING...</h2>;
  }

  return (
    <>
      <Jumbotron fluid className='text-light bg-dark'>
        <Container>
          <h1>Viewing saved books!</h1>
        </Container>
      </Jumbotron>
      <Container>
        <h2>
          {userData.savedBooks.length
            ? `Viewing ${userData.savedBooks.length} saved ${userData.savedBooks.length === 1 ? 'book' : 'books'}:`
            : 'You have no saved books!'}
        </h2>
        <CardColumns>
          {userData.savedBooks.map((book) => {
            return (
              <Card key={book.bookId} border='dark'>
                {book.image ? <Card.Img src={book.image} alt={`The cover for ${book.title}`} variant='top' /> : null}
                <Card.Body>
                  <Card.Title>{book.title}</Card.Title>
                  <p className='small'>Authors: {book.authors}</p>
                  <Card.Text>{book.description}</Card.Text>
                  <Button className='btn-block btn-danger' onClick={() => handleDeleteBook(book.bookId)}>
                    Delete this Book!
                  </Button>
                </Card.Body>
              </Card>
            );
          })}
        </CardColumns>
      </Container>
    </>
  );
};

export default SavedBooks;

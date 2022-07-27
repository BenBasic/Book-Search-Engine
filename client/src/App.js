import React from 'react';
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  createHttpLink,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SearchBooks from './pages/SearchBooks';
import SavedBooks from './pages/SavedBooks';
import Navbar from './components/Navbar';


// Constructing an http link, assigning uri to the URL of the GraphQL endpoint to send requests to
const httpLink = createHttpLink({
  uri: '/graphql'
})


const authLink = setContext((_, { headers }) => {
  // Getting the authentication token from local storage
  const token = localStorage.getItem("id_token");
  // Returning the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

// Creating a new ApolloClient (This is an Apollo Client constructor)
const client = new ApolloClient({
  // Chaining the HTTP link and the authorization link
  link: authLink.concat(httpLink),
  // Assigning cache to InMemoryCache object, this stores the results of its GraphQL queries in cache
  cache: new InMemoryCache(),
});


function App() {
  return (
    <ApolloProvider client={client}>
      <Router>
        <>
          <Navbar />
          <Routes>
          <Route 
              path="/" 
              element={<SearchBooks />} 
            />
            <Route 
              path="/saved" 
              element={<SavedBooks />} 
            />
            <Route 
              path="*" 
              element={<h1 className="display-2">Wrong page!</h1>} 
            />
          </Routes>
        </>
      </Router>
    </ApolloProvider>
  );
};

export default App;

const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
    // Filter the users array for any user with the same username
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    // Return true if any user with the same username is found, otherwise false
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
let validusers = users.filter((user) => {
    return (user.username === username && user.password === password);
});
// Return true if any valid user is found, otherwise false
if (validusers.length > 0) {
    return true;
} else {
    return false;
}
}


//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
  const username = req.body.username;
    const password = req.body.password;

    // Check if username or password is missing
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }

    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 160 * 160 });

        // Store access token and username in session
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    // Retrieve the username from the session
    const username = req.session.authorization?.username;
  
    if (!username) {
      return res.status(403).json({ message: "User not authenticated" });
    }
  
    const { review } = req.body; // The review text submitted by the user
    const isbn = req.params.isbn; // The ISBN of the book being reviewed
  
    // Check if the book with the given ISBN exists
    if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
    }
  
    // Add or update the review for the specific user
    books[isbn].reviews[username] = review;
  
    return res.status(200).json({ message: "Review added/updated successfully", reviews: books[isbn].reviews });
  });

  
  // Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    // Retrieve the username from the session
    const username = req.session.authorization?.username;
  
    if (!username) {
      return res.status(403).json({ message: "User not authenticated" });
    }
  
    const isbn = req.params.isbn; // The ISBN of the book
  
    // Check if the book with the given ISBN exists
    if (!books[isbn]) {
      return res.status(404).json({ message: "Book not found" });
    }
  
    // Check if the user has already posted a review
    if (!books[isbn].reviews[username]) {
      return res.status(404).json({ message: "Review not found for this user" });
    }
  
    // Delete the review for this user
    delete books[isbn].reviews[username];
  
    return res.status(200).json({ message: "Review deleted successfully", reviews: books[isbn].reviews });
  });
  
  

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
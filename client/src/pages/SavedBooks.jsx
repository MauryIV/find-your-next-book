import { Container, Card, Button, Row, Col } from "react-bootstrap";
import { useQuery, useMutation } from "@apollo/client";
import { GET_ME } from "../utils/queries";
import { REMOVE_BOOK } from "../utils/mutations";
import Auth from "../utils/auth";
import { removeBookId } from "../utils/localStorage";

const SavedBooks = () => {
  const userId = Auth.getUserId();

  const { loading, error, data } = useQuery(GET_ME, {
    variables: { userId },
    context: {
      headers: {
        authorization: `Bearer ${Auth.getToken()}`,
      },
    },
  });

  const [removeBook, { error: removeBookError }] = useMutation(REMOVE_BOOK);

  if (error) {
    console.log("Error:", error.message);
  }

  const userData = data?.me || [];

  // Make sure user is logged in, in order to delte book from said user
  const handleDeleteBook = async (bookId) => {
    const token = Auth.loggedIn() ? Auth.getToken() : null;
    if (!token) {
      return false;
    }

    try {
      await removeBook({
        variables: { bookId },
      });

      // upon success, remove book's id from localStorage
      removeBookId(bookId);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="text-light bg-dark p-5">
        <Container fluid>
          <h1>Viewing saved books!</h1>
        </Container>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <Container fluid>
          <h2 className="pt-5">
            {userData.savedBooks.length
              ? `Viewing ${userData.savedBooks.length} saved ${
                  userData.savedBooks.length === 1 ? "book" : "books"
                }:`
              : "You have no saved books!"}
          </h2>
          <Row>
            {userData.savedBooks.map((book) => {
              return (
                <Col md="4">
                  <Card key={book.bookId} border="dark">
                    {book.image ? (
                      <Card.Img
                        src={book.image}
                        alt={`The cover for ${book.title}`}
                        variant="top"
                      />
                    ) : null}
                    <Card.Body>
                      <Card.Title>{book.title}</Card.Title>
                      <p className="small">Authors: {book.authors}</p>
                      <Card.Text>{book.description}</Card.Text>
                      <Button
                        className="btn-block btn-danger"
                        onClick={() => handleDeleteBook(book.bookId)}
                      >
                        Delete this Book!
                      </Button>
                    </Card.Body>
                  </Card>
                  {removeBookError && (
                    <div className="my-3 p-3 bg-danger text-white">
                      {removeBookError.message}
                    </div>
                  )}
                </Col>
              );
            })}
          </Row>
        </Container>
      )}
    </div>
  );
};

export default SavedBooks;

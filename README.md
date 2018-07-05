# express-seed

An arhcitecturally sound starting point for a RESTful service utilizing expressjs, sequelize, and PostgreSQL.

## Major Node Modules
- **bcrypt:** One way encryption of passwords
- **joi:** validates the request objects before route entry
- **passport:** authentication and authorization middleware
- **winston:** Logging framework

## Class Organization
- **Route:** An initial entry to the web service corresponding to HTTP methods (POST, GET, PUT, etc.). The route listens for incoming request and routes them to the lower layers.

- **Controller:** Contains business logic to be performed to fulfill the given requests.  An example might be calling various database tables and aggregating their data to be returned to the client.

- **Repository:** The sole purpose it’s to communicate with the database.

- **Validation:** JOI json schema for validation of request parameters

## Project Structure

Project favores the division of classes by feature instead of by class type. Consider the **features/users** directory.

- UserController
- UserRepository
- UserRoute
- UserValidation

### Additional directories

- **utils:** global classes and functions.
- **config:** global configurations.
- **middleware:** global middleware.


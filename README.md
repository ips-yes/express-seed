
# express-seed

An architecturally sound starting point for a RESTful service utilizing expressjs, sequelize, and PostgreSQL.
<table table-layout="fixed" width="500px">
    <tr>
    <td>
    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Expressjs.png/220px-Expressjs.png" alt="sequelize"/>
    </td>
    <td>
    <img src="http://docs.sequelizejs.com/manual/asset/logo-small.png" alt="sequelize" height="100px" width="100px"/>
    </td>
    <td>
    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Postgresql_elephant.svg/120px-Postgresql_elephant.svg.png" alt="sequelize" height="100px" width="100px"/>
    </td>
    </tr>
</table>



<br><br>

- **bcrypt:** One way encryption of passwords
- **joi:** validates the request objects before route entry
- **passport:** authentication and authorization middleware
- **winston:** Logging framework

## Class Organization
- **Route:** An initial entry to the web service corresponding to HTTP methods (POST, GET, PUT, etc.). The route listens for incoming request and routes them to the lower layers.

- **Controller:** Contains business logic to be performed to fulfill the given requests.  An example might be calling various database tables and aggregating their data to be returned to the client.

- **Repository:** The sole purpose is to communicate with the database.

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


### Sample Routes
**The base path can be found in the config/dev.json**

**POST /users/**

This route will create a user. Note that when creating the first user you'll need to remove the authentication middleware temporarily

**required body params**
- email: string
- password: string 8 characters, One Uppercase, One Lowercase, One number, One special char
- userTypeId: int

**POST /users/login**

This route will attempt to login the given user. It will return a session token which must then be provided for authorization on requests

**required body params**
- username: string
- password: string

**GET /users/<id>**

This route will get the user with the associated ID.

**required query params**
- id: int


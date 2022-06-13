# express-seed

An architecturally sound starting point for a RESTful service utilizing expressjs, sequelize, and PostgreSQL.
<table table-layout="fixed" width="500px">
    <tr>
    <td>
    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Expressjs.png/220px-Expressjs.png" alt="express.js"/>
    </td>
    <td>
    <img src="https://sequelize.org/img/logo.svg" alt="sequelize.js" height="100px" width="100px"/>
    </td>
    <td>
    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Postgresql_elephant.svg/120px-Postgresql_elephant.svg.png" alt="postgres" height="100px" width="100px"/>
    </td>
    </tr>
</table>


- **bcrypt:** One way encryption of passwords
- **joi:** Validates the request objects before route entry
- **passport:** Authentication and authorization middleware
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

## Scripts
- `start`
  - Runs the application.
- `lint`
  - Runs the linter on both source code and styling modules.
- `build`
  - Builds the source code into a `build` directory containing JavaScript that can be hosted on a server.
- `test`
  - Runs any test modules within the project. Refer to [Testing](#testing) for more information on test files.
- `test:coverage`
  - Save as `test`, just with coverage.

## Development Environment Setup
    
**Run locally**
- Download Postgres from https://www.postgresql.org/download/ to run a database locally
- Open a terminal in the server directory
- run ``yarn run start`` to start the program

**Docker setup**
- Install docker desktop from https://www.docker.com/products/docker-desktop/
- Ensure virtualization is enabled
- Open a terminal in the server directory
- Run ``docker build —tag express-seed .`` to build the image for the project
- Run ``docker compose up`` to start the project

**PGAdmin setup**
- Download PGAdmin from https://www.pgadmin.org/download/
- Follow the instructions in Docker Setup or Run Locally to launch the project
- Open PGAdmin and select “add new server” from the main screen
- Make a name for the server
- Go to the Connection tab, set the host address as `localhost`
- Set the password to the same password set in server/config/docker.json or server/config/dev.json depending on if you're running the project in docker or locally
- You should see a database in the server named ‘express-server’, open this and go to Schemas/Public/Tables to view data
    
## Testing
Tests can be implemented in two different ways:

- Create a file ending with `test.ts` within the `src/__tests__` directory.
- Create a file ending with `test.ts` anywhere within the `src` directory, preferably within the same directory as the test subject(s).

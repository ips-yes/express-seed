module.exports = {
    HTTP: {
        SUCCESS: {
            get DELETE() {
                return {
                    statusCode: 200,
                    message: {message: "Resource Deleted"}
                };
            },
            get UPDATE() {
                return {
                    statusCode: 200,
                    message: {message: 'Update Successful'}
                };
            },
            get CREATED() {
                return {
                    statusCode: 201,
                    message: {message: "Resource Created"}
                };
            }
        },
        ERROR: {
            get NOT_FOUND() {
                return {
                    statusText: "Resource Not Found",
                    statusCode: 404,
                    message: {message: "Resource Not Found"}
                }
            }
        }
    },
    AUTH: {
        get PASSWORD_FAIL(){
            return{
                statusCode: 401,
                message: 'Incorrect Password'
            }
        },
        get PASSWORD_SUCCESS(){
            return {
                message: 'Login Successful'
            }
        },
        get SESSION_FAIL(){
            return{
                statusCode: 401,
                message: 'Invalid Session'
            }
        },
        get SESSION_EXPIRED(){
            return{
                statusCode: 401,
                message: 'Session Expired'
            }
        },
        get SESSION_MISSING(){
            return{
                statusCode: 401,
                message: 'Cookie Missing'
            }
        },
        get SESSION_LOGGED_OUT(){
            return{
                statusCode: 200,
                message: 'Logout Successful'
            }
        },
        get LOGIN_EXPIRED(){
            return{
                statusCode: 401,
                message: 'Login Expired'
            }
        }
    },
    DB:{
        USER_TYPE: {
            ADMIN: 'Admin'
        }
    }
};
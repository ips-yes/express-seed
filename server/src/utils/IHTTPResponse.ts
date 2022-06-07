// HTTP Response message
interface IHTTPResponse {
    statusCode: number
    message?: string
    ip?: string
    id?: number
}

export default IHTTPResponse;

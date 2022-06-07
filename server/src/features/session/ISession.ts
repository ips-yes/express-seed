// Defines the interface for a session model

interface ISession {
    uuid: string
    expiresAt?: Date
    active?: boolean
    expired?: boolean
    userId?: number
    UserType?: {value: any}
}

export default ISession;

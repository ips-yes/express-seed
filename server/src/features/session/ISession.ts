// Defines the interface for a session model

export default interface ISession {
    uuid: string
    expiresAt?: Date
    active?: boolean
    expired?: boolean
    userId?: number
    UserType?: {value: any}
};

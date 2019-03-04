// Defines the interface for a session model

export default interface ISession {
    uuid: string
    expires_at?: Date
    active?: boolean
    expired?: boolean
    user_id?: number
    user_type?: {value: any}
}

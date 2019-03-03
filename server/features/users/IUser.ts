// Defines the interface for a user model

export default interface IUser {
    _id?: number;
    deleted?: boolean
    created_by?: number
    edited_by?: number
    email?: string
    first_name?: string
    last_name?: string
    password?: string
    user_type?: {value: any}
}

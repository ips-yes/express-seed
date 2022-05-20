// Defines the interface for a user model

export default interface IUser {
    id?: number;
    deleted?: boolean
    createdBy?: number
    editedBy?: number
    email?: string
    firstName?: string
    lastName?: string
    password?: string
    UserType?: {value: any}
};

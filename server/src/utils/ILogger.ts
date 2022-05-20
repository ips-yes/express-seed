// Defines log interface
export default interface ILogger {
    info(msg: any): void
    warn(msg: any): void
    error(msg: any): void
}
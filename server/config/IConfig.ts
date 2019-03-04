export interface IAppConfig {
    NAME: string;
    PORT: number;
    CLIENT_PORT: string;
    VERSION: string;
    ADDRESS: string;
    PATH: string;
    HTTP: string;
}
export interface IBCryptConfig {
    costFactor: number;
}
export interface IAuthConfig {
    cookieLife: number;
    bcrypt: IBCryptConfig;
    recoveryLife: number;
    maxSessions: number;
}
export interface ILimiterConfig {
    enable: boolean;
    windowMS: number;
    max: number;
    delayMs: number;
}
export interface IDatabaseConfig {
    VERSION: string;
    HOST: string;
    NAME: string;
    USER: string;
    PASSWORD: string;
    SYNC: boolean;
}
export interface ISessionConfig {
    staleSessionTimeToLiveInDays: number;
    sessionCleanupFrequencyInDays: number;
}
export interface IConfig {
    app: IAppConfig;
    auth: IAuthConfig;
    limiter: ILimiterConfig;
    db: IDatabaseConfig;
    sessionLife: ISessionConfig;
}

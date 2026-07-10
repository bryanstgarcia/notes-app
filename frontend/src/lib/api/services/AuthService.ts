/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Register } from '../models/Register';
import type { TokenObtainPair } from '../models/TokenObtainPair';
import type { TokenRefresh } from '../models/TokenRefresh';
import type { User } from '../models/User';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AuthService {
    /**
     * Takes a set of user credentials and returns an access and refresh JSON web
     * token pair to prove the authentication of those credentials.
     * @param requestBody
     * @returns TokenObtainPair
     * @throws ApiError
     */
    public static authLoginCreate(
        requestBody: TokenObtainPair,
    ): CancelablePromise<TokenObtainPair> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/login/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns User
     * @throws ApiError
     */
    public static authMeRetrieve(): CancelablePromise<User> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/auth/me/',
        });
    }
    /**
     * Takes a refresh type JSON web token and returns an access type JSON web
     * token if the refresh token is valid.
     * @param requestBody
     * @returns TokenRefresh
     * @throws ApiError
     */
    public static authRefreshCreate(
        requestBody: TokenRefresh,
    ): CancelablePromise<TokenRefresh> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/refresh/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param requestBody
     * @returns Register
     * @throws ApiError
     */
    public static authRegisterCreate(
        requestBody: Register,
    ): CancelablePromise<Register> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/register/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}

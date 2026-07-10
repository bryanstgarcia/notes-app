/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Note } from '../models/Note';
import type { PatchedNote } from '../models/PatchedNote';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class NotesService {
    /**
     * @returns Note
     * @throws ApiError
     */
    public static notesList(): CancelablePromise<Array<Note>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/notes/',
        });
    }
    /**
     * @param requestBody
     * @returns Note
     * @throws ApiError
     */
    public static notesCreate(
        requestBody?: Note,
    ): CancelablePromise<Note> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/notes/',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param id
     * @returns Note
     * @throws ApiError
     */
    public static notesRetrieve(
        id: number,
    ): CancelablePromise<Note> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/notes/{id}/',
            path: {
                'id': id,
            },
        });
    }
    /**
     * @param id
     * @param requestBody
     * @returns Note
     * @throws ApiError
     */
    public static notesPartialUpdate(
        id: number,
        requestBody?: PatchedNote,
    ): CancelablePromise<Note> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/notes/{id}/',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
}

/**
 * Utility for calling Firebase Cloud Functions
 * This provides a centralized way to call Firebase callable functions
 * 
 * This module uses dependency injection to avoid requiring Firebase SDK in SculpoDatabase
 * The actual Firebase functions instance is provided by the consuming app (SculpoAdmin)
 */

// Type definitions to avoid importing Firebase SDK here
export type FirebaseFunctions = any;
export type HttpsCallable = <T, R>(data: T) => Promise<{ data: R }>;

// Store the callable function factory
let createCallable: ((functionName: string) => HttpsCallable) | null = null;

/**
 * Initialize Firebase functions with a factory function
 * This should be called once when the app starts, typically in the app's initialization code
 * @param callableFactory - Function that creates callable functions given a function name
 */
export const initializeFirebaseFunctions = (callableFactory: (functionName: string) => HttpsCallable) => {
    createCallable = callableFactory;
};

/**
 * Call a Firebase Cloud Function
 * @param functionName - Name of the Firebase function to call
 * @param data - Data to pass to the function
 * @returns Promise with the function response
 * @throws Error if Firebase functions are not initialized
 */
export const callFunction = async <T, R>(functionName: string, data: T): Promise<{ data: R }> => {
    if (!createCallable) {
        throw new Error(
            "Firebase functions not initialized. " +
            "Please call initializeFirebaseFunctions() in your app's initialization code (e.g., _layout.tsx)."
        );
    }
    
    const callable = createCallable(functionName);
    return callable<T, R>(data);
};

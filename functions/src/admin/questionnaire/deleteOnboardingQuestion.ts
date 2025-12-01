/**
 * Firebase Cloud Function to delete an onboarding question
 */
import { Collection } from "../../utils/collection";

const {info} = require("firebase-functions/logger");
const {onCall} = require("firebase-functions/v2/https");
const {getFirestore} = require("firebase-admin/firestore");

export const deleteOnboardingQuestion = onCall(
    {
        cors: [
            /https:\/\/.*\.exp\.direct$/,
            "http://localhost",
            "http://127.0.0.1",
        ]
    },
    async (req: any) => {
        info("deleteOnboardingQuestion invoked", {structuredData: true});
        const { questionId } = req.data;
        
        if (!questionId) {
            throw new Error("questionId is required");
        }

        const firestore = getFirestore();

        try {
            const questionRef = firestore
                .collection(Collection.ONBOARDING_QUESTIONS)
                .doc(questionId);

            // Check if question exists
            const existingDoc = await questionRef.get();
            if (!existingDoc.exists) {
                throw new Error("Question not found");
            }

            await questionRef.delete();

            info(`Deleted onboarding question with ID: ${questionId}`);
            return { success: true };
        } catch (error: any) {
            info("Error deleting onboarding question", {error: error.message});
            throw new Error(`Failed to delete onboarding question: ${error.message}`);
        }
    }
);

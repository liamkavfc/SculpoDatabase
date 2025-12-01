/**
 * Firebase Cloud Function to get onboarding answers for a specific user
 * This function retrieves all questionnaire answers submitted by a user
 */
import { Collection } from "../../utils/collection";

const {info} = require("firebase-functions/logger");
const {onCall} = require("firebase-functions/v2/https");
const {getFirestore} = require("firebase-admin/firestore");

export const getOnboardingAnswers = onCall(
    {
        cors: [
            /https:\/\/.*\.exp\.direct$/,
            "http://localhost",
            "http://127.0.0.1",
        ]
    },
    async (req: any) => {
        info("getOnboardingAnswers invoked", {structuredData: true});
        const { userId } = req.data;
        
        if (!userId) {
            throw new Error("userId is required");
        }

        const firestore = getFirestore();

        try {
            // Query onboarding answers by userId
            const answersSnapshot = await firestore
                .collection(Collection.ONBOARDING_ANSWERS)
                .where("userId", "==", userId)
                .get();

            const answers = answersSnapshot.docs.map((doc: any) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    questionId: data.questionId || null,
                    questionTitle: data.questionTitle || 'Question',
                    section: data.section || 'General',
                    answer: data.answer || '',
                    submittedAt: data.submittedAt ? data.submittedAt.toDate().toISOString() : null,
                };
            });

            info(`Found ${answers.length} answers for userId: ${userId}`);
            return answers;
        } catch (error: any) {
            info("Error getting onboarding answers", {error: error.message});
            throw new Error(`Failed to get onboarding answers: ${error.message}`);
        }
    }
);

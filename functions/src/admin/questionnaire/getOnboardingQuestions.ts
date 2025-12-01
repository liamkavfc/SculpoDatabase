/**
 * Firebase Cloud Function to get all onboarding questions
 * Returns all questions, optionally filtered by active status
 */
import { Collection } from "../../utils/collection";

const {info} = require("firebase-functions/logger");
const {onCall} = require("firebase-functions/v2/https");
const {getFirestore} = require("firebase-admin/firestore");

export const getOnboardingQuestions = onCall(
    {
        cors: [
            /https:\/\/.*\.exp\.direct$/,
            "http://localhost",
            "http://127.0.0.1",
        ]
    },
    async (req: any) => {
        info("getOnboardingQuestions invoked", {structuredData: true});
        const { activeOnly } = req.data || {};

        const firestore = getFirestore();

        try {
            let query = firestore.collection(Collection.ONBOARDING_QUESTIONS);

            // Filter by active status if requested
            if (activeOnly === true) {
                query = query.where("active", "==", true);
            }

            const snapshot = await query.orderBy("order", "asc").get();

            const questions = snapshot.docs.map((doc: any) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    title: data.title || '',
                    section: data.section || 'General',
                    type: data.type || 0,
                    active: data.active !== undefined ? data.active : true,
                    order: data.order || 0,
                    options: data.options || [],
                    createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : null,
                    updatedAt: data.updatedAt ? data.updatedAt.toDate().toISOString() : null,
                };
            });

            info(`Found ${questions.length} onboarding questions`);
            return questions;
        } catch (error: any) {
            info("Error getting onboarding questions", {error: error.message});
            throw new Error(`Failed to get onboarding questions: ${error.message}`);
        }
    }
);

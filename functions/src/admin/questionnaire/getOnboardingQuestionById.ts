/**
 * Firebase Cloud Function to get a single onboarding question by ID
 */
import { Collection } from "../../utils/collection";

const {info} = require("firebase-functions/logger");
const {onCall} = require("firebase-functions/v2/https");
const {getFirestore} = require("firebase-admin/firestore");

export const getOnboardingQuestionById = onCall(
    {
        cors: [
            /https:\/\/.*\.exp\.direct$/,
            "http://localhost",
            "http://127.0.0.1",
        ]
    },
    async (req: any) => {
        info("getOnboardingQuestionById invoked", {structuredData: true});
        const { questionId } = req.data;
        
        if (!questionId) {
            throw new Error("questionId is required");
        }

        const firestore = getFirestore();

        try {
            const doc = await firestore
                .collection(Collection.ONBOARDING_QUESTIONS)
                .doc(questionId)
                .get();

            if (!doc.exists) {
                return null;
            }

            const data = doc.data();
            return {
                id: doc.id,
                title: data?.title || '',
                section: data?.section || 'General',
                type: data?.type || 0,
                active: data?.active !== undefined ? data.active : true,
                order: data?.order || 0,
                options: data?.options || [],
                createdAt: data?.createdAt ? data.createdAt.toDate().toISOString() : null,
                updatedAt: data?.updatedAt ? data.updatedAt.toDate().toISOString() : null,
            };
        } catch (error: any) {
            info("Error getting onboarding question by ID", {error: error.message});
            throw new Error(`Failed to get onboarding question: ${error.message}`);
        }
    }
);

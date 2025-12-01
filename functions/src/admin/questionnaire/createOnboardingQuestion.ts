/**
 * Firebase Cloud Function to create a new onboarding question
 */
import { Collection } from "../../utils/collection";

const {info} = require("firebase-functions/logger");
const {onCall} = require("firebase-functions/v2/https");
const {getFirestore, FieldValue} = require("firebase-admin/firestore");

export const createOnboardingQuestion = onCall(
    {
        cors: [
            /https:\/\/.*\.exp\.direct$/,
            "http://localhost",
            "http://127.0.0.1",
        ]
    },
    async (req: any) => {
        info("createOnboardingQuestion invoked", {structuredData: true});
        const { question } = req.data;
        
        if (!question) {
            throw new Error("question data is required");
        }

        if (!question.title || !question.section) {
            throw new Error("title and section are required");
        }

        const firestore = getFirestore();

        try {
            const questionData = {
                title: question.title,
                section: question.section,
                type: question.type || 0,
                active: question.active !== undefined ? question.active : true,
                order: question.order || 0,
                options: question.options || [],
                createdAt: FieldValue.serverTimestamp(),
                updatedAt: FieldValue.serverTimestamp(),
            };

            const docRef = await firestore
                .collection(Collection.ONBOARDING_QUESTIONS)
                .add(questionData);

            const createdDoc = await docRef.get();
            const data = createdDoc.data();

            info(`Created onboarding question with ID: ${docRef.id}`);
            return {
                id: docRef.id,
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
            info("Error creating onboarding question", {error: error.message});
            throw new Error(`Failed to create onboarding question: ${error.message}`);
        }
    }
);

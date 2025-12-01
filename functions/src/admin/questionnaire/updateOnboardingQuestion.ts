/**
 * Firebase Cloud Function to update an existing onboarding question
 */
import { Collection } from "../../utils/collection";

const {info} = require("firebase-functions/logger");
const {onCall} = require("firebase-functions/v2/https");
const {getFirestore, FieldValue} = require("firebase-admin/firestore");

export const updateOnboardingQuestion = onCall(
    {
        cors: [
            /https:\/\/.*\.exp\.direct$/,
            "http://localhost",
            "http://127.0.0.1",
        ]
    },
    async (req: any) => {
        info("updateOnboardingQuestion invoked", {structuredData: true});
        const { questionId, question } = req.data;
        
        if (!questionId) {
            throw new Error("questionId is required");
        }

        if (!question) {
            throw new Error("question data is required");
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

            const updateData: any = {
                updatedAt: FieldValue.serverTimestamp(),
            };

            // Only update provided fields
            if (question.title !== undefined) updateData.title = question.title;
            if (question.section !== undefined) updateData.section = question.section;
            if (question.type !== undefined) updateData.type = question.type;
            if (question.active !== undefined) updateData.active = question.active;
            if (question.order !== undefined) updateData.order = question.order;
            if (question.options !== undefined) updateData.options = question.options;

            await questionRef.update(updateData);

            const updatedDoc = await questionRef.get();
            const data = updatedDoc.data();

            info(`Updated onboarding question with ID: ${questionId}`);
            return {
                id: questionId,
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
            info("Error updating onboarding question", {error: error.message});
            throw new Error(`Failed to update onboarding question: ${error.message}`);
        }
    }
);

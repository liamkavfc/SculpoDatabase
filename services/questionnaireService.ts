/**
 * QuestionnaireService - Handles questionnaire-related operations
 * Uses direct Firestore queries for better performance
 */
import { Firestore, collection, query, where, getDocs, Timestamp } from 'firebase/firestore';

/**
 * Interface for questionnaire answer data
 */
export interface QuestionnaireAnswer {
    id: string;
    questionId: string | null;
    questionTitle: string;
    section: string;
    answer: string;
    submittedAt: string | null;
}

class QuestionnaireService {
    private db: Firestore | null = null;

    /**
     * Initialize the service with a Firestore instance
     * @param db - Firestore database instance
     */
    initialize(db: Firestore) {
        this.db = db;
    }

    /**
     * Get onboarding answers for a specific user
     * @param userId - User ID to get answers for
     * @returns Array of questionnaire answers
     */
    async getOnboardingAnswers(userId: string): Promise<QuestionnaireAnswer[]> {
        if (!this.db) {
            throw new Error('QuestionnaireService not initialized. Call initialize(db) first.');
        }

        if (!userId) {
            console.warn('getOnboardingAnswers: userId is required');
            return [];
        }

        try {
            // Query onboardingAnswers collection directly using userId
            const answersQuery = query(
                collection(this.db, 'onboardingAnswers'),
                where('userId', '==', userId)
            );

            const snapshot = await getDocs(answersQuery);

            const answers: QuestionnaireAnswer[] = snapshot.docs.map((docSnapshot) => {
                const data = docSnapshot.data();
                
                // Parse submittedAt timestamp
                let submittedAt: string | null = null;
                if (data.submittedAt) {
                    if (data.submittedAt instanceof Timestamp) {
                        submittedAt = data.submittedAt.toDate().toISOString();
                    } else if (data.submittedAt?.toDate) {
                        submittedAt = data.submittedAt.toDate().toISOString();
                    } else if (data.submittedAt?._seconds) {
                        submittedAt = new Date(data.submittedAt._seconds * 1000).toISOString();
                    } else if (typeof data.submittedAt === 'string') {
                        submittedAt = data.submittedAt;
                    }
                }

                return {
                    id: docSnapshot.id,
                    questionId: data.questionId || null,
                    questionTitle: data.questionTitle || 'Question',
                    section: data.section || 'General',
                    answer: data.answer || '',
                    submittedAt,
                };
            });

            // Sort by section and question title for better display
            answers.sort((a, b) => {
                if (a.section !== b.section) {
                    return (a.section || '').localeCompare(b.section || '');
                }
                return (a.questionTitle || '').localeCompare(b.questionTitle || '');
            });

            return answers;
        } catch (error) {
            console.error('Error fetching onboarding answers:', error);
            return [];
        }
    }
}

export default new QuestionnaireService();

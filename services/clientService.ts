import { Firestore, collection, query, where, getDocs, addDoc, serverTimestamp, orderBy } from 'firebase/firestore';
import { OnboardingQuestionViewModel } from './models/onboardingQuestionnaireModels';
import { GoalViewModel, UserGoalResponseViewModel, SubmitGoalResponsesDto } from './models/goalsModels';
import { getAuth } from 'firebase/auth';

// CLIENT SERVICE
// Note: This service now uses Firebase Firestore directly instead of API calls
class ClientService {
    private db: Firestore | null = null;

    /**
     * Initialize the service with a Firestore instance
     * @param db - Firestore database instance
     */
    initialize(db: Firestore) {
        this.db = db;
    }

    // ONBOARDING QUESTIONNAIRE METHODS

    /**
     * Get all active onboarding questions for clients
     * Uses direct Firestore queries for better performance
     */
    async getOnboardingQuestions(): Promise<OnboardingQuestionViewModel[]> {
        if (!this.db) {
            throw new Error('ClientService not initialized. Call initialize(db) first.');
        }

        try {
            // Query onboardingQuestions collection directly, filtering for active questions
            const questionsQuery = query(
                collection(this.db, 'onboardingQuestions'),
                where('active', '==', true),
                orderBy('order', 'asc')
            );

            const snapshot = await getDocs(questionsQuery);

            const questions: OnboardingQuestionViewModel[] = snapshot.docs.map((docSnapshot) => {
                const data = docSnapshot.data();
                return {
                    id: docSnapshot.id,
                    title: data.title || '',
                    section: data.section || 'General',
                    type: data.type || 0,
                    active: data.active !== undefined ? data.active : true,
                    order: data.order || 0,
                    options: data.options || [],
                    createdAt: data.createdAt ? (data.createdAt.toDate ? data.createdAt.toDate().toISOString() : data.createdAt) : null,
                    updatedAt: data.updatedAt ? (data.updatedAt.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt) : null,
                };
            });

            return questions;
        } catch (error) {
            console.error('Error fetching onboarding questions for client:', error);
            throw error;
        }
    }

    /**
     * Submit onboarding answers
     * Writes directly to Firestore onboardingAnswers collection
     * @param answers - Record of questionId -> answer mappings
     * @returns True if submission was successful
     */
    async submitOnboardingAnswers(answers: Record<string, string>): Promise<boolean> {
        if (!this.db) {
            throw new Error('ClientService not initialized. Call initialize(db) first.');
        }

        try {
            // Get current user ID from Firebase Auth
            const auth = getAuth();
            const user = auth.currentUser;
            
            if (!user) {
                throw new Error('User must be authenticated to submit onboarding answers');
            }

            const userId = user.uid;

            // First, get all questions to get their titles and sections
            const questions = await this.getOnboardingQuestions();
            const questionsMap = new Map(questions.map(q => [q.id, q]));

            // Write each answer as a separate document in onboardingAnswers collection
            const writePromises = Object.entries(answers).map(async ([questionId, answer]) => {
                const question = questionsMap.get(questionId);
                
                const answerData = {
                    userId: userId,
                    questionId: questionId,
                    questionTitle: question?.title || 'Question',
                    section: question?.section || 'General',
                    answer: answer,
                    submittedAt: serverTimestamp(),
                };

                await addDoc(collection(this.db!, 'onboardingAnswers'), answerData);
            });

            await Promise.all(writePromises);

            return true;
        } catch (error) {
            console.error('Error submitting onboarding answers:', error);
            throw error;
        }
    }

    /**
     * Get my onboarding answers (if user wants to review their submitted answers)
     * Uses QuestionnaireService for consistency
     */
    async getMyOnboardingAnswers(): Promise<Record<string, string>> {
        if (!this.db) {
            throw new Error('ClientService not initialized. Call initialize(db) first.');
        }

        try {
            // Get current user ID from Firebase Auth
            const auth = getAuth();
            const user = auth.currentUser;
            
            if (!user) {
                throw new Error('User must be authenticated to get onboarding answers');
            }

            const userId = user.uid;

            // Query onboardingAnswers collection directly using userId
            const answersQuery = query(
                collection(this.db, 'onboardingAnswers'),
                where('userId', '==', userId)
            );

            const snapshot = await getDocs(answersQuery);

            // Convert to Record<string, string> format (questionId -> answer)
            const answers: Record<string, string> = {};
            snapshot.docs.forEach((docSnapshot) => {
                const data = docSnapshot.data();
                if (data.questionId && data.answer) {
                    answers[data.questionId] = data.answer;
                }
            });

            return answers;
        } catch (error) {
            console.error('Error fetching my onboarding answers:', error);
            throw error;
        }
    }

    // ========================================
    // GOALS METHODS
    // ========================================

    // GET ACTIVE GOALS (for onboarding)
    async getActiveGoals(): Promise<GoalViewModel[]> {
        try {
            const response = await axiosInstance.get<GoalViewModel[]>(`${this.apiUrl}/goals`);
            return response.data;
        } catch (error) {
            console.error('Error fetching active goals:', error);
            throw error;
        }
    }

    // SUBMIT GOAL RESPONSES
    async submitGoalResponses(responses: SubmitGoalResponsesDto): Promise<boolean> {
        try {
            // Client-side validation for other text length
            for (const response of responses.responses) {
                if (response.otherText && response.otherText.length > 50) {
                    throw new Error('Other text cannot exceed 50 characters');
                }
            }

            await axiosInstance.post(`${this.apiUrl}/goals`, responses);
            return true;
        } catch (error) {
            console.error('Error submitting goal responses:', error);
            throw error;
        }
    }

    // GET MY GOAL RESPONSES
    async getMyGoalResponses(): Promise<UserGoalResponseViewModel[]> {
        try {
            const response = await axiosInstance.get<UserGoalResponseViewModel[]>(`${this.apiUrl}/goals/my-responses`);
            return response.data;
        } catch (error) {
            console.error('Error fetching my goal responses:', error);
            throw error;
        }
    }
}

export default new ClientService(); 
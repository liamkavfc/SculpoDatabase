import axiosInstance from './axiosConfig';
// CLIENT SERVICE
class ClientService {
    // CONSTRUCTOR
    constructor() {
        this.apiUrl = `/api/client`; // Note: baseURL is now handled by axiosInstance
    }
    // ONBOARDING QUESTIONNAIRE METHODS
    // GET ALL ACTIVE ONBOARDING QUESTIONS FOR CLIENTS
    async getOnboardingQuestions() {
        try {
            const response = await axiosInstance.get(`${this.apiUrl}/onboarding-questions`);
            return response.data;
        }
        catch (error) {
            console.error('Error fetching onboarding questions for client:', error);
            throw error;
        }
    }
    // SUBMIT ONBOARDING ANSWERS
    async submitOnboardingAnswers(answers) {
        try {
            await axiosInstance.post(`${this.apiUrl}/onboarding-answers`, { answers });
            return true;
        }
        catch (error) {
            console.error('Error submitting onboarding answers:', error);
            throw error;
        }
    }
    // GET MY ONBOARDING ANSWERS (if user wants to review their submitted answers)
    async getMyOnboardingAnswers() {
        try {
            const response = await axiosInstance.get(`${this.apiUrl}/onboarding-answers`);
            return response.data.answers;
        }
        catch (error) {
            console.error('Error fetching my onboarding answers:', error);
            throw error;
        }
    }
    // ========================================
    // GOALS METHODS
    // ========================================
    // GET ACTIVE GOALS (for onboarding)
    async getActiveGoals() {
        try {
            const response = await axiosInstance.get(`${this.apiUrl}/goals`);
            return response.data;
        }
        catch (error) {
            console.error('Error fetching active goals:', error);
            throw error;
        }
    }
    // SUBMIT GOAL RESPONSES
    async submitGoalResponses(responses) {
        try {
            // Client-side validation for other text length
            for (const response of responses.responses) {
                if (response.otherText && response.otherText.length > 50) {
                    throw new Error('Other text cannot exceed 50 characters');
                }
            }
            await axiosInstance.post(`${this.apiUrl}/goals`, responses);
            return true;
        }
        catch (error) {
            console.error('Error submitting goal responses:', error);
            throw error;
        }
    }
    // GET MY GOAL RESPONSES
    async getMyGoalResponses() {
        try {
            const response = await axiosInstance.get(`${this.apiUrl}/goals/my-responses`);
            return response.data;
        }
        catch (error) {
            console.error('Error fetching my goal responses:', error);
            throw error;
        }
    }
}
export default new ClientService();

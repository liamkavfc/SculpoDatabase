import axiosInstance from './axiosConfig';
// ADMIN SERVICE
class AdminService {
    // CONSTRUCTOR
    constructor() {
        this.apiUrl = `/api/admin`; // Note: baseURL is now handled by axiosInstance
    }
    // GET DELIVERY FORMATS
    async getDeliveryFormats() {
        const response = await axiosInstance.get(`${this.apiUrl}/delivery-formats`);
        return response.data;
    }
    // CREATE DELIVERY FORMAT
    async createDeliveryFormat(deliveryFormat) {
        const response = await axiosInstance.post(`${this.apiUrl}/delivery-formats`, deliveryFormat);
        return response.data;
    }
    // ONBOARDING QUESTIONNAIRE METHODS
    // GET ALL ONBOARDING QUESTIONS
    async getOnboardingQuestions() {
        const response = await axiosInstance.get(`${this.apiUrl}/onboarding-questions`);
        return response.data;
    }
    // GET ONBOARDING QUESTION BY ID
    async getOnboardingQuestionById(id) {
        try {
            const response = await axiosInstance.get(`${this.apiUrl}/onboarding-questions/${id}`);
            return response.data;
        }
        catch (error) {
            console.error('Error fetching onboarding question:', error);
            return null;
        }
    }
    // CREATE ONBOARDING QUESTION
    async createOnboardingQuestion(question) {
        try {
            const response = await axiosInstance.post(`${this.apiUrl}/onboarding-questions`, question);
            return response.data;
        }
        catch (error) {
            console.error('Error creating onboarding question:', error);
            return null;
        }
    }
    // UPDATE ONBOARDING QUESTION
    async updateOnboardingQuestion(id, question) {
        try {
            const response = await axiosInstance.put(`${this.apiUrl}/onboarding-questions/${id}`, question);
            return response.data;
        }
        catch (error) {
            console.error('Error updating onboarding question:', error);
            return null;
        }
    }
    // DELETE ONBOARDING QUESTION
    async deleteOnboardingQuestion(id) {
        try {
            await axiosInstance.delete(`${this.apiUrl}/onboarding-questions/${id}`);
            return true;
        }
        catch (error) {
            console.error('Error deleting onboarding question:', error);
            return false;
        }
    }
    // ========================================
    // GOALS MANAGEMENT METHODS
    // ========================================
    // GET ALL GOALS
    async getGoals() {
        try {
            const response = await axiosInstance.get(`${this.apiUrl}/goals`);
            return response.data;
        }
        catch (error) {
            console.error('Error fetching goals:', error);
            return [];
        }
    }
    // GET GOAL BY ID
    async getGoalById(id) {
        try {
            const response = await axiosInstance.get(`${this.apiUrl}/goals/${id}`);
            return response.data;
        }
        catch (error) {
            console.error('Error fetching goal by ID:', error);
            return null;
        }
    }
    // CREATE GOAL
    async createGoal(goal) {
        try {
            const response = await axiosInstance.post(`${this.apiUrl}/goals`, goal);
            return response.data;
        }
        catch (error) {
            console.error('Error creating goal:', error);
            return null;
        }
    }
    // UPDATE GOAL
    async updateGoal(id, goal) {
        try {
            const response = await axiosInstance.put(`${this.apiUrl}/goals/${id}`, goal);
            return response.data;
        }
        catch (error) {
            console.error('Error updating goal:', error);
            return null;
        }
    }
    // DELETE GOAL
    async deleteGoal(id) {
        try {
            await axiosInstance.delete(`${this.apiUrl}/goals/${id}`);
            return true;
        }
        catch (error) {
            console.error('Error deleting goal:', error);
            return false;
        }
    }
    // REORDER GOALS
    async reorderGoals(goalIds) {
        try {
            await axiosInstance.put(`${this.apiUrl}/goals/reorder`, { goalIds });
            return true;
        }
        catch (error) {
            console.error('Error reordering goals:', error);
            return false;
        }
    }
    // GET GOAL ANALYTICS
    async getGoalAnalytics() {
        try {
            const response = await axiosInstance.get(`${this.apiUrl}/goals/analytics`);
            return response.data;
        }
        catch (error) {
            console.error('Error fetching goal analytics:', error);
            return [];
        }
    }
    // GET ALL USER GOAL SUMMARIES
    async getAllUserGoalSummaries() {
        try {
            const response = await axiosInstance.get(`${this.apiUrl}/goals/user-summaries`);
            return response.data;
        }
        catch (error) {
            console.error('Error fetching user goal summaries:', error);
            return [];
        }
    }
    // GET USER GOAL SUMMARY BY USER ID
    async getUserGoalSummary(userId) {
        try {
            const response = await axiosInstance.get(`${this.apiUrl}/goals/user-summaries/${userId}`);
            return response.data;
        }
        catch (error) {
            console.error('Error fetching user goal summary:', error);
            return null;
        }
    }
}
export default new AdminService();

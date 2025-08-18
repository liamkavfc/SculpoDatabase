import axiosInstance from './axiosConfig';
// GOALS SERVICE
class GoalsService {
    // CONSTRUCTOR
    constructor() {
        this.adminApiUrl = `/api/admin/goals`;
        this.clientApiUrl = `/api/client/goals`;
    }
    // ========================================
    // ADMIN METHODS - Goal Management
    // ========================================
    // GET ALL GOALS (for admin management)
    async getAllGoals() {
        try {
            const response = await axiosInstance.get(`${this.adminApiUrl}`);
            return response.data;
        }
        catch (error) {
            console.error('Error fetching all goals:', error);
            return [];
        }
    }
    // GET GOAL BY ID
    async getGoalById(id) {
        try {
            const response = await axiosInstance.get(`${this.adminApiUrl}/${id}`);
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
            const response = await axiosInstance.post(`${this.adminApiUrl}`, goal);
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
            const response = await axiosInstance.put(`${this.adminApiUrl}/${id}`, goal);
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
            await axiosInstance.delete(`${this.adminApiUrl}/${id}`);
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
            await axiosInstance.put(`${this.adminApiUrl}/reorder`, { goalIds });
            return true;
        }
        catch (error) {
            console.error('Error reordering goals:', error);
            return false;
        }
    }
    // ========================================
    // CLIENT METHODS - Goal Selection
    // ========================================
    // GET ACTIVE GOALS (for client onboarding)
    async getActiveGoals() {
        try {
            const response = await axiosInstance.get(`${this.clientApiUrl}/active`);
            return response.data;
        }
        catch (error) {
            console.error('Error fetching active goals:', error);
            return [];
        }
    }
    // SUBMIT GOAL RESPONSES
    async submitGoalResponses(responses) {
        try {
            // Validate other text length on client side
            for (const response of responses.responses) {
                if (response.otherText && response.otherText.length > 50) {
                    throw new Error('Other text cannot exceed 50 characters');
                }
            }
            await axiosInstance.post(`${this.clientApiUrl}/responses`, responses);
            return true;
        }
        catch (error) {
            console.error('Error submitting goal responses:', error);
            return false;
        }
    }
    // GET USER'S GOAL RESPONSES
    async getUserGoalResponses(userId) {
        try {
            const response = await axiosInstance.get(`${this.clientApiUrl}/responses/${userId}`);
            return response.data;
        }
        catch (error) {
            console.error('Error fetching user goal responses:', error);
            return [];
        }
    }
    // ========================================
    // ADMIN METHODS - Analytics & Reporting
    // ========================================
    // GET GOAL ANALYTICS
    async getGoalAnalytics() {
        try {
            const response = await axiosInstance.get(`${this.adminApiUrl}/analytics`);
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
            const response = await axiosInstance.get(`${this.adminApiUrl}/user-summaries`);
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
            const response = await axiosInstance.get(`${this.adminApiUrl}/user-summaries/${userId}`);
            return response.data;
        }
        catch (error) {
            console.error('Error fetching user goal summary:', error);
            return null;
        }
    }
    // ========================================
    // UTILITY METHODS
    // ========================================
    // VALIDATE GOAL RESPONSE
    validateGoalResponse(goal, response) {
        // If "Other" option is selected, validate other text
        if (goal.isOtherOption && response.selected) {
            if (!response.otherText || response.otherText.trim().length === 0) {
                return { isValid: false, error: "Please specify your other goal" };
            }
            if (response.otherText.length > 50) {
                return { isValid: false, error: "Other goal description must be 50 characters or less" };
            }
        }
        // If "Other" option is not selected, otherText should be empty
        if (!goal.isOtherOption && response.otherText) {
            return { isValid: false, error: "Other text should only be provided for 'Other' option" };
        }
        return { isValid: true };
    }
    // VALIDATE ALL GOAL RESPONSES
    validateAllGoalResponses(goals, responses) {
        const errors = [];
        for (const response of responses) {
            const goal = goals.find(g => g.id === response.goalId);
            if (!goal) {
                errors.push(`Goal with ID ${response.goalId} not found`);
                continue;
            }
            const validation = this.validateGoalResponse(goal, response);
            if (!validation.isValid && validation.error) {
                errors.push(validation.error);
            }
        }
        return { isValid: errors.length === 0, errors };
    }
}
export default new GoalsService();

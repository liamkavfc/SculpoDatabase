import { callFunction } from './firebaseFunctions';
import { DeliveryFormatListViewModel } from './models/deliveryFormatModels';
import { OnboardingQuestionViewModel, CreateOnboardingQuestionDto } from './models/onboardingQuestionnaireModels';
import { GoalViewModel, CreateGoalDto, UpdateGoalDto, GoalAnalyticsViewModel, UserGoalSummaryViewModel } from './models/goalsModels';

/**
 * AdminService - Handles all admin-related operations
 * This service uses Firebase Cloud Functions instead of REST API calls
 * All methods are organized by feature area for better code organization
 */
class AdminService {

    // ========================================
    // DELIVERY FORMATS METHODS
    // ========================================
    // TODO: Create Firebase functions for delivery formats
    // For now, keeping axios calls until functions are created
    async getDeliveryFormats(): Promise<DeliveryFormatListViewModel[]> {
        // This will be replaced with Firebase function call
        console.warn('getDeliveryFormats: Still using old API, needs Firebase function implementation');
        return [];
    }

    async createDeliveryFormat(deliveryFormat: DeliveryFormatListViewModel): Promise<DeliveryFormatListViewModel | null> {
        // This will be replaced with Firebase function call
        console.warn('createDeliveryFormat: Still using old API, needs Firebase function implementation');
        return null;
    }

    // ========================================
    // ONBOARDING QUESTIONNAIRE METHODS
    // ========================================

    /**
     * Get all onboarding questions
     * @param activeOnly - Optional flag to filter only active questions
     * @returns Array of onboarding questions
     */
    async getOnboardingQuestions(activeOnly?: boolean): Promise<OnboardingQuestionViewModel[]> {
        try {
            const result = await callFunction<{ activeOnly?: boolean }, OnboardingQuestionViewModel[]>(
                'getOnboardingQuestions',
                { activeOnly }
            );
            return result.data;
        } catch (error) {
            console.error('Error fetching onboarding questions:', error);
            return [];
        }
    }

    /**
     * Get a single onboarding question by ID
     * @param id - Question ID
     * @returns Question data or null if not found
     */
    async getOnboardingQuestionById(id: string): Promise<OnboardingQuestionViewModel | null> {
        try {
            const result = await callFunction<{ questionId: string }, OnboardingQuestionViewModel | null>(
                'getOnboardingQuestionById',
                { questionId: id }
            );
            return result.data;
        } catch (error) {
            console.error('Error fetching onboarding question:', error);
            return null;
        }
    }

    /**
     * Create a new onboarding question
     * @param question - Question data to create
     * @returns Created question or null if creation failed
     */
    async createOnboardingQuestion(question: CreateOnboardingQuestionDto): Promise<OnboardingQuestionViewModel | null> {
        try {
            const result = await callFunction<{ question: CreateOnboardingQuestionDto }, OnboardingQuestionViewModel>(
                'createOnboardingQuestion',
                { question }
            );
            return result.data;
        } catch (error) {
            console.error('Error creating onboarding question:', error);
            return null;
        }
    }

    /**
     * Update an existing onboarding question
     * @param id - Question ID
     * @param question - Updated question data
     * @returns Updated question or null if update failed
     */
    async updateOnboardingQuestion(id: string, question: OnboardingQuestionViewModel): Promise<OnboardingQuestionViewModel | null> {
        try {
            const result = await callFunction<{ questionId: string; question: OnboardingQuestionViewModel }, OnboardingQuestionViewModel>(
                'updateOnboardingQuestion',
                { questionId: id, question }
            );
            return result.data;
        } catch (error) {
            console.error('Error updating onboarding question:', error);
            return null;
        }
    }

    /**
     * Delete an onboarding question
     * @param id - Question ID to delete
     * @returns True if deletion was successful, false otherwise
     */
    async deleteOnboardingQuestion(id: string): Promise<boolean> {
        try {
            const result = await callFunction<{ questionId: string }, { success: boolean }>(
                'deleteOnboardingQuestion',
                { questionId: id }
            );
            return result.data.success;
        } catch (error) {
            console.error('Error deleting onboarding question:', error);
            return false;
        }
    }

    // ========================================
    // GOALS MANAGEMENT METHODS
    // ========================================

    // GET ALL GOALS
    async getGoals(): Promise<GoalViewModel[]> {
        try {
            const response = await axiosInstance.get<GoalViewModel[]>(`${this.apiUrl}/goals`);
            return response.data;
        } catch (error) {
            console.error('Error fetching goals:', error);
            return [];
        }
    }

    // GET GOAL BY ID
    async getGoalById(id: string): Promise<GoalViewModel | null> {
        try {
            const response = await axiosInstance.get<GoalViewModel>(`${this.apiUrl}/goals/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching goal by ID:', error);
            return null;
        }
    }

    // CREATE GOAL
    async createGoal(goal: CreateGoalDto): Promise<GoalViewModel | null> {
        try {
            const response = await axiosInstance.post<GoalViewModel>(`${this.apiUrl}/goals`, goal);
            return response.data;
        } catch (error) {
            console.error('Error creating goal:', error);
            return null;
        }
    }

    // UPDATE GOAL
    async updateGoal(id: string, goal: UpdateGoalDto): Promise<GoalViewModel | null> {
        try {
            const response = await axiosInstance.put<GoalViewModel>(`${this.apiUrl}/goals/${id}`, goal);
            return response.data;
        } catch (error) {
            console.error('Error updating goal:', error);
            return null;
        }
    }

    // DELETE GOAL
    async deleteGoal(id: string): Promise<boolean> {
        try {
            await axiosInstance.delete(`${this.apiUrl}/goals/${id}`);
            return true;
        } catch (error) {
            console.error('Error deleting goal:', error);
            return false;
        }
    }

    // REORDER GOALS
    async reorderGoals(goalIds: string[]): Promise<boolean> {
        try {
            await axiosInstance.put(`${this.apiUrl}/goals/reorder`, { goalIds });
            return true;
        } catch (error) {
            console.error('Error reordering goals:', error);
            return false;
        }
    }

    // GET GOAL ANALYTICS
    async getGoalAnalytics(): Promise<GoalAnalyticsViewModel[]> {
        try {
            const response = await axiosInstance.get<GoalAnalyticsViewModel[]>(`${this.apiUrl}/goals/analytics`);
            return response.data;
        } catch (error) {
            console.error('Error fetching goal analytics:', error);
            return [];
        }
    }

    // GET ALL USER GOAL SUMMARIES
    async getAllUserGoalSummaries(): Promise<UserGoalSummaryViewModel[]> {
        try {
            const response = await axiosInstance.get<UserGoalSummaryViewModel[]>(`${this.apiUrl}/goals/user-summaries`);
            return response.data;
        } catch (error) {
            console.error('Error fetching user goal summaries:', error);
            return [];
        }
    }

    // GET USER GOAL SUMMARY BY USER ID
    async getUserGoalSummary(userId: string): Promise<UserGoalSummaryViewModel | null> {
        try {
            const response = await axiosInstance.get<UserGoalSummaryViewModel>(`${this.apiUrl}/goals/user-summaries/${userId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching user goal summary:', error);
            return null;
        }
    }
}

export default new AdminService(); 
import axiosInstance from './axiosConfig';
import { DeliveryFormatListViewModel } from './models/deliverFormatModels';
import { OnboardingQuestionViewModel, CreateOnboardingQuestionDto } from './models/onboardingQuestionnaireModels';
import { GoalViewModel, CreateGoalDto, UpdateGoalDto, GoalAnalyticsViewModel, UserGoalSummaryViewModel } from './models/goalsModels';

// ADMIN SERVICE
class AdminService {
    private apiUrl: string;

    // CONSTRUCTOR
    constructor() {
        this.apiUrl = `/api/admin`;  // Note: baseURL is now handled by axiosInstance
    }

    // GET DELIVERY FORMATS
    async getDeliveryFormats(): Promise<DeliveryFormatListViewModel[]> {
        const response = await axiosInstance.get<DeliveryFormatListViewModel[]>(`${this.apiUrl}/delivery-formats`);
        return response.data;
    }

    // CREATE DELIVERY FORMAT
    async createDeliveryFormat(deliveryFormat: DeliveryFormatListViewModel): Promise<DeliveryFormatListViewModel | null> {
        const response = await axiosInstance.post<DeliveryFormatListViewModel>(`${this.apiUrl}/delivery-formats`, deliveryFormat);
        return response.data;
    }

    // ONBOARDING QUESTIONNAIRE METHODS

    // GET ALL ONBOARDING QUESTIONS
    async getOnboardingQuestions(): Promise<OnboardingQuestionViewModel[]> {
        const response = await axiosInstance.get<OnboardingQuestionViewModel[]>(`${this.apiUrl}/onboarding-questions`);
        return response.data;
    }

    // GET ONBOARDING QUESTION BY ID
    async getOnboardingQuestionById(id: string): Promise<OnboardingQuestionViewModel | null> {
        try {
            const response = await axiosInstance.get<OnboardingQuestionViewModel>(`${this.apiUrl}/onboarding-questions/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching onboarding question:', error);
            return null;
        }
    }

    // CREATE ONBOARDING QUESTION
    async createOnboardingQuestion(question: CreateOnboardingQuestionDto): Promise<OnboardingQuestionViewModel | null> {
        try {
            const response = await axiosInstance.post<OnboardingQuestionViewModel>(`${this.apiUrl}/onboarding-questions`, question);
            return response.data;
        } catch (error) {
            console.error('Error creating onboarding question:', error);
            return null;
        }
    }

    // UPDATE ONBOARDING QUESTION
    async updateOnboardingQuestion(id: string, question: OnboardingQuestionViewModel): Promise<OnboardingQuestionViewModel | null> {
        try {
            const response = await axiosInstance.put<OnboardingQuestionViewModel>(`${this.apiUrl}/onboarding-questions/${id}`, question);
            return response.data;
        } catch (error) {
            console.error('Error updating onboarding question:', error);
            return null;
        }
    }

    // DELETE ONBOARDING QUESTION
    async deleteOnboardingQuestion(id: string): Promise<boolean> {
        try {
            await axiosInstance.delete(`${this.apiUrl}/onboarding-questions/${id}`);
            return true;
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
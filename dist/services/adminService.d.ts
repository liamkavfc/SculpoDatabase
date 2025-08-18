import { DeliveryFormatListViewModel } from './models/deliverFormatModels';
import { OnboardingQuestionViewModel, CreateOnboardingQuestionDto } from './models/onboardingQuestionnaireModels';
import { GoalViewModel, CreateGoalDto, UpdateGoalDto, GoalAnalyticsViewModel, UserGoalSummaryViewModel } from './models/goalsModels';
declare class AdminService {
    private apiUrl;
    constructor();
    getDeliveryFormats(): Promise<DeliveryFormatListViewModel[]>;
    createDeliveryFormat(deliveryFormat: DeliveryFormatListViewModel): Promise<DeliveryFormatListViewModel | null>;
    getOnboardingQuestions(): Promise<OnboardingQuestionViewModel[]>;
    getOnboardingQuestionById(id: string): Promise<OnboardingQuestionViewModel | null>;
    createOnboardingQuestion(question: CreateOnboardingQuestionDto): Promise<OnboardingQuestionViewModel | null>;
    updateOnboardingQuestion(id: string, question: OnboardingQuestionViewModel): Promise<OnboardingQuestionViewModel | null>;
    deleteOnboardingQuestion(id: string): Promise<boolean>;
    getGoals(): Promise<GoalViewModel[]>;
    getGoalById(id: string): Promise<GoalViewModel | null>;
    createGoal(goal: CreateGoalDto): Promise<GoalViewModel | null>;
    updateGoal(id: string, goal: UpdateGoalDto): Promise<GoalViewModel | null>;
    deleteGoal(id: string): Promise<boolean>;
    reorderGoals(goalIds: string[]): Promise<boolean>;
    getGoalAnalytics(): Promise<GoalAnalyticsViewModel[]>;
    getAllUserGoalSummaries(): Promise<UserGoalSummaryViewModel[]>;
    getUserGoalSummary(userId: string): Promise<UserGoalSummaryViewModel | null>;
}
declare const _default: AdminService;
export default _default;

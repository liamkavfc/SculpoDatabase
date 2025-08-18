import { GoalViewModel, CreateGoalDto, UpdateGoalDto, UserGoalResponseViewModel, GoalResponseDto, SubmitGoalResponsesDto, GoalAnalyticsViewModel, UserGoalSummaryViewModel } from './models/goalsModels';
declare class GoalsService {
    private adminApiUrl;
    private clientApiUrl;
    constructor();
    getAllGoals(): Promise<GoalViewModel[]>;
    getGoalById(id: string): Promise<GoalViewModel | null>;
    createGoal(goal: CreateGoalDto): Promise<GoalViewModel | null>;
    updateGoal(id: string, goal: UpdateGoalDto): Promise<GoalViewModel | null>;
    deleteGoal(id: string): Promise<boolean>;
    reorderGoals(goalIds: string[]): Promise<boolean>;
    getActiveGoals(): Promise<GoalViewModel[]>;
    submitGoalResponses(responses: SubmitGoalResponsesDto): Promise<boolean>;
    getUserGoalResponses(userId: string): Promise<UserGoalResponseViewModel[]>;
    getGoalAnalytics(): Promise<GoalAnalyticsViewModel[]>;
    getAllUserGoalSummaries(): Promise<UserGoalSummaryViewModel[]>;
    getUserGoalSummary(userId: string): Promise<UserGoalSummaryViewModel | null>;
    validateGoalResponse(goal: GoalViewModel, response: GoalResponseDto): {
        isValid: boolean;
        error?: string;
    };
    validateAllGoalResponses(goals: GoalViewModel[], responses: GoalResponseDto[]): {
        isValid: boolean;
        errors: string[];
    };
}
declare const _default: GoalsService;
export default _default;

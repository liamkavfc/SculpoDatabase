export interface GoalViewModel {
    id: string;
    title: string;
    active: boolean;
    order: number;
    isOtherOption: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface CreateGoalDto {
    title: string;
    active: boolean;
    order: number;
    isOtherOption: boolean;
}
export interface UpdateGoalDto {
    title: string;
    active: boolean;
    order: number;
    isOtherOption: boolean;
}
export interface UserGoalResponseViewModel {
    id: string;
    userId: string;
    goalId: string;
    goalTitle: string;
    selected: boolean;
    otherText?: string;
    submittedAt: Date;
}
export interface GoalResponseDto {
    goalId: string;
    selected: boolean;
    otherText?: string;
}
export interface SubmitGoalResponsesDto {
    userId: string;
    responses: GoalResponseDto[];
}
export interface GoalAnalyticsViewModel {
    goalId: string;
    goalTitle: string;
    totalSelections: number;
    selectionPercentage: number;
    customResponses?: string[];
}
export interface UserGoalSummaryViewModel {
    userId: string;
    userName: string;
    selectedGoals: {
        goalId: string;
        goalTitle: string;
        otherText?: string;
    }[];
    submittedAt: Date;
}

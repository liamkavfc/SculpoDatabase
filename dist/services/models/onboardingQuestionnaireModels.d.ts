export declare enum QuestionType {
    FreeText = 0,
    MultipleChoice = 1
}
export interface OnboardingQuestionViewModel {
    id: string;
    title: string;
    section: string;
    type: QuestionType;
    active: boolean;
    order: number;
    options: string[];
}
export interface CreateOnboardingQuestionDto {
    title: string;
    section: string;
    type: QuestionType;
    active: boolean;
    order: number;
    options: string[];
}

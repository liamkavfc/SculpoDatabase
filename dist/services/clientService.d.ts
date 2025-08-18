import { OnboardingQuestionViewModel } from './models/onboardingQuestionnaireModels';
import { GoalViewModel, UserGoalResponseViewModel, SubmitGoalResponsesDto } from './models/goalsModels';
declare class ClientService {
    private apiUrl;
    constructor();
    getOnboardingQuestions(): Promise<OnboardingQuestionViewModel[]>;
    submitOnboardingAnswers(answers: Record<string, string>): Promise<boolean>;
    getMyOnboardingAnswers(): Promise<Record<string, string>>;
    getActiveGoals(): Promise<GoalViewModel[]>;
    submitGoalResponses(responses: SubmitGoalResponsesDto): Promise<boolean>;
    getMyGoalResponses(): Promise<UserGoalResponseViewModel[]>;
}
declare const _default: ClientService;
export default _default;

/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {setGlobalOptions} from "firebase-functions/v2";
import * as admin from "firebase-admin";
import { getUsersByTrainerId } from "./admin/users/getUsersByTrainerId";
import { sendBookingConfirmation } from "./admin/users/bookings/sendBookingConfirmation";
import { getBookingsByUserId } from "./admin/users/getBookingsByUserId";
import { setTrainerAvailability } from "./admin/availability/setTrainerAvailability";
import { blockTimeSlot } from "./admin/availability/blockTimeSlot";
import { getTrainerAvailability } from "./admin/availability/getTrainerAvailability";
import { getOnboardingAnswers } from "./admin/questionnaire/getOnboardingAnswers";
import { getOnboardingQuestions } from "./admin/questionnaire/getOnboardingQuestions";
import { getOnboardingQuestionById } from "./admin/questionnaire/getOnboardingQuestionById";
import { createOnboardingQuestion } from "./admin/questionnaire/createOnboardingQuestion";
import { updateOnboardingQuestion } from "./admin/questionnaire/updateOnboardingQuestion";
import { deleteOnboardingQuestion } from "./admin/questionnaire/deleteOnboardingQuestion";

admin.initializeApp();

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 5 });

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
export { 
    getUsersByTrainerId, 
    sendBookingConfirmation, 
    getBookingsByUserId,
    setTrainerAvailability,
    blockTimeSlot,
    getTrainerAvailability,
    getOnboardingAnswers,
    getOnboardingQuestions,
    getOnboardingQuestionById,
    createOnboardingQuestion,
    updateOnboardingQuestion,
    deleteOnboardingQuestion
};
/// <summary>
/// TypeScript models for booking and availability management
/// Corresponds to the C# models in ScupoApi
/// </summary>
// Enums
export var BookingStatus;
(function (BookingStatus) {
    BookingStatus[BookingStatus["Pending"] = 0] = "Pending";
    BookingStatus[BookingStatus["Confirmed"] = 1] = "Confirmed";
    BookingStatus[BookingStatus["InProgress"] = 2] = "InProgress";
    BookingStatus[BookingStatus["Completed"] = 3] = "Completed";
    BookingStatus[BookingStatus["CancelledByClient"] = 4] = "CancelledByClient";
    BookingStatus[BookingStatus["CancelledByTrainer"] = 5] = "CancelledByTrainer";
    BookingStatus[BookingStatus["NoShow"] = 6] = "NoShow";
    BookingStatus[BookingStatus["Rejected"] = 7] = "Rejected";
})(BookingStatus || (BookingStatus = {}));

const { onCall } = require("firebase-functions/v2/https");

exports.yourV2CallableFunction = onCall(
  {
    enforceAppCheck: true,
  },
  (request) => {
    return {
      message: "Function executed successfully",
      appId: request.app?.appId || "No App Check token",
    };
  }
);

const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

/**
 * 1st Gen Callable Cloud Function: deleteUserAccount
 * Uses functions.https.onCall (1st Gen)
 * Automatically verifies client's Firebase Auth ID token into context.auth.
 * Recursively deletes user Firestore document and ALL subcollections (words)
 * at /users/{uid}, and deletes Firebase Auth user account.
 */
exports.deleteUserAccount = functions.region("us-central1").https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "User must be authenticated to delete account.");
  }

  const uid = context.auth.uid;

  try {
    // 1. Recursively delete user document AND all subcollections (words)
    const userDocRef = admin.firestore()
      .collection("users")
      .doc(uid);

    await admin.firestore().recursiveDelete(userDocRef);

    // 2. Delete user account from Firebase Auth
    await admin.auth().deleteUser(uid);

    console.log(`Successfully deleted user document, words subcollection, and auth account for UID: ${uid}`);
    return { success: true, uid: uid };
  } catch (error) {
    console.error(`Error deleting user ${uid}:`, error);
    throw new functions.https.HttpsError("internal", error.message || "Failed to delete user account.");
  }
});

const crypto = require("node:crypto");
const { FieldValue, Timestamp } = require("firebase-admin/firestore");

const DELIVERY_COLLECTION = "push_notification_deliveries";

function getDeliveryId(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function isAlreadyExists(error) {
  return (
    error?.code === 6 ||
    error?.code === "already-exists" ||
    error?.code === "ALREADY_EXISTS"
  );
}

async function createPendingDelivery(db, deliveryId, deliveryData) {
  const deliveryRef = db.collection(DELIVERY_COLLECTION).doc(deliveryId);
  try {
    await deliveryRef.create({
      ...deliveryData,
      status: "pending",
      attemptCount: 0,
      deliveredSubscriptionIds: [],
      nextAttemptAt: Timestamp.fromMillis(0),
      createdAt: FieldValue.serverTimestamp(),
    });
    return true;
  } catch (error) {
    if (isAlreadyExists(error)) return false;
    throw error;
  }
}

module.exports = {
  createPendingDelivery,
  getDeliveryId,
};

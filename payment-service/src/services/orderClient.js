const axios = require("axios");
const { orderServiceUrl, orderServiceTimeoutMs } = require("../config/env");

/**
 * Notify order-service that payment succeeded
 */
const notifyPaymentSucceeded = async ({ orderId, paymentId, amount, paidAt }) => {
  try {
    await axios.post(
      `${orderServiceUrl}/api/orders/events/payment-succeeded`,
      {
        eventId: `vnpay-${paymentId}-${Date.now()}`,
        orderId,
        paymentId,
        amount,
        paidAt,
      },
      { timeout: orderServiceTimeoutMs }
    );
  } catch (error) {
    // Log but don't throw — payment is already recorded
    console.error("[orderClient] Failed to notify order-service:", error.message);
  }
};

module.exports = { notifyPaymentSucceeded };

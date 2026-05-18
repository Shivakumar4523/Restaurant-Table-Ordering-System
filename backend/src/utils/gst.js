const DEFAULT_GST_PERCENTAGE = 5;

export function getGstPercentage() {
  return Number(process.env.GST_PERCENTAGE || DEFAULT_GST_PERCENTAGE);
}

export function calculateBill(items, discount = 0) {
  const subtotal = items.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);
  const safeDiscount = Math.max(0, Math.min(Number(discount || 0), subtotal));
  const taxableAmount = subtotal - safeDiscount;
  const gstRate = getGstPercentage();
  const gst = Math.round((taxableAmount * gstRate) / 100);
  const total = taxableAmount + gst;

  return { subtotal, discount: safeDiscount, gstRate, gst, total };
}

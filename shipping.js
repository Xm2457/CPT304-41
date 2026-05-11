// shipping.js
function shippingFee(isMember) {
  if (isMember) return 0;
  return 10;
}

module.exports = shippingFee;  // CommonJS 导出，方便测试
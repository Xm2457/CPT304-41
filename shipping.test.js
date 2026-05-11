// shipping.test.js
const shippingFee = require('./shipping');

test('non-member shipping fee is 10', () => {
  expect(shippingFee(false)).toBe(10);
});

// 加上这个测试后，覆盖所有分支
test('member shipping fee is 0', () => {
  expect(shippingFee(true)).toBe(0);
});
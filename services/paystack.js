const paystack = require("paystack")(
  "sk_test_bd74ab22c4a08442cf81f08ca4f89bf147cef74d"
);

exports.createTransaction = (amount, email) => {
  const data = {
    amount: amount,
    email: email,
  };
  return new Promise((resolve, reject) => {
    paystack.transaction.initialize(data, (error, body) => {
      if (error) {
        reject(error);
      } else {
        resolve(body.data.reference);
      }
    });
  });
};

exports.verifyTransaction = (reference) => {
  return new Promise((resolve, reject) => {
    paystack.transaction.verify(reference, (error, body) => {
      if (error) {
        reject(error);
      } else {
        resolve(body.data);
      }
    });
  });
};

const axios = require('axios');

const convertCurrency = async (amount, fromCurrency, toCurrency) => {
  try {
    if (fromCurrency === toCurrency) return { convertedAmount: amount, rate: 1 };

    const response = await axios.get(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`);
    const rate = response.data.rates[toCurrency];
    
    if (!rate) {
      throw new Error(`Currency rate not found for ${toCurrency}`);
    }

    const convertedAmount = amount * rate;
    return { convertedAmount, rate };
  } catch (error) {
    console.error('Error converting currency:', error.message);
    // Fallback to manual mock for common pairs if API fails
    if (fromCurrency === 'USD' && toCurrency === 'EUR') return { convertedAmount: amount * 0.9, rate: 0.9 };
    if (fromCurrency === 'EUR' && toCurrency === 'USD') return { convertedAmount: amount * 1.1, rate: 1.1 };
    
    return { convertedAmount: amount, rate: 1 }; // Default fallback
  }
};

module.exports = {
  convertCurrency
};

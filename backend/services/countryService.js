const axios = require('axios');

const getCountryCurrency = async (countryName) => {
  try {
    const response = await axios.get(`https://restcountries.com/v3.1/name/${countryName}?fullText=true`);
    const countryData = response.data[0];
    const currencies = countryData.currencies;
    const currencyCode = Object.keys(currencies)[0];
    return currencyCode || 'USD';
  } catch (error) {
    console.error('Error fetching currency from REST Countries API:', error.message);
    return 'USD'; // Default fallback
  }
};

module.exports = {
  getCountryCurrency
};

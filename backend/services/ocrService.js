const Tesseract = require('tesseract.js');

const parseReceipt = async (imagePath) => {
  try {
    const { data: { text } } = await Tesseract.recognize(
      imagePath,
      'eng',
      { logger: m => console.log(m) }
    );

    // Basic parsing logic using regex
    // This is simplified and can be enhanced with more complex logic
    const amountRegex = /(\d+[\.,]\d{2})/g;
    const dateRegex = /(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/;
    const vendorRegex = /^([A-Z\s]+)$|^(?:[A-Z\s]+)(?=\n)/m;

    const amounts = text.match(amountRegex);
    const date = text.match(dateRegex);
    const vendor = text.match(vendorRegex);

    // Identify expense type based on keywords
    let expenseType = 'General';
    if (/restaurant|cafe|food|meal|dining/i.test(text)) expenseType = 'Food & Beverage';
    else if (/taxi|uber|lyft|flight|airline|train|fuel|gas/i.test(text)) expenseType = 'Travel';
    else if (/hotel|lodging|airbnb/i.test(text)) expenseType = 'Accommodation';

    // Basic expense lines extraction (first 5 lines after vendor)
    const lines = text.split('\n').filter(line => line.trim().length > 5).slice(0, 5);

    return {
      amount: amounts ? Math.max(...amounts.map(a => parseFloat(a.replace(',', '.')))) : 0,
      date: date ? date[0] : null,
      vendorName: vendor ? vendor[0].trim() : 'Unknown Vendor',
      expenseType,
      expenseLines: lines,
      rawText: text
    };
  } catch (error) {
    console.error('OCR Error:', error.message);
    return { amount: 0, date: null, vendorName: 'Unknown Vendor', rawText: '' };
  }
};

module.exports = {
  parseReceipt
};

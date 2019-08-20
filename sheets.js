const errors = require('./errors');
const GoogleSpreadsheet = require('google-spreadsheet')

const SPREADSHEET_ID = `1tFtxpbL9GRHJ5jydYStk9ThYFtdTtJiXIcn-SIztyqo`

module.exports = {
  setup: function (ctx) {
    console.log('setting up sheets');
    const doc = new GoogleSpreadsheet(SPREADSHEET_ID);
    doc.getRows('Sheet1', (err, info) => {
      if (err) {
        console.error(err);
        errors.reply(ctx, err.message);
        return;
      }
      console.log(info);   
    });
  }
};
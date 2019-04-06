import GoogleSpreadsheet from 'google-spreadsheet';
import express from 'express';

import ensureAuthenticated from '../methods/auth';
import logger from '../methods/logger';

const router = express.Router();

const googlePrivateKey = process.env.GOOGLE_PRIVATE_KEY || '';

// Set up google credentials with secret parameters. Docker doesn't parse
// start/end quotes within .env files, so make sure those are not present
const googleCreds = {
  type: 'service_account',
  project_id: process.env.GOOGLE_PROJECT_ID,
  private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
  // docker doesn't parse newlines in .env files, so we need to replace manually
  private_key: googlePrivateKey.replace(/\\n/g, '\n'),
  client_email: process.env.GOOGLE_CLIENT_EMAIL,
  client_id: process.env.GOOGLE_CLIENT_ID,
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://accounts.google.com/o/oauth2/token',
  auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
  client_x509_cert_url: process.env.GOOGLE_CLIENT_X509_CERT_URL,
};

// Send user data to client side (via cookie) when user is logged in
router.get('/user_weight', ensureAuthenticated, (req, res) => {
  if (req.user.username !== 'sam') {
    // The user is not logged in
    res.json({});
  } else {
    const weightDoc = new GoogleSpreadsheet('1q15E449k_0KP_elfptM7oyVx_qXsss9_K4ESExlM2MI'); // 2016 spreadsheet
    // const weightDoc = new GoogleSpreadsheet('13XR4qkzeMDVRPkiB3vUGV7n25sLqBpyLlE6yBC22aSM'); // All weight data

    weightDoc.useServiceAccountAuth(googleCreds, authErr => {
      if (authErr) {
        logger.info('auth error: ');
        logger.error(authErr);
      }
      // Get all of the rows from the spreadsheet.
      weightDoc.getRows(1, (getErr, rows) => {
        if (getErr) {
          logger.info('google sheet row fetch error: ');
          logger.error(getErr);
        }
        // initialize empty array for us to gather pruned rows
        const prunedRows = [];
        // For each row in the array of rows, return just the weight & date
        rows.forEach(row => {
          const prunedRow = {
            date: row.date,
            weight: row.weight,
          };
          prunedRows.push(prunedRow);
        });

        res.json({
          rows: prunedRows,
        });
      });
    });
  }
});

// Send user data to client side (via cookie) when user is logged in
router.get('/user_data', ensureAuthenticated, (req, res) => {
  if (req.user === undefined) {
    // The user is not logged in
    res.json({});
  } else {
    // Sened everything EXCEPT PASSWORD
    // Blacklist method. Only needs to change if blacklist changes
    // First define function to omit object keys
    // const removeProps = (...propsToFilter) => obj => {
    //   const newObj = Object.assign({}, obj);
    //   propsToFilter.forEach(key => delete newObj[key]);
    //   return newObj;
    // };
    // However, overinclusive!! Includes properties/keys such as '_maxListeners'
    // const userJSON = removeProps('_id', 'password', '__v')(req.user);
    // res.json(userJSON);
    // Whitelist method--must be updated if user model changes
    res.json({
      username: res.locals.user.username,
      firstname: res.locals.user.firstname,
      lastname: res.locals.user.lastname,
      email: res.locals.user.email,
      partner: res.locals.user.partner,
      mfp: res.locals.user.mfp,
      currentPoints: res.locals.user.currentPoints,
      fitnessGoal: res.locals.user.fitnessGoal,
    });
  }
});

export default router;

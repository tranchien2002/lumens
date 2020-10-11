var StellarSdk = require('stellar-sdk');

const createAccount = () => {
  const pair = StellarSdk.Keypair.random();
  return pair.secret();
};

//SBZ7HKBO7AQJYVDWO7GASFHOZM5JUOZ74GRPH25TVF5EWR3OXE6WBRXC

const getPublicKey = _privateKey => {
  const pair = StellarSdk.Keypair.fromSecret(_privateKey);
  console.log(pair.publicKey());
  return pair.publicKey();
};

const getNativeBalance = async _publicKey => {
  const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
  const account = await server.loadAccount(_publicKey);
  let balance = account.balances.find(e => e.asset_type === 'native');
  return balance.balance;
};

const transferLumen = (_privateKey, _to, _amount) => {
  var StellarSdk = require('stellar-sdk');
  var server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
  var sourceKeys = StellarSdk.Keypair.fromSecret(_privateKey);
  var destinationId = _to;
  // Transaction will hold a built transaction we can resubmit if the result is unknown.
  var transaction;

  // First, check to make sure that the destination account exists.
  // You could skip this, but if the account does not exist, you will be charged
  // the transaction fee when the transaction fails.
  server
    .loadAccount(destinationId)
    // If the account is not found, surface a nicer error message for logging.
    .catch(function (error) {
      if (error instanceof StellarSdk.NotFoundError) {
        throw new Error('The destination account does not exist!');
      } else return error;
    })
    // If there was no error, load up-to-date information on your account.
    .then(function () {
      return server.loadAccount(sourceKeys.publicKey());
    })
    .then(function (sourceAccount) {
      // Start building the transaction.
      transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: StellarSdk.Networks.TESTNET
      })
        .addOperation(
          StellarSdk.Operation.payment({
            destination: destinationId,
            // Because Stellar allows transaction in many currencies, you must
            // specify the asset type. The special "native" asset represents Lumens.
            asset: StellarSdk.Asset.native(),
            amount: _amount.toString()
          })
        )
        // Wait a maximum of three minutes for the transaction
        .setTimeout(180)
        .build();
      // Sign the transaction to prove you are actually the person sending it.
      transaction.sign(sourceKeys);
      // And finally, send it off to Stellar!
      return server.submitTransaction(transaction);
    })
    .then(function (result) {
      console.log('Success! Results:', result);
    })
    .catch(function (error) {
      console.error('Something went wrong!', error);
      // If the result is unknown (no response body, timeout etc.) we simply resubmit
      // already built transaction:
      // server.submitTransaction(transaction);
    });
};

const faucet = async _publicKey => {
  try {
    const response = await fetch(
      `https://friendbot.stellar.org?addr=${encodeURIComponent(_publicKey)}`
    );
    const responseJSON = await response.json();
    console.log('SUCCESS! You have a new account :)\n', responseJSON);
  } catch (e) {
    console.error('ERROR!', e);
  }
};

// getNativeBalance('GBGXTRB4UQSWDT6AS7E5DXBEKX4TVCMG5QOMGLNYCDF5XKG3ZXUI44TC').then(e =>
//   console.log(e)
// );

// transferLumen(
//   'SCZANGBA5YHTNYVVV4C3U252E2B6P6F5T3U6MM63WBSBZATAQI3EBTQ4',
//   'GC2BKLYOOYPDEFJKLKY6FNNRQMGFLVHJKQRGNSSRRGSMPGF32LHCQVGF',
//   100
// );

// const pair = StellarSdk.Keypair.random();
// console.log(pair.publicKey());

//Faucet lumens
// const fetch = require('node-fetch');

// (async function main() {
//   try {
//     const response = await fetch(
//       `https://friendbot.stellar.org?addr=${encodeURIComponent(
//         'GC2BKLYOOYPDEFJKLKY6FNNRQMGFLVHJKQRGNSSRRGSMPGF32LHCQVGF'
//       )}`
//     );
//     const responseJSON = await response.json();
//     console.log('SUCCESS! You have a new account :)\n', responseJSON);
//   } catch (e) {
//     console.error('ERROR!', e);
//   }
// })();

module.exports = {
  createAccount: createAccount,
  getPublicKey: getPublicKey,
  getNativeBalance: getNativeBalance,
  transferLumen: transferLumen,
  faucet: faucet
};

const express = require('express')
const Hydra = require('ory-hydra-sdk')
const router = express.Router()
const OAuth2 = require('simple-oauth2')
const qs = require('querystring')
const process = require('process')

const scope = 'hydra.consent'
const oauth2 = OAuth2.create({
  client: {
    id: qs.escape("another-consumer"),
    secret: qs.escape("consumer-secret")
  },
  auth: {
    tokenHost: endpoint = "http://localhost:9000",
    authorizePath: authorizePath = '/oauth2/auth',
    tokenPath: tokenPath = '/oauth2/token'
  },
  options: {
    useBodyAuth: false,
    useBasicAuthorizationHeader: true
  }
})

// Instantiating a hydra config. If you provide no config, the hydra-js library will try to figure them out
// from the environment variables, such as HYDRA_CLIENT_ID, HYDRA_CLIENT_SECRET, and HYDRA_URL.

Hydra.ApiClient.instance.basePath = "http://localhost:9000" 
/*
const hydra = new Hydra.OAuth2Api()

const refreshToken = () => oauth2.clientCredentials
  .getToken({ scope })
  .then((result) => {
    const token = oauth2.accessToken.create(result);
    const hydraClient = Hydra.ApiClient.instance
    hydraClient.authentications.oauth2.accessToken = token.token.access_token
    return Promise.resolve(token)
  })

refreshToken().then().catch((err) => {
  console.error('Unable to refresh token, an error occurred: ', err)
  process.exit(1)
})

// A simple error helper
const catcher = (w) => (error) => {
  console.error(error)
  w.render('error', { error })
  w.status(500)
  return Promise.reject(error)
}
*/
// Authorization uri definition
const authorizationUri = oauth2.authorizationCode.authorizeURL({
  redirect_uri: 'http://localhost:9010/callback',
  scope: 'offline,openid',
  state: 'rskhrvvawskvckmytldcsrzt',
  nonce: 'cixdpcpkwpqcihlrkzkbpgkp'
});

// Initial page redirecting to Github
router.get('/auth', (req, res) => {
  console.log(authorizationUri);
  res.redirect(authorizationUri);
});

router.get('/callback', async (req, res) => {
  const code = req.query.code;
  const options = {
    code,
  };

  try {
    const result = await oauth2.authorizationCode.getToken(options);

    console.log('The resulting token: ', result);

    const token = oauth2.accessToken.create(result);

    return res.status(200).json(token)
  } catch(error) {
    console.error('Access Token Error', error.message);
    return res.status(500).json('Authentication failed');
  }
});

// This is a mock object for the user. Usually, you would fetch this from, for example, mysql, or mongodb, or somewhere else.
// The data is arbitrary, but will require a unique user id.


router.get('/', (
  r,
  w
) => w.send('Hello<br><a href="/auth">Log In with Consent</a>'))

module.exports = router

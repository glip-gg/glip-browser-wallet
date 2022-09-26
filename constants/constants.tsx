const BASE_URL = 'https://glip.gg/wallet-login/';
const WEB_SOCKET_URI = 'https://be.namasteapis.com/wallet';

const LOGIN_TYPE_GOOGLE = "google";
const LOGIN_TYPE_EMAIL = "email";
const SUPPORTED_LOGIN_TYPES = [
    LOGIN_TYPE_GOOGLE, LOGIN_TYPE_EMAIL];

export {BASE_URL, WEB_SOCKET_URI, LOGIN_TYPE_EMAIL,
        LOGIN_TYPE_GOOGLE, SUPPORTED_LOGIN_TYPES};

import axios from "axios";
import { randomUUID } from "crypto";

const DEFAULT_BASE = "https://sandbox.momodeveloper.mtn.com";
const BASE = process.env.MTN_MOMO_BASE_URL || DEFAULT_BASE;
const TOKEN_URL = process.env.MTN_MOMO_TOKEN_URL || `${BASE}/collection/token/`;
const RTP_URL = process.env.MTN_MOMO_RTP_URL || `${BASE}/collection/v1_0/requesttopay`;
const STATUS_URL = process.env.MTN_MOMO_STATUS_URL || `${BASE}/collection/v1_0/requesttopay/{referenceId}`;

const SUB_KEY = process.env.MTN_MOMO_SUBSCRIPTION_KEY;
const API_USER = process.env.MTN_MOMO_API_USER;
const API_KEY = process.env.MTN_MOMO_API_KEY;
const TARGET_ENV = process.env.MTN_MOMO_TARGET_ENV || "sandbox";

function basicAuthHeader(user, pass) {
  const token = Buffer.from(`${user}:${pass}`).toString("base64");
  return `Basic ${token}`;
}

export async function getAccessToken() {
  if (!SUB_KEY || !API_USER || !API_KEY) {
    throw new Error("MTN MoMo credentials missing (subscription key/api user/api key)");
  }
  const headers = {
    "Ocp-Apim-Subscription-Key": SUB_KEY,
    Authorization: basicAuthHeader(API_USER, API_KEY),
  };
  const res = await axios.post(TOKEN_URL, null, { headers });
  return res.data.access_token;
}

export async function requestToPay({ amount, currency = "XOF", payerMsisdn, payerMessage, payeeNote, externalId }) {
  const accessToken = await getAccessToken();
  const referenceId = randomUUID();
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "X-Reference-Id": referenceId,
    "X-Target-Environment": TARGET_ENV,
    "Ocp-Apim-Subscription-Key": SUB_KEY,
    "Content-Type": "application/json",
  };
  const body = {
    amount: String(amount),
    currency,
    externalId: externalId || referenceId,
    payer: { partyIdType: "MSISDN", partyId: payerMsisdn },
    payerMessage: payerMessage || "Payment",
    payeeNote: payeeNote || "Youdego",
  };
  await axios.post(RTP_URL, body, { headers });
  return { referenceId };
}

export async function getRequestToPayStatus(referenceId) {
  const accessToken = await getAccessToken();
  const url = STATUS_URL.replace("{referenceId}", referenceId);
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "X-Target-Environment": TARGET_ENV,
    "Ocp-Apim-Subscription-Key": SUB_KEY,
  };
  const res = await axios.get(url, { headers });
  return res.data; // contains status: PENDING|SUCCESSFUL|FAILED etc
}

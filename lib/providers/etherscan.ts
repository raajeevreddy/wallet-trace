import axios from "axios";

const BASE_URL = "https://api.etherscan.io/api";

export async function getFirstTransactionTimestamp(
  address: string
): Promise<{ firstTxTimestamp: number; walletAgeYears: number } | null> {
  const apiKey = process.env.ETHERSCAN_API_KEY;

  try {
    const params: Record<string, unknown> = {
      module: "account",
      action: "txlist",
      address,
      startblock: 0,
      endblock: 99999999,
      page: 1,
      offset: 1,
      sort: "asc",
    };
    if (apiKey) params.apikey = apiKey;

    const { data } = await axios.get(BASE_URL, { params, timeout: 8_000 });

    if (data.status !== "1" || !data.result?.length) return null;

    const firstTx = data.result[0];
    const firstTxTimestamp = parseInt(firstTx.timeStamp, 10);
    const nowSec = Date.now() / 1000;
    const walletAgeYears = (nowSec - firstTxTimestamp) / (365.25 * 24 * 3600);

    return { firstTxTimestamp, walletAgeYears };
  } catch (err) {
    console.error("[etherscan] getFirstTransactionTimestamp error:", err);
    return null;
  }
}

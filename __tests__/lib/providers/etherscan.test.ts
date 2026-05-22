import { getFirstTransactionTimestamp } from "../../../lib/providers/etherscan";

jest.mock("axios");
const axios = require("axios");

const ADDR = "0xd8da6bf26964af9d7eed9e03e53415d37aa96045";

function mockGet(data: unknown) {
  axios.get.mockResolvedValueOnce({ data });
}

function mockGetErr(err = new Error("network error")) {
  axios.get.mockRejectedValueOnce(err);
}

beforeEach(() => jest.clearAllMocks());

describe("getFirstTransactionTimestamp", () => {
  it("returns null when API status is not '1'", async () => {
    mockGet({ status: "0", result: [] });
    const result = await getFirstTransactionTimestamp(ADDR);
    expect(result).toBeNull();
  });

  it("returns null when result array is empty", async () => {
    mockGet({ status: "1", result: [] });
    const result = await getFirstTransactionTimestamp(ADDR);
    expect(result).toBeNull();
  });

  it("returns correct firstTxTimestamp from the first transaction", async () => {
    const ts = 1438214400; // 2015-07-30 — genesis era
    mockGet({ status: "1", result: [{ timeStamp: String(ts) }] });
    const result = await getFirstTransactionTimestamp(ADDR);
    expect(result).not.toBeNull();
    expect(result!.firstTxTimestamp).toBe(ts);
  });

  it("computes walletAgeYears as a positive number for old transactions", async () => {
    const tenYearsAgoSec = Math.floor(Date.now() / 1000) - 10 * 365.25 * 24 * 3600;
    mockGet({ status: "1", result: [{ timeStamp: String(Math.floor(tenYearsAgoSec)) }] });
    const result = await getFirstTransactionTimestamp(ADDR);
    expect(result!.walletAgeYears).toBeGreaterThan(9.9);
    expect(result!.walletAgeYears).toBeLessThan(10.1);
  });

  it("returns null gracefully when axios throws", async () => {
    mockGetErr();
    const result = await getFirstTransactionTimestamp(ADDR);
    expect(result).toBeNull();
  });

  it("includes the address in the request params", async () => {
    mockGet({ status: "1", result: [{ timeStamp: "1438214400" }] });
    await getFirstTransactionTimestamp(ADDR);
    expect(axios.get).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ params: expect.objectContaining({ address: ADDR }) })
    );
  });

  it("sorts results ascending (page 1, offset 1) to get the earliest tx", async () => {
    mockGet({ status: "1", result: [{ timeStamp: "1438214400" }] });
    await getFirstTransactionTimestamp(ADDR);
    const params = axios.get.mock.calls[0][1].params;
    expect(params.sort).toBe("asc");
    expect(params.page).toBe(1);
    expect(params.offset).toBe(1);
  });

  it("uses ETHERSCAN_API_KEY env var when set", async () => {
    process.env.ETHERSCAN_API_KEY = "my-key";
    mockGet({ status: "1", result: [{ timeStamp: "1438214400" }] });
    await getFirstTransactionTimestamp(ADDR);
    const params = axios.get.mock.calls[0][1].params;
    expect(params.apikey).toBe("my-key");
    delete process.env.ETHERSCAN_API_KEY;
  });
});

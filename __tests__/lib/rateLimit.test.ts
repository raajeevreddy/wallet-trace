import {
  isRateLimited,
  getRemainingRequests,
  purgeExpired,
  resetLimiter,
} from "../../lib/rateLimit";

const IP = "192.168.1.1";
const OTHER_IP = "10.0.0.1";

describe("rate limiter", () => {
  beforeEach(() => {
    resetLimiter();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // ─── isRateLimited ───────────────────────────────────────────────────────

  it("does not limit first request from an IP", () => {
    expect(isRateLimited(IP)).toBe(false);
  });

  it("allows up to 10 requests per minute", () => {
    for (let i = 0; i < 10; i++) {
      expect(isRateLimited(IP)).toBe(false);
    }
  });

  it("blocks the 11th request within the same window", () => {
    for (let i = 0; i < 10; i++) isRateLimited(IP);
    expect(isRateLimited(IP)).toBe(true);
  });

  it("does not affect other IPs", () => {
    for (let i = 0; i < 10; i++) isRateLimited(IP);
    expect(isRateLimited(OTHER_IP)).toBe(false);
  });

  it("resets after the 1-minute window expires", () => {
    for (let i = 0; i < 10; i++) isRateLimited(IP);
    expect(isRateLimited(IP)).toBe(true);

    jest.advanceTimersByTime(61 * 1000); // 61 seconds later

    expect(isRateLimited(IP)).toBe(false);
  });

  it("uses a rolling window — old requests fall out as time passes", () => {
    // Make 9 requests
    for (let i = 0; i < 9; i++) isRateLimited(IP);

    // Advance 61s — all 9 are now outside the window
    jest.advanceTimersByTime(61 * 1000);

    // Make 10 more — should all succeed (window is fresh)
    for (let i = 0; i < 10; i++) {
      expect(isRateLimited(IP)).toBe(false);
    }
    // 11th should be blocked again
    expect(isRateLimited(IP)).toBe(true);
  });

  // ─── getRemainingRequests ────────────────────────────────────────────────

  it("returns 10 remaining for a fresh IP", () => {
    expect(getRemainingRequests(IP)).toBe(10);
  });

  it("decrements as requests are made", () => {
    isRateLimited(IP); // 1 request
    expect(getRemainingRequests(IP)).toBe(9);
  });

  it("returns 0 when rate limit is reached", () => {
    for (let i = 0; i < 10; i++) isRateLimited(IP);
    expect(getRemainingRequests(IP)).toBe(0);
  });

  it("returns 10 after window expires", () => {
    for (let i = 0; i < 10; i++) isRateLimited(IP);
    jest.advanceTimersByTime(61 * 1000);
    expect(getRemainingRequests(IP)).toBe(10);
  });

  // ─── purgeExpired ────────────────────────────────────────────────────────

  it("purgeExpired removes IPs with no recent requests", () => {
    isRateLimited(IP);
    jest.advanceTimersByTime(61 * 1000);
    purgeExpired();
    // After purge, IP should be treated as new
    expect(getRemainingRequests(IP)).toBe(10);
  });

  it("purgeExpired keeps IPs with requests still in window", () => {
    for (let i = 0; i < 5; i++) isRateLimited(IP);
    purgeExpired(); // window not expired yet
    expect(getRemainingRequests(IP)).toBe(5);
  });
});

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  classroomRoomName,
  isLiveKitConfigured,
  issueLiveKitToken,
  liveKitUrl,
} from "./livekit";

describe("classroomRoomName", () => {
  it("produces a deterministic room name for a booking id", () => {
    expect(classroomRoomName("ckabc123")).toBe("classroom-ckabc123");
    expect(classroomRoomName("ckabc123")).toBe(classroomRoomName("ckabc123"));
  });

  it("differs across booking ids", () => {
    expect(classroomRoomName("a")).not.toBe(classroomRoomName("b"));
  });
});

describe("isLiveKitConfigured / liveKitUrl", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    delete process.env.LIVEKIT_URL;
    delete process.env.LIVEKIT_API_KEY;
    delete process.env.LIVEKIT_API_SECRET;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("is false when any env var is missing", () => {
    expect(isLiveKitConfigured()).toBe(false);
    process.env.LIVEKIT_URL = "wss://example";
    expect(isLiveKitConfigured()).toBe(false);
    process.env.LIVEKIT_API_KEY = "k";
    expect(isLiveKitConfigured()).toBe(false);
  });

  it("is true when all three env vars are populated", () => {
    process.env.LIVEKIT_URL = "wss://example";
    process.env.LIVEKIT_API_KEY = "k";
    process.env.LIVEKIT_API_SECRET = "s";
    expect(isLiveKitConfigured()).toBe(true);
  });

  it("liveKitUrl throws when LIVEKIT_URL is unset", () => {
    expect(() => liveKitUrl()).toThrowError(/LIVEKIT_URL/);
  });

  it("liveKitUrl returns the configured URL", () => {
    process.env.LIVEKIT_URL = "wss://example.livekit.cloud";
    expect(liveKitUrl()).toBe("wss://example.livekit.cloud");
  });
});

describe("issueLiveKitToken", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env.LIVEKIT_API_KEY = "API_KEY";
    // Secret must be at least 256 bits / 32 chars for the underlying HS256
    // implementation in livekit-server-sdk to accept it.
    process.env.LIVEKIT_API_SECRET = "test-secret-please-ignore-not-real-1234567890";
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("throws when credentials are missing", async () => {
    delete process.env.LIVEKIT_API_KEY;
    await expect(
      issueLiveKitToken({
        role: "STUDENT",
        identity: "u1",
        name: "Alice",
        roomName: "classroom-x",
      })
    ).rejects.toThrowError(/LIVEKIT_API_KEY/);
  });

  it("mints a JWT identifying the user and granting room join", async () => {
    const token = await issueLiveKitToken({
      role: "STUDENT",
      identity: "u-123",
      name: "Alice",
      roomName: "classroom-abc",
    });
    expect(token.split(".")).toHaveLength(3); // JWT shape: header.payload.signature
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64url").toString("utf8")
    );
    expect(payload.sub).toBe("u-123");
    expect(payload.name).toBe("Alice");
    expect(payload.video?.room).toBe("classroom-abc");
    expect(payload.video?.roomJoin).toBe(true);
    // Tutor-only grants should be off for a student.
    expect(payload.video?.roomAdmin).toBeFalsy();
    expect(payload.video?.roomCreate).toBeFalsy();
    expect(payload.video?.canPublishData).toBe(true);
    // A/V publish is off by default (P3 enables it).
    expect(payload.video?.canPublish).toBe(false);
  });

  it("grants room admin + create to tutors", async () => {
    const token = await issueLiveKitToken({
      role: "TUTOR",
      identity: "t-1",
      name: "Mx. Tutor",
      roomName: "classroom-abc",
    });
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64url").toString("utf8")
    );
    expect(payload.video?.roomAdmin).toBe(true);
    expect(payload.video?.roomCreate).toBe(true);
  });
});

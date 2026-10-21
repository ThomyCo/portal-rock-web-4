import { validatePost } from "./communityApi";
it("enforces publication limits", () => {
  expect(() => validatePost("")).toThrow();
  expect(() => validatePost("x".repeat(1201))).toThrow();
  expect(() => validatePost("Una canción para compartir")).not.toThrow();
});

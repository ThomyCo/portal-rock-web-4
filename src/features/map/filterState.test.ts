import { parseMapFilters, serializeMapFilters } from "./filterState";
it("round trips all shareable filters", () => {
  const value = {
    genre: "hard-rock",
    decade: 1980,
    country: "GB",
    query: "queen",
  };
  expect(parseMapFilters(serializeMapFilters(value))).toEqual(value);
});

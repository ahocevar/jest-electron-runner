"use strict";
describe("Tests in main process", () => {
    it("have no access to window object", () => {
        expect(typeof window).toBe("undefined");
    });
});
//# sourceMappingURL=main.test.js.map
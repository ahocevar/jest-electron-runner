"use strict";
/*
 * Copyright (C) 2021 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const loadImage_1 = require("../util/loadImage");
const resolveURI_1 = require("../util/resolveURI");
const startServer_1 = require("../util/startServer");
describe("Tests in renderer process", () => {
    it("can load images from a data URL", async () => {
        const image = await (0, loadImage_1.loadImage)("data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==");
        expect(image.width).toBe(1);
        expect(image.height).toBe(1);
    });
    it("can load images from a file", async () => {
        const image = await (0, loadImage_1.loadImage)((0, resolveURI_1.resolveURI)("test.png"));
        expect(image.width).toBe(640);
        expect(image.height).toBe(487);
    });
    it("can load images from localhost", async () => {
        const server = await (0, startServer_1.startServer)();
        try {
            const image = await (0, loadImage_1.loadImage)(server.baseUrl + "test.png");
            expect(image.width).toBe(640);
            expect(image.height).toBe(487);
        }
        finally {
            server.close();
        }
    });
    it("can load images from an object URL", async () => {
        const blob = await (await fetch((0, resolveURI_1.resolveURI)("test.png"))).blob();
        const image = await (0, loadImage_1.loadImage)(URL.createObjectURL(blob));
        expect(image.width).toBe(640);
        expect(image.height).toBe(487);
    });
});
//# sourceMappingURL=fetch.test.js.map
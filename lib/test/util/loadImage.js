"use strict";
/*
 * Copyright (C) 2021 Klaus Reimer <k@ailis.de>
 * See LICENSE.md for licensing information.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadImage = void 0;
async function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        function cleanup() {
            img.removeEventListener("load", onLoad);
            img.removeEventListener("error", onError);
        }
        function onError() {
            cleanup();
            reject(new Error("Unable to load image: " + src));
        }
        function onLoad() {
            cleanup();
            resolve(img);
        }
        img.addEventListener("load", onLoad);
        img.addEventListener("error", onError);
        img.src = src;
    });
}
exports.loadImage = loadImage;
//# sourceMappingURL=loadImage.js.map
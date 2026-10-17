import { expect, test, beforeEach } from 'vitest';
import calculate from "../../src/app/calculation/calculate";
import { allPaths, breaks, pathColors } from "../../src/app/logic/paths";
import { createFakeElement, resetEngineData, addComponentValue } from "./utils";

beforeEach(() => {
    resetEngineData();
});

test.skip("Stress Test 2: Deeply Nested Parallel Branches", () => {
    const vs = createFakeElement("voltageSources");
    addComponentValue("voltageSources", vs, { key: "voltage", value: 48 }, { key: "resistance", value: 0 });

    const r1 = createFakeElement("resistors");
    addComponentValue("resistors", r1, { key: "resistance", value: 12 });
    const r2 = createFakeElement("resistors");
    addComponentValue("resistors", r2, { key: "resistance", value: 6 });
    const r3 = createFakeElement("resistors");
    addComponentValue("resistors", r3, { key: "resistance", value: 6 });

    const c1 = createFakeElement("connections");
    addComponentValue("connections", c1, { key: "resistance", value: 0 });
    const c2 = createFakeElement("connections");
    addComponentValue("connections", c2, { key: "resistance", value: 0 });

    const c3 = createFakeElement("connections");
    addComponentValue("connections", c3, { key: "resistance", value: 0 });
    const c4 = createFakeElement("connections");
    addComponentValue("connections", c4, { key: "resistance", value: 0 });

    const colorMain = "rgb(0, 0, 0)";
    const colorL1_A = "rgb(255, 0, 0)";
    const colorL1_B = "rgb(0, 255, 0)";
    const colorL2_A = "rgb(0, 0, 255)";
    const colorL2_B = "rgb(255, 255, 0)";

    const pathL2_A = {
        color: colorL2_A, isClosed: true, descendantOf: colorL1_B,
        path: [{ element: c3, point: "actualPoint" }, { element: r2, point: "actualPoint" }, { element: c4, point: "actualPoint" }]
    };
    const pathL2_B = {
        color: colorL2_B, isClosed: true, descendantOf: colorL1_B,
        path: [{ element: c3, point: "actualPoint" }, { element: r3, point: "actualPoint" }, { element: c4, point: "actualPoint" }]
    };
    breaks.push([pathL2_A, pathL2_B]);
    const breakIndexL2 = breaks.length - 1;

    const pathL1_A = {
        color: colorL1_A, isClosed: true, descendantOf: colorMain,
        path: [{ element: c1, point: "actualPoint" }, { element: r1, point: "actualPoint" }, { element: c2, point: "actualPoint" }]
    };
    const pathL1_B = {
        color: colorL1_B, isClosed: true, descendantOf: colorMain,
        path: [{ element: c1, point: "actualPoint" }, { element: c3, point: "actualPoint" }, breakIndexL2, { element: c4, point: "actualPoint" }, { element: c2, point: "actualPoint" }]
    };
    breaks.push([pathL1_A, pathL1_B]);
    const breakIndexL1 = breaks.length - 1;

    const pathMain = {
        color: colorMain, isClosed: true,
        path: [{ element: vs, point: "actualPoint" }, { element: c1, point: "actualPoint" }, breakIndexL1, { element: c2, point: "actualPoint" }, { element: vs, point: "actualPoint" }]
    };

    allPaths.set(colorMain, pathMain);
    allPaths.set(colorL1_A, pathL1_A);
    allPaths.set(colorL1_B, pathL1_B);
    allPaths.set(colorL2_A, pathL2_A);
    allPaths.set(colorL2_B, pathL2_B);

    pathColors.add(colorMain); pathColors.add(colorL1_A); pathColors.add(colorL1_B); pathColors.add(colorL2_A); pathColors.add(colorL2_B);

    const success = calculate(pathMain);
    expect(success).toBe(true);
});

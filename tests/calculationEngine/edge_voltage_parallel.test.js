import { expect, test, beforeEach } from 'vitest';
import calculate from "../../src/calculation/calculate";
import { allPaths, breaks, pathColors } from "../../src/app/logic/paths";
import { createFakeElement, resetEngineData, addComponentValue } from "./utils";

beforeEach(() => {
    resetEngineData();
});

test("Edge Case 3: Conflicting Voltages in Parallel Branches", () => {
    const vs1 = createFakeElement("voltageSources");
    addComponentValue("voltageSources", vs1, { key: "voltage", value: 12 }, { key: "resistance", value: 0 });

    const b1_vs = createFakeElement("voltageSources");
    addComponentValue("voltageSources", b1_vs, { key: "voltage", value: 5 }, { key: "resistance", value: 0 });

    const b2_vs = createFakeElement("voltageSources");
    addComponentValue("voltageSources", b2_vs, { key: "voltage", value: 8 }, { key: "resistance", value: 0 });

    const c1 = createFakeElement("connections");
    addComponentValue("connections", c1, { key: "resistance", value: 0 });
    const c2 = createFakeElement("connections");
    addComponentValue("connections", c2, { key: "resistance", value: 0 });

    const colorMain = "rgb(10, 10, 10)";
    const color1 = "rgb(20, 20, 20)";
    const color2 = "rgb(30, 30, 30)";

    const path1 = {
        color: color1, isClosed: true, descendantOf: colorMain,
        path: [ { element: c1, point: "actualPoint" }, { element: b1_vs, point: "actualPoint" }, { element: c2, point: "actualPoint" } ]
    };

    const path2 = {
        color: color2, isClosed: true, descendantOf: colorMain,
        path: [ { element: c1, point: "actualPoint" }, { element: b2_vs, point: "actualPoint" }, { element: c2, point: "actualPoint" } ]
    };

    breaks.push([path1, path2]);
    allPaths.set(color1, path1); allPaths.set(color2, path2); pathColors.add(color1); pathColors.add(color2);

    const pathMain = {
        color: colorMain, isClosed: true,
        path: [ { element: vs1, point: "actualPoint" }, { element: c1, point: "actualPoint" }, 0, { element: c2, point: "actualPoint" }, { element: vs1, point: "actualPoint" } ]
    };

    allPaths.set(colorMain, pathMain); pathColors.add(colorMain);

    const success = calculate(pathMain);
    expect(success).toBe(false);
});

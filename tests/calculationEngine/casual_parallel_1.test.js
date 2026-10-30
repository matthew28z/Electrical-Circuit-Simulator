import { expect, test, beforeEach } from 'vitest';
import calculate from "../../src/calculation/calculate";
import { data } from "../../src/calculation/data";
import { allPaths, breaks, pathColors } from "../../src/app/logic/paths";
import { createFakeElement, resetEngineData, addComponentValue } from "./utils";

beforeEach(() => {
    resetEngineData();
});

test("Simple Parallel Circuit: 1 Voltage Source, 2 Parallel Resistors", () => {
    const vs = createFakeElement("voltageSources");
    addComponentValue("voltageSources", vs, { key: "voltage", value: 24 }, { key: "resistance", value: 0 });

    const r1 = createFakeElement("resistors");
    addComponentValue("resistors", r1, { key: "resistance", value: 8 });

    const r2 = createFakeElement("resistors");
    addComponentValue("resistors", r2, { key: "resistance", value: 8 });

    const c1 = createFakeElement("connections");
    addComponentValue("connections", c1, { key: "resistance", value: 0 });

    const c2 = createFakeElement("connections");
    addComponentValue("connections", c2, { key: "resistance", value: 0 });

    const colorMain = "rgb(0, 0, 0)";
    const color1 = "rgb(255, 0, 0)";
    const color2 = "rgb(0, 255, 0)";

    const path1 = {
        color: color1,
        isClosed: true,
        descendantOf: colorMain,
        path: [
            { element: c1, point: "actualPoint" },
            { element: r1, point: "actualPoint" },
            { element: c2, point: "actualPoint" }
        ]
    };

    const path2 = {
        color: color2,
        isClosed: true,
        descendantOf: colorMain,
        path: [
            { element: c1, point: "actualPoint" },
            { element: r2, point: "actualPoint" },
            { element: c2, point: "actualPoint" }
        ]
    };

    breaks.push([path1, path2]);
    allPaths.set(color1, path1);
    allPaths.set(color2, path2);
    pathColors.add(color1);
    pathColors.add(color2);

    const pathMain = {
        color: colorMain,
        isClosed: true,
        path: [
            { element: vs, point: "actualPoint" },
            { element: c1, point: "actualPoint" },
            0,
            { element: c2, point: "actualPoint" },
            { element: vs, point: "actualPoint" }
        ]
    };

    allPaths.set(colorMain, pathMain);
    pathColors.add(colorMain);

    const success = calculate(pathMain);
    expect(success).toBe(true);
});

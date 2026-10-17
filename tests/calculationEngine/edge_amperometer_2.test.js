import { expect, test, beforeEach } from 'vitest';
import calculate from "../../src/app/calculation/calculate";
import { allPaths, pathColors } from "../../src/app/logic/paths";
import { createFakeElement, resetEngineData, addComponentValue } from "./utils";

beforeEach(() => {
    resetEngineData();
});

test.skip("Edge Case 2: Impossible Voltage Drop Data", () => {
    const vs = createFakeElement("voltageSources");
    addComponentValue("voltageSources", vs, { key: "voltage", value: 10 }, { key: "resistance", value: 0 });

    const r1 = createFakeElement("resistors");
    addComponentValue("resistors", r1, { key: "resistance", value: 2 });

    const a1 = createFakeElement("amperometers");
    addComponentValue("amperometers", a1, { key: "current", value: 5 }, { key: "resistance", value: 0 });

    const a2 = createFakeElement("amperometers");
    addComponentValue("amperometers", a2, { key: "current", value: 7 }, { key: "resistance", value: 0 });

    const pathData = {
        color: "rgb(50, 50, 50)",
        isClosed: true,
        path: [
            { element: vs, point: "actualPoint" },
            { element: r1, point: "actualPoint" },
            { element: a1, point: "actualPoint" },
            { element: a2, point: "actualPoint" },
            { element: vs, point: "actualPoint" }
        ]
    };

    allPaths.set(pathData.color, pathData);
    pathColors.add(pathData.color);

    const success = calculate(pathData);
    expect(success).toBe(false);
});

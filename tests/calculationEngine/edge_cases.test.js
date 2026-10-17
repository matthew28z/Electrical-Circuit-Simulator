import { expect, test, beforeEach } from 'vitest';
import calculate from "../../src/app/calculation/calculate";
import { data } from "../../src/app/calculation/data";
import { allPaths, breaks, pathColors } from "../../src/app/logic/paths";
import { createFakeElement, resetEngineData, addComponentValue } from "./utils";

beforeEach(() => {
    resetEngineData();
});

test.skip("Edge Case 1: Contradictory Amperometer Reading in a Series Circuit", () => {
    // Topologies:
    // path1: VS (12V) -> R (4Ohm) -> Amperometer (reads 10A instead of 3A)
    const vs = createFakeElement("voltageSources");
    addComponentValue("voltageSources", vs, { key: "voltage", value: 12 }, { key: "resistance", value: 0 });

    const r1 = createFakeElement("resistors");
    addComponentValue("resistors", r1, { key: "resistance", value: 4 });

    const a1 = createFakeElement("amperometers");
    // User breaks laws of physics by forcing the current to 10 A instead of 3 A
    addComponentValue("amperometers", a1, { key: "current", value: 10 }, { key: "resistance", value: 0 });

    const pathData = {
        color: "rgb(100, 100, 100)",
        isClosed: true,
        path: [
            { element: vs, point: "actualPoint" },
            { element: r1, point: "actualPoint" },
            { element: a1, point: "actualPoint" },
            { element: vs, point: "actualPoint" }
        ]
    };

    allPaths.set(pathData.color, pathData);
    pathColors.add(pathData.color);

    const success = calculate(pathData);

    // The engine should flag this as impossible and return false
    expect(success).toBe(false);
});

test.skip("Edge Case 2: Impossible Voltage Drop Data", () => {
    // A closed path with no voltage sources but non-zero resistance and non-zero current
    // Or multiple amperometers with different readings in the same branch
    // Let's test multiple amperometers with different readings in the same path

    const vs = createFakeElement("voltageSources");
    addComponentValue("voltageSources", vs, { key: "voltage", value: 10 }, { key: "resistance", value: 0 });

    const r1 = createFakeElement("resistors");
    addComponentValue("resistors", r1, { key: "resistance", value: 2 });

    const a1 = createFakeElement("amperometers");
    addComponentValue("amperometers", a1, { key: "current", value: 5 }, { key: "resistance", value: 0 }); // Correct reading (10/2=5)

    const a2 = createFakeElement("amperometers");
    addComponentValue("amperometers", a2, { key: "current", value: 7 }, { key: "resistance", value: 0 }); // Invalid reading in same series path

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

    // The engine should detect conflicting amperometer readings on the same path
    expect(success).toBe(false);
});

test.skip("Edge Case 3: Conflicting Voltages in Parallel Branches", () => {
    // Topologies:
    // main: VS (12V) -> (split to B1 and B2) -> VS
    // B1 has a voltage drop of 10V specified manually (via another VS inside or impossible R/I combo)
    // Actually, parallel branches must have identical pathVoltage. The engine checks this.
    // Let's create two parallel branches, each with a different voltage source inside them.

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

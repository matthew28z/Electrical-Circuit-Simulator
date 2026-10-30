import { expect, test, beforeEach } from 'vitest';
import calculate from "../../src/calculation/calculate";
import { data } from "../../src/calculation/data";
import { allPaths, breaks, pathColors } from "../../src/app/logic/paths";
import { createFakeElement, resetEngineData, addComponentValue } from "./utils";

beforeEach(() => {
    resetEngineData();
});

test("Simple Series Circuit: 1 Voltage Source, 2 Resistors", () => {
    const vs = createFakeElement("voltageSources");
    addComponentValue("voltageSources", vs, { key: "voltage", value: 12 }, { key: "resistance", value: 0 });

    const r1 = createFakeElement("resistors");
    addComponentValue("resistors", r1, { key: "resistance", value: 4 });

    const r2 = createFakeElement("resistors");
    addComponentValue("resistors", r2, { key: "resistance", value: 2 });

    const pathData = {
        color: "rgb(255, 0, 0)",
        isClosed: true,
        path: [
            { element: vs, point: "actualPoint" },
            { element: r1, point: "actualPoint" },
            { element: r2, point: "actualPoint" },
            { element: vs, point: "actualPoint" }
        ]
    };

    allPaths.set(pathData.color, pathData);
    pathColors.add(pathData.color);

    const success = calculate(pathData);

    expect(success).toBe(true);

    const mainSimData = data.get(pathData.color);
    expect(mainSimData.pathResistance).toBe(6);
    expect(mainSimData.forcedVoltage).toBe(12);
    expect(mainSimData.pathVoltage).toBe(0);
    expect(mainSimData.pathCurrent).toBe(2);
});

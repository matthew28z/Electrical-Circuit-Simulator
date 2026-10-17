import { expect, test, beforeEach } from 'vitest';
import calculate from "../../src/app/calculation/calculate";
import { data } from "../../src/app/calculation/data";
import { allPaths, breaks, pathColors } from "../../src/app/logic/paths";
import { createFakeElement, resetEngineData, addComponentValue } from "./utils";

beforeEach(() => {
    resetEngineData();
});

test("Simple Series Circuit: 1 Voltage Source, 2 Resistors", () => {
    // Topologies:
    // path1: VoltageSource -> Resistor1 -> Resistor2

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
    expect(mainSimData).toBeDefined();

    // R_total = 4 + 2 = 6
    // V_total = 12
    // I_total = 12 / 6 = 2
    expect(mainSimData.pathResistance).toBe(6);
    expect(mainSimData.pathVoltage).toBe(12);
    expect(mainSimData.pathCurrent).toBe(2);
});

test.skip("Simple Parallel Circuit: 1 Voltage Source, 2 Parallel Resistors", () => {
    // Topologies:
    // main: VS -> (split to R1 and R2) -> VS

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
            0, // Index in breaks array referencing the parallel branches
            { element: c2, point: "actualPoint" },
            { element: vs, point: "actualPoint" }
        ]
    };

    allPaths.set(colorMain, pathMain);
    pathColors.add(colorMain);

    const success = calculate(pathMain);
    expect(success).toBe(true);

    const mainSimData = data.get(colorMain);
    const sim1 = data.get(color1);
    const sim2 = data.get(color2);

    // Total R = 1 / (1/8 + 1/8) = 4
    // Total V = 24
    // Total I = 24 / 4 = 6
    expect(mainSimData.pathResistance).toBe(4);
    expect(mainSimData.pathVoltage).toBe(24);
    expect(mainSimData.pathCurrent).toBe(6);

    // I1 = 24 / 8 = 3
    // I2 = 24 / 8 = 3
    expect(sim1.pathResistance).toBe(8);
    expect(sim1.pathCurrent).toBe(3);

    expect(sim2.pathResistance).toBe(8);
    expect(sim2.pathCurrent).toBe(3);
});

test.skip("Mixed Circuit: VS, 1 Resistor in series with 2 Parallel Resistors", () => {
    // Topologies:
    // main: VS -> Rs -> (split to R1 and R2) -> VS
    const vs = createFakeElement("voltageSources");
    addComponentValue("voltageSources", vs, { key: "voltage", value: 36 }, { key: "resistance", value: 0 });

    const rs = createFakeElement("resistors");
    addComponentValue("resistors", rs, { key: "resistance", value: 2 });

    const r1 = createFakeElement("resistors");
    addComponentValue("resistors", r1, { key: "resistance", value: 6 });

    const r2 = createFakeElement("resistors");
    addComponentValue("resistors", r2, { key: "resistance", value: 12 });

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
            { element: rs, point: "actualPoint" },
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

    const mainSimData = data.get(colorMain);
    const sim1 = data.get(color1);
    const sim2 = data.get(color2);

    // R_parallel = 1 / (1/6 + 1/12) = 4
    // R_total = 2 + 4 = 6
    // V_total = 36
    // I_total = 36 / 6 = 6
    expect(mainSimData.pathResistance).toBe(6);
    expect(mainSimData.pathVoltage).toBe(36);
    expect(mainSimData.pathCurrent).toBe(6);

    // V_parallel = V_total - V_rs = 36 - (6 * 2) = 24
    // I1 = 24 / 6 = 4
    // I2 = 24 / 12 = 2
    expect(sim1.pathCurrent).toBe(4);
    expect(sim2.pathCurrent).toBe(2);
});

test("Simple Series Circuit: 1 Voltage Source, 3 Resistors", () => {
    const vs = createFakeElement("voltageSources");
    addComponentValue("voltageSources", vs, { key: "voltage", value: 12 }, { key: "resistance", value: 0 });

    const r1 = createFakeElement("resistors");
    addComponentValue("resistors", r1, { key: "resistance", value: 4 });

    const r2 = createFakeElement("resistors");
    addComponentValue("resistors", r2, { key: "resistance", value: 2 });

    const r3 = createFakeElement("resistors");
    addComponentValue("resistors", r3, { key: "resistance", value: 6 });

    const pathData = {
        color: "rgb(100, 100, 100)",
        isClosed: true,
        path: [
            { element: vs, point: "actualPoint" },
            { element: r1, point: "actualPoint" },
            { element: r2, point: "actualPoint" },
            { element: r3, point: "actualPoint" },
            { element: vs, point: "actualPoint" }
        ]
    };

    allPaths.set(pathData.color, pathData);
    pathColors.add(pathData.color);

    const success = calculate(pathData);

    expect(success).toBe(true);

    const mainSimData = data.get(pathData.color);
    expect(mainSimData).toBeDefined();

    // R_total = 4 + 2 + 6 = 12
    // V_total = 12
    // I_total = 12 / 12 = 1
    expect(mainSimData.pathResistance).toBe(12);
    expect(mainSimData.pathVoltage).toBe(12);
    expect(mainSimData.pathCurrent).toBe(1);
});

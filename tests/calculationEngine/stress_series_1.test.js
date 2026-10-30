import { expect, test, beforeEach } from 'vitest';
import calculate from "../../src/calculation/calculate";
import { data } from "../../src/calculation/data";
import { allPaths, pathColors } from "../../src/app/logic/paths";
import { createFakeElement, resetEngineData, addComponentValue } from "./utils";

beforeEach(() => {
    resetEngineData();
});

test("Stress Test 1: High Quantity of Series Elements", () => {
    const vs = createFakeElement("voltageSources");
    addComponentValue("voltageSources", vs, { key: "voltage", value: 100 }, { key: "resistance", value: 0 });

    const elementsPath = [{ element: vs, point: "actualPoint" }];

    let expectedTotalR = 0;

    for (let i = 0; i < 100; i++) {
        const r = createFakeElement("resistors");
        addComponentValue("resistors", r, { key: "resistance", value: 2 });
        elementsPath.push({ element: r, point: "actualPoint" });
        expectedTotalR += 2;
    }

    elementsPath.push({ element: vs, point: "actualPoint" });

    const pathData = {
        color: "rgb(0, 0, 255)",
        isClosed: true,
        path: elementsPath
    };

    allPaths.set(pathData.color, pathData);
    pathColors.add(pathData.color);

    const success = calculate(pathData);
    expect(success).toBe(true);
});

import { appendFile } from 'node:fs/promises';

export default async function logData(data: string) {
    const { allElements, breaks, allPaths } = await import("../logic/paths");

    try {
        await appendFile("./data.txt", `Input:\n${JSON.stringify(Array.from(allElements))}\nOutput:\nmainPath: ${data}\nbreaks:${JSON.stringify(Array.from(breaks))}\nallPaths: ${JSON.stringify(Array.from(allPaths))}`);
    } catch (err) {
        console.warn("FAILED, hidden code");
    }
}
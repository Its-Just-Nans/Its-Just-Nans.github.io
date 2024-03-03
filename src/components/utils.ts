export const splitStringByLength = (inputString = "", chunkLength = 10) => {
    inputString = inputString || "";
    const words = inputString.split(" ");
    const result = [];

    let currentChunk = "";
    for (const word of words) {
        if ((currentChunk + word).length <= chunkLength) {
            currentChunk += (currentChunk === "" ? "" : " ") + word;
        } else {
            result.push(currentChunk);
            currentChunk = word;
        }
    }

    if (currentChunk !== "") {
        result.push(currentChunk);
    }

    return result;
};

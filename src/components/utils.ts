export const text = (str = "", index = 24) => {
    str = str || "";
    return str
        .substring(0, index)
        .trim()
        .concat(str.length > index ? "..." : "");
};

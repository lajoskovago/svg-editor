export function checkIfValidJSON(obj1, obj2) {
    // Function to get sorted keys from an object
    const getSortedKeys = (obj) => Object.keys(obj).sort();

    // Get sorted keys from both objects
    const keys1 = getSortedKeys(obj1);
    const keys2 = getSortedKeys(obj2);

    // Compare the sorted keys arrays
    return JSON.stringify(keys1) === JSON.stringify(keys2);
}

export function  encodeToBase64(svgString) {
    return btoa(svgQString);
}

export function  decodeBase64(base64Str) {
    const decodedStr = atob(base64Str);
    return decodedStr;
}
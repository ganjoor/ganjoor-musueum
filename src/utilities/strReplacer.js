export default class strReplacer {
    static replaceAll(str, find, replace) {
        return str.replace(new RegExp(find, 'g'), replace);
    }
    static replaceArray(str, findSet, replace) {
        for (let i = 0; i < findSet.length; i++) {
            str = str.replace(new RegExp(findSet[i], 'g'), replace);
        }
        return str;
    }
}
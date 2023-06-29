export function convertToByteUnits(num: number): string {
    const units = ["bytes", "kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    let i = 0;
    while (num >= 1000 && i < units.length - 1) {
      num /= 1000;
      i++;
    }
    // remove decimals and round up to nearest integer
    num = Math.round(num);
    return `${num} ${units[i]}`;
}
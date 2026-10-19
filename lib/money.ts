export const parseSmartMoney = (raw: string): number => {
  if (!raw || !raw.trim()) return 0;
  let str = raw.trim().toLowerCase();

  const isNegative = str.startsWith("-");
  if (isNegative || str.startsWith("+")) {
    str = str.slice(1).trim();
  }

  let multiplier = 1;
  if (str.endsWith("k")) {
    multiplier = 1000;
    str = str.slice(0, -1).trim();
  } else if (str.endsWith("tr") || str.endsWith("m") || str.endsWith("cu") || str.endsWith("củ")) {
    multiplier = 1000000;
    str = str.replace(/(tr|m|cu|củ)$/, "").trim();
  } else if (str.endsWith("lit") || str.endsWith("lít")) {
    multiplier = 100000;
    str = str.replace(/(lit|lít)$/, "").trim();
  }

  if (multiplier > 1) {
    str = str.replace(",", ".");
    const num = parseFloat(str);
    if (isNaN(num)) return NaN;
    const result = Math.round(num * multiplier);
    return isNegative ? -result : result;
  }

  let finalStr = str.replace(/[,\s]/g, "");
  const dotCount = (str.match(/\./g) || []).length;
  if (dotCount > 0) {
    if (/\.\d{3}(\.|$)/.test(str)) {
      finalStr = str.replace(/\./g, "").replace(/[,\s]/g, "");
    } else {
      finalStr = str.replace(",", ".");
    }
  }

  const parsed = Number(finalStr);
  if (isNaN(parsed)) return NaN;
  return isNegative ? -parsed : parsed;
};



export const parseAdjustmentString = (val: string): number | null => {
  if (!val || !val.trim()) return 0;
  const parts = val.trim().split(/\s+/);
  let sum = 0;
  for (const p of parts) {
    const num = parseSmartMoney(p);
    if (isNaN(num)) return null;
    sum += num;
  }
  return sum;
};



export const formatNumberWithCommas = (num: number): string => {
  return new Intl.NumberFormat("vi-VN").format(num);
};

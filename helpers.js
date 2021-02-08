const median = arr => {
  const mid = Math.floor(arr.length / 2),
    nums = [...arr].sort((a, b) => a - b);
  return arr.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
};

const IQRHigh = arr => {
    const mid = Math.floor(arr.length / 2);
    const nums = [...arr].sort((a, b) => a - b);
    const low_quarter = Math.floor(arr.length * .25);
    const high_quarter = Math.floor(arr.length * .75);
    const high_quartile = arr.length % 4 !== 0 ? nums[high_quarter] : (nums[high_quarter - 1] + nums[high_quarter]) / 2;
    const low_quartile = arr.length % 4 !== 0 ? nums[low_quarter] : (nums[low_quarter - 1] + nums[low_quarter]) / 2;
    const iqr = high_quartile - low_quartile;
    return high_quartile + 1.5 * iqr;
}

const highOutlierCutoff = arr => {
    return d3.mean(arr) + 2 * d3.deviation(arr)
}
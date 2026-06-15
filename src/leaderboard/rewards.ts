// coin thưởng theo thứ hạng cuối tháng
export function rewardForRank(rank: number): number {
    if (rank === 1) return 5000;
    if (rank <= 3) return 2000;
    if (rank <= 10) return 1000;
    if (rank <= 50) return 300;
    if (rank <= 100) return 100;
    return 0;                       // ngoài top 100 không có quà
}

export const REWARD_TOP_N = 100;  // chỉ phát cho top 100
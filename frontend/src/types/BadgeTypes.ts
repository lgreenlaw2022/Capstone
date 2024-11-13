export interface Badge {
    id: number;
    title: string;
    description: string;
    type: BadgeType;
}

export enum BadgeType {
    CONTENT = "content",
    AWARD = "award",
}

export const mapBadgeType = (type: string): BadgeType => {
    switch (type) {
        case "content":
            return BadgeType.CONTENT;
        case "award":
            return BadgeType.AWARD;
        default:
            throw new Error(`Unknown badge type: ${type}`);
    }
};
import type { BarLevel } from "./XBarLevel.ts";
import type { Category } from "./Category.ts";

export interface XBarData {
    cat: Category;
    bar: BarLevel;
    text: string;
    direction?: "TB" | "LR";
    onChange?: (text: string) => void;
}

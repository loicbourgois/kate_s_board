use crate::DIAMETER;
use crate::GRID_CELL_COUNT_SIDE;
use crate::MAX_NODE_PER_GRID_CELL;

pub fn get_common() -> String {
    include_str!("common.wgsl")
        .replace(
            "{GRID_CELL_COUNT_SIDE}",
            &format!("{}", GRID_CELL_COUNT_SIDE),
        )
        .replace(
            "{MAX_NODE_PER_GRID_CELL}",
            &format!("{}", MAX_NODE_PER_GRID_CELL),
        )
        .replace("{DIAMETER}", &format!("{}", DIAMETER))
}

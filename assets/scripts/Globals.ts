export enum Dir {
    LEFT = 0,
    UP = 1,
    RIGHT = 2,
    DOWN = 3
};

export enum GameMode {
    ONE, MORE
};

let server = "ocfbnj.cn";
if (CC_DEBUG) {
    server = "127.0.0.1"
}

export const Globals = {
    BLOCK_SIZE: 8,
    TANK_SIZE: 16,
    MAP_HEIGHT: 208,
    MAP_WIDTH: 208,
    BULLET_SIZE: 4,
    ENEMIES_COUNT: 20,

    ENEMY1: cc.v2(8, 200),
    ENEMY2: cc.v2(104, 200),
    ENEMY3: cc.v2(200, 200),
    PLAYER1: cc.v2(80, 8),

    USER_SERVER: `ws://${server}:8080/`,
    LOGIC_SERVER: `ws://${server}:8081/`,

    Z: {
        FOREST: cc.macro.MAX_ZINDEX,
        TANK: cc.macro.MAX_ZINDEX - 1,
        BULLET: cc.macro.MAX_ZINDEX - 2,
        OTHERS: cc.macro.MAX_ZINDEX - 3,
        ICE: cc.macro.MAX_ZINDEX - 4,
    },
};

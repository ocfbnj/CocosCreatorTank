export enum Dir {
    LEFT = 0,
    UP = 1,
    RIGHT = 2,
    DOWN = 3
};

export enum GameMode {
    ONE, MORE
};

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

    USER_SERVER: "ws://118.178.91.76:8080/",
    LOGIC_SERVER: "ws://118.178.91.76:8081/"
};

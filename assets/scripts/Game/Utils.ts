// 将给定数字调整为8的倍数
export function adjustNumber(number: number) {
    number = Math.round(number);

    if (number % 8 != 0) {
        for (let offset = 1; offset < 8; offset++) {
            if ((number + offset) % 8 == 0) {
                return number + offset;
            }

            if ((number - offset) % 8 == 0) {
                return number - offset;
            }
        }
    }

    return number;
}

function findNode(name: string): cc.Node {
    switch (name) {
        case "Game":
            return cc.find("/Game");
        case "GameLayer":
            return cc.find("/Canvas/GameLayer");
        case "AudioMng":
            return cc.find("/Game/AudioMng");
        case "Canvas":
            return cc.find("/Canvas");
        case "GameLayer":
            return cc.find("/Canvas/GameLayer");
        case "StageArea":
            return cc.find("/Canvas/StageArea");
        case "Camera":
            return cc.find("/Canvas/Main Camera");
        case "gameover_left":
            return findNode("/Canvas/External/gameover_left");
        case "gameover_up":
            return findNode("/Canvas/External/gameover_up");
        case "big_gameover":
            return cc.find("/Canvas/External/big_gameover");
        default:
            return null;
    }

    return null;
}

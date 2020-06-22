import { Globals, Dir } from "./Globals";
import { Utils } from "./Utils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BaseTank extends cc.Component {
    level: number;
    dir: number;
    step: number;
    blood: number;
    canMove: boolean;
    autoMoving: boolean;
    isEnemy: boolean;
    bulletCount: number;

    constructor() {
        super();
        this.level = 0;
        this.dir = Dir.DOWN;
        this.step = 1;
        this.blood = 1;
        this.canMove = false;
        this.autoMoving = false;
        this.isEnemy = true;
        this.bulletCount = 1;
    }

    protected _isCollisionWithMap() {
        let node = this.node;
        let offset = Globals.TANK_SIZE / 2;

        if (node.x - offset < 0 || node.x + offset > Globals.MAP_WIDTH ||
            node.y + offset > Globals.MAP_HEIGHT || node.y - offset < 0) {
            return true;
        }

        return false;
    }

    protected _isCollisionWithBlock() {
        let blocks = this.node.parent.getComponent("MapLayer").blocks;
        let rect = this.node.getBoundingBox();

        for (let i = 0; i != blocks.length; i++) {
            let block = blocks[i];
            if (rect.intersects(block.getBoundingBox())) {
                return true;
            }
        }

        return false;
    }

    protected _isCollisionWithTank() {
        let box = this.node.getBoundingBox();
        let tanks = this.node.parent.getComponent("MapLayer").enemies;
        let player = this.node.parent.getComponent("MapLayer").player.node;

        if (this.isEnemy) {
            if (box.intersects(player.getBoundingBox()))
                return true;

            for (let i = 0; i != tanks.length; i++) {
                if (tanks[i] != this.node && box.intersects(tanks[i].getBoundingBox())) {
                    return true;
                }
            }
        } else {
            for (let i = 0; i != tanks.length; i++) {
                if (box.intersects(tanks[i].getBoundingBox())) {
                    return true;
                }
            }
        }

        return false;
    }

    // 调整位置为8的整数倍
    protected _adjustPosition() {
        this.node.x = Utils.adjustNumber(this.node.x);
        this.node.y = Utils.adjustNumber(this.node.y);
    }
}

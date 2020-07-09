import { Globals, Dir } from "./Globals";
import { Utils } from "./Utils";
import MapLayer from "./MapLayer";

const { ccclass } = cc._decorator;

@ccclass
export default class BaseTank extends cc.Component {
    public bulletCount: number;
    public isEnemy: boolean;
    protected level: number;
    protected dir: number;
    protected step: number;
    protected blood: number;
    protected canMove: boolean;
    protected autoMoving: boolean;
    protected mapLayer: MapLayer;

    public constructor() {
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
        let blocks = this.mapLayer.blocks.children;
        let rect = this.node.getBoundingBox();

        for (let i = 0; i != blocks.length; i++) {
            let block = blocks[i];
            if ((block.name == "block_wall" ||
                block.name == "block_stone" ||
                block.name == "camp" ||
                block.name == "block_river") &&
                rect.intersects(block.getBoundingBox())) {
                return true;
            }
        }

        return false;
    }

    protected _isCollisionWithTank() {
        let box = this.node.getBoundingBox();
        let tanks = this.mapLayer.enemies.children;
        let player = this.mapLayer.player;

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

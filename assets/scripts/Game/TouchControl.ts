import PlayerTank from "./PlayerTank";
import { Dir } from "../Globals";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TouchControl extends cc.Component {
    @property([cc.Node])
    buttons: cc.Node[] = [];

    _player: PlayerTank = null;
    _node: cc.Node = null;

    onLoad() {
        this._node = cc.find("/Canvas");
        this._player = cc.find("/Canvas/GameLayer/MapLayer/players").children[0].getComponent(PlayerTank);

        if (cc.sys.isMobile) {
            this.node.active = true;
        } else {
            this.node.active = false;
        }

        if (CC_DEBUG) {
            this.node.active = true;
        }
    }

    onEnable() {
        this._node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this, true);
        this._node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this, true);
    }

    onDisable() {
        this._node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this, true);
        this._node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this, true);
    }

    onTouchStart(event: cc.Event.EventTouch) {
        let globalPos = this._node.convertToNodeSpaceAR(event.touch.getLocation());

        if (this.node.getBoundingBox().contains(globalPos)) {
            let pos = this.node.convertToNodeSpaceAR(event.touch.getLocation());

            if (this.buttons[0].getBoundingBox().contains(pos)) {
                this._player.control(Dir.LEFT);
            } else if (this.buttons[1].getBoundingBox().contains(pos)) {
                this._player.control(Dir.UP);
            } else if (this.buttons[2].getBoundingBox().contains(pos)) {
                this._player.control(Dir.RIGHT);
            } else if (this.buttons[3].getBoundingBox().contains(pos)) {
                this._player.control(Dir.DOWN);
            }
        } else {
            this._player.shoot();
        }
    }

    onTouchEnd(event: cc.Event.EventTouch) {
        let pos = this.node.convertToNodeSpaceAR(event.touch.getLocation());

        if (this.buttons[0].getBoundingBox().contains(pos) ||
            this.buttons[1].getBoundingBox().contains(pos) ||
            this.buttons[2].getBoundingBox().contains(pos) ||
            this.buttons[3].getBoundingBox().contains(pos)) {

            this._player.controlStop();
        }
    }

}
